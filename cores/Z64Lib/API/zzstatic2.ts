export enum DisplayOpcodes {
    G_NOOP = 0x00
    , G_VTX = 0x01
    , G_MODIFYVTX = 0x02
    , G_CULLDL = 0x03
    , G_BRANCH_Z = 0x04
    , G_TRI1 = 0x05
    , G_TRI2 = 0x06
    , G_QUAD = 0x07
    , G_SPECIAL_3 = 0xD3
    , G_SPECIAL_2 = 0xD4
    , G_SPECIAL_1 = 0xD5
    , G_DMA_IO = 0xD6
    , G_TEXTURE = 0xD7
    , G_POPMTX = 0xD8
    , G_GEOMETRYMODE = 0xD9
    , G_MTX = 0xDA
    , G_MOVEWORD = 0xDB
    , G_MOVEMEM = 0xDC
    , G_LOAD_UCODE = 0xDD
    , G_DL = 0xDE
    , G_ENDDL = 0xDF
    , G_SPNOOP = 0xE0
    , G_RDPHALF_1 = 0xE1
    , G_SETOTHERMODE_L = 0xE2
    , G_SETOTHERMODE_H = 0xE3
    , G_TEXRECT = 0xE4
    , G_TEXRECTFLIP = 0xE5
    , G_RDPLOADSYNC = 0xE6
    , G_RDPPIPESYNC = 0xE7
    , G_RDPTILESYNC = 0xE8
    , G_RDPFULLSYNC = 0xE9
    , G_SETKEYGB = 0xEA
    , G_SETKEYR = 0xEB
    , G_SETCONVERT = 0xEC
    , G_SETSCISSOR = 0xED
    , G_SETPRIMDEPTH = 0xEE
    , G_RDPSETOTHERMODE = 0xEF
    , G_LOADTLUT = 0xF0
    , G_RDPHALF_2 = 0xF1
    , G_SETTILESIZE = 0xF2
    , G_LOADBLOCK = 0xF3
    , G_LOADTILE = 0xF4
    , G_SETTILE = 0xF5
    , G_FILLRECT = 0xF6
    , G_SETFILLCOLOR = 0xF7
    , G_SETFOGCOLOR = 0xF8
    , G_SETBLENDCOLOR = 0xF9
    , G_SETPRIMCOLOR = 0xFA
    , G_SETENVCOLOR = 0xFB
    , G_SETCOMBINE = 0xFC
    , G_SETTIMG = 0xFD
    , G_SETZIMG = 0xFE
    , G_SETCIMG = 0xFF
}

export class zzstatic2 {

    pointerList: Array<number> = [];
    temp: Buffer = Buffer.alloc(4);

    isValidOpCode(op: number) {
        return DisplayOpcodes[op] !== undefined;
    }

    isOpCodeEnd(op: DisplayOpcodes) {
        switch (op) {
            case DisplayOpcodes.G_ENDDL:
                return true;
        }
        return false;
    }

    doesOpCodeHavePointer(op: DisplayOpcodes) {
        switch (op) {
            case DisplayOpcodes.G_VTX:
            case DisplayOpcodes.G_BRANCH_Z:
            case DisplayOpcodes.G_MTX:
            case DisplayOpcodes.G_DL:
            case DisplayOpcodes.G_SETTIMG:
            case DisplayOpcodes.G_SETZIMG:
            case DisplayOpcodes.G_SETCIMG:
                return true;
        }
        return false;
    }

    readCommand(buf: Buffer, offset: number) {
        return new Command(buf.readUInt8(offset), buf.readUInt32BE(offset) & 0x00FFFFFF);
    }

    readPointer(buf: Buffer, offset: number) {
        return buf.readUInt32BE(offset) & 0x00FFFFFF;
    }

    repoint(buf: Buffer, base: number) {
        for (let i = 0; i < buf.byteLength; i += 8) {
            let cmd = this.readCommand(buf, i);
            if (this.isOpCodeEnd(cmd.id)) {
                let reverse = i;
                while (this.isValidOpCode(cmd.id)) {
                    if (this.doesOpCodeHavePointer(cmd.id)) {
                        this.pointerList.push(reverse + 4);
                    }
                    reverse -= 8;
                    cmd = this.readCommand(buf, reverse);
                }
            }
        }
        let start = buf.indexOf(Buffer.from("MODLOADER64"));
        let cur = start + 0x90;
        let end = this.readPointer(buf, start + 0xC);
        this.pointerList.push(start + 0xC);
        this.pointerList.push(end);
        while (cur !== end) {
            let cmd = this.readCommand(buf, cur);
            if (this.doesOpCodeHavePointer(cmd.id)) {
                this.pointerList.push(cur + 4);
            }
            cur += 8;
        }
        let skelp = this.readPointer(buf, end);
        let bones = buf.readUInt8(end + 4) + 1;
        for (let i = 0; i < bones; i++) {
            this.pointerList.push(skelp + (i * 4));
            let bone = this.readPointer(buf, skelp + (i * 4));
            bone += 8;
            this.temp.writeUInt32BE(bone);
            if (this.temp.readUInt8(0) === 0x06) {
                this.pointerList.push(bone);
            }
            bone += 4;
            this.temp.writeUInt32BE(bone);
            if (this.temp.readUInt8(0) === 0x06) {
                this.pointerList.push(bone);
            }
        }

        for (let i = 0; i < this.pointerList.length; i++) {
            let p = this.readPointer(buf, this.pointerList[i]);
            p += base;
            buf.writeUInt32BE(p, this.pointerList[i]);
        }
    }
}

class Command {
    id: number;
    params: number;

    constructor(id: number, params: number) {
        this.id = id;
        this.params = params;
    }

    equals(cmd: Command) {
        return cmd.id === this.id && cmd.params === this.params;
    }

    toString() {
        return `${this.id.toString(16).toUpperCase().padStart(2, '0')} | ${this.params.toString(16).toUpperCase().padStart(6, '0')}`
    }
}
