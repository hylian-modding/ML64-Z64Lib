import IMemory from 'modloader64_api/IMemory';
import * as Z64API from '../../API/Imports';

export class DungeonItemManager implements Z64API.IDungeonItemManager {
    emulator: IMemory;
    DEKU_TREE: Z64API.IDungeonItemContainer;
    DODONGOS_CAVERN: Z64API.IDungeonItemContainer;
    JABJ_JABUS_BELLY: Z64API.IDungeonItemContainer;
    FOREST_TEMPLE: Z64API.IDungeonItemContainer;
    FIRE_TEMPLE: Z64API.IDungeonItemContainer;
    WATER_TEMPLE: Z64API.IDungeonItemContainer;
    SPIRIT_TEMPLE: Z64API.IDungeonItemContainer;
    SHADOW_TEMPLE: Z64API.IDungeonItemContainer;
    BOTTOM_OF_THE_WELL: Z64API.IDungeonItemContainer;
    ICE_CAVERN: Z64API.IDungeonItemContainer;
    GANONS_CASTLE: Z64API.IDungeonItemContainer;
    
    WOODFALL_TEMPLE: Z64API.IDungeonItemContainer;
    SNOWHEAD_TEMPLE: Z64API.IDungeonItemContainer;
    GREAT_BAY_TEMPLE: Z64API.IDungeonItemContainer;
    STONE_TOWER_TEMPLE: Z64API.IDungeonItemContainer;

    constructor(emulator: IMemory) {
        this.emulator = emulator;
        this.DEKU_TREE = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.DEKU_TREE
        );
        this.DODONGOS_CAVERN = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.DODONGOS_CAVERN
        );
        this.JABJ_JABUS_BELLY = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.JABJ_JABUS_BELLY
        );
        this.FOREST_TEMPLE = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.FOREST_TEMPLE
        );
        this.FIRE_TEMPLE = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.FIRE_TEMPLE
        );
        this.WATER_TEMPLE = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.WATER_TEMPLE
        );
        this.SPIRIT_TEMPLE = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.SPIRIT_TEMPLE
        );
        this.SHADOW_TEMPLE = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.SHADOW_TEMPLE
        );
        this.BOTTOM_OF_THE_WELL = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.BOTTOM_OF_THE_WELL
        );
        this.ICE_CAVERN = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.ICE_CAVERN
        );
        this.GANONS_CASTLE = new DungeonItemContainer(
            this.emulator,
            Z64API.OoT.VANILLA_DUNGEON_ITEM_INDEXES.GANONS_CASTLE
        );
        this.WOODFALL_TEMPLE = new DungeonItemContainer(
            this.emulator,
            Z64API.MM.VANILLA_DUNGEON_ITEM_INDEXES.WOODFALL_TEMPLE
        );
        this.SNOWHEAD_TEMPLE = new DungeonItemContainer(
            this.emulator,
            Z64API.MM.VANILLA_DUNGEON_ITEM_INDEXES.SNOWHEAD_TEMPLE
        );
        this.GREAT_BAY_TEMPLE = new DungeonItemContainer(
            this.emulator,
            Z64API.MM.VANILLA_DUNGEON_ITEM_INDEXES.GREAT_BAY_TEMPLE
        );
        this.STONE_TOWER_TEMPLE = new DungeonItemContainer(
            this.emulator,
            Z64API.MM.VANILLA_DUNGEON_ITEM_INDEXES.STONE_TOWER_TEMPLE
        );
    }
    setRawBuffer(buf: Buffer): void {
        this.emulator.rdramWriteBuffer(global.ModLoader.save_context + 0xa8, buf);
    }

    getRawBuffer(): Buffer {
        return this.emulator.rdramReadBuffer(global.ModLoader.save_context + 0xa8, 0x14);
    }
}

export class DungeonItemContainer implements Z64API.IDungeonItemContainer {
    private addr: number = 0x801EF730;
    private emulator: IMemory;
    private index: number;

    constructor(emulator: IMemory, index: number) {
        this.emulator = emulator;
        this.index = index;
    }

    get bossKey(): boolean {
        return this.emulator.rdramReadBit8(this.addr + this.index, 7);
    }

    set bossKey(bool: boolean) {
        this.emulator.rdramWriteBit8(this.addr + this.index, 7, bool);
    }

    get compass(): boolean {
        return this.emulator.rdramReadBit8(this.addr + this.index, 6);
    }

    set compass(bool: boolean) {
        this.emulator.rdramWriteBit8(this.addr + this.index, 6, bool);
    }

    get map(): boolean {
        return this.emulator.rdramReadBit8(this.addr + this.index, 5);
    }

    set map(bool: boolean) {
        this.emulator.rdramWriteBit8(this.addr + this.index, 5, bool);
    }
}
