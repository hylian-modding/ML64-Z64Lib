import { SmartBuffer } from 'smart-buffer';
import fs from 'fs';
import path from 'path';
import { TRANSLATION_MAP_HUMAN, LUT_MAP_HUMAN, MANIFEST_MAP_HUMAN } from './human_map';
import crypto from 'crypto';

enum HierarchyType {
    LINK = 0x10,
    NPC = 0xC
}

enum HierarchyFormat {
    NORMAL = 0,
    FLEX = 1
}

class ZobjPiece {
    piece: Buffer;
    hash: string;
    offset: number;
    newOffset: number = -1;

    constructor(piece: Buffer, offset: number) {
        this.piece = piece;
        this.offset = offset;
        this.hash = crypto.createHash('md5').update(this.piece).digest('hex');
    }
}

class Bone {
    name: string;
    pointer: number;
    unk1: number;
    unk2: number;
    dlist1: number;
    piece1!: ZobjPiece;

    constructor(name: string, pointer: number, unk1: number, unk2: number, dlist1: number) {
        this.name = name;
        this.pointer = pointer;
        this.unk1 = unk1;
        this.unk2 = unk2;
        this.dlist1 = dlist1;
    }
}


export class random_shit_to_zzconvert {

    findHierarchy(buf: Buffer) {
        for (let i = 0; i < buf.byteLength; i += 4) {
            // Is this possibly an 06 pointer?
            if (buf.readUInt8(i) === 0x06) {
                let possible = buf.readUInt32BE(i) & 0x00FFFFFF;
                // Does the offset stay within the bounds of the file?
                if (possible <= buf.byteLength) {
                    // If we take the next 4 bytes and subtract do we get 0xC or 0x10?
                    let possible2 = buf.readUInt32BE(i - 0x4) & 0x00FFFFFF;
                    let change = possible - possible2;
                    if (change === 0xC || change === 0x10) {
                        // Traverse down until we hit something that doesn't start with 06.
                        let cur = buf.readUInt32BE(i) & 0xFF000000;
                        let pos = i;
                        while (cur === 0x06000000) {
                            pos += 4;
                            cur = buf.readUInt32BE(pos) & 0xFF000000;
                        }
                        pos -= 4;
                        // Hierarchy offset maybe?
                        let a1 = buf.readUInt8(pos + 1);
                        let a2 = buf.readUInt32BE(pos + 5);
                        let format = a2 <= a1 ? 1 : 0;
                        return { pos, change, format };
                    }
                }
            }
        }
        return undefined;
    }

    convert(buf: Buffer) {
        let out: SmartBuffer = new SmartBuffer();
        out.writeBuffer(buf);
        let df = out.writeOffset;
        out.writeUInt32BE(0xDF000000);
        out.writeUInt32BE(0x00000000);
        while (out.length % 0x10 !== 0){
            out.writeUInt8(0xFF);
        }
        let template = fs.readFileSync(path.resolve(__dirname, "zobjs/zzconvert_child_template.zobj"));
        out.writeBuffer(template);
        let n = out.toBuffer();
        let start = n.indexOf("!PlayAsManifest0");
        let h = this.findHierarchy(n);
        console.log(`Skeleton type: ${HierarchyType[h!.change]}. Format: ${HierarchyFormat[h!.format]}. Offset: ${h!.pos.toString(16)}`);
        let bones = buf.readUInt8(h!.pos + 0x4);
        let p = buf.readUInt32BE(h!.pos + 0x0) & 0x00FFFFFF;
        let skeleton: Array<Bone> = [];
        MANIFEST_MAP_HUMAN.forEach((value: number, key: string)=>{
            n.writeUInt32BE(df, start + value);
        });
        for (let i = 0; i < bones; i++) {
            let p1 = buf.readUInt32BE(p + (i * 4)) & 0x00FFFFFF;
            let unk1 = buf.readUInt32BE(p1 + 0x0);
            let unk2 = buf.readUInt32BE(p1 + 0x4);
            let dlist = buf.readUInt32BE(p1 + 0x8) & 0x00FFFFFF;
            let bone = new Bone(`Limb ${i}`, p1 + 0x8, unk1, unk2, dlist);
            skeleton.push(bone);
            if (dlist > 0){
                if (MANIFEST_MAP_HUMAN.has(bone.name)){
                    let off = MANIFEST_MAP_HUMAN.get(bone.name)! + start;
                    n.writeUInt32BE(dlist, off);
                }
            }
        }
        return n;
    }

}