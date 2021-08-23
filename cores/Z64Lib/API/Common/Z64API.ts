import { ICore } from 'modloader64_api/IModLoaderAPI';
import Vector3 from 'modloader64_api/math/Vector3';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../imports';

export const enum LinkState {
    UNKNOWN,
    STANDING,
    SWIMMING,
    OCARINA,
    BUSY,
    LOADING_ZONE,
    ENTERING_GROTTO,
    FIRST_PERSON,
    JUMPING,
    CLIMBING_OUT_OF_WATER,
    HANGING_FROM_LEDGE,
    CHARGING_SPIN_ATTACK,
    HOLDING_ACTOR,
    GETTING_ITEM,
    SHOOTING_BOW_OR_HOOKSHOT,
    RIDING_EPONA,
    DYING,
    TAKING_DAMAGE,
    FALLING,
    VOIDING_OUT,
    TALKING,
    HOVERING,
    Z_TARGETING,
    CAMERA,
}

export const enum LinkState2 {
    UNKNOWN,
    IDLE,
    CRAWLSPACE,
    MOVING_FORWARD,
}

export const enum Sword {
    NONE,
    //OoT
    KOKIRI_OOT = 1,
    MASTER = 2,
    GIANT_KNIFE = 3,
    BIGGORON = 4,
    //MM
    KOKIRI_MM = 1,
    RAZOR = 2,
    GILDED = 3
}

export const enum Shield {
    NONE,
    //OoT
    DEKU = 1,
    HYLIAN = 2,
    MIRROR_OOT = 3,
    //MM
    HERO = 1,
    MIRROR_MM = 2
}

export const enum Ocarina {
    NONE,
    //OoT
    FAIRY_OCARINA = 1,
    OCARINA_OF_TIME = 2,
    //MM
    OCARINA_OF_TIME_MM = 1
}

export interface ISwords {
    //OoT
    kokiriSword: boolean;
    masterSword: boolean;
    giantKnife: boolean;
    biggoronSword: boolean;
    //MM
    swordLevel: Sword;
}

export interface IShields {
    //OoT
    dekuShield: boolean;
    hylianShield: boolean;
    mirrorShield: boolean;
    //MM
    shieldLevel: Shield;
}

export const enum Magic {
    NONE,
    NORMAL,
    EXTENDED,
}

export const enum MagicQuantities {
    NONE = 0,
    NORMAL = 0x30,
    EXTENDED = 0x60,
}

export const enum AmmoUpgrade {
    NONE,
    BASE,
    UPGRADED,
    MAX
}

export const enum Wallet {
    CHILD,
    ADULT,
    GIANT,
    TYCOON,
}

export const enum AgeOrForm {
    //OOT
    ADULT = 0,
    CHILD = 1,
    //MM
    FD = 0,
    GORON = 1,
    ZORA = 2,
    DEKU = 3,
    HUMAN = 4
}

export const enum Mask {
    NONE,
    //OoT
    OOT_KEATON = 1,
    OOT_SKULL = 2,
    OOT_SPOOKY = 3,
    OOT_BUNNY = 4,
    OOT_TRUTH = 5,
    //MM
    MM_POSTMAN = 0x09,
    MM_ALL_NIGHT = 0x03,
    MM_BLAST = 0x12,
    MM_STONE = 0x10,
    MM_GREAT_FAIRY = 0xB,
    MM_DEKU = 0x18,
    MM_KEATON = 0x5,
    MM_BREMEN = 0x11,
    MM_BUNNY_HOOD = 0x4,
    MM_DON_GERO = 0xD,
    MM_OF_SCENTS = 0x13,
    MM_GORON = 0x16,
    MM_ROMANI = 0x07,
    MM_CIRCUS_LEADER = 0x08,
    MM_KAFEI = 0x02,
    MM_COUPLES = 0x0A,
    MM_OF_TRUTH = 0x1,
    MM_ZORA = 0x17,
    MM_KAMERO = 0x0E,
    MM_GIBDO = 0x0C,
    MM_GARO = 0x06,
    MM_CAPTAIN = 0x0F,
    MM_GIANT = 0x14,
    MM_FIERCE_DEITY = 0x15,
}

export interface ILink extends Z64API.IActor {
    state: LinkState;
    state2: LinkState2;
    rawStateValue: number;
    tunic: Z64API.OoT.Tunic | any;
    shield: Shield;
    boots: Z64API.OoT.Boots | any;
    mask: Mask;
    anim_data: Buffer;
    current_sound_id: number;
    sword: Sword;
    get_anim_id(): number;
    get_anim_frame(): number;
    projected_position: Vector3;
}

export interface IGlobalContext {
    scene: number;
    room: number;
    framecount: number;
    scene_framecount: number;
    continue_state: boolean;
    liveSceneData_chests: Buffer;
    liveSceneData_clear: Buffer;
    liveSceneData_switch: Buffer;
    liveSceneData_temp: Buffer;
    liveSceneData_collectable: Buffer;
    getSaveDataForCurrentScene(): Buffer;
    writeSaveDataForCurrentScene(buf: Buffer): void;
    viewStruct: IViewStruct;
    fogDistance: number;
    fogColor: number;
    lastOrCurrentEntrance: number;
}

export interface IViewStruct {
    readonly VIEW: string;
    gfx_ctx_pointer: number;
    fov: number;
    near_clip: number;
    far_clip: number;
    position: Vector3;
    focus: Vector3;
    axis: Vector3;
}

export interface IOotHelper {
    isTitleScreen(): boolean;
    isSceneNumberValid(): boolean;
    isLinkEnteringLoadingZone(): boolean;
    isPaused(): boolean;
    isInterfaceShown(): boolean;
    Player_InBlockingCsMode(): boolean;
}

export interface IZ64Core extends ICore {
    link: Z64API.Z64.ILink;
    save: Z64API.OoT.ISaveContext | Z64API.MM.ISaveContext;
    helper: Z64API.OoT.IOotHelper | Z64API.MM.IMMHelper;
    global: Z64API.OoT.IGlobalContext | Z64API.OoT.IGlobalContext;
    commandBuffer: Z64API.ICommandBuffer;
    actorManager: IActorManager;
    toggleMapSelectKeybind(): boolean;
}

// Note: ON_ACTOR_SPAWN/ON_ACTOR_DESPAWN won't detect anything created by ICommandBuffer. This is intentional behavior.

export enum OotEvents {
    ON_SAVE_LOADED = 'onSaveLoaded',
    ON_SCENE_CHANGE = 'onSceneChange',
    ON_LOADING_ZONE = 'onLoadingZone',
    ON_ACTOR_SPAWN = 'onActorSpawn',
    ON_ACTOR_DESPAWN = 'onActorDespawn',
    ON_ROOM_CHANGE = 'onRoomChange',
    ON_ROOM_CHANGE_PRE = 'onPreRoomChange',
    ON_AGE_CHANGE = 'onAgeChange',
    ON_SAVE_FLAG_CHANGE = "onSaveFlagChange",
    ON_LOCAL_FLAG_CHANGE = "onLocalFlagChange",
    ON_DAY_TRANSITION = "onDayTransition",
    ON_NIGHT_TRANSITION = "onNightTransition",
    ON_HEALTH_CHANGE = "onHealthChange",
    ON_TUNIC_CHANGE = "onTunicChanged"
}

export interface IActorManager {
    // Returns IActor if the actor exists or undefined if the pointer doesn't lead to an actor.
    createIActorFromPointer(pointer: number): Z64API.IActor;
    getActors(category: Z64API.ActorCategory): Z64API.IActor[];
}

export const NO_KEYS = 0xff;

export interface IKeyManager {
    getKeyCountForIndex(index: number): number;
    setKeyCountByIndex(index: number, count: number): void;
    getRawKeyBuffer(): Buffer;
}

class UpgradeCount {
    item: Z64API.OoT.InventoryItem | Z64API.MM.InventoryItem;
    level: AmmoUpgrade;
    count: number;

    constructor(item: Z64API.OoT.InventoryItem | Z64API.MM.InventoryItem, level: AmmoUpgrade, count: number) {
        this.item = item;
        this.level = level;
        this.count = count;
    }

    isMatch(inst: UpgradeCount) {
        return inst.item === this.item && inst.level === this.level;
    }
}

const UpgradeCountLookupTable: UpgradeCount[] = [
    // Bombs
    new UpgradeCount(Z64API.OoT.InventoryItem.BOMB | Z64API.MM.InventoryItem.BOMB, AmmoUpgrade.NONE, 0),
    new UpgradeCount(Z64API.OoT.InventoryItem.BOMB | Z64API.MM.InventoryItem.BOMB, AmmoUpgrade.BASE, 20),
    new UpgradeCount(Z64API.OoT.InventoryItem.BOMB | Z64API.MM.InventoryItem.BOMB, AmmoUpgrade.UPGRADED, 30),
    new UpgradeCount(Z64API.OoT.InventoryItem.BOMB | Z64API.MM.InventoryItem.BOMB, AmmoUpgrade.MAX, 40),
    // Sticks
    new UpgradeCount(Z64API.OoT.InventoryItem.DEKU_STICK | Z64API.MM.InventoryItem.DEKU_STICK, AmmoUpgrade.NONE, 0),
    new UpgradeCount(Z64API.OoT.InventoryItem.DEKU_STICK | Z64API.MM.InventoryItem.DEKU_STICK, AmmoUpgrade.BASE, 10),
    new UpgradeCount(Z64API.OoT.InventoryItem.DEKU_STICK | Z64API.MM.InventoryItem.DEKU_STICK, AmmoUpgrade.UPGRADED, 20),
    new UpgradeCount(Z64API.OoT.InventoryItem.DEKU_STICK | Z64API.MM.InventoryItem.DEKU_STICK, AmmoUpgrade.MAX, 30),
    // Nuts
    new UpgradeCount(Z64API.OoT.InventoryItem.DEKU_NUT | Z64API.MM.InventoryItem.DEKU_NUT, AmmoUpgrade.NONE, 0),
    new UpgradeCount(Z64API.OoT.InventoryItem.DEKU_NUT | Z64API.MM.InventoryItem.DEKU_NUT, AmmoUpgrade.BASE, 20),
    new UpgradeCount(Z64API.OoT.InventoryItem.DEKU_NUT | Z64API.MM.InventoryItem.DEKU_NUT, AmmoUpgrade.UPGRADED, 30),
    new UpgradeCount(Z64API.OoT.InventoryItem.DEKU_NUT | Z64API.MM.InventoryItem.DEKU_NUT, AmmoUpgrade.MAX, 40),
    // Seeds
    new UpgradeCount(Z64API.OoT.InventoryItem.FAIRY_SLINGSHOT | Z64API.MM.InventoryItem.FAIRY_SLINGSHOT, AmmoUpgrade.NONE, 0),
    new UpgradeCount(Z64API.OoT.InventoryItem.FAIRY_SLINGSHOT | Z64API.MM.InventoryItem.FAIRY_SLINGSHOT, AmmoUpgrade.BASE, 30),
    new UpgradeCount(Z64API.OoT.InventoryItem.FAIRY_SLINGSHOT | Z64API.MM.InventoryItem.FAIRY_SLINGSHOT, AmmoUpgrade.UPGRADED, 40),
    new UpgradeCount(Z64API.OoT.InventoryItem.FAIRY_SLINGSHOT | Z64API.MM.InventoryItem.FAIRY_SLINGSHOT, AmmoUpgrade.MAX, 50),
    // Arrows
    new UpgradeCount(Z64API.OoT.InventoryItem.FAIRY_BOW | Z64API.MM.InventoryItem.HEROES_BOW, AmmoUpgrade.NONE, 0),
    new UpgradeCount(Z64API.OoT.InventoryItem.FAIRY_BOW | Z64API.MM.InventoryItem.HEROES_BOW, AmmoUpgrade.BASE, 30),
    new UpgradeCount(Z64API.OoT.InventoryItem.FAIRY_BOW | Z64API.MM.InventoryItem.HEROES_BOW, AmmoUpgrade.UPGRADED, 40),
    new UpgradeCount(Z64API.OoT.InventoryItem.FAIRY_BOW | Z64API.MM.InventoryItem.HEROES_BOW, AmmoUpgrade.MAX, 50),
    // Bombchu
    new UpgradeCount(Z64API.OoT.InventoryItem.BOMBCHU | Z64API.MM.InventoryItem.BOMBCHU, AmmoUpgrade.NONE, 0),
    new UpgradeCount(Z64API.OoT.InventoryItem.BOMBCHU | Z64API.MM.InventoryItem.BOMBCHU, AmmoUpgrade.BASE, 5),
    new UpgradeCount(Z64API.OoT.InventoryItem.BOMBCHU | Z64API.MM.InventoryItem.BOMBCHU, AmmoUpgrade.UPGRADED, 10),
    new UpgradeCount(Z64API.OoT.InventoryItem.BOMBCHU | Z64API.MM.InventoryItem.BOMBCHU, AmmoUpgrade.MAX, 20),
];

export function UpgradeCountLookup(
    item: Z64API.OoT.InventoryItem | Z64API.MM.InventoryItem,
    level: AmmoUpgrade
): number {
    let inst: UpgradeCount = new UpgradeCount(item, level, -1);
    for (let i = 0; i < UpgradeCountLookupTable.length; i++) {
        if (inst.isMatch(UpgradeCountLookupTable[i])) {
            return UpgradeCountLookupTable[i].count;
        }
    }
    return 0;
}

export interface IOvlPayloadResult {
    slot: number;
    spawn(params: number, rot: Vector3, pos: Vector3, address?: number): Promise<Z64API.IActor>;
    spawnActorRXYZ(params: number, rotX: number, rotY: number, rotZ: number, pos: Vector3, address?: number): Promise<Z64API.IActor>;
    spawnActorRXY_Z(params: number, rotXY: number, rotZ: number, pos: Vector3, address?: number): Promise<Z64API.IActor>
}

export class SceneStruct {
    buf: Buffer;

    constructor(buf: Buffer) {
        this.buf = buf;
    }

    get chests(): Buffer {
        return this.buf.slice(0x0, 0x4);
    }

    get switches(): Buffer {
        return this.buf.slice(0x4, 0x8);
    }

    get room_clear(): Buffer {
        return this.buf.slice(0x8, 0xC);
    }

    get collectible(): Buffer {
        return this.buf.slice(0xC, 0x10);
    }

    get unused(): Buffer {
        return this.buf.slice(0x10, 0x14);
    }

    get visited_rooms(): Buffer {
        return this.buf.slice(0x14, 0x18);
    }

    get visited_floors(): Buffer {
        return this.buf.slice(0x18, 0x1C);
    }
}

export const enum SongNotes {
    NONE = 0,
    A_FLAT = 1,
    A_NOTE = 2,
    A_SHARP = 3,
    C_DOWN_FLAT = 4,
    C_DOWN_NOTE = 5,
    C_DOWN_SHARP = 6,
    C_RIGHT_FLAT = 8,
    C_RIGHT_NOTE = 9,
    C_RIGHT_SHARP = 10,
    C_LEFT_FLAT = 10,
    C_LEFT_NOTE = 11,
    C_LEFT_SHARP = 12,
    C_UP_FLAT = 13,
    C_UP_NOTE = 14,
    C_UP_SHARP = 15,
    SILENCE = 0xFF,
}

export const enum SongFlags {
    NONE = 0,
    FLATTENED_NOTE = 0x40,
    SHARPENED_NOTE = 0x80,
    CONTINUE_SILENCE = 0xC0,
}

export interface IScarecrowSongNote {
    note: SongNotes;
    duration: number;
    volume: number;
    vibrato: number;
    pitch: number;
    special: SongFlags;
}

export class ScarecrowSongNoteStruct {
    buf: Buffer;

    constructor(buf: Buffer) {
        this.buf = buf;
    }

    get note(): Buffer {
        return this.buf.slice(0x0, 0x1);
    }

    get unused(): Buffer {
        return this.buf.slice(0x1, 0x2);
    }

    get duration(): Buffer {
        return this.buf.slice(0x2, 0x4);
    }

    get volume(): Buffer {
        return this.buf.slice(0x4, 0x5);
    }

    get vibrato(): Buffer {
        return this.buf.slice(0x5, 0x6);
    }

    get pitch(): Buffer {
        return this.buf.slice(0x6, 0x7);
    }

    get special(): Buffer {
        return this.buf.slice(0x7, 0x8);
    }
}