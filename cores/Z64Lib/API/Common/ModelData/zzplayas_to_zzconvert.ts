import { zzplayas_to_zzconvert_MM } from "../../MM/ModelData/backwards_compat/zzplayas_to_zzconvert_MM";
import { zzplayas_to_zzconvert_OOT } from "../../OoT/ModelData/backwards_compat/zzplayas_to_zzconvert_OOT";
import zzplayas_magic_number from "./zzplayas_magic_number";

export class zzplayas_to_zzconvert{

    static processOotZobj(buf: Buffer){
        if (!zzplayas_magic_number.hasMagicNumber(buf)){
            throw new Error("This zobj isn't a valid ML64 model file.");
        }
        let zz = new zzplayas_to_zzconvert_OOT();
        let age = buf.readUInt8(0x500B);
        switch(age){
            case 0:
                return zz.convert_adult(buf);
            case 1:
                return zz.convert_child(buf);
        }
    }

    static processMMZobj(buf: Buffer){
        if (!zzplayas_magic_number.hasMagicNumber(buf)){
            throw new Error("This zobj isn't a valid ML64 model file.");
        }
        let zz = new zzplayas_to_zzconvert_MM();
        return zz.convert_human(buf);
    }

}