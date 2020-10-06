import child_process, { ForkOptions } from 'child_process';
import path from 'path';

export interface IOpCode {
    raw: string;
    params: string[];
    rebuild(): string;
}

export class OpCode implements IOpCode {
    raw: string;
    params: string[] = [];

    constructor(raw: string) {
        this.raw = raw;
        let t = this.raw.split("(");
        t.shift();
        let temp = t.join("").trim();
        t = temp.split(")");
        t.pop();
        temp = t.join("").trim();
        let split = temp.split(",");
        for (let i = 0; i < split.length; i++) {
            this.params.push(split[i].trim());
        }
    }

    rebuild(): string {
        let s1: string = this.raw.split("(")[0];
        let s2: string = this.raw.split(")")[1];
        let r = s1 + "(" + this.params.join(",") + ")" + s2;
        return r;
    }

}

export class GfxDis {

    static async dissassemble(buf: Buffer): Promise<IOpCode[]> {
        return new Promise((resolve, reject) => {
            const options = {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
                silent: true,
            };
            const args: string[] = ["-d", buf.toString('hex')];
            let child = child_process.fork(path.resolve(__dirname, "gfxdis.js"), args, options as ForkOptions);
            child.stdout!.on('data', (buf: Buffer) => {
                let msg: string = buf.toString();
                if (msg === '' || msg === null || msg === undefined) {
                    return;
                }
                console.log(msg);
                let r: IOpCode[] = [];
                msg = msg.replace("{", "");
                msg = msg.replace("}", "");
                msg = msg.trim();
                let split: string[] = msg.split("\n");
                for (let i = 0; i < split.length; i++) {
                    r.push(new OpCode(split[i]));
                }
                resolve(r);
            });
            child.on('error', (err: any) => {
                reject();
            });
        });
    }

}