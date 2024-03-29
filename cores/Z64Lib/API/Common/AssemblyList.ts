import { MMAssemblyBuffers } from "../MM/MMAssembly";
import { OOTAssemblyBuffers } from "../OoT/OOTAssembly";
import { Z64LibSupportedGames } from "../Utilities/Z64LibSupportedGames";

export class AssemblyList{
    static getAssemblyForGame(game: Z64LibSupportedGames){
        switch(game) {
            case Z64LibSupportedGames.OCARINA_OF_TIME:
                return OOTAssemblyBuffers;
            case Z64LibSupportedGames.MAJORAS_MASK:
                return MMAssemblyBuffers;
        }
        return undefined;
    }
}