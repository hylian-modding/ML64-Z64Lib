import fs from 'fs';
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { PatchTypes } from "modloader64_api/Patchers/PatchManager";
import path from 'path';
import { Z64LibSupportedGames } from '../../Utilities/Z64LibSupportedGames';
import { IManifest, ManifestBuffer } from '../../Utilities/Z64ManifestBuffer';
import { trimBuffer, Z64RomTools } from '../../Utilities/Z64RomTools';
import { Z64Offsets } from '../../Common/ModelData/IZ64Offsets';
import { MMRomPatches } from './MMRomPatches';

export class MMManifest implements IManifest {

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer, nocompress?: boolean, obj_id: number = 0x0015): number {
        let r = 0;
        // Get original zobj from ROM.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.MAJORAS_MASK);
        let zobj: Buffer = tools.decompressObjectFileFromRom(rom, obj_id);
        if (model.byteLength > zobj.byteLength) {
            // This shouldn't be possible because zzplayas would throw a tantrum before you got this far.
            return r;
        }
        // Clear its contents.
        ModLoader.utils.clearBuffer(zobj);
        // Load the model.
        model.copy(zobj);
        // Trim excess space.
        zobj = trimBuffer(zobj);
        // Attempt to put the file back.
        if (nocompress === undefined || nocompress === false) {
            if (!tools.recompressObjectFileIntoRom(rom, obj_id, zobj)) {
                // If we get here it means the compressed object is bigger than the original.
                // This can happen because the compression ratio ends up different due to texture differences.

                // Move the file to extended ROM space.
                r = tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, obj_id), zobj, 0);
                tools.noCRC(rom);
            }
        } else {
            // Move the file to extended ROM space.
            r = tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, obj_id), zobj, 0, nocompress);
            tools.noCRC(rom);
        }
        new MMRomPatches().patch(rom);
        return r;
    }

    repoint(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): boolean {
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.MAJORAS_MASK);

        let code: Buffer = tools.getCodeFile(rom);
        let files = [83, 38, 511];
        for (let i = 0; i < files.length; i++) {
            let r = tools.relocateFileToExtendedRom(rom, files[i], tools.decompressDMAFileFromRom(rom, files[i]), 0, true);
        }

        let _code = new ManifestBuffer(code);
        let _hook = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 83));
        let _player = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 38));
        let _zot = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 511));

        let hilo = (m: ManifestBuffer, hi: number, lo: number, p: number) => {
            m.GoTo(hi);
            m.Hi32(p);
            m.GoTo(lo);
            m.Lo32(p);
        }

        // Human Link
        _code.GoTo(0x11A55C);
        _code.Write32(Z64Offsets.DL_WAIST);                   // Waist
        _code.Write32(Z64Offsets.DL_WAIST);
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_2);       // Right Fist + 2's Shield
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_2);
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_3);     // Right Fist + 3 Shield
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_3);

        _code.GoTo(0x11A5EC);
        _code.Write32(Z64Offsets.DL_SHIELD2_BACK);        // Rotated 2's Shield
        _code.Write32(Z64Offsets.DL_SHIELD2_BACK);
        _code.Write32(Z64Offsets.DL_SHIELD3_BACK);      // Rotated 3 Shield
        _code.Write32(Z64Offsets.DL_SHIELD3_BACK);
        _code.Write32(Z64Offsets.DL_SWORD1_SHEATHED);   // Sheathed Kokiri Sword
        _code.Write32(Z64Offsets.DL_SWORD1_SHEATHED);
        _code.Write32(Z64Offsets.DL_SWORD2_SHEATHED);   // Sheathed Razor Sword
        _code.Write32(Z64Offsets.DL_SWORD2_SHEATHED);
        _code.Write32(Z64Offsets.DL_SWORD3_SHEATHED);   // Sheathed Gilded Sword
        _code.Write32(Z64Offsets.DL_SWORD3_SHEATHED);
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_1);           // Kokiri Sword Sheath
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_1);
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_2);            // Razor Sword Sheath
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_2);
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_3);           // Gilded Sword Sheath
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_3);

        _code.GoTo(0x11A64C);                    // Left Fist + Great Fairy's Sword
        _code.Write32(Z64Offsets.DL_RFIST_SWORD4);
        _code.Write32(Z64Offsets.DL_RFIST_SWORD4);

        _code.GoTo(0x11A674);                    // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A69C);                    // Left Fist
        _code.Write32(Z64Offsets.DL_LFIST);
        _code.Write32(Z64Offsets.DL_LFIST);

        _code.GoTo(0x11A6CC);                    // Left Fist + Kokiri Sword
        _code.Write32(Z64Offsets.DL_LFIST_SWORD1);
        _code.Write32(Z64Offsets.DL_LFIST_SWORD1);

        _code.GoTo(0x11A6D4);                    // Left Fist + Razor Sword
        _code.Write32(Z64Offsets.DL_LFIST_SWORD2);
        _code.Write32(Z64Offsets.DL_LFIST_SWORD2);

        _code.GoTo(0x11A6DC);                    // Left Fist + Gilded Sword
        _code.Write32(Z64Offsets.DL_LFIST_SWORD3);
        _code.Write32(Z64Offsets.DL_LFIST_SWORD3);

        _code.GoTo(0x11A704);                    // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A72C);                    // Right Fist
        _code.Write32(Z64Offsets.DL_RFIST);
        _code.Write32(Z64Offsets.DL_RFIST);

        _code.GoTo(0x11A754);                    // Right Fist + 2's Bow
        _code.Write32(Z64Offsets.DL_RFIST_BOW);
        _code.Write32(Z64Offsets.DL_RFIST_BOW);

        _code.GoTo(0x11A77C);                    // Right Hand + Ocarina of Time
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_TIME);
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_TIME);

        _code.GoTo(0x11A7A4);                    // Right Fist + Hookshot
        _code.Write32(Z64Offsets.DL_RFIST_HOOKSHOT);
        _code.Write32(Z64Offsets.DL_RFIST_HOOKSHOT);

        _code.GoTo(0x11A7CC);                    // Outstreched Left Hand (for holding bottles)
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);

        _code.GoTo(0x11A7F8);                    // Left Fist
        _code.Write32(Z64Offsets.DL_LFIST);

        _code.GoTo(0x11A80C);                    // Right Shoulder
        _code.Write32(Z64Offsets.DL_RSHOULDER);

        _code.GoTo(0X11A820);                    // FPS Right Arm + 2's Bow
        _code.Write32(Z64Offsets.DL_FPS_RARM_BOW);

        _code.GoTo(0x11A834);                    // FPS Right Arm + Hookshot
        _code.Write32(Z64Offsets.DL_FPS_RARM_HOOKSHOT);

        _code.GoTo(0x11B2D4);                    // 2's Bow String
        _code.Write32(Z64Offsets.DL_BOW_STRING);

        // skeleton pointer
        _code.GoTo(0x11A340);
        _code.Write32(Z64Offsets.SKEL_SECTION);

        // Hookshot Spike
        _hook.GoTo(0xA2E);
        _hook.Hi32(Z64Offsets.DL_HOOKSHOT_HOOK);

        _hook.GoTo(0xA32);
        _hook.Lo32(Z64Offsets.DL_HOOKSHOT_HOOK);

        // FPS Glitch Fix (Thanks Fkualol!)
        _code.GoTo(0x11A7E4);
        _code.Write32(Z64Offsets.DF_COMMAND);

        // Swordless fix    (Thanks Nick!)
        _code.GoTo(0x11A5E4);
        _code.Write32(Z64Offsets.DF_COMMAND);                   // Sheathed Sword + Shield

        _code.GoTo(0x11A5BC);
        _code.Write32(Z64Offsets.DF_COMMAND);                   // Sheathed Sword

        // Unknown Pointers (?)
        _code.GoTo(0x11A594);
        _code.Write32(Z64Offsets.DF_COMMAND);

        _code.GoTo(0x11A598);
        _code.Write32(Z64Offsets.DF_COMMAND);

        _code.GoTo(0x11A5C0);
        _code.Write32(Z64Offsets.DF_COMMAND);

        _code.GoTo(0x11A5E8);
        _code.Write32(Z64Offsets.DF_COMMAND);

        _code.GoTo(0x11A350);
        _code.Write32(Z64Offsets.SKEL_SECTION);

        // Deku Link

        _code.GoTo(0x11A554);
        _code.Write32(Z64Offsets.DL_WAIST);  // Waist
        _code.Write32(Z64Offsets.DL_WAIST);

        _code.GoTo(0x11A644); // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A66C); // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A694); // Left Fist
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A6FC); // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A6BC); // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A724); // Right Fist
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A74C); // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A79C); // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A814); // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A828); // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A7C4); // Bottle Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A58C); // Sheath 
        _code.Write32(Z64Offsets.DF_COMMAND);
        _code.Write32(Z64Offsets.DF_COMMAND);

        _code.GoTo(0x11A5B4); // Sheath 
        _code.Write32(Z64Offsets.DF_COMMAND);
        _code.Write32(Z64Offsets.DF_COMMAND);

        _code.GoTo(0x11A5DC); // Sword and Shield in Sheath (Unused)
        _code.Write32(Z64Offsets.DF_COMMAND);
        _code.Write32(Z64Offsets.DF_COMMAND);

        _code.GoTo(0x11A7F4); // FPS Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A81C); //FPS Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A774); // Right Hand holding Deku Pipes
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11B370);
        _code.Write32(Z64Offsets.DL_PIPE_DOWN);

        _code.GoTo(0x11B374);
        _code.Write32(Z64Offsets.DL_PIPE_RIGHT);

        _code.GoTo(0x11B378);
        _code.Write32(Z64Offsets.DL_PIPE_LEFT);

        _code.GoTo(0x11B37C);
        _code.Write32(Z64Offsets.DL_PIPE_UP);

        _code.GoTo(0x11B36C);
        _code.Write32(Z64Offsets.DL_PIPE_A);

        _code.GoTo(0x11A808);                    // Right Shoulder
        _code.Write32(Z64Offsets.DL_RSHOULDER);

        _code.GoTo(0x11A7E0);
        _code.Write32(Z64Offsets.DL_LFOREARM);			   // Left Forearm

        _code.GoTo(0x11B058);
        _code.Write32(Z64Offsets.DL_STEM_LEFT);

        _code.GoTo(0x11B054);
        _code.Write32(Z64Offsets.DL_STEM_RIGHT);

        _player.GoTo(0x2FAE8); // Pad Wood
        _player.Write32(Z64Offsets.DL_PAD_WOOD);

        _player.GoTo(0x2FAE4); // Pad Grass
        _player.Write32(Z64Offsets.DL_PAD_GRASS);

        _player.GoTo(0x2FAEC); // Pad Opening
        _player.Write32(Z64Offsets.DL_PAD_OPENING);

        _code.GoTo(0x83ED6); // Deku Pipe Mouthpiece
        _code.Hi32(Z64Offsets.DL_PIPE_MOUTH);
        _code.GoTo(0x83EDA);
        _code.Lo32(Z64Offsets.DL_PIPE_MOUTH);

        _code.GoTo(0x83CFE); // Shield
        _code.Hi32(Z64Offsets.DL_DEKU_GUARD);
        _code.GoTo(0x83D02);
        _code.Lo32(Z64Offsets.DL_DEKU_GUARD);

        _code.GoTo(0x81902); // Deku Flower Closed
        _code.Hi32(Z64Offsets.DL_CENTER_FLOWER_PROPELLER_CLOSED);
        _code.GoTo(0x81906); // Deku Flower Closed
        _code.Lo32(Z64Offsets.DL_CENTER_FLOWER_PROPELLER_CLOSED);

        _code.GoTo(0x818DA); // Deku Flower Open
        _code.Hi32(Z64Offsets.DL_CENTER_FLOWER_PROPELLER_OPEN);
        _code.GoTo(0x8190E); // Deku Flower Open
        _code.Lo32(Z64Offsets.DL_CENTER_FLOWER_PROPELLER_OPEN);

        _player.GoTo(0x923A); // Deku Flower Landing Particle Effect
        _player.Hi32(Z64Offsets.DL_PETAL_PARTICLE);
        _player.GoTo(0x924A); // Deku Flower Landing Particle Effect
        _player.Lo32(Z64Offsets.DL_PETAL_PARTICLE);




        _code.GoTo(0x11A34C);
        _code.Write32(Z64Offsets.SKEL_SECTION);

        // Goron Link (LOL)

        _code.GoTo(0x11A544);
        _code.Write32(Z64Offsets.DL_WAIST);                   // Waist
        _code.Write32(Z64Offsets.DL_WAIST);

        _code.GoTo(0x11A800); // Right Shoulder
        _code.Write32(Z64Offsets.DL_RSHOULDER);

        _code.GoTo(0x11A7D8); // Left Forearm
        _code.Write32(Z64Offsets.DL_LFOREARM);

        _code.GoTo(0x11A634);                    // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A65C);                    // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A6AC);                    // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A7EC);                    // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A6AC);                    // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A684);                    // Left Fist
        _code.Write32(Z64Offsets.DL_LFIST);
        _code.Write32(Z64Offsets.DL_LFIST);

        _code.GoTo(0x11A6EC);                    // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A73C);                    // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A764);                    // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A78C);                    // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A714);                    // Right Fist
        _code.Write32(Z64Offsets.DL_RFIST);
        _code.Write32(Z64Offsets.DL_RFIST);

        _code.GoTo(0x11A314);                    // Curled
        _code.Write32(Z64Offsets.DL_CURLED);

        _code.GoTo(0x11B340);                    // Drum Up
        _code.Write32(Z64Offsets.DL_DRUM_UP);

        _code.GoTo(0x11B33C);                    // Drum Left
        _code.Write32(Z64Offsets.DL_DRUM_LEFT);

        _code.GoTo(0x11B338);                    // Drum Rignt
        _code.Write32(Z64Offsets.DL_DRUM_RIGHT);

        _code.GoTo(0x11B334);                    // Drum Down
        _code.Write32(Z64Offsets.DL_DRUM_DOWN);

        _code.GoTo(0x11B330);                    // Drum A
        _code.Write32(Z64Offsets.DL_DRUM_A);

        _code.GoTo(0x11A7B4);                    // Outstreched Left Hand (for holding bottles)
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);

        //skeleton pointer
        _code.GoTo(0x11A344);
        _code.Write32(Z64Offsets.SKEL_SECTION);

        //_code.GoTo(0x11A314);
        //_code.Write32(Z64Offsets.DL_CURLED);

        _player.GoTo(0x13EE2); //lui     a2, 0x0x01 ## a2 = 06010000
        _player.Hi32(Z64Offsets.SKEL_SECTION + 0x10);
        _player.GoTo(0x13F06); //addiu   a2, a2, 0x77B8  ## a2 = 060177B8
        _player.Lo32(Z64Offsets.SKEL_SECTION + 0x10);

        _player.GoTo(0x13EE6);
        _player.Hi32(Z64Offsets.GORON_MAGIC_0);
        _player.GoTo(0x13F02);
        _player.Lo32(Z64Offsets.GORON_MAGIC_0);

        _code.GoTo(0x7D326);
        _code.Hi32(Z64Offsets.GORON_MAGIC_1);
        _code.GoTo(0x7D32E);
        _code.Lo32(Z64Offsets.GORON_MAGIC_1);

        hilo(_player, 0x19132, 0x1913A, Z64Offsets.GORON_MAGIC_1);
        hilo(_player, 0x1916E, 0x1919A, Z64Offsets.GORON_MAGIC_1 + 0x10);
        
        hilo(_player, 0x1917E, 0x19182, Z64Offsets.DL_INIT_FIRE);
        hilo(_player, 0x191AE, 0x191B2, Z64Offsets.DL_FIRE_ROLL);
        hilo(_player, 0x18EEE, 0x18EF2, Z64Offsets.DL_CURLED);
        hilo(_player, 0x18F8A, 0x18F8E, Z64Offsets.DL_SPIKES);

        hilo(_code, 0x81A4A, 0x81A4E, Z64Offsets.DL_FIRE_PUNCH);
        _code.GoTo(0x11A324);
        _code.Write32(Z64Offsets.DL_FIRE_PUNCH);

        hilo(_code, 0x83932, 0x83936, Z64Offsets.DL_DRUM_STRAP);

        // Zora Link

        _code.GoTo(0x11A54C);
        _code.Write32(Z64Offsets.DL_WAIST);                   		// Waist
        _code.Write32(Z64Offsets.DL_WAIST);

        _code.GoTo(0x11A63C);                    // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A664);                    // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);

        _zot.GoTo(0x334C);                    // Left Hand
        _zot.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A68C);                    // Left Fist
        _code.Write32(Z64Offsets.DL_LFIST);
        _code.Write32(Z64Offsets.DL_LFIST);

        _code.GoTo(0x11A6b4);                    // Left Fist
        _code.Write32(Z64Offsets.DL_LFIST);
        _code.Write32(Z64Offsets.DL_LFIST);

        _code.GoTo(0x11A7F0);                    // Left Fist
        _code.Write32(Z64Offsets.DL_LFIST);

        _code.GoTo(0x11Aff4);                    // Left Fin
        _code.Write32(Z64Offsets.DL_LFIN);

        _code.GoTo(0x11AFFC);                    // Left Swimming Fin
        _code.Write32(Z64Offsets.DL_LFIN_SWIM);

        _code.GoTo(0x11A6f4);                    // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A744);                    // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A76c);                    // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A794);                    // Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A818);
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.GoTo(0x11A82c);
        _code.Write32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x11A71C);                    // Right Fist
        _code.Write32(Z64Offsets.DL_RFIST);
        _code.Write32(Z64Offsets.DL_RFIST);

        _code.GoTo(0x11AFF8);                    // Right Fin
        _code.Write32(Z64Offsets.DL_RFIN);

        _code.GoTo(0x11B000);                    // Right Swimming Fin
        _code.Write32(Z64Offsets.DL_RFIN_SWIM);

        _code.GoTo(0x11A7BC);                    // Outstreched Left Hand (for holding bottles)
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);

        _code.GoTo(0x11A6B4);                    // Left Fist
        _code.Write32(Z64Offsets.DL_LFIST);

        _code.GoTo(0x11A804);                    // Right Shoulder
        _code.Write32(Z64Offsets.DL_RSHOULDER);

        _code.GoTo(0x80522);
        _code.Hi32(Z64Offsets.DL_GUITAR_HAND);
        _code.GoTo(0x80526);
        _code.Lo32(Z64Offsets.DL_GUITAR_HAND);

        _code.GoTo(0x805A2);                      // Hard Coded Right Hand
        _code.Hi32(Z64Offsets.DL_RHAND);
        _code.GoTo(0x805A6);
        _code.Lo32(Z64Offsets.DL_RHAND);

        _code.GoTo(0x804C6);                      // Hard Coded Left Hand
        _code.Hi32(Z64Offsets.DL_LHAND);
        _code.GoTo(0x804CA);
        _code.Lo32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x83072);        // Hard Coded Guitar Hand
        _code.Hi32(Z64Offsets.DL_GUITAR_HAND);
        _code.GoTo(0x83076);
        _code.Lo32(Z64Offsets.DL_GUITAR_HAND);

        _code.GoTo(0x811A6);
        _code.Hi32(Z64Offsets.DL_FIN_SHIELD);
        _code.GoTo(0x811AA);
        _code.Lo32(Z64Offsets.DL_FIN_SHIELD);

        _code.GoTo(0x7FA12);
        _code.Hi32(Z64Offsets.DL_MAGIC_BARRIER);
        _code.GoTo(0x7FA16);
        _code.Lo32(Z64Offsets.DL_MAGIC_BARRIER);

        _code.GoTo(0x7F90A);                      //Do Magic Branch Stuff
        _code.Hi32(Z64Offsets.ZORA_MAGIC_1);
        _code.GoTo(0x7F916);
        _code.Lo32(Z64Offsets.ZORA_MAGIC_1);

        _code.GoTo(0x7F97C);
        _code.HexString("0x1000001B00000000"); //Do Magic Branch Stuff

        _code.GoTo(0x11A348);
        _code.Write32(Z64Offsets.SKEL_SECTION);

        // Fierce Deity

        _code.GoTo(0x11A53C);    // Waist'
        _code.Write32(Z64Offsets.DL_WAIST);
        _code.Write32(Z64Offsets.DL_WAIST);
        _code.GoTo(0x11A7AC);    // Bottle Hand
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);
        _code.GoTo(0x11A7D4);    // FPS Left shoulder
        _code.Write32(Z64Offsets.DL_LSHOULDER);
        _code.GoTo(0x11A7E8);    // FPS Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);

        _code.GoTo(0x11A340);
        _code.Write32(Z64Offsets.SKEL_SECTION);

        //Hands

        _code.GoTo(0x11A6E4); //Right Hand
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.GoTo(0x11A70C); //??
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.GoTo(0x11A734); //Bow
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.GoTo(0x11A75C); //Ocarina
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.GoTo(0x11A784); //Hookshot
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.GoTo(0x11A810); //FPS Bow
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.GoTo(0x11A824); //FPS Hookshot
        _code.Write32(Z64Offsets.DL_RHAND);
        _code.Write32(Z64Offsets.DL_RHAND);

        //Left Hand

        _code.GoTo(0x11A654); // Left Hand
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.Write32(Z64Offsets.DL_LHAND);
        _code.GoTo(0x11A67C); // Left Fist
        _code.Write32(Z64Offsets.DL_LFIST);
        _code.Write32(Z64Offsets.DL_LFIST);
        _code.GoTo(0x11A6A4); // Broad Sword
        _code.Write32(Z64Offsets.DL_LHAND_SWORD_DEITY);
        _code.Write32(Z64Offsets.DL_LHAND_SWORD_DEITY);
        _code.GoTo(0x11A62C);  //Long Sword
        _code.Write32(Z64Offsets.DL_LHAND_SWORD_DEITY);
        _code.Write32(Z64Offsets.DL_LHAND_SWORD_DEITY);

        _code.GoTo(0x11B0B0);
        _code.Write32(Z64Offsets.DL_DEITY_MASK);
        _code.Write32(Z64Offsets.DL_GORON_MASK);
        _code.Write32(Z64Offsets.DL_ZORA_MASK);
        _code.Write32(Z64Offsets.DL_DEKU_MASK);

        // End

        tools.recompressDMAFileIntoRom(rom, 31, _code.buf);
        tools.recompressDMAFileIntoRom(rom, 83, _hook.buf);
        tools.recompressDMAFileIntoRom(rom, 38, _player.buf);
        tools.recompressDMAFileIntoRom(rom, 511, _zot.buf)

        fs.writeFileSync("./player.ovl", _player.buf);
        fs.writeFileSync("./code_dirty.bin", _code.buf);

        return true;
    }
}