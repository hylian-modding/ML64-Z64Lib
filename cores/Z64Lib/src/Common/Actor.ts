import IMemory from 'modloader64_api/IMemory';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';
import fs from 'fs';
import path from 'path';
import Vector3 from 'modloader64_api/math/Vector3';
import { Z64_OVERLAY_TABLE } from './types/GameAliases';
import { IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';

export class Position extends JSONTemplate implements Z64API.IPosition {
    private readonly offset: number;
    private readonly parent: IMemory;
    jsonFields: string[] = ['x', 'y', 'z'];

    constructor(parent: IMemory, offset: number = Z64CORE.Z64.Z64_ACTOR_POSITION_OFFSET) {
        super();
        this.parent = parent;
        this.offset = offset;
    }

    get x(): number {
        return this.parent.rdramReadF32(this.offset + 0);
    }
    set x(x: number) {
        this.parent.rdramWriteF32(this.offset + 0, x);
    }

    get y(): number {
        return this.parent.rdramReadF32(this.offset + 4);
    }
    set y(y: number) {
        this.parent.rdramWriteF32(this.offset + 4, y);
    }

    get z(): number {
        return this.parent.rdramReadF32(this.offset + 8);
    }
    set z(z: number) {
        this.parent.rdramWriteF32(this.offset + 8, z);
    }

    getRawPos(): Buffer {
        return this.parent.rdramReadBuffer(this.offset, Z64CORE.Z64.Z64_ACTOR_POSITION_SIZE);
    }

    setRawPos(pos: Buffer) {
        this.parent.rdramWriteBuffer(this.offset, pos);
    }

    getVec3(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }
}

export class Rotation extends JSONTemplate implements Z64API.IRotation {
    private readonly parent: IMemory;
    private readonly offset: number;
    jsonFields: string[] = ['x', 'y', 'z'];

    constructor(parent: IMemory, offset: number = Z64CORE.Z64.Z64_ACTOR_ROTATION_OFFSET) {
        super();
        this.parent = parent;
        this.offset = offset;
    }

    get x(): number {
        return this.parent.rdramReadS16(this.offset + 0);
    }
    set x(x: number) {
        this.parent.rdramWrite16(this.offset + 0, x);
    }

    get y(): number {
        return this.parent.rdramReadS16(this.offset + 2);
    }
    set y(y: number) {
        this.parent.rdramWrite16(this.offset + 2, y);
    }

    get z(): number {
        return this.parent.rdramReadS16(this.offset + 4);
    }
    set z(z: number) {
        this.parent.rdramWrite16(this.offset + 4, z);
    }

    getRawRot(): Buffer {
        return this.parent.rdramReadBuffer(this.offset, Z64CORE.Z64.Z64_ACTOR_ROTATION_SIZE);
    }

    setRawRot(rot: Buffer) {
        this.parent.rdramWriteBuffer(this.offset, rot);
    }

    getVec3(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }
}

export class ActorDeathBehavior {
    offset: number;
    behavior_calc: number;

    constructor(offset: number, behavior_calc: number) {
        this.offset = offset;
        this.behavior_calc = behavior_calc;
    }
}

export interface IActorDeathFile {
    id: number;
    death: ActorDeathBehavior;
}

export const actorDeathBehaviorMap: Map<number, ActorDeathBehavior> = new Map<
    number,
    ActorDeathBehavior
>();
/*
fs.readdirSync(path.join(__dirname, 'actorDeaths')).forEach((file: string) => {
    let parse = path.parse(file);
    if (parse.ext === '.js') {
        let cls = require(path.resolve(path.join(__dirname, 'actorDeaths', file)))[
            parse.name
        ];
        let instance: IActorDeathFile = new cls();
        actorDeathBehaviorMap.set(instance.id, instance.death);
    }
});*/

export function setActorBehavior(
    emulator: IMemory,
    actor: Z64API.IActor,
    offset: number,
    behavior: number
) {
    let id: number = actor.actorID;
    let overlay_table: number = Z64_OVERLAY_TABLE;
    let overlay_entry = overlay_table + id * 32;
    let behavior_start = overlay_entry + 0x10;
    let pointer = emulator.dereferencePointer(behavior_start);
    let behavior_result = pointer + behavior;
    actor.rdramWrite32(offset, behavior_result + 0x80000000);
}

export function getActorBehavior(
    emulator: IMemory,
    actor: Z64API.IActor,
    offset: number
): number {
    let id: number = actor.actorID;
    let overlay_table: number = Z64_OVERLAY_TABLE;
    let overlay_entry = overlay_table + id * 32;
    let behavior_start = overlay_entry + 0x10;
    let pointer = emulator.dereferencePointer(behavior_start);
    let behavior = actor.dereferencePointer(offset);
    return behavior - pointer;
}

export class ActorBase extends JSONTemplate implements Z64API.IActor {
    actorUUID = '';
    private readonly emulator: IMemory;
    pointer: number;
    exists = true;
    rotation: Z64API.IRotation;
    position: Z64API.IPosition;
    homePos: Z64API.IPosition;
    homeRot: Z64API.IRotation;

    jsonFields: string[] = [
        'actorID',
        'actorUUID',
        'rotation',
        'position',
    ];

    constructor(ModLoader: IModLoaderAPI, scene: number, pointer: number) {
        super();
        this.emulator = ModLoader.emulator;
        this.pointer = pointer;
        this.rotation = new Rotation(this);
        this.position = new Position(this);
        this.homePos = new Position(this, 0x8);
        this.homeRot = new Rotation(this, 0xC);
        this.actorUUID = `${this.actorID}|${this.actorType}|${scene}|${this.room}|${this.homePos.getRawPos().toString('hex')}|${this.homeRot.getRawRot().toString('hex')}`;
        this.actorUUID = ModLoader.utils.hashBuffer(Buffer.from(this.actorUUID));
    }

    isTransitionActor: boolean = false;

    getRdramBuffer(): ArrayBuffer {
        return this.emulator.getRdramBuffer();
    }

    bitCount8(value: number): number {
        return this.emulator.bitCount8(value);
    }
    bitCount16(value: number): number {
        return this.emulator.bitCount16(value);
    }
    bitCount32(value: number): number {
        return this.emulator.bitCount32(value);
    }
    bitCountBuffer(buf: Buffer, off: number, len: number): number {
        return this.emulator.bitCountBuffer(buf, off, len);
    }

    invalidateCachedCode(): void {
    }

    get actorID(): number {
        return this.rdramRead16(0x0);
    }

    get actorType(): Z64API.ActorCategory {
        return this.rdramRead8(0x2);
    }

    get room(): number {
        return this.rdramRead8(0x3);
    }
    set room(r: number) {
        this.rdramWrite8(0x3, r);
    }

    get renderingFlags(): number {
        return this.rdramRead32(0x4);
    }

    set renderingFlags(flags: number) {
        this.rdramWrite32(0x4, flags);
    }

    get variable(): number {
        return this.rdramRead16(0x1c);
    }

    get objectTableIndex(): number {
        return this.rdramRead8(0x1e);
    }

    get soundEffect(): number {
        return this.rdramRead16(0x20);
    }

    set soundEffect(s: number) {
        this.rdramWrite16(0x20, s);
    }

    get health(): number {
        return this.rdramRead8(0xaf);
    }

    set health(h: number) {
        this.rdramWrite8(0xaf, h);
    }

    get redeadFreeze(): number {
        return this.rdramReadS16(0x110);
    }

    set redeadFreeze(f: number) {
        this.rdramWrite16(0x110, f);
    }

    destroy(): void {
        if (actorDeathBehaviorMap.has(this.actorID)) {
            let b: ActorDeathBehavior = actorDeathBehaviorMap.get(this.actorID)!;
            setActorBehavior(this.emulator, this, b.offset, b.behavior_calc);
        } else {
            this.rdramWrite32(0x130, 0x0);
            this.rdramWrite32(0x134, 0x0);
        }
    }

    rdramRead8(addr: number): number {
        return this.emulator.rdramRead8(this.pointer + addr);
    }
    rdramWrite8(addr: number, value: number): void {
        this.emulator.rdramWrite8(this.pointer + addr, value);
    }
    rdramRead16(addr: number): number {
        return this.emulator.rdramRead16(this.pointer + addr);
    }
    rdramWrite16(addr: number, value: number): void {
        this.emulator.rdramWrite16(this.pointer + addr, value);
    }
    rdramWrite32(addr: number, value: number): void {
        this.emulator.rdramWrite32(this.pointer + addr, value);
    }
    rdramRead32(addr: number): number {
        return this.emulator.rdramRead32(this.pointer + addr);
    }
    rdramReadBuffer(addr: number, size: number): Buffer {
        return this.emulator.rdramReadBuffer(this.pointer + addr, size);
    }
    rdramWriteBuffer(addr: number, buf: Buffer): void {
        this.emulator.rdramWriteBuffer(this.pointer + addr, buf);
    }
    dereferencePointer(addr: number): number {
        return this.emulator.dereferencePointer(this.pointer + addr);
    }
    rdramReadS8(addr: number): number {
        return this.emulator.rdramReadS8(this.pointer + addr);
    }
    rdramReadS16(addr: number): number {
        return this.emulator.rdramReadS16(this.pointer + addr);
    }
    rdramReadS32(addr: number): number {
        return this.emulator.rdramReadS32(this.pointer + addr);
    }
    rdramReadBitsBuffer(addr: number, bytes: number): Buffer {
        return this.emulator.rdramReadBitsBuffer(this.pointer + addr, bytes);
    }
    rdramReadBits8(addr: number): Buffer {
        return this.emulator.rdramReadBits8(this.pointer + addr);
    }
    rdramReadBit8(addr: number, bitoffset: number): boolean {
        return this.emulator.rdramReadBit8(this.pointer + addr, bitoffset);
    }
    rdramWriteBitsBuffer(addr: number, buf: Buffer): void {
        this.emulator.rdramWriteBitsBuffer(this.pointer + addr, buf);
    }
    rdramWriteBits8(addr: number, buf: Buffer): void {
        this.emulator.rdramWriteBits8(this.pointer + addr, buf);
    }
    rdramWriteBit8(addr: number, bitoffset: number, bit: boolean): void {
        this.emulator.rdramWriteBit8(this.pointer + addr, bitoffset, bit);
    }
    rdramReadPtr8(addr: number, offset: number): number {
        return this.emulator.rdramReadPtr8(this.pointer + addr, offset);
    }
    rdramWritePtr8(addr: number, offset: number, value: number): void {
        this.emulator.rdramWritePtr8(this.pointer + addr, offset, value);
    }
    rdramReadPtr16(addr: number, offset: number): number {
        return this.emulator.rdramReadPtr16(this.pointer + addr, offset);
    }
    rdramWritePtr16(addr: number, offset: number, value: number): void {
        this.emulator.rdramWritePtr16(this.pointer + addr, offset, value);
    }
    rdramWritePtr32(addr: number, offset: number, value: number): void {
        this.emulator.rdramWritePtr32(this.pointer + addr, offset, value);
    }
    rdramReadPtr32(addr: number, offset: number): number {
        return this.emulator.rdramReadPtr32(this.pointer + addr, offset);
    }
    rdramReadPtrBuffer(addr: number, offset: number, size: number): Buffer {
        return this.emulator.rdramReadPtrBuffer(this.pointer + addr, offset, size);
    }
    rdramWritePtrBuffer(addr: number, offset: number, buf: Buffer): void {
        this.emulator.rdramWritePtrBuffer(this.pointer + addr, offset, buf);
    }
    rdramReadPtrS8(addr: number, offset: number): number {
        return this.emulator.rdramReadPtrS8(this.pointer + addr, offset);
    }
    rdramReadPtrS16(addr: number, offset: number): number {
        return this.emulator.rdramReadPtrS16(this.pointer + addr, offset);
    }
    rdramReadPtrS32(addr: number, offset: number): number {
        return this.emulator.rdramReadPtrS32(this.pointer + addr, offset);
    }
    rdramReadPtrBitsBuffer(addr: number, offset: number, bytes: number): Buffer {
        return this.emulator.rdramReadPtrBitsBuffer(
            this.pointer + addr,
            offset,
            bytes
        );
    }
    rdramReadPtrBits8(addr: number, offset: number): Buffer {
        return this.emulator.rdramReadPtrBits8(this.pointer + addr, offset);
    }
    rdramReadPtrBit8(addr: number, offset: number, bitoffset: number): boolean {
        return this.emulator.rdramReadPtrBit8(
            this.pointer + addr,
            offset,
            bitoffset
        );
    }
    rdramWritePtrBitsBuffer(addr: number, offset: number, buf: Buffer): void {
        this.emulator.rdramWritePtrBitsBuffer(this.pointer + addr, offset, buf);
    }
    rdramWritePtrBits8(addr: number, offset: number, buf: Buffer): void {
        this.emulator.rdramWritePtrBits8(this.pointer + addr, offset, buf);
    }
    rdramWritePtrBit8(
        addr: number,
        offset: number,
        bitoffset: number,
        bit: boolean
    ): void {
        this.emulator.rdramWritePtrBit8(
            this.pointer + addr,
            offset,
            bitoffset,
            bit
        );
    }
    rdramReadF32(addr: number): number {
        return this.emulator.rdramReadF32(this.pointer + addr);
    }
    rdramReadPtrF32(addr: number, offset: number): number {
        return this.emulator.rdramReadPtrF32(this.pointer + addr, offset);
    }
    rdramWriteF32(addr: number, value: number): void {
        this.emulator.rdramWriteF32(this.pointer + addr, value);
    }
    rdramWritePtrF32(addr: number, offset: number, value: number): void {
        this.emulator.rdramWritePtrF32(this.pointer + addr, offset, value);
    }

    rdramRead64(addr: number): number {
        return this.emulator.rdramRead64(this.pointer + addr);
    }

    rdramReadS64(addr: number): number {
        return this.emulator.rdramReadS64(this.pointer + addr);
    }

    rdramReadF64(addr: number): number {
        return this.emulator.rdramReadF64(this.pointer + addr);
    }

    rdramWrite64(addr: number, val: number): void {
        this.emulator.rdramWrite64(this.pointer + addr, val)
    }

    rdramWriteF64(addr: number, val: number): void {
        this.emulator.rdramWriteF64(this.pointer + addr, val);
    }

    rdramReadBigInt64(addr: number): BigInt {
        return this.emulator.rdramReadBigInt64(this.pointer + addr);
    }

    rdramReadBigIntS64(addr: number): BigInt {
        return this.emulator.rdramReadBigIntS64(this.pointer + addr);
    }

    rdramWriteBigInt64(addr: number, val: BigInt): void {
        this.emulator.rdramWriteBigInt64(this.pointer + addr, val);
    }

    memoryDebugLogger(bool: boolean): void { }
}
