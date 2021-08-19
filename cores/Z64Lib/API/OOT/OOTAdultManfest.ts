import fs from 'fs';
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { PatchTypes } from "modloader64_api/Patchers/PatchManager";
import path from 'path';
import { Z64LibSupportedGames } from "../../Utilities/Z64LibSupportedGames";
import { IManifest, ManifestBuffer } from "../../Utilities/Z64ManifestBuffer";
import { trimBuffer, Z64RomTools } from "../../Utilities/Z64RomTools";

export interface IOOTAdult {
	FACE_TEXTURES: number;
	HEADER: number;
	DL_WAIST: number;
	DL_RTHIGH: number;
	DL_RSHIN: number;
	DL_RFOOT: number;
	DL_LTHIGH: number;
	DL_LSHIN: number;
	DL_LFOOT: number;
	DL_HEAD: number;
	DL_HAT: number;
	DL_COLLAR: number;
	DL_LSHOULDER: number;
	DL_LFOREARM: number;
	DL_RSHOULDER: number;
	DL_RFOREARM: number;
	DL_TORSO: number;
	DL_LHAND: number;
	DL_LFIST: number;
	DL_LHAND_BOTTLE: number;
	DL_RHAND: number;
	DL_RFIST: number;
	DL_SWORD_SHEATH_1: number;
	DL_SWORD_SHEATH_2: number;
	DL_SWORD_SHEATH_3: number;
	DL_SWORD_HILT_1: number;
	DL_SWORD_HILT_2: number;
	DL_SWORD_HILT_3: number;
	DL_SWORD_BLADE_1: number;
	DL_SWORD_BLADE_2: number;
	DL_SWORD_BLADE_3: number;
	DL_SHIELD_1: number;
	DL_SHIELD_2: number;
	DL_SHIELD_3: number;
	DL_BOTTLE: number;
	DL_OCARINA_2: number;
	DL_DEKU_STICK: number;
	DL_BOW: number;
	DL_BOW_STRING: number;
	DL_HOOKSHOT: number;
	DL_HOOKSHOT_CHAIN: number;
	DL_HOOKSHOT_HOOK: number;
	DL_HOOKSHOT_AIM: number;
	DL_FPS_RFOREARM: number;
	DL_FPS_HOOKSHOT: number;
	DL_BOOMERANG: number;
	DL_SLINGSHOT: number;
	DL_SLINGSHOT_STRING: number;
	DL_OCARINA_FAIRY: number;
	DL_GORON_BRACELET: number;
	DL_MASK_SKULL: number;
	DL_MASK_SPOOKY: number;
	DL_MASK_KEATON: number;
	DL_MASK_TRUTH: number;
	DL_MASK_GORON: number;
	DL_MASK_ZORA: number;
	DL_MASK_GERUDO: number;
	DL_MASK_BUNNY: number;
	DL_SWORD_BLADE_3_BROKEN: number;
	DL_BLADEBREAK: number;
	DL_HAMMER: number;
	DL_UPGRADE_LFOREARM: number;
	DL_UPGRADE_LHAND: number;
	DL_UPGRADE_LFIST: number;
	DL_UPGRADE_RFOREARM: number;
	DL_UPGRADE_RHAND: number;
	DL_UPGRADE_RFIST: number;
	DL_BOOT_LIRON: number;
	DL_BOOT_RIRON: number;
	DL_BOOT_LHOVER: number;
	DL_BOOT_RHOVER: number;
	DL_FPS_LFOREARM: number;
	DL_FPS_LHAND: number;
	DL_FPS_RHAND: number;
	DL_DEKU_MASK: number;
	DL_GORON_MASK: number;
	DL_ZORA_MASK: number;
	DL_DEITY_MASK: number;
	DL_BOTTLE_FILLING: number;
	DL_BOTTLE_EMPTY: number;
	DL_SWORD_FAIRY: number;
	DL_DEKU_GUARD: number;
	DL_PIPE_MOUTH: number;
	DL_PIPE_RIGHT: number;
	DL_PIPE_UP: number;
	DL_PIPE_DOWN: number;
	DL_PIPE_LEFT: number;
	DL_PIPE_A: number;
	DL_STEM_RIGHT: number;
	DL_STEM_LEFT: number;
	DL_PETAL_PARTICLE: number;
	DL_PETAL_PROPELLER_CLOSED: number;
	DL_FLOWER_CENTER_CLOSED: number;
	DL_FLOWER_PROPELLER_OPEN: number;
	DL_FLOWER_CENTER_OPEN: number;
	DL_PAD_WOOD: number;
	DL_PAD_GRASS: number;
	DL_PAD_OPENING: number;
	DL_FIRE_PUNCH: number;
	DL_DRUM_STRAP: number;
	DL_DRUM_UP: number;
	DL_DRUM_LEFT: number;
	DL_DRUM_RIGHT: number;
	DL_DRUM_DOWN: number;
	DL_DRUM_A: number;
	DL_SHIELD_PRONE: number;
	DL_BODY_SHIELD: number;
	DL_CURLED: number;
	DL_SPIKES: number;
	DL_INIT_FIRE: number;
	DL_FIRE_ROLL: number;
	DL_LFIN: number;
	DL_LFIN_SWIM: number;
	DL_RFIN: number;
	DL_RFIN_SWIM: number;
	DL_GUITAR_HAND: number;
	DL_FIN_SHIELD: number;
	DL_MAGIC_BARRIER: number;
	DL_SWORD_DEITY: number;
	DL_DF: number;
	DL_SWORD1_SHEATHED: number;
	DL_SWORD2_SHEATHED: number;
	DL_SWORD3_SHEATHED: number;
	DL_SHIELD1_BACK: number;
	DL_SHIELD2_BACK: number;
	DL_SHIELD3_BACK: number;
	DL_SWORD1_SHIELD1: number;
	DL_SWORD1_SHIELD2: number;
	DL_SWORD1_SHIELD3: number;
	DL_SWORD2_SHIELD1: number;
	DL_SWORD2_SHIELD2: number;
	DL_SWORD2_SHIELD3: number;
	DL_SWORD3_SHIELD1: number;
	DL_SWORD3_SHIELD2: number;
	DL_SWORD3_SHIELD3: number;
	DL_LFIST_SWORD1: number;
	DL_LFIST_SWORD2: number;
	DL_LFIST_SWORD3: number;
	DL_LFIST_HAMMER: number;
	DL_RFIST_SHIELD_1: number;
	DL_RFIST_SHIELD_2: number;
	DL_RFIST_SHIELD_3: number;
	DL_RFIST_BOW: number;
	DL_RFIST_HOOKSHOT: number;
	DL_RHAND_OCARINA_TIME: number;
	DL_FPS_RHAND_BOW: number;
	DL_FPS_LHAND_HOOKSHOT: number;
	DL_SWORD1_SHIELD1_SHEATH: number;
	DL_SWORD1_SHIELD2_SHEATH: number;
	DL_SWORD1_SHIELD3_SHEATH: number;
	DL_SWORD2_SHIELD1_SHEATH: number;
	DL_SWORD2_SHIELD2_SHEATH: number;
	DL_SWORD2_SHIELD3_SHEATH: number;
	DL_SWORD3_SHIELD1_SHEATH: number;
	DL_SWORD3_SHIELD2_SHEATH: number;
	DL_SWORD3_SHIELD3_SHEATH: number;
	DL_LFIST_SWORD3_BROKEN: number;
	DL_UNK37: number;
	DL_UNK38: number;
	DL_UNK39: number;
	DL_UNK40: number;
	DL_UNK41: number;
	DL_UNK42: number;
	DL_UNK43: number;
	DL_UNK44: number;
	DL_UNK45: number;
	DL_UNK46: number;
	DL_UNK47: number;
	DL_UNK48: number;
	DL_UNK49: number;
	DL_UNK50: number;
	DL_UNK51: number;
	DL_UNK52: number;
	DL_UNK53: number;
	DL_UNK54: number;
	DL_UNK55: number;
	DL_UNK56: number;
	DL_UNK57: number;
	DL_UNK58: number;
	DL_UNK59: number;
	DL_UNK60: number;
	DL_UNK61: number;
	DL_UNK62: number;
	DL_UNK63: number;
	DL_UNK64: number;
	DL_UNK65: number;
	DL_UNK66: number;
	DL_UNK67: number;
	DL_UNK68: number;
	DL_UNK69: number;
	DL_UNK70: number;
	DL_UNK71: number;
	DL_UNK72: number;
	DL_UNK73: number;
	DL_UNK74: number;
	DL_UNK75: number;
	DL_UNK76: number;
	DL_UNK77: number;
	DL_UNK78: number;
	DL_UNK79: number;
	DL_UNK80: number;
	DL_UNK81: number;
	DL_UNK82: number;
	DL_UNK83: number;
	DL_UNK84: number;
	DL_UNK85: number;
	DL_UNK86: number;
	DL_UNK87: number;
	DL_UNK88: number;
	DL_UNK89: number;
	DL_UNK90: number;
	DL_UNK91: number;
	DL_UNK92: number;
	DL_UNK93: number;
	DL_UNK94: number;
	DL_UNK95: number;
	DL_UNK96: number;
	DL_UNK97: number;
	DL_UNK98: number;
	DL_UNK99: number;
	DL_UNK100: number;
	DL_UNK101: number;
	DL_UNK102: number;
	DL_UNK103: number;
	DL_UNK104: number;
	DL_UNK105: number;
	DL_UNK106: number;
	DL_UNK107: number;
	DL_UNK108: number;
	DL_UNK109: number;
	DL_UNK110: number;
	DL_UNK111: number;
	DL_UNK112: number;
	DL_UNK113: number;
	DL_UNK114: number;
	DL_UNK115: number;
	DL_UNK116: number;
	DL_UNK117: number;
	DL_UNK118: number;
	DL_UNK119: number;
	DL_UNK120: number;
	DL_UNK121: number;
	DL_UNK122: number;
	DL_UNK123: number;
	DL_UNK124: number;
	DL_UNK125: number;
	DL_UNK126: number;
	DL_UNK127: number;
	DL_UNK128: number;
	DL_UNK129: number;
	DL_UNK130: number;
	DL_UNK131: number;
	DL_UNK132: number;
	DL_UNK133: number;
	DL_UNK134: number;
	DL_UNK135: number;
	DL_UNK136: number;
	DL_UNK137: number;
	DF_COMMAND: number;
	SKEL_SECTION: number;
	ZORA_MAGIC_0: number;
	ZORA_MAGIC_1: number;
	MATRIX_SWORD1_BACK: number;
	MATRIX_SWORD2_BACK: number;
	MATRIX_SWORD3_BACK: number;
	MATRIX_SHIELD1_BACK: number;
	MATRIX_SHIELD2_BACK: number;
	MATRIX_SHIELD3_BACK: number;
	MATRIX_SHIELD1_ITEM: number;
	MATRIX_BUNNYHOOD0: number;
	MATRIX_BUNNYHOOD1: number;
	MATRIX_DUMMY: number;
}
const OOT_ADULT: IOOTAdult = {
    "FACE_TEXTURES": 0,
    "HEADER": 20480,
    "DL_WAIST": 20512,
    "DL_RTHIGH": 20520,
    "DL_RSHIN": 20528,
    "DL_RFOOT": 20536,
    "DL_LTHIGH": 20544,
    "DL_LSHIN": 20552,
    "DL_LFOOT": 20560,
    "DL_HEAD": 20568,
    "DL_HAT": 20576,
    "DL_COLLAR": 20584,
    "DL_LSHOULDER": 20592,
    "DL_LFOREARM": 20600,
    "DL_RSHOULDER": 20608,
    "DL_RFOREARM": 20616,
    "DL_TORSO": 20624,
    "DL_LHAND": 20632,
    "DL_LFIST": 20640,
    "DL_LHAND_BOTTLE": 20648,
    "DL_RHAND": 20656,
    "DL_RFIST": 20664,
    "DL_SWORD_SHEATH_1": 20672,
    "DL_SWORD_SHEATH_2": 20680,
    "DL_SWORD_SHEATH_3": 20688,
    "DL_SWORD_HILT_1": 20696,
    "DL_SWORD_HILT_2": 20704,
    "DL_SWORD_HILT_3": 20712,
    "DL_SWORD_BLADE_1": 20720,
    "DL_SWORD_BLADE_2": 20728,
    "DL_SWORD_BLADE_3": 20736,
    "DL_SHIELD_1": 20744,
    "DL_SHIELD_2": 20752,
    "DL_SHIELD_3": 20760,
    "DL_BOTTLE": 20768,
    "DL_OCARINA_2": 20776,
    "DL_DEKU_STICK": 20784,
    "DL_BOW": 20792,
    "DL_BOW_STRING": 20800,
    "DL_HOOKSHOT": 20808,
    "DL_HOOKSHOT_CHAIN": 20816,
    "DL_HOOKSHOT_HOOK": 20824,
    "DL_HOOKSHOT_AIM": 20832,
    "DL_FPS_RFOREARM": 20840,
    "DL_FPS_HOOKSHOT": 20848,
    "DL_BOOMERANG": 20856,
    "DL_SLINGSHOT": 20864,
    "DL_SLINGSHOT_STRING": 20872,
    "DL_OCARINA_FAIRY": 20880,
    "DL_GORON_BRACELET": 20888,
    "DL_MASK_SKULL": 20896,
    "DL_MASK_SPOOKY": 20904,
    "DL_MASK_KEATON": 20912,
    "DL_MASK_TRUTH": 20920,
    "DL_MASK_GORON": 20928,
    "DL_MASK_ZORA": 20936,
    "DL_MASK_GERUDO": 20944,
    "DL_MASK_BUNNY": 20952,
    "DL_SWORD_BLADE_3_BROKEN": 20960,
    "DL_BLADEBREAK": 20968,
    "DL_HAMMER": 20976,
    "DL_UPGRADE_LFOREARM": 20984,
    "DL_UPGRADE_LHAND": 20992,
    "DL_UPGRADE_LFIST": 21000,
    "DL_UPGRADE_RFOREARM": 21008,
    "DL_UPGRADE_RHAND": 21016,
    "DL_UPGRADE_RFIST": 21024,
    "DL_BOOT_LIRON": 21032,
    "DL_BOOT_RIRON": 21040,
    "DL_BOOT_LHOVER": 21048,
    "DL_BOOT_RHOVER": 21056,
    "DL_FPS_LFOREARM": 21064,
    "DL_FPS_LHAND": 21072,
    "DL_FPS_RHAND": 21080,
    "DL_DEKU_MASK": 21088,
    "DL_GORON_MASK": 21096,
    "DL_ZORA_MASK": 21104,
    "DL_DEITY_MASK": 21112,
    "DL_BOTTLE_FILLING": 21120,
    "DL_BOTTLE_EMPTY": 21128,
    "DL_SWORD_FAIRY": 21136,
    "DL_DEKU_GUARD": 21144,
    "DL_PIPE_MOUTH": 21152,
    "DL_PIPE_RIGHT": 21160,
    "DL_PIPE_UP": 21168,
    "DL_PIPE_DOWN": 21176,
    "DL_PIPE_LEFT": 21184,
    "DL_PIPE_A": 21192,
    "DL_STEM_RIGHT": 21200,
    "DL_STEM_LEFT": 21208,
    "DL_PETAL_PARTICLE": 21216,
    "DL_PETAL_PROPELLER_CLOSED": 21224,
    "DL_FLOWER_CENTER_CLOSED": 21232,
    "DL_FLOWER_PROPELLER_OPEN": 21240,
    "DL_FLOWER_CENTER_OPEN": 21248,
    "DL_PAD_WOOD": 21256,
    "DL_PAD_GRASS": 21264,
    "DL_PAD_OPENING": 21272,
    "DL_FIRE_PUNCH": 21280,
    "DL_DRUM_STRAP": 21288,
    "DL_DRUM_UP": 21296,
    "DL_DRUM_LEFT": 21304,
    "DL_DRUM_RIGHT": 21312,
    "DL_DRUM_DOWN": 21320,
    "DL_DRUM_A": 21328,
    "DL_SHIELD_PRONE": 21336,
    "DL_BODY_SHIELD": 21344,
    "DL_CURLED": 21352,
    "DL_SPIKES": 21360,
    "DL_INIT_FIRE": 21368,
    "DL_FIRE_ROLL": 21376,
    "DL_LFIN": 21384,
    "DL_LFIN_SWIM": 21392,
    "DL_RFIN": 21400,
    "DL_RFIN_SWIM": 21408,
    "DL_GUITAR_HAND": 21416,
    "DL_FIN_SHIELD": 21424,
    "DL_MAGIC_BARRIER": 21432,
    "DL_SWORD_DEITY": 21440,
    "DL_DF": 21448,
    "DL_SWORD1_SHEATHED": 21456,
    "DL_SWORD2_SHEATHED": 21464,
    "DL_SWORD3_SHEATHED": 21472,
    "DL_SHIELD1_BACK": 21480,
    "DL_SHIELD2_BACK": 21488,
    "DL_SHIELD3_BACK": 21496,
    "DL_SWORD1_SHIELD1": 21504,
    "DL_SWORD1_SHIELD2": 21512,
    "DL_SWORD1_SHIELD3": 21520,
    "DL_SWORD2_SHIELD1": 21528,
    "DL_SWORD2_SHIELD2": 21536,
    "DL_SWORD2_SHIELD3": 21544,
    "DL_SWORD3_SHIELD1": 21552,
    "DL_SWORD3_SHIELD2": 21560,
    "DL_SWORD3_SHIELD3": 21568,
    "DL_LFIST_SWORD1": 21576,
    "DL_LFIST_SWORD2": 21584,
    "DL_LFIST_SWORD3": 21592,
    "DL_LFIST_HAMMER": 21600,
    "DL_RFIST_SHIELD_1": 21608,
    "DL_RFIST_SHIELD_2": 21616,
    "DL_RFIST_SHIELD_3": 21624,
    "DL_RFIST_BOW": 21632,
    "DL_RFIST_HOOKSHOT": 21640,
    "DL_RHAND_OCARINA_TIME": 21648,
    "DL_FPS_RHAND_BOW": 21656,
    "DL_FPS_LHAND_HOOKSHOT": 21664,
    "DL_SWORD1_SHIELD1_SHEATH": 21672,
    "DL_SWORD1_SHIELD2_SHEATH": 21680,
    "DL_SWORD1_SHIELD3_SHEATH": 21688,
    "DL_SWORD2_SHIELD1_SHEATH": 21696,
    "DL_SWORD2_SHIELD2_SHEATH": 21704,
    "DL_SWORD2_SHIELD3_SHEATH": 21712,
    "DL_SWORD3_SHIELD1_SHEATH": 21720,
    "DL_SWORD3_SHIELD2_SHEATH": 21728,
    "DL_SWORD3_SHIELD3_SHEATH": 21736,
    "DL_LFIST_SWORD3_BROKEN": 21744,
    "DL_UNK37": 21752,
    "DL_UNK38": 21760,
    "DL_UNK39": 21768,
    "DL_UNK40": 21776,
    "DL_UNK41": 21784,
    "DL_UNK42": 21792,
    "DL_UNK43": 21800,
    "DL_UNK44": 21808,
    "DL_UNK45": 21816,
    "DL_UNK46": 21824,
    "DL_UNK47": 21832,
    "DL_UNK48": 21840,
    "DL_UNK49": 21848,
    "DL_UNK50": 21856,
    "DL_UNK51": 21864,
    "DL_UNK52": 21872,
    "DL_UNK53": 21880,
    "DL_UNK54": 21888,
    "DL_UNK55": 21896,
    "DL_UNK56": 21904,
    "DL_UNK57": 21912,
    "DL_UNK58": 21920,
    "DL_UNK59": 21928,
    "DL_UNK60": 21936,
    "DL_UNK61": 21944,
    "DL_UNK62": 21952,
    "DL_UNK63": 21960,
    "DL_UNK64": 21968,
    "DL_UNK65": 21976,
    "DL_UNK66": 21984,
    "DL_UNK67": 21992,
    "DL_UNK68": 22000,
    "DL_UNK69": 22008,
    "DL_UNK70": 22016,
    "DL_UNK71": 22024,
    "DL_UNK72": 22032,
    "DL_UNK73": 22040,
    "DL_UNK74": 22048,
    "DL_UNK75": 22056,
    "DL_UNK76": 22064,
    "DL_UNK77": 22072,
    "DL_UNK78": 22080,
    "DL_UNK79": 22088,
    "DL_UNK80": 22096,
    "DL_UNK81": 22104,
    "DL_UNK82": 22112,
    "DL_UNK83": 22120,
    "DL_UNK84": 22128,
    "DL_UNK85": 22136,
    "DL_UNK86": 22144,
    "DL_UNK87": 22152,
    "DL_UNK88": 22160,
    "DL_UNK89": 22168,
    "DL_UNK90": 22176,
    "DL_UNK91": 22184,
    "DL_UNK92": 22192,
    "DL_UNK93": 22200,
    "DL_UNK94": 22208,
    "DL_UNK95": 22216,
    "DL_UNK96": 22224,
    "DL_UNK97": 22232,
    "DL_UNK98": 22240,
    "DL_UNK99": 22248,
    "DL_UNK100": 22256,
    "DL_UNK101": 22264,
    "DL_UNK102": 22272,
    "DL_UNK103": 22280,
    "DL_UNK104": 22288,
    "DL_UNK105": 22296,
    "DL_UNK106": 22304,
    "DL_UNK107": 22312,
    "DL_UNK108": 22320,
    "DL_UNK109": 22328,
    "DL_UNK110": 22336,
    "DL_UNK111": 22344,
    "DL_UNK112": 22352,
    "DL_UNK113": 22360,
    "DL_UNK114": 22368,
    "DL_UNK115": 22376,
    "DL_UNK116": 22384,
    "DL_UNK117": 22392,
    "DL_UNK118": 22400,
    "DL_UNK119": 22408,
    "DL_UNK120": 22416,
    "DL_UNK121": 22424,
    "DL_UNK122": 22432,
    "DL_UNK123": 22440,
    "DL_UNK124": 22448,
    "DL_UNK125": 22456,
    "DL_UNK126": 22464,
    "DL_UNK127": 22472,
    "DL_UNK128": 22480,
    "DL_UNK129": 22488,
    "DL_UNK130": 22496,
    "DL_UNK131": 22504,
    "DL_UNK132": 22512,
    "DL_UNK133": 22520,
    "DL_UNK134": 22528,
    "DL_UNK135": 22536,
    "DL_UNK136": 22544,
    "DL_UNK137": 22552,
    "DF_COMMAND": 22560,
    "SKEL_SECTION": 22576,
    "ZORA_MAGIC_0": 22592,
    "ZORA_MAGIC_1": 22608,
    "MATRIX_SWORD1_BACK": 22624,
    "MATRIX_SWORD2_BACK": 22688,
    "MATRIX_SWORD3_BACK": 22752,
    "MATRIX_SHIELD1_BACK": 22816,
    "MATRIX_SHIELD2_BACK": 22880,
    "MATRIX_SHIELD3_BACK": 22944,
    "MATRIX_SHIELD1_ITEM": 23008,
    "MATRIX_BUNNYHOOD0": 23072,
    "MATRIX_BUNNYHOOD1": 23136,
    "MATRIX_DUMMY": 23200
  };

export class OOTAdultManifest implements IManifest {

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer, nocompress?: boolean): number {
        let r = 0;
        // Get original zobj from ROM.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let zobj: Buffer = tools.decompressObjectFileFromRom(rom, OBJ_BOY);
        let originalSize: number = zobj.byteLength;
        if (model.byteLength > zobj.byteLength) {
            // This shouldn't be possible because zzplayas would throw a tantrum before you got this far.
            return r;
        }
        // Clear its contents.
        ModLoader.utils.clearBuffer(zobj);
        // Load the model.
        model.copy(zobj);
        // Trim excess space.
        zobj = trimBuffer(zobj);
        // Attempt to put the file back.
        if (nocompress === undefined || nocompress === false) {
            if (!tools.recompressObjectFileIntoRom(rom, OBJ_BOY, zobj)) {
                // If we get here it means the compressed object is bigger than the original.
                // This can happen because the compression ratio ends up different due to texture differences.

                // Move the file to extended ROM space.
                r = tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, OBJ_BOY), zobj, originalSize);
                rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.join(__dirname, "../", "no_crc.txt")));
            }
        } else {
            // Move the file to extended ROM space.
            r = tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, OBJ_BOY), zobj, originalSize, nocompress);
            rom = PatchTypes.get(".txt")!.patch(rom, fs.readFileSync(path.join(__dirname, "../", "no_crc.txt")));
        }
        return r;
    }

    repoint(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): boolean {
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let code: Buffer = tools.getCodeFile(rom);
        let _code = new ManifestBuffer(code);
        _code.GoTo(0xE6718);
        _code.SetAdvance(8);
        _code.Write32(OOT_ADULT.DL_RFIST);                    //    Right Fist (High Poly)
        _code.Write32(OOT_ADULT.DL_RFIST);                    //    Right Fist (Low Poly)
        _code.Write32(OOT_ADULT.DL_RFIST);                    //    Right Fist + Deku Shield (High Poly)
        _code.Write32(OOT_ADULT.DL_RFIST);                    //    Right Fist + Deku Shield (Low Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_SHIELD_1);      //    Right Fist + Hylian Shield (High Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_SHIELD_1);      //    Right Fist + Hylian Shield (Low Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_SHIELD_2);      //    Right Fist + Mirror Shield (High Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_SHIELD_2);      //    Right Fist + Mirror Shield (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD1_SHEATHED);           //    Sheathed Sword (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD1_SHEATHED);           //    Sheathed Sword (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD1_SHIELD1);           //    Deku Shield + Sheathed Sword (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD1_SHIELD1);           //    Deku Shield + Sheathed Sword (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD1_SHIELD2);      //    Hylian Shield + Sheathed Sword (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD1_SHIELD2);      //    Hylian Shield + Sheathed Sword (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD1_SHIELD3);      //    Mirror Shield + Sheathed Sword (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD1_SHIELD3);      //    Mirror Shield + Sheathed Sword (Low Poly)
        _code.Write32(0x00000000);              //    ? (High Poly)
        _code.Write32(0x00000000);                  //    ? (Low Poly)
        _code.Write32(0x00000000);                  //    Deku Shield without Sheath (High Poly)
        _code.Write32(0x00000000);                  //    Deku Shield without Sheath (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD_SHEATH_2);             //    Sword Sheath (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD_SHEATH_2);             //    Sword Sheath (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD2_SHIELD1_SHEATH);             //    Deku Shield + Sheath (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD2_SHIELD1_SHEATH);             //    Deku Shield + Sheath (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD2_SHIELD2_SHEATH);           //    Hylian Shield + Sheath (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD2_SHIELD2_SHEATH);           //    Hylian Shield + Sheath (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD2_SHIELD3_SHEATH);           //    Mirror Shield + Sheath (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD2_SHIELD3_SHEATH);           //    Mirror Shield + Sheath (Low Poly)
        _code.Write32(0x00000000);                  //    ? (High Poly)
        _code.Write32(0x00000000);                  //    ? (Low Poly)
        _code.Write32(0x00000000);                  //    ? (High Poly)
        _code.Write32(0x00000000);                  //    ? (Low Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_SWORD3);          //    Left Fist + Biggoron Sword (High Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_SWORD3);          //    Left Fist + Biggoron Sword (Low Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_SWORD3_BROKEN);   //    Left Fist + Broken Giant's Knife (High Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_SWORD3_BROKEN);   //    Left Fist + Broken Giant's Knife (Low Poly)
        _code.Write32(OOT_ADULT.DL_LHAND);                    //    Left Hand (High Poly)
        _code.Write32(OOT_ADULT.DL_LHAND);                    //    Left Hand (Low Poly)
        _code.Write32(OOT_ADULT.DL_LFIST);                    //    Left Fist (High Poly)
        _code.Write32(OOT_ADULT.DL_LFIST);                    //    Left Fist (Low Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_SWORD1);              //    Left Fist + Kokiri Sword (High Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_SWORD1);              //    Left Fist + Kokiri Sword (Low Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_SWORD2);              //    Left Fist + Master Sword (High Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_SWORD2);              //    Left Fist + Master Sword (Low Poly)
        _code.Write32(OOT_ADULT.DL_RHAND);                    //    Right Hand (High Poly)
        _code.Write32(OOT_ADULT.DL_RHAND);                    //    Right Hand (Low Poly)
        _code.Write32(OOT_ADULT.DL_RFIST);                    //    Right Fist (High Poly)
        _code.Write32(OOT_ADULT.DL_RFIST);                    //    Right Fist (Low Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (High Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD2_SHEATHED);           //    Sheathed Sword (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD2_SHEATHED);           //    Sheathed Sword (Low Poly)
        _code.Write32(OOT_ADULT.DL_SWORD_SHEATH_2);             //    Sword Sheath (High Poly)
        _code.Write32(OOT_ADULT.DL_SWORD_SHEATH_2);             //    Sword Sheath (Low Poly)
        _code.Write32(OOT_ADULT.DL_WAIST);                    //    Waist (High Poly)
        _code.Write32(OOT_ADULT.DL_WAIST);                    //    Waist (Low Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (High Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (Low Poly)
        _code.Write32(OOT_ADULT.DL_RHAND_OCARINA_TIME);       //    Right Hand + Fairy Ocarina (High Poly)
        _code.Write32(OOT_ADULT.DL_RHAND_OCARINA_TIME);       //    Right Hand + Fairy Ocarina (Low Poly)
        _code.Write32(OOT_ADULT.DL_RHAND_OCARINA_TIME);       //    Right Hand + Ocarina of Time (High Poly)
        _code.Write32(OOT_ADULT.DL_RHAND_OCARINA_TIME);       //    Right Hand + Ocarina of Time (Low Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_HOOKSHOT);           //    Right Fist + Hookshot / Longshot (High Poly)
        _code.Write32(OOT_ADULT.DL_RFIST_HOOKSHOT);           //    Right Fist + Hookshot / Longshot (Low Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_HAMMER);             //    Left Fist + Megaton Hammer (High Poly)
        _code.Write32(OOT_ADULT.DL_LFIST_HAMMER);             //    Left Fist + Megaton Hammer (Low Poly)
        _code.Write32(OOT_ADULT.DL_DF);                    //    Left Fist + Boomerang (High Poly)
        _code.Write32(OOT_ADULT.DL_DF);                    //    Left Fist + Boomerang (Low Poly)
        _code.Write32(OOT_ADULT.DL_LHAND_BOTTLE);             //    Outstretched Left Hand for Holding Bottles (High Poly)
        _code.Write32(OOT_ADULT.DL_LHAND_BOTTLE);             //    Outstretched Left Hand for Holding Bottles (Low Poly)
        _code.Write32(OOT_ADULT.DL_FPS_LFOREARM);             //    FPS Left Forearm
        _code.Write32(OOT_ADULT.DL_FPS_LHAND);                //    FPS Left Hand
        _code.Write32(OOT_ADULT.DL_RSHOULDER);                //    Right Shoulder (High Poly)
        _code.Write32(OOT_ADULT.DL_FPS_RFOREARM);             //    FPS Right Forearm
        _code.Write32(OOT_ADULT.DL_FPS_RHAND_BOW);            //    FPS Right Hand + Fairy Bow
        _code.GoTo(0xE6A4C);
        _code.SetAdvance(4);
        _code.Write32(OOT_ADULT.DL_BOOT_LIRON);               //    Left Iron Boot
        _code.Write32(OOT_ADULT.DL_BOOT_RIRON);               //    Right Iron Boot
        _code.Write32(OOT_ADULT.DL_BOOT_LHOVER);              //    Left Hover Boot
        _code.Write32(OOT_ADULT.DL_BOOT_RHOVER);              //    Right Hover Boot
        _code.GoTo(0xE6B28);
        _code.Write32(OOT_ADULT.DL_BOTTLE);                   //    Empty Bottle
        _code.GoTo(0xE6B64);
        _code.SetAdvance(4);
        _code.Write32(OOT_ADULT.DL_BOW_STRING);               //    Fairy Bow String
        _code.Float(0.0);                           //    Fairy Bow String Anchor (X Position Float)
        _code.Float(-360.4);                        //    Fairy Bow String Anchor (Y Position Float) 0xC3B43333
        tools.recompressDMAFileIntoRom(rom, 27, code);
        return true;
    }
}

const OBJ_BOY: number = 0x0014;