import fs from 'fs';

export class ZZPlayasEmbedParser {

    private h: Buffer = Buffer.from("!PlayAsManifest0");

    constructor() { }

    parse(file: string | Buffer) {
        let buf: Buffer;
        if (Buffer.isBuffer(file)) {
            buf = file;
        } else {
            buf = fs.readFileSync(file);
        }
        let head: number = buf.indexOf(this.h) + this.h.byteLength;
        let map: any = {};
        let entries: number = buf.readUInt16BE(head);
        head += 2;
        let ascii_convert: Buffer = Buffer.alloc(1);
        for (let i = 0; i < entries; i++) {
            try {
                let str: string = "";
                let cur: number = buf.readUInt8(head);
                // Start seeking for the end of the ascii.
                while (cur !== 0) {
                    ascii_convert[0] = cur;
                    str += ascii_convert.toString();
                    head++;
                    cur = buf.readUInt8(head);
                }
                head++;
                let offset = buf.readUInt32BE(head);
                head += 4;
                map[str] = offset;
            } catch (err) {
                console.log(`Parsing problem?`);
                console.log(err.stack);
                break;
            }
        }
        return map;
    }

}