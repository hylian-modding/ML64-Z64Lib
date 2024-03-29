import { Z64LibSupportedGames } from '../../../API/Utilities/Z64LibSupportedGames';
import { MM_GAME, MM_SAVE, MM_GLOBAL_PTR, MM_PLAYER, MM_ACTOR_POSITION_OFFSET, MM_ACTOR_POSITION_SIZE, MM_ACTOR_ROTATION_OFFSET, MM_ACTOR_ROTATION_SIZE, MM_DUNGEON_ITEM_ADDR, MM_GUI_SHOWN, MM_DMAROM, MM_ENTRANCE_TABLE, MM_OVERLAY_TABLE, MM_PAUSED, MM_PLAYER_RAWANIM, MM_PLAYER_STATE, MM_PLAYER_STATE2, MM_RESTRICTION_TABLE, MM_SCENE_TABLE, MM_EQUIP_ADDR, MM_GSEGMENTS } from './MMAliases';
import { OOT_GAME, OOT_SAVE, OOT_GLOBAL_PTR, OOT_PLAYER, OOT_ACTOR_ROTATION_OFFSET, OOT_ACTOR_POSITION_OFFSET, OOT_ACTOR_POSITION_SIZE, OOT_ACTOR_ROTATION_SIZE, OOT_DUNGEON_ITEM_ADDR, OOT_GUI_SHOWN, OOT_OVERLAY_TABLE, OOT_SCENE_TABLE, OOT_ENTRANCE_TABLE, OOT_RESTRICTION_TABLE, OOT_PLAYER_STATE, OOTDBG_ACTOR_POSITION_OFFSET, OOTDBG_ACTOR_POSITION_SIZE, OOTDBG_ACTOR_ROTATION_OFFSET, OOTDBG_ACTOR_ROTATION_SIZE, OOTDBG_DUNGEON_ITEM_ADDR, OOTDBG_GAME, OOTDBG_GLOBAL_PTR, OOTDBG_GUI_SHOWN, OOTDBG_PLAYER, OOTDBG_SAVE, OOT_DMAROM, OOT_PAUSED, OOT_PLAYER_STATE2, OOT_PLAYER_RAWANIM, OOTDBG_DMAROM, OOTDBG_ENTRANCE_TABLE, OOTDBG_OVERLAY_TABLE, OOTDBG_PAUSED, OOTDBG_RESTRICTION_TABLE, OOTDBG_SCENE_TABLE, OOTDBG_PLAYER_STATE, OOTDBG_PLAYER_STATE2, OOTDBG_PLAYER_RAWANIM, OOT_EQUIP_ADDR, OOTDBG_EQUIP_ADDR, OOT_GSEGMENTS, OOTDGB_GSEGMENTS } from './OotAliases';

export let Z64_GLOBAL_PTR: number;
export let Z64_SAVE: number;
export let Z64_PLAYER: number;
export let Z64_GAME: Z64LibSupportedGames;
export let Z64_ACTOR_ROTATION_OFFSET: number;
export let Z64_ACTOR_ROTATION_SIZE: number;
export let Z64_ACTOR_POSITION_OFFSET: number;
export let Z64_ACTOR_POSITION_SIZE: number;
export let Z64_DUNGEON_ITEM_ADDR: number;
export let Z64_OVERLAY_TABLE: number;
export let Z64_SCENE_TABLE: number;
export let Z64_ENTRANCE_TABLE: number;
export let Z64_RESTRICTION_TABLE: number;
export let Z64_GUI_SHOWN: number;
export let Z64_PLAYER_STATE: number;
export let Z64_PLAYER_STATE2: number;
export let Z64_PLAYER_RAWANIM: number;
export let Z64_PAUSED: number;
export let Z64_DMAROM: number;
export let Z64_SPAWN_WITH_ADDRESS_POINTER: number;

export let Z64_EQUIP_ADDR: number;
export let Z64_GSEGMENTS: number;


export let Z64_IS_DEBUG: boolean;
export let Z64_IS_RANDOMIZER: boolean;

export function setupOot() {
    Z64_GAME = OOT_GAME;
    Z64_SAVE = OOT_SAVE;
    Z64_GLOBAL_PTR = OOT_GLOBAL_PTR;
    Z64_PLAYER = OOT_PLAYER;
    Z64_ACTOR_ROTATION_OFFSET = OOT_ACTOR_ROTATION_OFFSET;
    Z64_ACTOR_ROTATION_SIZE = OOT_ACTOR_ROTATION_SIZE;
    Z64_ACTOR_POSITION_OFFSET = OOT_ACTOR_POSITION_OFFSET;
    Z64_ACTOR_POSITION_SIZE = OOT_ACTOR_POSITION_SIZE;
    Z64_DUNGEON_ITEM_ADDR = OOT_DUNGEON_ITEM_ADDR;
    Z64_OVERLAY_TABLE = OOT_OVERLAY_TABLE;
    Z64_SCENE_TABLE = OOT_SCENE_TABLE;
    Z64_ENTRANCE_TABLE = OOT_ENTRANCE_TABLE;
    Z64_RESTRICTION_TABLE = OOT_RESTRICTION_TABLE;
    Z64_GUI_SHOWN = OOT_GUI_SHOWN;
    Z64_PLAYER_STATE = OOT_PLAYER_STATE;
    Z64_PLAYER_STATE2 = OOT_PLAYER_STATE2;
    Z64_PLAYER_RAWANIM = OOT_PLAYER_RAWANIM;
    Z64_PAUSED = OOT_PAUSED;
    Z64_DMAROM = OOT_DMAROM;
    Z64_IS_DEBUG = false;
    Z64_EQUIP_ADDR = OOT_EQUIP_ADDR;
    Z64_GSEGMENTS = OOT_GSEGMENTS;
}

export function setupOotDBG() {
    Z64_GAME = OOTDBG_GAME;
    Z64_SAVE = OOTDBG_SAVE;
    Z64_GLOBAL_PTR = OOTDBG_GLOBAL_PTR;
    Z64_PLAYER = OOTDBG_PLAYER;
    Z64_ACTOR_ROTATION_OFFSET = OOTDBG_ACTOR_ROTATION_OFFSET;
    Z64_ACTOR_ROTATION_SIZE = OOTDBG_ACTOR_ROTATION_SIZE;
    Z64_ACTOR_POSITION_OFFSET = OOTDBG_ACTOR_POSITION_OFFSET;
    Z64_ACTOR_POSITION_SIZE = OOTDBG_ACTOR_POSITION_SIZE;
    Z64_DUNGEON_ITEM_ADDR = OOTDBG_DUNGEON_ITEM_ADDR;
    Z64_OVERLAY_TABLE = OOTDBG_OVERLAY_TABLE;
    Z64_SCENE_TABLE = OOTDBG_SCENE_TABLE;
    Z64_ENTRANCE_TABLE = OOTDBG_ENTRANCE_TABLE;
    Z64_RESTRICTION_TABLE = OOTDBG_RESTRICTION_TABLE;
    Z64_GUI_SHOWN = OOTDBG_GUI_SHOWN;
    Z64_PLAYER_STATE = OOTDBG_PLAYER_STATE;
    Z64_PLAYER_STATE2 = OOTDBG_PLAYER_STATE2;
    Z64_PLAYER_RAWANIM = OOTDBG_PLAYER_RAWANIM;
    Z64_PAUSED = OOTDBG_PAUSED;
    Z64_DMAROM = OOTDBG_DMAROM;
    Z64_IS_DEBUG = true;
    Z64_EQUIP_ADDR = OOTDBG_EQUIP_ADDR;
    Z64_GSEGMENTS = OOTDGB_GSEGMENTS;
}

export function setupMM() {
    Z64_GAME = MM_GAME;
    Z64_SAVE = MM_SAVE;
    Z64_GLOBAL_PTR = MM_GLOBAL_PTR;
    Z64_PLAYER = MM_PLAYER;
    Z64_ACTOR_ROTATION_OFFSET = MM_ACTOR_ROTATION_OFFSET;
    Z64_ACTOR_ROTATION_SIZE = MM_ACTOR_ROTATION_SIZE;
    Z64_ACTOR_POSITION_OFFSET = MM_ACTOR_POSITION_OFFSET;
    Z64_ACTOR_POSITION_SIZE = MM_ACTOR_POSITION_SIZE;
    Z64_DUNGEON_ITEM_ADDR = MM_DUNGEON_ITEM_ADDR;
    Z64_OVERLAY_TABLE = MM_OVERLAY_TABLE;
    Z64_SCENE_TABLE = MM_SCENE_TABLE;
    Z64_ENTRANCE_TABLE = MM_ENTRANCE_TABLE;
    Z64_RESTRICTION_TABLE = MM_RESTRICTION_TABLE;
    Z64_GUI_SHOWN = MM_GUI_SHOWN;
    Z64_PLAYER_STATE = MM_PLAYER_STATE;
    Z64_PLAYER_STATE2 = MM_PLAYER_STATE2;
    Z64_PLAYER_RAWANIM = MM_PLAYER_RAWANIM;
    Z64_PAUSED = MM_PAUSED;
    Z64_DMAROM = MM_DMAROM;
    Z64_IS_DEBUG = false;
    Z64_EQUIP_ADDR = MM_EQUIP_ADDR;
    Z64_GSEGMENTS = MM_GSEGMENTS;
}

export function markAsRandomizer() {
    Z64_IS_RANDOMIZER = true;
}

/**
 * Internal function please don't call.
 * @param pointer 
 */
export function setSpawnWithAddrPointer(pointer: number){
    Z64_SPAWN_WITH_ADDRESS_POINTER = pointer;
}