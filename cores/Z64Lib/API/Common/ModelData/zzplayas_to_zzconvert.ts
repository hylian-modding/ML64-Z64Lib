import { zzplayas_to_zzconvert_MM } from "@Z64Lib/API/MM/ModelData/backwards_compat/zzplayas_to_zzconvert_MM";
import { zzplayas_to_zzconvert_OOT } from "@Z64Lib/API/OoT/ModelData/backwards_compat/zzplayas_to_zzconvert_OOT";

export class zzplayas_to_zzconvert{

    static processOotZobj(buf: Buffer){
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
        let zz = new zzplayas_to_zzconvert_MM();
        return zz.convert_human(buf);
    }

}