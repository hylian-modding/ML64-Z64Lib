import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import MipsAssembler from '../../../API/Utilities/MipsAssembler';

export class ScriptKiddy {
    ModLoader: IModLoaderAPI

    constructor(ModLoader: IModLoaderAPI) {
        this.ModLoader = ModLoader
    }

    ErrorCheck_CodeSize(size: number) {
        if (size > 0x8000) {
            let error_message = `YOUR CODE IS LARGER THAN 8K! SIZE IS ${size}! CONGRATS YOU PROBABLY CORRUPTED THE HEAP!!!!!!!`
            try {
                throw new Error(error_message);
            } catch(err: any) {
                this.ModLoader.logger.error(err.stack);
            }
            this.ModLoader.logger.error(error_message)
        }
    }

    CodeBuffer_To_Data(buf: Buffer): string {
        let data_string = ".word    "

        for (let i = 0; i < buf.byteLength / 4; i++) {
            data_string += `${buf.readUInt32BE(i * 4).toString()},`
        }

        return data_string
    }

    /**
     * 
     * @param addr address to place J
     * @param func address to J to
     */
    J(addr: number, func: number) {
        let code = MipsAssembler.assemble(`
        .org ${addr}
        jnop:
            j ${func}`)

        this.ModLoader.emulator.rdramWriteBuffer(addr, Buffer.from(code))
        this.ModLoader.emulator.invalidateCachedCode()
    }

    /**
     * 
     * @param addr address to place JAL
     * @param func address to JAL to
     */
    JAL(addr: number, func: number) {
        let code = MipsAssembler.assemble(`
        .org ${addr}
        jal:
            jal ${func}`)

        this.ModLoader.emulator.rdramWriteBuffer(addr, Buffer.from(code))
        this.ModLoader.emulator.invalidateCachedCode()
    }

    /**
     * 
     * @param count number of nops to generate
     * @return the generated nops to assemble
    */
    NOP(count: number): string {
        let nops = ""

        for (let i = 0; i < count; i++) {
            nops += "nop\n"
        }

        return nops
    }

    /**
     * 
     * @param addr address to place J
     * @param func address to J to
     */
    JNOP(addr: number, func: number) {
        let code = MipsAssembler.assemble(`
        .org ${addr}
        jnop:
            j ${func}
            nop`)

        this.ModLoader.emulator.rdramWriteBuffer(addr, Buffer.from(code))
        this.ModLoader.emulator.invalidateCachedCode()
    }

    /**
     * 
     * @param addr address to place JAL
     * @param func address to JAL to
     */
    JALNOP(addr: number, func: number) {
        let code = MipsAssembler.assemble(`
        .org ${addr}
        jalnop:
            jal ${func}
            nop`)

        this.ModLoader.emulator.rdramWriteBuffer(addr, Buffer.from(code))
        this.ModLoader.emulator.invalidateCachedCode()
    }

    /**
     * Create a codecave using J, where the original code executes before the arbitrary code
     * @param addr address to codecave
     * @param code assembly to assemble into the cave
     * @returns pointer to codecave code
     */
    CODECAVE_PRE_J(addr: number, code: string): number {
        let old_code_buf = this.ModLoader.emulator.rdramReadBuffer(addr, 0x8)
        let new_code_addr = this.ModLoader.heap!.malloc(0x8000)
        let new_code_buf = Buffer.from(MipsAssembler.assemble(`
        .org ${new_code_addr}
        .align 64

        codecave:
            ${this.CodeBuffer_To_Data(old_code_buf)}
            nop
            ${code}
            nop`))

        new_code_addr = this.ModLoader.heap!.realloc(new_code_addr, new_code_buf.byteLength + 0x20)
        this.ModLoader.emulator.rdramWriteBuffer(new_code_addr, new_code_buf)

        this.JNOP(addr, new_code_addr)
        this.ModLoader.emulator.invalidateCachedCode()

        this.ErrorCheck_CodeSize(new_code_buf.byteLength + 0x20)

        return new_code_addr
    }

    /**
     * Create a codecave using J, where the original code executes after the arbitrary code
     * @param addr address to codecave
     * @param code assembly to assemble into the cave
     * @returns pointer to codecave code
     */
    CODECAVE_POST_J(addr: number, code: string): number {
        let old_code_buf = this.ModLoader.emulator.rdramReadBuffer(addr, 0x8)
        let new_code_addr = this.ModLoader.heap!.malloc(0x8000)
        let new_code_buf = Buffer.from(MipsAssembler.assemble(`
        .org ${new_code_addr}
        .align 64

        codecave:
            ${code}
            nop
            ${this.CodeBuffer_To_Data(old_code_buf)}
            nop`))

        new_code_addr = this.ModLoader.heap!.realloc(new_code_addr, new_code_buf.byteLength + 0x20)
        this.ModLoader.emulator.rdramWriteBuffer(new_code_addr, new_code_buf)

        this.JNOP(addr, new_code_addr)
        this.ModLoader.emulator.invalidateCachedCode()

        this.ErrorCheck_CodeSize(new_code_buf.byteLength + 0x20)

        return new_code_addr
    }

    /**
     * Create a codecave using JAL, where the original code executes before the arbitrary code
     * @param addr address to codecave
     * @param code assembly to assemble into the cave
     * @returns pointer to codecave code
     */
    CODECAVE_PRE_JAL(addr: number, code: string): number {
        let return_addr = addr + 0x8
        let old_code_buf = this.ModLoader.emulator.rdramReadBuffer(addr, 0x8)
        let new_code_addr = this.ModLoader.heap!.malloc(0x8000)
        let new_code_buf = Buffer.from(MipsAssembler.assemble(`
        .org ${new_code_addr}
        .align 64

        .definelabel RETURN_ADDR, ${return_addr}

        codecave:
            ${this.CodeBuffer_To_Data(old_code_buf)}
            nop
            ${code}
            nop
            j       RETURN_ADDR
            nop`))

        new_code_addr = this.ModLoader.heap!.realloc(new_code_addr, new_code_buf.byteLength + 0x20)
        this.ModLoader.emulator.rdramWriteBuffer(new_code_addr, new_code_buf)

        this.JNOP(addr, new_code_addr) // emulating jal with foresight
        this.ModLoader.emulator.invalidateCachedCode()

        this.ErrorCheck_CodeSize(new_code_buf.byteLength + 0x20)

        return new_code_addr
    }

    /**
     * Create a codecave using JAL, where the original code executes after the arbitrary code
     * @param addr address to codecave
     * @param code assembly to assemble into the cave
     * @returns pointer to codecave code
     */
    CODECAVE_POST_JAL(addr: number, code: string): number {
        let return_addr = addr + 0x8
        let old_code_buf = this.ModLoader.emulator.rdramReadBuffer(addr, 0x8)
        let new_code_addr = this.ModLoader.heap!.malloc(0x8000)
        let new_code_buf = Buffer.from(MipsAssembler.assemble(`
        .org ${new_code_addr}
        .align 64

        .definelabel RETURN_ADDR, ${return_addr}

        codecave:
            ${code}
            nop
            ${this.CodeBuffer_To_Data(old_code_buf)}
            nop
            j       RETURN_ADDR
            nop`))

        new_code_addr = this.ModLoader.heap!.realloc(new_code_addr, new_code_buf.byteLength + 0x20)
        this.ModLoader.emulator.rdramWriteBuffer(new_code_addr, new_code_buf)

        this.JNOP(addr, new_code_addr) // emulating jal with foresight
        this.ModLoader.emulator.invalidateCachedCode()

        this.ErrorCheck_CodeSize(new_code_buf.byteLength + 0x20)

        return new_code_addr
    }

    /**
     * Create a codecave using J, where the original code does not execute
     * @param addr address to codecave
     * @param code assembly to assemble into the cave
     * @returns pointer to codecave code
     */
    CODECAVE_J(addr: number, code: string): number {
        let new_code_addr = this.ModLoader.heap!.malloc(0x8000)
        let new_code_buf = Buffer.from(MipsAssembler.assemble(`
        .org ${new_code_addr}
        .align 64

        codecave:
            ${code}
            nop`))

        new_code_addr = this.ModLoader.heap!.realloc(new_code_addr, new_code_buf.byteLength + 0x20)
        this.ModLoader.emulator.rdramWriteBuffer(new_code_addr, new_code_buf)

        this.JNOP(addr, new_code_addr)
        this.ModLoader.emulator.invalidateCachedCode()

        this.ErrorCheck_CodeSize(new_code_buf.byteLength + 0x20)

        return new_code_addr
    }

    /**
     * Create a codecave using JAL, where the original code does not execute
     * @param addr address to codecave
     * @param code assembly to assemble into the cave
     * @returns pointer to codecave code
     */
    CODECAVE_JAL(addr: number, code: string): number {
        let return_addr = addr + 0x8
        let new_code_addr = this.ModLoader.heap!.malloc(0x8000)
        let new_code_buf = Buffer.from(MipsAssembler.assemble(`
        .org ${new_code_addr}
        .align 64

        .definelabel RETURN_ADDR, ${return_addr}

        codecave:
            nop
            ${code}
            nop
            j       RETURN_ADDR
            nop`))

        new_code_addr = this.ModLoader.heap!.realloc(new_code_addr, new_code_buf.byteLength + 0x20)
        this.ModLoader.emulator.rdramWriteBuffer(new_code_addr, new_code_buf)

        this.JNOP(addr, new_code_addr) // emulating jal with foresight
        this.ModLoader.emulator.invalidateCachedCode()

        this.ErrorCheck_CodeSize(new_code_buf.byteLength + 0x20)

        return new_code_addr
    }
}

