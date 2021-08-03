import { IInventoryCounts, IInventoryFields, ISaveContext } from "../../../API/MM/MMAPI";
import { Z64LibSupportedGames } from "../../../API/Utilities/Z64LibSupportedGames";

export type IMMSaveContext = ISaveContext;
export type IMMInventoryFields = IInventoryFields;
export type IMMInventoryCounts = IInventoryCounts;

export const MM_GLOBAL_PTR: number = 0x801F9C60;
export const MM_SAVE: number = 0x801EF670;
export const MM_PLAYER: number = 0x803FFDB0;
export const MM_GAME: Z64LibSupportedGames = Z64LibSupportedGames.MAJORAS_MASK;
export const MM_ACTOR_ROTATION_OFFSET = 0xbc;
export const MM_ACTOR_ROTATION_SIZE = 0x6;
export const MM_ACTOR_POSITION_OFFSET = 0x24;
export const MM_ACTOR_POSITION_SIZE = 0xc;