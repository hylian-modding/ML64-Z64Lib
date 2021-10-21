import { SmartBuffer } from 'smart-buffer';

interface IDisplayListInfo {
    data: Buffer,
    dependencies: Set<number>,
    offset: number
}

interface IOffsetExtended {
    primaryOffset: number,
    secondaryOffset: number
}

export interface IOptimized{
    zobj: Buffer;
    oldOffs2NewOffs: Map<number, number>;
}

export interface IOptimizeExtended extends IOptimized{
    textureOffsets: Map<number, number>;
    textureLengths: Map<number, number>;
    vertOffsets: Map<number, number>;
    vertLengths: Map<number, number>;
    mtxOffsets: Map<number, number>;
    mtxLength: Map<number, number>;
}

// hacky as hell, but it works
function removeDupes(a: { offset: number, data: Buffer }[], m: Map<number, IOffsetExtended[]>) {
    for (let i = 0; i < a.length; i++) {

        for (let j = i + 1; j < a.length; j++) {

            if (a[j].data.byteLength === 0) {
                // console.log("Skip j");
                continue;
            }

            if (a[i].data.byteLength === 0) {
                // console.log("Skip i");
                continue;
            }

            let b = a[i].data.byteLength > a[j].data.byteLength;
            let bigger = b ? a[i] : a[j];
            let smaller = b ? a[j] : a[i];

            let subOff = bigger.data.compare(smaller.data);

            // if there was a sub array, don't forget to track existing sub arrays within it
            if (subOff === 0) {

                // console.log(bigger);
                // console.log(smaller);

                smaller.data = Buffer.alloc(0);

                let sEntry = m.get(smaller.offset);

                let sa: IOffsetExtended[] = sEntry ? sEntry : [];

                let bEntry = m.get(bigger.offset);

                let ba = bEntry ? bEntry : [];

                ba.push({ primaryOffset: smaller.offset, secondaryOffset: subOff });

                let tmpa = ba.concat(sa);

                let finala: IOffsetExtended[] = [];

                for (let k = 0; k < tmpa.length; k++) {
                    let isUnique = true;

                    for (let l = k + 1; l < tmpa.length && isUnique; l++) {
                        if (tmpa[k].primaryOffset === tmpa[l].primaryOffset && tmpa[k].secondaryOffset === tmpa[l].secondaryOffset) {
                            isUnique = false;
                        }
                    }

                    if (isUnique) {
                        finala.push(tmpa[k]);
                    }
                }

                m.delete(smaller.offset);
                m.set(bigger.offset, finala);

            }
        }
    }
}

export function optimize(zobj: Buffer, displayListOffsets: number[], rebase: number = 0, segment = 0x06, removeDupData = false): IOptimized {

    let DLoffsets = new Set(displayListOffsets);

    let textures = new Map<number, Buffer>();
    let vertices = new Map<number, Buffer>();
    let matrices = new Map<number, Buffer>();
    let displayLists = new Array<IDisplayListInfo>();

    // first pass: gather all relevant offsets for display lists, textures, palettes, and vertex data
    DLoffsets.forEach((val) => {

        if (val % 8 !== 0) {
            throw new Error("Display List Offset 0x" + val.toString(16) + " is not byte-aligned!");
        }

        let isEndOfDL = false;
        let displayList = new SmartBuffer();
        let deps = new Set<number>();

        for (let i = val; i < zobj.byteLength && !isEndOfDL; i += 8) {

            // console.log("Proc 0x" + i.toString(16));

            let opcode = zobj[i];
            let seg = zobj[i + 4];
            let loWord = zobj.readUInt32BE(i + 4);

            switch (opcode) {

                // end of display list, self-explanatory
                case 0xDF:
                    isEndOfDL = true;
                    break;

                // branch to new display list, so add to list
                case 0xDE:

                    if (zobj[i + 1] === 0x01) {
                        isEndOfDL = true;
                    }

                    if (seg === segment) {
                        DLoffsets.add(loWord & 0x00FFFFFF);
                        deps.add(loWord & 0x00FFFFFF);
                    }
                    break;

                // vertex data
                case 0x01:
                    if (seg === segment) {
                        let vtxStart = loWord & 0x00FFFFFF;
                        let vtxLen = zobj.readUInt16BE(i + 1);

                        // don't write same data twice
                        let vtxEntry = vertices.get(vtxStart);

                        if (vtxEntry === undefined || vtxEntry.byteLength < vtxLen) {
                            vertices.set(vtxStart, zobj.slice(vtxStart, vtxStart + vtxLen));
                        }
                    }
                    break;

                case 0xDA: // push matrix
                    if (seg === segment) {

                        let mtxStart = loWord & 0x00FFFFFF;

                        let mtxEntry = matrices.get(mtxStart);

                        if (mtxEntry === undefined) {

                            if (mtxStart + 0x40 > zobj.byteLength) {    // matrices are always 0x40 bytes long
                                throw new Error("Invalid matrix offset at 0x" + i.toString());
                            }

                            matrices.set(mtxStart, zobj.slice(mtxStart, mtxStart + 0x40));
                        }
                    }
                    break;

                case 0xFD:  // handle textures
                    // Don't ask me how this works

                    // console.log("Detected FD at 0x" + i.toString(16));

                    if (seg === segment) {

                        let textureType = (zobj[i + 1] >> 3) & 0x1F;

                        // console.log("Texture Type: 0x" + textureType.toString(16));

                        let numTexelBits = 4 * Math.pow(2, textureType & 0x3);
                        let bytesPerTexel = numTexelBits / 8;

                        // console.log("texel size: " + bytesPerTexel.toString());

                        let texOffset = loWord & 0x00FFFFFF;

                        // Palette macro always includes E8 afterward?
                        let isPalette = zobj[i + 8] === 0xE8;

                        // console.log(isPalette);

                        let stopSearch = false;

                        let numTexels = -1;

                        let returnStack: number[] = [];

                        for (let j = i + 8; j < zobj.byteLength && !stopSearch && numTexels === -1; j += 8) {

                            // console.log("Current opcode: 0x" + zobj[j].toString(16));

                            let loWordJ = zobj.readUInt32BE(j + 4);

                            // console.log("Low word J: 0x" + loWordJ.toString(16));

                            switch (zobj[j]) {

                                case 0xDF:
                                    if (returnStack.length === 0) {
                                        numTexels = 0;
                                        stopSearch = true;
                                    }
                                    else {
                                        j = returnStack.pop()!;
                                    }
                                    break;

                                case 0xFD:
                                    numTexels = 0;
                                    stopSearch = true;
                                    break;

                                case 0xDE:

                                    if (zobj[j + 4] === segment) {
                                        if (zobj[j + 1] === 0x0) {
                                            returnStack.push(j);
                                        }

                                        j = loWordJ & 0x00FFFFFF;
                                    }

                                    break;

                                case 0xF0:
                                    if (isPalette) {
                                        // console.log("Calculating palette size?")
                                        numTexels = ((loWordJ & 0x00FFF000) >> 14) + 1;
                                        // console.log("Number of Colors: 0x" + numTexels.toString(16));
                                    }
                                    else throw new Error("Mismatched palette and FD command at 0x" + i.toString(16));
                                    stopSearch = true;

                                    if (numTexels > 256) {
                                        throw new Error("Invalid number of colors in TLUT");
                                    }
                                    break;

                                case 0xF3:
                                    if (!isPalette) {
                                        numTexels = ((loWordJ & 0x00FFF000) >> 12) + 1;
                                        // console.log("Number of Texels to Load: 0x" + numTexels.toString(16));
                                    }
                                    else throw new Error("Mismatched non-palette and FD command at 0x" + i.toString(16));
                                    stopSearch = true;
                                    break;

                                default:
                                    break;
                            }
                        }

                        // console.log("size: 0x" + numTexels.toString(16));

                        if (numTexels === -1) {
                            throw new Error("Could not find texture size for FD command at 0x" + i.toString(16));
                        }

                        let dataLen = bytesPerTexel * numTexels;

                        // console.log("dataLen: 0x" + dataLen.toString(16));

                        // console.log("Texture Address: 0x" + texOffset.toString(16) + " - 0x" + (texOffset + dataLen).toString(16));

                        if (texOffset + dataLen > zobj.byteLength) {
                            throw new Error("Texture referenced at 0x" + i.toString(16) + " not in range of zobj!");
                        }

                        let texDat = textures.get(texOffset);

                        if (texDat === undefined || texDat.byteLength < dataLen) {
                            textures.set(texOffset, zobj.slice(texOffset, texOffset + dataLen));
                        }
                    }
                    break;

                default:
                    break;
            }

            displayList.writeBuffer(zobj.slice(i, i + 8));
        }

        displayLists.push({
            data: displayList.toBuffer(),
            dependencies: deps,
            offset: val
        });
    });

    let oldTex2Undupe: Map<number, IOffsetExtended[]>;
    let oldVert2Undupe: Map<number, IOffsetExtended[]>;

    if (removeDupData) {

        oldTex2Undupe = new Map();
        oldVert2Undupe = new Map();

        let texPairs: { offset: number, data: Buffer }[] = [];
        let vertPairs: { offset: number, data: Buffer }[] = [];

        textures.forEach((val, key) => {
            texPairs.push({ offset: key, data: val });
        });

        vertices.forEach((val, key) => {
            vertPairs.push({ offset: key, data: val });
        });

        removeDupes(texPairs, oldTex2Undupe);
        removeDupes(vertPairs, oldVert2Undupe);

        // console.log("FUCK2");

        oldTex2Undupe.forEach((extOffs, parentOff) => {
            extOffs.forEach((extOff) => {
                textures.delete(extOff.primaryOffset);
            });
        });

        oldVert2Undupe.forEach((extOffs, parentOff) => {
            extOffs.forEach((extOff) => {
                vertices.delete(extOff.primaryOffset);
            });
        });

    }

    // Create the new zobj
    // start by writing all of the textures, vertex data, and matrices
    let optimizedZobj = new SmartBuffer();

    let oldTex2New = new Map<number, number>();
    let texLengths = new Map<number, number>();

    textures.forEach((tex, originalOffset) => {

        let newOffset = optimizedZobj.length;

        oldTex2New.set(originalOffset, newOffset);
        texLengths.set(originalOffset, tex.byteLength);

        // console.log("Tex: 0x" + originalOffset.toString(16) + " -> 0x" + newOffset.toString(16));

        optimizedZobj.writeBuffer(tex);

    });

    let oldVer2New = new Map<number, number>();
    let vertLength = new Map<number, number>();
    vertices.forEach((tex, originalOffset) => {

        let newOffset = optimizedZobj.length;

        oldVer2New.set(originalOffset, newOffset);
        vertLength.set(originalOffset, tex.byteLength);

        optimizedZobj.writeBuffer(tex);

        // console.log("Vert: 0x" + originalOffset.toString(16) + " -> 0x" + newOffset.toString(16));

    });

    if (removeDupData) {

        // console.log(oldTex2Undupe!);
        // console.log(oldVert2Undupe!);

        oldTex2Undupe!.forEach((extOffs, parentOff) => {
            extOffs.forEach((extOff) => {
                oldTex2New.set(extOff.primaryOffset, oldTex2New.get(parentOff)! + extOff.secondaryOffset);
                // console.log("Duplicate texture detected: 0x" + extOff.primaryOffset.toString(16) + " => 0x" + (oldTex2New.get(parentOff)! + extOff.secondaryOffset).toString(16));
            });
        });

        oldVert2Undupe!.forEach((extOffs, parentOff) => {
            extOffs.forEach((extOff) => {
                oldVer2New.set(extOff.primaryOffset, oldVer2New.get(parentOff)! + extOff.secondaryOffset);
                // console.log("Duplicate vtx data detected: 0x" + extOff.primaryOffset.toString(16) + " => 0x" + (oldVer2New.get(parentOff)! + extOff.secondaryOffset).toString(16));
            });
        });
    }

    let oldMtx2New = new Map<number, number>();
    let mtxLength= new Map<number, number>();

    matrices.forEach((mtx, originalOffset) => {
        let newOffset = optimizedZobj.length;

        oldMtx2New.set(originalOffset, newOffset);
        mtxLength.set(originalOffset, mtx.byteLength);

        optimizedZobj.writeBuffer(mtx);
    });

    // repoint the display lists
    // sort to make sure that the display lists called by DE are already in the zobj
    let oldDL2New = new Map<number, number>();

    displayLists.sort((a, b) => {
        return (a.dependencies.size - b.dependencies.size) * -1;    // sort in descending order
    });

    while (displayLists.length !== 0) {
        let currentData = displayLists.pop()!;

        if (currentData.dependencies.size !== 0) {
            throw new Error("Non-relocated display list referenced.");
        }

        let dl = currentData.data;

        oldDL2New.set(currentData.offset, optimizedZobj.length);

        for (let i = 0; i < dl.byteLength; i += 8) {
            let opcode = dl[i];
            let seg = dl[i + 4];
            let loWord = dl.readUInt32BE(i + 4);

            if (seg === segment) {

                // console.log("Proc 0x" + i.toString(16));
                // console.log("Opcode: 0x" + opcode.toString(16));
                // console.log("Low Word: 0x" + loWord.toString(16));

                switch (opcode) {   // do repoint
                    case 0x01:
                        let vertEntry = oldVer2New.get(loWord & 0x00FFFFFF);

                        if (vertEntry === undefined) {
                            throw new Error("Non-relocated vertex data referenced.");
                        }

                        dl.writeUInt32BE(0x06000000 + vertEntry + rebase, i + 4);
                        break;

                    case 0xDA:
                        let mtxEntry = oldMtx2New.get(loWord & 0x00FFFFFF);

                        if (mtxEntry === undefined) {
                            throw new Error("Non-relocated matrix data referenced.");
                        }

                        dl.writeUInt32BE(0x06000000 + mtxEntry + rebase, i + 4);
                        break;

                    case 0xFD:
                        let texEntry = oldTex2New.get(loWord & 0x00FFFFFF);

                        if (texEntry === undefined) {
                            throw new Error("Non-relocated texture data referenced.");
                        }

                        dl.writeUInt32BE(0x06000000 + texEntry + rebase, i + 4);
                        break;

                    case 0xDE:
                        let dlEntry = oldDL2New.get(loWord & 0x00FFFFFF);

                        if (dlEntry === undefined)
                            throw new Error("Non-relocated display list referenced.");

                        dl.writeUInt32BE(0x06000000 + dlEntry + rebase, i + 4);
                        break;

                    default:
                        break;
                }
            }
        }

        // console.log("DL: 0x" + currentData.offset.toString(16) + " -> 0x" + optimizedZobj.length.toString(16));

        optimizedZobj.writeBuffer(dl);

        // remove this display list as a dependency so that we can sort again
        displayLists.forEach((dat) => {
            // shut up typescript. I verified that this isn't undefined earlier
            dat.dependencies.delete(currentData!.offset);
        });

        // if last element no longer has 0 dependencies, must resort
        if (displayLists.length > 0){
            if (displayLists[displayLists.length - 1].dependencies.size !== 0) {
                displayLists.sort((a, b) => {
                    return (a.dependencies.size - b.dependencies.size) * -1;    // sort in descending order
                });
            }
        }
    }

    // byte alignment via 0 padding
    optimizedZobj.writeBuffer(Buffer.alloc(optimizedZobj.length % 0x10, 0));

    oldDL2New.forEach((newOff, oldOff) => {
        oldDL2New.set(oldOff, newOff + rebase);
    });

    return {
        zobj: optimizedZobj.toBuffer(),
        oldOffs2NewOffs: oldDL2New,
        textureOffsets: oldTex2New,
        textureLengths: texLengths,
        vertOffsets: oldVer2New,
        vertLengths: vertLength,
        mtxOffsets: oldMtx2New,
        mtxLength
    } as IOptimized;
}
