import fs from 'fs-extra'
import path from 'path'

export const CommandBuffer_mm: Buffer = fs.readFileSync(path.resolve(__dirname, "CommandBuffer_mm.ovl"))
