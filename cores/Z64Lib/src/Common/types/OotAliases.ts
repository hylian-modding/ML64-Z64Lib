import { IInventoryCounts, IInventoryFields, ISaveContext } from "../../../API/OoT/OOTAPI";
import { Z64LibSupportedGames } from "../../../API/Utilities/Z64LibSupportedGames";

export type IOOTSaveContext = ISaveContext;
export type IOOTInventoryFields = IInventoryFields;
export type IOOTInventoryCounts = IInventoryCounts;

// OoT NTSC 1.0
export const OOT_GLOBAL_PTR: number = 0x8011F248;
export const OOT_SAVE: number = 0x8011A5D0;
export const OOT_PLAYER: number = 0x801DAA30;
export const OOT_GAME: Z64LibSupportedGames = Z64LibSupportedGames.OCARINA_OF_TIME;
export const OOT_ACTOR_ROTATION_OFFSET = 0xb4;
export const OOT_ACTOR_ROTATION_SIZE = 0x6;
export const OOT_ACTOR_POSITION_OFFSET = 0x24;
export const OOT_ACTOR_POSITION_SIZE = 0xc;
export const OOT_DUNGEON_ITEM_ADDR = (OOT_SAVE + 0xA8);

export const OOT_OVERLAY_TABLE = 0x800e8530;
export const OOT_SCENE_TABLE = 0x800FB4E0;
export const OOT_ENTRANCE_TABLE = 0x800F9C90;
export const OOT_RESTRICTION_TABLE = 0x800F7350;

export const OOT_GUI_SHOWN = (OOT_SAVE + 0xbe613);
export const OOT_PLAYER_STATE = (OOT_PLAYER + 0x066c);
export const OOT_PLAYER_STATE2 = (OOT_PLAYER + 0x0670);
export const OOT_PLAYER_RAWANIM = (OOT_PLAYER + 0x01F0);
export const OOT_PAUSED = 0x801c6fa0;
export const OOT_DMAROM = 0x00007430;
export const OOT_EQUIP_ADDR = (OOT_SAVE + 0x009c);
export const OOT_GSEGMENTS = 0x80120C38;

// OoT Debug
export const OOTDBG_GLOBAL_PTR: number = 0x80157da0;
export const OOTDBG_SAVE: number = 0x8015e660;
export const OOTDBG_PLAYER: number = 0x802245B0;
export const OOTDBG_GAME: Z64LibSupportedGames = Z64LibSupportedGames.DEBUG_OF_TIME;
export const OOTDBG_ACTOR_ROTATION_OFFSET = 0xb4;
export const OOTDBG_ACTOR_ROTATION_SIZE = 0x6;
export const OOTDBG_ACTOR_POSITION_OFFSET = 0x24;
export const OOTDBG_ACTOR_POSITION_SIZE = 0xc;
export const OOTDBG_DUNGEON_ITEM_ADDR = (OOTDBG_SAVE + 0xA8);

export const OOTDBG_OVERLAY_TABLE = 0x801162A0;
export const OOTDBG_SCENE_TABLE = 0x800FB4E0;
export const OOTDBG_ENTRANCE_TABLE = 0x800F9C90;
export const OOTDBG_RESTRICTION_TABLE = 0x800F7350;

export const OOTDBG_GUI_SHOWN = 0x801C4357;
export const OOTDBG_PLAYER_STATE = (OOTDBG_PLAYER + 0x067C);
export const OOTDBG_PLAYER_STATE2 = (OOTDBG_PLAYER + 0x0680);
export const OOTDBG_PLAYER_RAWANIM = (OOTDBG_PLAYER + 0x0200);
export const OOTDBG_PAUSED = (0x80166600);
export const OOTDBG_DMAROM = (0x00012F70);
export const OOTDBG_EQUIP_ADDR = (OOTDBG_SAVE + 0x009c);
export const OOTDGB_GSEGMENTS = 0x80166FA8;