import fse from 'fs-extra';

export const enum ManifestOffets{
    OOT_ADULT = 0x5090,
    OOT_CHILD = 0x50d0
}

export class ManifestMapper {
    map(file: string, offset: ManifestOffets) {
        let lines: string[] = fse.readFileSync(file).toString().split("\n");
        let start_line: number = 0;
        let end_line: number = 0;
        let start_txt: string = "OBJECT POOL";
        let end_txt: string = "END";
        for (let i = 0; i < lines.length; i++) {
            console.log(lines[i]);
            if (lines[i].indexOf(start_txt) > -1) {
                start_line = i;
                continue;
            }
            if (lines[i].indexOf(end_txt) > -1 && start_line > 0) {
                end_line = i;
                break;
            }
        }
        let ignore: string[] = ["LUT_ZZ_MODLOADER", "MATRIX_"];
        let def: string = "";
        let curSize: number = 0;
        let curMark: string = "";
        let descriminator: string = "";
        console.log(start_line);
        console.log(end_line);
        for (let i = start_line; i < end_line; i++) {
            let ig: boolean = false;
            for (let j = 0; j < ignore.length; j++) {
                if (lines[i].indexOf(ignore[j]) > -1 && lines[i].indexOf(":") > -1) {
                    ig = true;
                }
            }
            if (ig) {
                continue;
            }
            if (lines[i].indexOf(":") > -1) {
                if (curMark !== "") {
                    def += "const " + curMark + ": number = " + "0x" + (offset).toString(16).toUpperCase() + ";\r\n";
                }
                offset += curSize;
                curSize = 0;
                curMark = descriminator + "" + lines[i].split(":")[0].trim();
                continue;
            } else {
                if (lines[i].trim() === "") {
                    continue;
                }
                if (curMark === "") {
                    continue;
                }
                curSize += 0x8;
            }
        }
        def += "const " + curMark + ": number = " + "0x" + (offset).toString(16).toUpperCase() + ";\r\n";
        return def;
    }
}