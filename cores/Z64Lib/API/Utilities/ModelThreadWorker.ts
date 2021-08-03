import fs from 'fs';
import path from 'path';
import { BufferEnc } from './BufferEnc';
import { zzstatic, zzstatic_cache } from './zzstatic';
import { Z64LibSupportedGames } from './Z64LibSupportedGames';

let myArgs = process.argv.slice(2);

export class ModelThreadWorker {
  constructor() {}

  work() {
    let zz: zzstatic = new zzstatic(parseInt(myArgs[1]) as Z64LibSupportedGames);
    let decrypter: BufferEnc = new BufferEnc();
    decrypter.key = Buffer.from(myArgs[1], 'base64');
    let buf: Buffer = decrypter.decrypt(fs.readFileSync(myArgs[0]));
    let cache: zzstatic_cache = zz.generateCache(buf);
    let outf: string = path.join(
      __dirname,
      path.parse(myArgs[0]).name + '.zzcache'
    );
    fs.writeFileSync(outf, Buffer.from(JSON.stringify(cache, null, 2)));
  }
}

const thread: ModelThreadWorker = new ModelThreadWorker();
thread.work();
