import { SmartBuffer } from 'smart-buffer';
import fs from 'fs';
import path from 'path';
import { TRANSLATION_MAP_HUMAN, LUT_MAP_HUMAN, MANIFEST_MAP_HUMAN } from './human_map';

export class zzplayas_to_zzconvert {

    convert_human(buf: Buffer): Buffer {
        let out: SmartBuffer = new SmartBuffer();
        out.writeBuffer(buf);
        if (buf.indexOf("!PlayAsManifest0") > -1){
            return out.toBuffer();
        }
        let template = fs.readFileSync(path.resolve(__dirname, "zobjs/zzconvert_human_template.zobj"));
        out.writeBuffer(template);
        let n = out.toBuffer();
        let start = n.indexOf("!PlayAsManifest0");
        let unwrap = (buf: Buffer, start: number) => {
            let cur = buf.readUInt32BE(start + 0x4) - 0x06000000;
            while (cur >= 0x5000 && cur <= 0x5800) {
                cur = buf.readUInt32BE(cur + 0x4) - 0x06000000;
            }
            return cur;
        };
        TRANSLATION_MAP_HUMAN.forEach((manifest: string, lut: string) => {
            let lut_offset = LUT_MAP_HUMAN.get(lut)!;
            let manifest_offset = MANIFEST_MAP_HUMAN.get(manifest)! + start;
            if (buf.readUInt8(lut_offset) === 0xDE) {
                n.writeUInt32BE(unwrap(buf, lut_offset), manifest_offset);
                //console.log(unwrap(buf, lut_offset).toString(16) + " to " + manifest);
            } else {
                let cur = buf.readUInt8(lut_offset);
                let advance = 0x0;
                while (cur !== 0xDE) {
                    advance += 0x8;
                    cur = buf.readUInt8(lut_offset + advance);
                }
                n.writeUInt32BE(unwrap(buf, (lut_offset + advance)), manifest_offset);
                //console.log(manifest);
                //console.log(unwrap(buf, lut_offset + advance).toString(16) + " to " + manifest);
            }
        });
        n.writeUInt32BE(0x06005380, 0x500C);
        return n;
    }
}