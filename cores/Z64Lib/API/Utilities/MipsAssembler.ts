//@ts-ignore
import { assemble } from "mips-assembler";

export default class MipsAssembler{

    static assemble(code: string): Buffer{
        return Buffer.from(assemble(code) as any);
    }

}