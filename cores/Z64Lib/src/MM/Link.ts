import IMemory from 'modloader64_api/IMemory';
import Vector3 from 'modloader64_api/math/Vector3';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import { IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsMM';

export class Link extends JSONTemplate implements Z64API.Z64.ILink {
    private emulator: IMemory;
    private instance = Z64CORE.Z64_PLAYER;
    private save_context = Z64CORE.Z64_SAVE;
    private anim = 0x80400500;
    private state_addr: number = 0x8040081C;
    private state2_addr: number = 0x8040081C; //TODO: Find real State2_Addr
    private tunic_addr: number = this.instance + 0x013c;
    private shield_addr: number = this.instance + 0x013e;
    private bMMs_addr: number = this.instance + 0x013f;
    private mask_addr: number = this.instance + 0x014f;
    private pos_addr: number = this.instance + 0x24;
    private rot_addr: number = this.instance + 0xb4;
    private sword_addr: number = this.save_context + 0x0070 + 0x1;

    private link_state: number = 0xA6C;

    private sound_addr: number = 0x800000 + 0x88;
    private anim_data_addr = 0x600000;
    private anim_raw_data_addr = this.instance + this.anim;

    rotation: Z64API.IRotation;
    position: Z64API.IPosition;
    actorUUID = 'Link';

    jsonFields: string[] = [
        'state',
        'tunic',
        'shield',
        'bMMs',
        'mask',
        'pos',
        'rot',
        'anim_data',
        'current_sound_id',
    ];

    constructor(emu: IMemory) {
        super();
        this.emulator = emu;
        this.rotation = new Z64CORE.Rotation(this);
        this.position = new Z64CORE.Position(this);
    }
    tunic: any;
    boots: any;
    projected_position!: Vector3;
    pointer!: number;
    isTransitionActor!: boolean;

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
    getRdramBuffer(): ArrayBuffer {
        return this.emulator.getRdramBuffer();
    }

    invalidateCachedCode(): void {
    }

    get rawStateValue(): number {

        return this.emulator.rdramRead32(this.instance + this.link_state);
    }

    get anim_data(): Buffer {
        return this.emulator.rdramReadBuffer(this.anim, 0x86);
    }

    get rawPos(): Buffer {
        return this.emulator.rdramReadBuffer(this.instance + 0x24, 0xC);
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

    get exists(): boolean {
        return this.emulator.rdramRead32(this.instance) === 0x2ff;
    }

    destroy(): void { }

    get state(): Z64API.Z64.LinkState {
        switch (this.emulator.rdramRead32(this.state_addr)) {
            case 0:
                return Z64API.Z64.LinkState.STANDING;
            case 0x00000008:
                return Z64API.Z64.LinkState.STANDING;
            case 0x20000000:
                return Z64API.Z64.LinkState.BUSY;
            case 0x30000000:
                return Z64API.Z64.LinkState.OCARINA;
            case 0x20000001:
                return Z64API.Z64.LinkState.LOADING_ZONE;
            case 0x80000000:
                return Z64API.Z64.LinkState.ENTERING_GROTTO;
            case 0x00100000:
                return Z64API.Z64.LinkState.FIRST_PERSON;
            case 0x00040000:
                return Z64API.Z64.LinkState.JUMPING;
            case 0x08000000:
                return Z64API.Z64.LinkState.SWIMMING;
            case 0x00004000:
                return Z64API.Z64.LinkState.CLIMBING_OUT_OF_WATER;
            case 0x00002000:
                return Z64API.Z64.LinkState.HANGING_FROM_LEDGE;
            case 0x00800000:
                return Z64API.Z64.LinkState.RIDING_EPONA;
            case 0x00000080:
                return Z64API.Z64.LinkState.DYING;
            case 0x04000000:
                return Z64API.Z64.LinkState.TAKING_DAMAGE;
            case 0x00080000:
                return Z64API.Z64.LinkState.FALLING;
            case 0x00068000:
                return Z64API.Z64.LinkState.FALLING;
            case 0xa0040000:
                return Z64API.Z64.LinkState.VOIDING_OUT;
            case 0x20000c00:
                return Z64API.Z64.LinkState.GETTING_ITEM;
            case 0x20010040:
                return Z64API.Z64.LinkState.TALKING;
            case 0x00018000:
                return Z64API.Z64.LinkState.Z_TARGETING;
            case 0x00028000:
                return Z64API.Z64.LinkState.Z_TARGETING;
            case 0x00000800:
                return Z64API.Z64.LinkState.HOLDING_ACTOR;
            case 0x00100200:
                return Z64API.Z64.LinkState.CAMERA;
            case 0x00100208:
                return Z64API.Z64.LinkState.CAMERA;
        }

        return Z64API.Z64.LinkState.UNKNOWN;
    }

    get state2(): Z64API.Z64.LinkState2 {
        let s2: number = this.emulator.rdramRead32(this.state2_addr);
        let digits = s2.toString().split('');
        let realDigits = digits.map(Number);
        let idle: number = realDigits[0];
        let crawlspace: number = realDigits[3];
        let moving: number = realDigits[6];
        if (idle === 0x1) {
            return Z64API.Z64.LinkState2.IDLE;
        }
        if (crawlspace === 0x4) {
            return Z64API.Z64.LinkState2.CRAWLSPACE;
        }
        if (moving === 0x2) {
            return Z64API.Z64.LinkState2.MOVING_FORWARD;
        }
        return Z64API.Z64.LinkState2.UNKNOWN;
    }

    get shield(): Z64API.Z64.Shield {
        return this.emulator.rdramRead8(this.shield_addr);
    }
    set shield(shield: Z64API.Z64.Shield) {
        this.emulator.rdramWrite8(this.shield_addr, shield);
    }
    get sword(): Z64API.Z64.Sword {
        return this.emulator.rdramRead8(this.sword_addr);
    }
    set sword(sword: Z64API.Z64.Sword) {
        this.emulator.rdramWrite8(this.sword_addr, sword);
    }

    get mask(): Z64API.Z64.Mask {
        return this.emulator.rdramRead8(this.mask_addr);
    }
    set mask(mask: Z64API.Z64.Mask) {
        this.emulator.rdramWrite8(this.mask_addr, mask);
    }
    get pos(): Buffer {
        return this.emulator.rdramReadBuffer(this.pos_addr, 0xc);
    }
    set pos(pos: Buffer) {
        this.emulator.rdramWriteBuffer(this.pos_addr, pos);
    }
    get rot(): Buffer {
        return this.emulator.rdramReadBuffer(this.rot_addr, 0x8);
    }
    set rot(rot: Buffer) {
        this.emulator.rdramWriteBuffer(this.rot_addr, rot);
    }

    set anim_data(buf: Buffer) {
        this.emulator.rdramWriteBuffer(this.anim_raw_data_addr, buf);
    }
    get current_sound_id(): number {
        return this.emulator.rdramRead16(this.sound_addr);
    }
    set current_sound_id(s: number) {
        this.emulator.rdramWrite16(this.sound_addr, s);
    }
    get_anim_id(): number {
        return this.emulator.rdramRead16(this.instance + 0x1ae);
    }
    get_anim_frame(): number {
        return this.emulator.rdramRead16(this.instance + 0x1f4);
    }
    // Give ILink a complete IMemory implementation for shortcuts.
    rdramRead8(addr: number): number {
        return this.emulator.rdramRead8(this.instance + addr);
    }
    rdramWrite8(addr: number, value: number): void {
        this.emulator.rdramWrite8(this.instance + addr, value);
    }
    rdramRead16(addr: number): number {
        return this.emulator.rdramRead16(this.instance + addr);
    }
    rdramWrite16(addr: number, value: number): void {
        this.emulator.rdramWrite16(this.instance + addr, value);
    }
    rdramWrite32(addr: number, value: number): void {
        this.emulator.rdramWrite32(this.instance + addr, value);
    }
    rdramRead32(addr: number): number {
        return this.emulator.rdramRead32(this.instance + addr);
    }
    rdramReadBuffer(addr: number, size: number): Buffer {
        return this.emulator.rdramReadBuffer(this.instance + addr, size);
    }
    rdramWriteBuffer(addr: number, buf: Buffer): void {
        this.emulator.rdramWriteBuffer(this.instance + addr, buf);
    }
    dereferencePointer(addr: number): number {
        return this.emulator.dereferencePointer(this.instance + addr);
    }
    rdramReadS8(addr: number): number {
        return this.emulator.rdramReadS8(this.instance + addr);
    }
    rdramReadS16(addr: number): number {
        return this.emulator.rdramReadS16(this.instance + addr);
    }
    rdramReadS32(addr: number): number {
        return this.emulator.rdramReadS32(this.instance + addr);
    }
    rdramReadBitsBuffer(addr: number, bytes: number): Buffer {
        return this.emulator.rdramReadBitsBuffer(this.instance + addr, bytes);
    }
    rdramReadBits8(addr: number): Buffer {
        return this.emulator.rdramReadBits8(this.instance + addr);
    }
    rdramReadBit8(addr: number, bitoffset: number): boolean {
        return this.emulator.rdramReadBit8(this.instance + addr, bitoffset);
    }
    rdramWriteBitsBuffer(addr: number, buf: Buffer): void {
        this.emulator.rdramWriteBitsBuffer(this.instance + addr, buf);
    }
    rdramWriteBits8(addr: number, buf: Buffer): void {
        this.emulator.rdramWriteBits8(this.instance + addr, buf);
    }
    rdramWriteBit8(addr: number, bitoffset: number, bit: boolean): void {
        this.emulator.rdramWriteBit8(this.instance + addr, bitoffset, bit);
    }
    rdramReadPtr8(addr: number, offset: number): number {
        return this.emulator.rdramReadPtr8(this.instance + addr, offset);
    }
    rdramWritePtr8(addr: number, offset: number, value: number): void {
        this.emulator.rdramWritePtr8(this.instance + addr, offset, value);
    }
    rdramReadPtr16(addr: number, offset: number): number {
        return this.emulator.rdramReadPtr16(this.instance + addr, offset);
    }
    rdramWritePtr16(addr: number, offset: number, value: number): void {
        this.emulator.rdramWritePtr16(this.instance + addr, offset, value);
    }
    rdramWritePtr32(addr: number, offset: number, value: number): void {
        this.emulator.rdramWritePtr32(this.instance + addr, offset, value);
    }
    rdramReadPtr32(addr: number, offset: number): number {
        return this.emulator.rdramReadPtr32(this.instance + addr, offset);
    }
    rdramReadPtrBuffer(addr: number, offset: number, size: number): Buffer {
        return this.emulator.rdramReadPtrBuffer(this.instance + addr, offset, size);
    }
    rdramWritePtrBuffer(addr: number, offset: number, buf: Buffer): void {
        this.emulator.rdramWritePtrBuffer(this.instance + addr, offset, buf);
    }
    rdramReadPtrS8(addr: number, offset: number): number {
        return this.emulator.rdramReadPtrS8(this.instance + addr, offset);
    }
    rdramReadPtrS16(addr: number, offset: number): number {
        return this.emulator.rdramReadPtrS16(this.instance + addr, offset);
    }
    rdramReadPtrS32(addr: number, offset: number): number {
        return this.emulator.rdramReadPtrS32(this.instance + addr, offset);
    }
    rdramReadPtrBitsBuffer(addr: number, offset: number, bytes: number): Buffer {
        return this.emulator.rdramReadPtrBitsBuffer(
            this.instance + addr,
            offset,
            bytes
        );
    }
    rdramReadPtrBits8(addr: number, offset: number): Buffer {
        return this.emulator.rdramReadPtrBits8(this.instance + addr, offset);
    }
    rdramReadPtrBit8(addr: number, offset: number, bitoffset: number): boolean {
        return this.emulator.rdramReadPtrBit8(
            this.instance + addr,
            offset,
            bitoffset
        );
    }
    rdramWritePtrBitsBuffer(addr: number, offset: number, buf: Buffer): void {
        this.emulator.rdramWritePtrBitsBuffer(this.instance + addr, offset, buf);
    }
    rdramWritePtrBits8(addr: number, offset: number, buf: Buffer): void {
        this.emulator.rdramWritePtrBits8(this.instance + addr, offset, buf);
    }
    rdramWritePtrBit8(
        addr: number,
        offset: number,
        bitoffset: number,
        bit: boolean
    ): void {
        this.emulator.rdramWritePtrBit8(
            this.instance + addr,
            offset,
            bitoffset,
            bit
        );
    }
    rdramReadF32(addr: number): number {
        return this.emulator.rdramReadF32(this.instance + addr);
    }
    rdramReadPtrF32(addr: number, offset: number): number {
        return this.emulator.rdramReadPtrF32(this.instance + addr, offset);
    }
    rdramWriteF32(addr: number, value: number): void {
        this.emulator.rdramWriteF32(this.instance + addr, value);
    }
    rdramWritePtrF32(addr: number, offset: number, value: number): void {
        this.emulator.rdramWritePtrF32(this.instance + addr, offset, value);
    }
    memoryDebugLogger(bool: boolean): void { }

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
}