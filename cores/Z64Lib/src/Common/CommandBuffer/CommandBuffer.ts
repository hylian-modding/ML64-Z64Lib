import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import Vector3 from "modloader64_api/math/Vector3";
import { Heap } from "modloader64_api/heap";
import { JAL_ENCODE, J_ENCODE } from "./OpcodeBullshit";
import { Deprecated } from "modloader64_api/Deprecated";
import { ActorBase } from "../Actor";
import { Z64LibSupportedGames } from "@Z64Lib/API/Utilities/Z64LibSupportedGames";
import { Command, IActor, ICommandBuffer } from "@Z64Lib/API/imports";
import { IInjectedAssembly } from "@Z64Lib/API/Common/IInjectedAssembly";
import { AssemblyList } from "@Z64Lib/API/Common/AssemblyList";
import { setCommandBufferAddr, Z64_GAME, Z64_GLOBAL_PTR } from "../types/GameAliases";
import { IZ64Core } from "@Z64Lib/API/Common/Z64API";
import { SmartBuffer } from "smart-buffer";
import { OOT_GAME } from "../types/OotAliases";
import { MM_GAME } from "../types/MMAliases";
import { assemble } from "mips-assembler";

export enum CommandBuffer_CommandType {
    NONE,
    ACTORSPAWN,
    ACTORADDREMCAT,
    RELOCATE,
    UPDATEBUTTON,
    PLAYSOUND,
    WARP,
    MOVEPLAYERTOADDRESS,
    ARBITRARYFUNCTIONCALL,
    PVPDAMAGE,
    MALLOCFREE,
    OBJECTLOAD
}

export enum CommandBuffer_CommandEventType {
    NONE,
    INIT,
    SPAWN,
    SPAWNENTRY,
    SPAWNTRANSITION,
    DESTROY,
    UPDATE,
    OBJECTSPAWN,
    ERROR_FILLED
}

export const COMMAND_MAX = 64;
export const COMMANDEVENT_MAX = 200;
export const COMMAND_PARAM_SIZEOF = 0x20;
export const COMMAND_SIZEOF = COMMAND_PARAM_SIZEOF + 8;
export const COMMAND_OFFSET = 4;
export const COMMAND_RETURN_DATA_SIZEOF = 0x04;
export const COMMAND_RETURN_SIZEOF = COMMAND_RETURN_DATA_SIZEOF + 8;
export const COMMAND_RETURN_OFFSET = COMMAND_OFFSET + COMMAND_SIZEOF * COMMAND_MAX;
export const COMMAND_EVENT_SIZEOF = 8;
export const COMMAND_EVENT_OFFSET = COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * COMMAND_MAX;
export const COMMANDBUFFER_SIZEOF = 0x1334;

// TODO: blah blah pvp blah (doesn't belong here)
export interface IPvpContext {
    damageQueue: number
    damageType: number
    damageAngle: number
    damageFlags: number
    iframes: number
    enabled: number
}

class CommandBufferBootstrap {

    ModLoader: IModLoaderAPI;
    core: IZ64Core;
    hax: Buffer;
    payloadPointer: number = -1;
    bootstrapPointer: number = -1;
    data: IInjectedAssembly
    revision: number;
    commands: number = -1;

    constructor(ModLoader: IModLoaderAPI, core: IZ64Core, hax: Buffer, data: IInjectedAssembly, revision: number) {
        this.ModLoader = ModLoader;
        this.core = core;
        this.hax = hax;
        this.data = data;
        this.revision = revision;
    }

    inject() {
        if (this.payloadPointer > 0) return;

        /** 
         * Injecting the command buffer is a two step process.
         * Start of Step 1
         */
        this.ModLoader.logger.debug("Starting command buffer bootstrap sequence...");

        /**
         * Malloc the space for the buffer itself.
         */
        this.commands = this.ModLoader.heap!.malloc(COMMANDBUFFER_SIZEOF);

        /**
         * Malloc and write the command buffer overlay
         */
        this.payloadPointer = this.ModLoader.heap!.malloc(this.hax.byteLength);
        this.ModLoader.emulator.rdramWriteBuffer(this.payloadPointer, this.hax);

        /**
         * Find the dummy pointer inside the overlay and replace it.
         */
        let badfood = this.hax.indexOf(Buffer.from("0BADF00D", 'hex'));
        this.ModLoader.emulator.rdramWrite32(this.payloadPointer + badfood, this.commands);

        /**
         * This is the bootstrap assembly. This runs for a single frame and runs the Overlay_Reallocate function...
         * ... on the command buffer overlay.
         */
        let variableNameOfAllocatedVRamAddress: number = this.payloadPointer;
        let variableNameOfOverlayInfo: number = this.payloadPointer + (this.hax.byteLength - this.hax.readUInt32BE(this.hax.byteLength - 0x4));
        let variableNameOfVRamAddress: number = 0x80800000;
        let addressOfThisGamesOverlay_Relocate: number = this.data.VERSIONS.get(this.revision)!.get("Overlay_Relocate")!;
        let bootstrapasm = `
        .definelabel allocatedVRamAddress,0x${variableNameOfAllocatedVRamAddress.toString(16)}
        .definelabel overlayInfo,0x${variableNameOfOverlayInfo.toString(16)}
        .definelabel vRamAddress,0x${variableNameOfVRamAddress.toString(16)}
        .definelabel Overlay_Relocate,0x${addressOfThisGamesOverlay_Relocate.toString(16)}
        
        bootstrap:
        ADDIU   SP SP -0x08 ; stack header, 4 bytes of padding, 4 to store the return address
        SW      RA 0x04(SP) ; store return address
        LUI     A0 hi(allocatedVRamAddress) ; arg0 is allocatedVRamAddress
        ADDIU   A0 A0 lo(allocatedVRamAddress)
        LUI     A1 hi(overlayInfo) ; arg1 is overlayInfo
        ADDIU   A1 A1 lo(overlayInfo)
        LUI     A2 hi(vRamAddress) ; arg2 is vRamAddress
        JAL     Overlay_Relocate
        ADDIU   A2 A2 lo(vRamAddress) ; delay slot
        LW      RA 0x04(SP) ; restore return address
        JR      RA  ; abort mission, mission successful?
        ADDIU   SP SP 0x08 ; stack footer (delay slot)
        `;
        let bootstrap = Buffer.from(assemble(bootstrapasm));
        this.bootstrapPointer = this.ModLoader.heap!.malloc(bootstrap.byteLength);
        this.ModLoader.emulator.rdramWriteBuffer(this.bootstrapPointer, bootstrap);

        /**
         * Write a JAL to our entry point. We will overwrite this later with the actual main loop of our overlay.
         * This delays the game starting by one frame as the game's main overlay isn't processed.
         */
        let sb = new SmartBuffer();
        sb.writeUInt32BE(JAL_ENCODE(this.bootstrapPointer));
        this.ModLoader.emulator.rdramWriteBuffer(this.data.VERSIONS.get(this.revision)!.get("CommandBuffer_Update")!, sb.toBuffer());
        sb.clear();
        this.ModLoader.emulator.invalidateCachedCode();

        /**
         * Start of Step 2
         * This needs to happen in 1 frame so we put it in a timeout.
         */
        this.ModLoader.utils.setTimeoutFrames(() => {
            this.ModLoader.logger.debug("Command buffer bootstrap step 2...");

            /**
             * Find our struct inside the overlay that contains all our function pointers.
             */
            let embedStart: number = this.hax.indexOf(Buffer.from("DEADBEEF", 'hex'));
            let instance: number = this.payloadPointer + embedStart;

            /**
             * Overwrite the JAL we wrote earlier with a new one to our main loop function inside the overlay.
             * This also resumes the game's main overlay.
             */
            sb.writeUInt32BE(JAL_ENCODE(this.ModLoader.emulator.rdramRead32(instance + 0x4)));
            this.ModLoader.emulator.rdramWriteBuffer(this.data.VERSIONS.get(this.revision)!.get("CommandBuffer_Update")!, sb.toBuffer());
            sb.clear();

            /**
             * Local helper function. Generates a J and a NOP immediately following.
             * @param pointer Base pointer to get the address to J to (double pointer)
             * @param offset Offset from pointer
             * @param tag Name of the target. See IInjectedAssembly.
             * @returns void
             */
            let JNOP = (pointer: number, offset: number, tag: string) => {
                if (!this.data.VERSIONS.get(this.revision)!.has(tag)) return;
                if (this.data.VERSIONS.get(this.revision)!.get(tag)! === 0xDEADBEEF) return;
                sb.writeUInt32BE(J_ENCODE(this.ModLoader.emulator.rdramRead32(pointer + offset)));
                sb.writeBuffer(Buffer.from("0000000003E0000800000000", "hex"));
                this.ModLoader.emulator.rdramWriteBuffer(this.data.VERSIONS.get(this.revision)!.get(tag)!, sb.toBuffer());
                sb.clear();
            };

            /**
             * Local helper function. Generates a JAL.
             * @param pointer Base pointer to get the address to J to (double pointer)
             * @param offset Offset from pointer
             * @param tag Name of the target. See IInjectedAssembly.
             * @returns void
             */
            let JAL = (pointer: number, offset: number, tag: string) => {
                if (!this.data.VERSIONS.get(this.revision)!.has(tag)) return;
                if (this.data.VERSIONS.get(this.revision)!.get(tag)! === 0xDEADBEEF) return;
                sb.writeUInt32BE(JAL_ENCODE(this.ModLoader.emulator.rdramRead32(pointer + offset)));
                this.ModLoader.emulator.rdramWriteBuffer(this.data.VERSIONS.get(this.revision)!.get(tag)!, sb.toBuffer());
                sb.clear();
            };

            /**
             * This section hooks several game functions in order to feed data...
             * ... to the event system.
             */
            JNOP(instance, 0x08, "Actor_SpawnCave");
            JAL(instance, 0x0C, "Actor_DestroyCave");
            JAL(instance, 0x10, "Actor_SpawnEntryCave");
            JAL(instance, 0x14, "Actor_InitCave");
            JAL(instance, 0x18, "Actor_UpdateCave");
            if (Z64_GAME === OOT_GAME) {
                JAL(instance, 0x20, "Actor_SpawnTransitionActorCave");
            } else if (Z64_GAME === MM_GAME) {
                // This crashes. Investigate at some point. Red bar.
                //JNOP(instance, 0x20, "Actor_SpawnTransitionActorCave");
                JNOP(instance, 0x24, "Actor_SpawnWithParentAndCutscene");
            }
            // Object spawn would go here but its broke. 0x28


            this.ModLoader.emulator.invalidateCachedCode();
        }, 1);

        return this.commands;
    }

}

export class CommandBuffer implements ICommandBuffer {
    ModLoader!: IModLoaderAPI;
    core!: IZ64Core;
    cmdbuf: number;
    uuid: number = 0;

    constructor(ModLoader: IModLoaderAPI, revision: number, game: Z64LibSupportedGames, core: IZ64Core) {
        this.ModLoader = ModLoader;
        this.cmdbuf = CommandBuffer_Factory.Inject(this.ModLoader, core, this, this.ModLoader.heap!, revision, AssemblyList.getAssemblyForGame(game)!);
        this.core = core;
        setCommandBufferAddr(this.cmdbuf);
    }

    @Deprecated("CommandBuffer.runCommand is deprecated.")
    runCommand(command: Command, param: number, callback?: Function): void { }

    spawnActor(actorId: number, params: number, rot: Vector3, pos: Vector3, address: number = 0): Promise<IActor> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.ACTORSPAWN);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite16(offset + 8, actorId);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 2, params);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 4, Math.floor(rot.x) % 32768);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 6, Math.floor(rot.y) % 32768);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 8, Math.floor(rot.z) % 32768);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0xC, pos.x);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x10, pos.y);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x14, pos.z);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 0x18, address);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);

                    if (type === CommandBuffer_CommandType.ACTORSPAWN && uuid === myUUID) {
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        if (this.ModLoader.emulator.rdramRead32(offset + 8) === 0) {
                            reject("Actor pointer was zero.");
                        }
                        else {
                            accept(new ActorBase(this.ModLoader, this.core.global.scene, this.ModLoader.emulator.rdramRead32(offset + 8)));
                        }
                    }
                }
                reject("Failed to find return value.");
            }, 1);
        });
    }

    spawnActorRXYZ(actorId: number, params: number, rotX: number, rotY: number, rotZ: number, pos: Vector3, address: number = 0): Promise<IActor> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.ACTORSPAWN);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite16(offset + 8, actorId);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 2, params);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 4, Math.floor(rotX) % 32768);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 6, Math.floor(rotY) % 32768);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 8, Math.floor(rotZ) % 32768);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0xc, pos.x);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x10, pos.y);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x14, pos.z);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 0x18, address);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);

                    if (type === CommandBuffer_CommandType.ACTORSPAWN && uuid === myUUID) {
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        if (this.ModLoader.emulator.rdramRead32(offset + 8) === 0) {
                            reject("Actor pointer was zero.");
                        }
                        else {
                            accept(new ActorBase(this.ModLoader, this.core.global.scene, this.ModLoader.emulator.rdramRead32(offset + 8)));
                        }
                    }
                }
                reject("Failed to find return value.");
            }, 1);
        });
    }

    spawnActorRXY_Z(actorId: number, params: number, rotXY: number, rotZ: number, pos: Vector3, address: number = 0): Promise<IActor> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.ACTORSPAWN);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite16(offset + 8, actorId);
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 2, params);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, Math.floor(rotXY));
        this.ModLoader.emulator.rdramWrite16(offset + 8 + 8, Math.floor(rotZ) % 32768);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0xc, pos.x);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x10, pos.y);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x14, pos.z);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 0x18, address);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    if (type === 0) continue;
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);

                    if (type === CommandBuffer_CommandType.ACTORSPAWN && uuid === myUUID) {
                        let addr = this.ModLoader.emulator.rdramRead32(offset + 8);
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        if (addr === 0) {
                            reject("Actor pointer was zero.");
                        }
                        else {
                            accept(new ActorBase(this.ModLoader, this.core.global.scene, addr));
                        }
                    }
                }
                reject("Failed to find return value.");
            }, 1);
        });
    }

    relocateOverlay(allocatedVRamAddress: number, overlayInfoPointer: number, vRamAddress: number): Promise<void> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.RELOCATE);
        this.ModLoader.emulator.rdramWrite32(offset + 8, allocatedVRamAddress);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, overlayInfoPointer);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 8, vRamAddress);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                accept();
            }, 1);
        });
    }

    updateButton(button: number): void {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.UPDATEBUTTON);
        this.ModLoader.emulator.rdramWrite16(offset + 8, button);
    }

    playSound(sfxId: number, a1: Vector3, a2: number, a3: number, a4: number, a5: number): void {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.PLAYSOUND);
        this.ModLoader.emulator.rdramWrite16(offset + 8, sfxId);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x4, a1.x);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x8, a1.y);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0xc, a1.z);
        this.ModLoader.emulator.rdramWrite8(offset + 8 + 0x10, a2);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x14, a3);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x18, a4);
        this.ModLoader.emulator.rdramWriteF32(offset + 8 + 0x1c, a5);
    }

    runWarp(entranceIndex: number, cutsceneIndex: number, age?: number, transition?: number): Promise<boolean> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.WARP);
        this.ModLoader.emulator.rdramWrite32(offset + 8, entranceIndex);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, cutsceneIndex);

        if (age === undefined) {
            this.ModLoader.emulator.rdramWrite32(offset + 8 + 8, 0xFFFFFFFF);
        }
        else {
            this.ModLoader.emulator.rdramWrite32(offset + 8 + 8, age);
        }

        if (transition === undefined) {
            this.ModLoader.emulator.rdramWrite32(offset + 8 + 0xC, 0xFFFFFFFF);
        } else {
            this.ModLoader.emulator.rdramWrite32(offset + 8 + 0xC, transition);
        }

        return new Promise((accept, reject) => {
            accept(true)
        });
    }

    movePlayerActorToAddress(address: number): Promise<boolean> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.MOVEPLAYERTOADDRESS);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite32(offset + 8, address);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);
                    if (type === 0) continue;
                    if (type === CommandBuffer_CommandType.MOVEPLAYERTOADDRESS && uuid === myUUID) {
                        let addr = this.ModLoader.emulator.rdramRead32(offset + 8);
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        if (addr === 0) {
                            reject("Player pointer was zero.");
                        }
                        else {
                            accept(true);
                        }
                    }
                }
                reject("Failed to find return value.");
            }, 1);
        });
    }

    // supports up to 8 args (exclusing args that go in FP regs); returns function return value (v0)
    arbitraryFunctionCall(functionAddress: number, argsPointer: number, argsCount: number): Promise<Buffer> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;

        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.ARBITRARYFUNCTIONCALL);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite32(offset + 8, functionAddress);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, argsPointer);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 8, argsCount);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    if (type === 0) continue;
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);

                    if (type === CommandBuffer_CommandType.ARBITRARYFUNCTIONCALL && uuid === myUUID) {
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        accept(this.ModLoader.emulator.rdramReadBuffer(offset + 8, 4));
                    }
                }
                reject("Failed to find return value!");
            }, 1);
        });
    }

    PvpDamage(context: IPvpContext, invokingActorPointer: number) {
        console.warn("Not functional when we are using gamestate cave! Bug Drahsid to transition to the new system (low priority)")
    }

    // param malloc == 0: free, param malloc == 1: malloc, param malloc == 2 mallocR, data = address on free, otherwise size of malloc
    Zelda_MallocFree(malloc: number, data: number): Promise<number> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;
        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.MALLOCFREE);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite32(offset + 8, malloc);
        this.ModLoader.emulator.rdramWrite32(offset + 8 + 4, data);

        return new Promise((accept, reject) => {
            if (malloc) {
                this.ModLoader.utils.setTimeoutFrames(() => {
                    for (let index = 0; index < COMMAND_MAX; index++) {
                        let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                        let type = this.ModLoader.emulator.rdramRead32(offset);
                        let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);
                        if (type === 0) continue;
                        if (type === CommandBuffer_CommandType.MALLOCFREE && uuid === myUUID) {
                            let addr = this.ModLoader.emulator.rdramRead32(offset + 8);
                            this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                            if (addr === 0) {
                                reject(-1);
                            }
                            else {
                                accept(addr);
                            }
                        }
                    }
                }, 1);
            }
            else {
                accept(1);
            }
        });
    }

    ObjectLoad(objectId: number): Promise<number> {
        let count = this.ModLoader.emulator.rdramRead16(this.cmdbuf);
        let offset = this.cmdbuf + COMMAND_OFFSET + COMMAND_SIZEOF * count;
        let myUUID = this.uuid++;

        this.ModLoader.emulator.rdramWrite16(this.cmdbuf, count + 1);
        this.ModLoader.emulator.rdramWrite32(offset, CommandBuffer_CommandType.OBJECTLOAD);
        this.ModLoader.emulator.rdramWrite32(offset + 4, myUUID);
        this.ModLoader.emulator.rdramWrite16(offset + 8, objectId);

        return new Promise((accept, reject) => {
            this.ModLoader.utils.setTimeoutFrames(() => {
                for (let index = 0; index < COMMAND_MAX; index++) {
                    let offset = this.cmdbuf + COMMAND_RETURN_OFFSET + COMMAND_RETURN_SIZEOF * index;
                    let type = this.ModLoader.emulator.rdramRead32(offset);
                    let uuid = this.ModLoader.emulator.rdramRead32(offset + 4);
                    if (type === 0) continue;
                    if (type === CommandBuffer_CommandType.OBJECTLOAD && uuid === myUUID) {
                        let addr = this.ModLoader.emulator.rdramRead32(offset + 8);
                        this.ModLoader.emulator.rdramWrite32(offset, 0); // free return slot
                        let obj_list: number = global.ModLoader["obj_context"];
                        obj_list += 0xC;
                        let _offset = addr * 0x44;
                        obj_list += _offset;
                        obj_list += 0x4;
                        accept(this.ModLoader.emulator.rdramRead32(obj_list));
                    }
                }
                reject(-1);
            }, 1);
        });
    }

    onTick() {
    }
}

export class CommandBuffer_Factory {
    static cmdbuf: number = 0;

    static Inject(ModLoader: IModLoaderAPI, core: IZ64Core, parent: CommandBuffer, heap: Heap, revision: number, inject: IInjectedAssembly): number {
        let bootstrap = new CommandBufferBootstrap(ModLoader, core, inject.commandBuffer, inject, revision);
        this.cmdbuf = bootstrap.inject()!;
        return this.cmdbuf;
    }
}
