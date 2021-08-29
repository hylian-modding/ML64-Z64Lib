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
export const MM_DUNGEON_ITEM_ADDR = (MM_SAVE + 0xC0);

export const MM_OVERLAY_TABLE = 0x801AEFD0;
export const MM_SCENE_TABLE = 0x801C5720;
export const MM_ENTRANCE_TABLE = 0x801C43B0;
export const MM_RESTRICTION_TABLE = 0x800F7350;

export const MM_GUI_SHOWN = 0x803FD77B;
export const MM_PLAYER_STATE = (MM_PLAYER + 0xA6C);
export const MM_PLAYER_STATE2 = (MM_PLAYER + 0xA70);
export const MM_PLAYER_RAWANIM = (MM_PLAYER + 0x750);
export const MM_PAUSED = 0x801D1500;
export const MM_DMAROM = 0x0001A500;

export const MM_EQUIP_ADDR = (MM_SAVE + 0x6D);
