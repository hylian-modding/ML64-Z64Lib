import { IInventoryCounts, IInventoryFields, ISaveContext } from "../../../API/OOT/OOTAPI";
import { Z64LibSupportedGames } from "../../../API/Utilities/Z64LibSupportedGames";

export type IOOTSaveContext = ISaveContext;
export type IOOTInventoryFields = IInventoryFields;
export type IOOTInventoryCounts = IInventoryCounts;

export const OOT_GLOBAL_PTR: number = 0x80157DA0;
export const OOT_SAVE: number = 0x8015E660;
export const OOT_PLAYER: number = 0x802245B0;
export const OOT_GAME: Z64LibSupportedGames = Z64LibSupportedGames.OCARINA_OF_TIME;
export const OOT_ACTOR_ROTATION_OFFSET = 0xb4;
export const OOT_ACTOR_ROTATION_SIZE = 0x6;
export const OOT_ACTOR_POSITION_OFFSET = 0x24;
export const OOT_ACTOR_POSITION_SIZE = 0xc;
export const OOT_DUNGEON_ITEM_ADDR = (OOT_SAVE + 0xA8);
