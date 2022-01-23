export default class zzplayas_magic_number{

    static hasMagicNumber(buf: Buffer): boolean{
        return buf.indexOf(Buffer.from('4D4F444C4F414445523634', 'hex')) > -1;
    }

}