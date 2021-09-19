import { ICore } from 'modloader64_api/IModLoaderAPI';
import Vector3 from 'modloader64_api/math/Vector3';
import { AgeOrForm, Wallet } from '../Common/Z64API';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../imports';

export const enum Scene {
  INSIDE_THE_DEKU_TREE,
  DODONGOS_CAVERN,
  INSIDE_JABU_JABUS_BELLY,
  FOREST_TEMPLE,
  FIRE_TEMPLE,
  WATER_TEMPLE,
  SPIRIT_TEMPLE,
  SHADOW_TEMPLE,
  BOTTOM_OF_THE_WELL,
  ICE_CAVERN,
  GANONS_TOWER,
  GERUDO_TRAINING_GROUNDS,
  THIEVES_HIDEOUT,
  INSIDE_GANONS_CASTLE,
  GANONS_TOWER_COLLAPSING,
  INSIDE_GANONS_CASTLE_COLLAPSING,
  TREASURE_BOX_SHOP,
  GOHMAS_LAIR,
  KING_DODONGOS_LAIR,
  BARINADES_LAIR,
  PHANTOM_GANONS_LAIR,
  VOLVAGIAS_LAIR,
  MORPHAS_LAIR,
  TWINROVAS_LAIR,
  BONGO_BONGOS_LAIR,
  GANONDORFS_LAIR,
  TOWER_COLLAPSE_EXTERIOR,
  MARKET_ENTRANCE_CHILD_DAY,
  MARKET_ENTRANCE_CHILD_NIGHT,
  MARKET_ENTRANCE_ADULT,
  BACK_ALLEY_DAY,
  BACK_ALLEY_NIGHT,
  MARKET_CHILD_DAY,
  MARKET_CHILD_NIGHT,
  MARKET_ADULT,
  TEMPLE_OF_TIME_EXTERIOR_CHILD_DAY,
  TEMPLE_OF_TIME_EXTERIOR_CHILD_NIGHT,
  TEMPLE_OF_TIME_EXTERIOR_ADULT,
  KNOW_IT_ALL_BROTHERS_HOUSE,
  HOUSE_OF_TWINS,
  MIDOS_HOUSE,
  SARIAS_HOUSE,
  CARPENTER_BOSS_HOUSE,
  BACK_ALLEY_MAN_IN_GREEN_HOUSE,
  BAZAAR,
  KOKIRI_SHOP,
  GORON_SHOP,
  ZORA_SHOP,
  KAKARIKO_POTION_SHOP,
  MARKET_POTION_SHOP,
  BOMBCHU_SHOP,
  HAPPY_MASK_SHOP,
  LINKS_HOUSE,
  BACK_ALLEY_DOG_LADY_HOUSE,
  STABLE,
  IMPAS_HOUSE,
  LAKESIDE_LABORATORY,
  CARPENTERS_TENT,
  GRAVEKEEPERS_HUT,
  GREAT_FAIRYS_FOUNTAIN_UPGRADES,
  FAIRYS_FOUNTAIN,
  GREAT_FAIRYS_FOUNTAIN_SPELLS,
  GROTTOS,
  GRAVE_REDEAD,
  GRAVE_FAIRYS_FOUNTAIN,
  ROYAL_FAMILY_TOMB,
  SHOOTING_GALLERY,
  TEMPLE_OF_TIME,
  CHAMBER_OF_THE_SAGES,
  CASTLE_HEDGE_MAZE_DAY,
  CASTLE_HEDGE_MAZE_NIGHT,
  CUTSCENE_MAP,
  WINDMILL,
  FISHING_POND,
  CASTLE_COURTYARD,
  BUMBCHU_BOWLING,
  RANCH_HOUSE,
  GUARD_HOUSE,
  GRANNYS_POTION_SHOP,
  GANON_BATTLE_ARENA,
  HOUSE_OF_SKULLTULA,
  HYRULE_FIELD,
  KAKARIKO_VILLAGE,
  GRAVEYARD,
  ZORAS_RIVER,
  KOKIRI_FOREST,
  SACRED_FOREST_MEADOW,
  LAKE_HYLIA,
  ZORAS_DOMAIN,
  ZORAS_FOUNTAIN,
  GERUDO_VALLEY,
  LOST_WOODS,
  DESERT_COLOSSUS,
  GERUDOS_FORTRESS,
  HAUNTED_WASTELAND,
  HYRULE_CASTLE,
  DEATH_MOUNTAIN_TRAIL,
  DEATH_MOUNTAIN_CRATER,
  GORON_CITY,
  LON_LON_RANCH,
  GANONS_CASTLE_EXTERIOR,
}

export interface ISceneInfo { }

export const enum Tunic {
  KOKIRI = 1,
  GORON = 2,
  ZORA = 3,
}

export const enum Boots {
  KOKIRI = 1,
  IRON = 2,
  HOVER = 3,
}

export const enum InventoryItem {
  DEKU_STICK,
  DEKU_NUT,
  BOMB,
  FAIRY_BOW,
  FIRE_ARROW,
  DINS_FIRE,
  FAIRY_SLINGSHOT,
  FAIRY_OCARINA,
  OCARINA_OF_TIME,
  BOMBCHU,
  HOOKSHOT,
  LONGSHOT,
  ICE_ARROW,
  FARORES_WIND,
  BOOMERANG,
  LENS_OF_TRUTH,
  MAGIC_BEAN,
  MEGATON_HAMMER,
  LIGHT_ARROW,
  NAYRUS_LOVE,
  EMPTY_BOTTLE,
  RED_POTION,
  GREEN_POTION,
  BLUE_POTION,
  BOTTLED_FAIRY,
  BOTTLED_FISH,
  LON_LON_MILK,
  RUTOS_LETTER,
  BLUE_FIRE,
  BOTTLED_BUGS,
  BOTTLED_BIG_POE,
  LON_LON_MILK_HALF,
  BOTTLED_POE,
  WEIRD_EGG,
  CHILD_CUCCO,
  ZELDAS_LETTER,
  KEATON_MASK,
  SKULL_MASK,
  SPOOKY_MASK,
  BUNNY_HOOD,
  GORON_MASK,
  ZORA_MASK,
  GERUDO_MASK,
  MASK_OF_TRUTH,
  SOLD_OUT,
  POCKET_EGG,
  POCKET_CUCCO,
  COJIRO,
  ODD_MUSHROOM,
  ODD_POTION,
  POACHERS_SAW,
  BROKEN_GORON_SWORD,
  PRESCRIPTION,
  EYEBALL_FROG,
  EYE_DROPS,
  CLAIM_CHECK,
  BOW_FIRE_ARROWS,
  BOW_ICE_ARROWS,
  BOW_LIGHT_ARROWS,
  NONE = 0xff,
}

export const enum Hookshot {
  NONE,
  HOOKSHOT,
  LONGSHOT,
}

export const enum Strength {
  NONE,
  GORON_BRACELET,
  SILVER_GAUNTLETS,
  GOLDEN_GAUNTLETS,
  BLACK_GAUNTLETS,
  GREEN_GAUNTLETS,
  BLUE_GAUNTLETS,
}

export const enum ZoraScale {
  NONE,
  SILVER,
  GOLDEN,
}

export interface ITunics {
  kokiriTunic: boolean;
  goronTunic: boolean;
  zoraTunic: boolean;
}

export interface IBoots {
  kokiriBoots: boolean;
  ironBoots: boolean;
  hoverBoots: boolean;
}

export interface IInventoryFields {
  wallet: Wallet;
  strength: Strength;
  swimming: ZoraScale;
  dekuSticks: boolean;
  dekuSticksCapacity: Z64API.Z64.AmmoUpgrade;
  dekuNuts: boolean;
  dekuNutsCapacity: Z64API.Z64.AmmoUpgrade;
  bombs: boolean;
  bombBag: Z64API.Z64.AmmoUpgrade;
  bombchus: boolean;
  magicBeans: boolean;
  fairySlingshot: boolean;
  bulletBag: Z64API.Z64.AmmoUpgrade;
  fairyBow: boolean;
  fireArrows: boolean;
  iceArrows: boolean;
  lightArrows: boolean;
  quiver: Z64API.Z64.AmmoUpgrade;
  dinsFire: boolean;
  faroresWind: boolean;
  nayrusLove: boolean;
  ocarina: Z64API.Z64.Ocarina;
  hookshot: Hookshot;
  boomerang: boolean;
  lensOfTruth: boolean;
  megatonHammer: boolean;
  childTradeItem: InventoryItem;
  adultTradeItem: InventoryItem;
  bottle_1: InventoryItem;
  bottle_2: InventoryItem;
  bottle_3: InventoryItem;
  bottle_4: InventoryItem;
}

export interface IInventoryCounts {
  dekuSticksCount: number;
  dekuNutsCount: number;
  bombsCount: number;
  bombchuCount: number;
  magicBeansCount: number;
  dekuSeeds: number;
  arrows: number;
}

export interface IQuestStatus {
  kokiriEmerald: boolean;
  goronRuby: boolean;
  zoraSapphire: boolean;

  lightMedallion: boolean;
  forestMedallion: boolean;
  fireMedallion: boolean;
  waterMedallion: boolean;
  shadowMedallion: boolean;
  spiritMedallion: boolean;

  zeldasLullaby: boolean;
  eponasSong: boolean;
  sariasSong: boolean;
  sunsSong: boolean;
  songOfTime: boolean;
  songOfStorms: boolean;

  preludeOfLight: boolean;
  minuetOfForest: boolean;
  boleroOfFire: boolean;
  serenadeOfWater: boolean;
  nocturneOfShadow: boolean;
  requiemOfSpirit: boolean;

  gerudoMembershipCard: boolean;
  stoneOfAgony: boolean;

  goldSkulltulas: number;
  displayGoldSkulltulas: boolean;

  heartPieces: number;
}

export interface ISaveContext {
  swords: Z64API.Z64.ISwords;
  shields: Z64API.Z64.IShields;
  tunics: ITunics;
  boots: IBoots;
  inventory: IInventory;
  questStatus: IQuestStatus;
  entrance_index: number;
  cutscene_number: number;
  world_time: number;
  world_night_flag: boolean;
  zeldaz_string: string;
  death_counter: number;
  player_name: string;
  dd_flag: boolean;
  heart_containers: number;
  health: number;
  magic_meter_size: Z64API.Z64.Magic;
  magic_current: number;
  rupee_count: number;
  navi_timer: number;
  checksum: number;
  age: AgeOrForm;
  magic_beans_purchased: number;
  poe_collector_score: number;
  permSceneData: Buffer;
  eventFlags: Buffer;
  itemFlags: Buffer;
  infTable: Buffer;
  skulltulaFlags: Buffer;
  keyManager: IKeyManager;
  dungeonItemManager: Z64API.IDungeonItemManager;
  scarecrowsSongChildFlag: boolean;
  scarecrowsSong: Buffer;
  double_defense: number;
  bButton: number;
  index: number;
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

export interface IInventory extends Z64API.OoT.IInventoryFields, Z64API.OoT.IInventoryCounts {
  hasBottle(): boolean;
  getBottleCount(): number;
  getBottledItems(): InventoryItem[];
  isChildTradeFinished(): boolean;
  isAdultTradeFinished(): boolean;
  getItemInSlot(slotId: number): InventoryItem;
  getSlotForItem(item: InventoryItem): number;
  getSlotsForItem(item: InventoryItem): number[];
  hasItem(item: InventoryItem): boolean;
  hasAmmo(item: InventoryItem): boolean;
  getAmmoForItem(item: InventoryItem): number;
  getAmmoForSlot(slotId: number): number;
  setAmmoInSlot(slot: number, amount: number): void;
  setItemInSlot(item: InventoryItem, slot: number): void;
  giveItem(item: InventoryItem, desiredSlot: number): void;
  removeItem(item: InventoryItem): void;
  getEmptySlots(): number[];
  getMaxRupeeCount(): number;
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

export interface IOOTCore extends ICore {
  link: Z64API.Z64.ILink;
  save: ISaveContext;
  helper: IOotHelper;
  global: IGlobalContext;
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

export const enum VANILLA_KEY_INDEXES {
  FOREST_TEMPLE = 3,
  FIRE_TEMPLE = 4,
  WATER_TEMPLE = 5,
  SPIRIT_TEMPLE = 6,
  SHADOW_TEMPLE = 7,
  BOTTOM_OF_THE_WELL = 8,
  GERUDO_TRAINING_GROUND = 11,
  GERUDO_FORTRESS = 12,
  GANONS_CASTLE = 13,
  TREASURE_CHEST_SHOP = 16,
}

export const enum VANILLA_DUNGEON_ITEM_INDEXES {
  DEKU_TREE,
  DODONGOS_CAVERN,
  JABJ_JABUS_BELLY,
  FOREST_TEMPLE,
  FIRE_TEMPLE,
  WATER_TEMPLE,
  SPIRIT_TEMPLE,
  SHADOW_TEMPLE,
  BOTTOM_OF_THE_WELL,
  ICE_CAVERN,
  GANONS_CASTLE,
}

export interface IKeyManager {
  getKeyCountForIndex(index: number): number;
  setKeyCountByIndex(index: number, count: number): void;
  getRawKeyBuffer(): Buffer;
}

export const enum InventorySlots {
  DEKU_STICKS,
  DEKU_NUTS,
  BOMBS,
  FAIRY_BOW,
  FIRE_ARROWS,
  DINS_FIRE,
  FAIRY_SLINGSHOT,
  OCARINA,
  BOMBCHUS,
  HOOKSHOT,
  ICE_ARROWS,
  FARORES_WIND,
  BOOMERANG,
  LENS_OF_TRUTH,
  MAGIC_BEANS,
  MEGATON_HAMMER,
  LIGHT_ARROWS,
  NAYRUS_LOVE,
  BOTTLE1,
  BOTTLE2,
  BOTTLE3,
  BOTTLE4,
  ADULT_TRADE_ITEM,
  CHILD_TRADE_ITEM,
}

export interface IScarecrowSongNote {
  note: Z64API.Z64.SongNotes;
  duration: number;
  volume: number;
  vibrato: number;
  pitch: number;
  special: Z64API.Z64.SongFlags;
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