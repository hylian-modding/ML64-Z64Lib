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

    pointerSet: Set<number> = new Set();
    pointerList: Array<number> = [];
    displayListStarts: Set<number> = new Set();
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
            case DisplayOpcodes.G_MOVEWORD:
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

    findAllDisplayLists(buf: Buffer){
        for (let i = 0; i < buf.byteLength; i += 8) {
            let cmd = this.readCommand(buf, i);
            if (this.isOpCodeEnd(cmd.id) && buf.readUInt32BE(i) === 0xDF000000 && buf.readUInt32BE(i + 0x4) === 0) {
                let reverse = i;
                while (this.isValidOpCode(cmd.id)) {
                    if (this.doesOpCodeHavePointer(cmd.id)) {
                        this.pointerSet.add(reverse + 4);
                    }
                    reverse -= 8;
                    cmd = this.readCommand(buf, reverse);
                }
                this.displayListStarts.add(reverse);
            }
        }
        return this.displayListStarts;
    }

    repoint(buf: Buffer, base: number) {
        this.pointerSet.clear();
        this.findAllDisplayLists(buf);
        let start = buf.indexOf(Buffer.from("MODLOADER64"));
        let count = buf.readUInt32BE(start + 0xC);
        let cur = start + 0x20;
        while (count > 0) {
            let cmd = this.readCommand(buf, cur);
            if (this.doesOpCodeHavePointer(cmd.id)) {
                this.pointerSet.add(cur + 4);
            }
            cur += 8;
            count--;
        }
        if (buf.readUInt32BE(start + 0x17) > 0){
            this.pointerSet.add(start + 0x17);
        }
        let skelsec = this.readPointer(buf, start + 0x1C);
        if (skelsec > 0) {
            this.pointerSet.add(start + 0x1C);
            for (let i = 0; i < 4; i++) {
                let bones = buf.readUInt8(skelsec + (i * 0x10) + 4);
                if (bones > 0) {
                    this.pointerSet.add(skelsec + (i * 0x10));
                    let skel = this.readPointer(buf, skelsec + (i * 0x10));
                    for (let j = 0; j < bones; j++) {
                        this.pointerSet.add(skel + (j * 4));
                        let bone = this.readPointer(buf, skel + (j * 4));
                        bone += 8;
                        let d1 = buf.readUInt32BE(bone);
                        this.temp.writeUInt32BE(d1);
                        if (this.temp.readUInt8(0) === 0x06) {
                            this.pointerSet.add(bone);
                        }
                        bone += 4;
                        let d2 = buf.readUInt32BE(bone);
                        this.temp.writeUInt32BE(d2);
                        if (this.temp.readUInt8(0) === 0x06) {
                            this.pointerSet.add(bone);
                        }
                    }
                }
            }
        }
        this.pointerList = Array.from(this.pointerSet);
        for (let i = 0; i < this.pointerList.length; i++) {
            this.temp.writeUInt32BE(buf.readUInt32BE(this.pointerList[i]));
            if (this.temp.readUInt8(0) !== 0x06) continue;
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
