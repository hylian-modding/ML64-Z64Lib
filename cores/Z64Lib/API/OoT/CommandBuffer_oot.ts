import fs from 'fs-extra'
import path from 'path'

export const CommandBuffer_oot: Buffer = fs.readFileSync(path.resolve(__dirname, "CommandBuffer_oot.ovl"))
