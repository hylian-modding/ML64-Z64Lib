import { IMMCore } from "../MM/MMAPI";
import { IOOTCore } from "../OoT/OOTAPI";

export interface IZ64Main{
    OOT: IOOTCore | undefined;
    MM: IMMCore | undefined;
}