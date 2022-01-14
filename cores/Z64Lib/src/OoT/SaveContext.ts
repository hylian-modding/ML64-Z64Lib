import IMemory from 'modloader64_api/IMemory';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import { ILogger, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';
import { IZ64Core } from '@Z64Lib/API/Common/Z64API';

export class SaveContext extends JSONTemplate implements Z64API.OoT.ISaveContext {
    private ModLoader: IModLoaderAPI;
    private emulator: IMemory;
    private instance: number = Z64CORE.Z64.Z64_SAVE;
    private entrance_index_addr: number = this.instance + 0x0000;
    private age_addr = this.instance + 0x0004;
    private cutscene_number_addr: number = this.instance + 0x000a;
    private world_time_addr: number = this.instance + 0x000c;
    private world_night_addr: number = this.instance + 0x0010;
    private zeldaz_addr: number = this.instance + 0x001c;
    private death_addr: number = this.instance + 0x0022;
    private player_name_addr: number = this.instance + 0x0024;
    private dd_flag_addr: number = this.instance + 0x002c;
    private heart_container_addr: number = this.instance + 0x002e;
    private health_addr: number = this.instance + 0x0030;
    private magic_meter_size_addr: number = this.instance + 0x0032;
    private magic_current_addr: number = this.instance + 0x0033;
    private magic_limit_addr: number = this.instance + 0x13f4;
    private magic_flag_1_addr: number = this.instance + 0x003a;
    private magic_flag_2_addr: number = this.instance + 0x003c;
    private magic_fill_cap_addr: number = this.instance + 0x13f7;
    private rupees_address: number = this.instance + 0x0034;
    private navi_timer_addr: number = this.instance + 0x0038;
    private checksum_addr: number = this.instance + 0x1352;
    private magic_beans_addr: number = this.instance + 0x009b;
    private poe_score_addr: number = this.instance + 0x0ebc;
    private scene_data_addr: number = this.instance + 0x00d4;
    private event_data_addr: number = this.instance + 0x0ed4;
    private item_flag_addr: number = this.instance + 0x0ef0;
    private inf_table_addr: number = this.instance + 0x0ef8;
    private skulltula_table_addr: number = this.instance + 0x0e9c;
    private scarecrowsSongChildFlag_addr: number = this.instance + 0x12c4;
    private scarecrowsSong_addr: number = this.instance + 0x12c6;
    private scarecrowsSong_addr_1: number = 0x801029FC;
    private scarecrowsSong_addr_2: number = 0x80102A9C;
    private double_defense_addr_1: number = this.instance + 0x00cf;
    private double_defense_addr_2: number = this.instance + 0x3d;
    private index_addr: number = 0x1354;

    // Further abstractions
    swords: Z64CORE.Z64.SwordsEquipment;
    shields: Z64CORE.Z64.ShieldsEquipment;
    tunics: Z64CORE.OoT.TunicsEquipment;
    boots: Z64CORE.OoT.BootsEquipment;
    inventory: Z64CORE.OoT.Inventory;
    questStatus: Z64API.OoT.IQuestStatus;
    keyManager: Z64API.OoT.IKeyManager;
    dungeonItemManager: Z64API.IDungeonItemManager;
    commandBuffer!: Z64API.ICommandBuffer;
    
    jsonFields: string[] = [
        'entrance_index',
        'cutscene_number',
        'world_time',
        'world_night_flag',
        'zeldaz_string',
        'death_counter',
        'player_name',
        'dd_flag',
        'heart_containers',
        'health',
        'magic_meter_size',
        'magic_current',
        'rupee_count',
        'navi_timer',
        'checksum',
        'age',
        'swords',
        'shields',
        'tunics',
        'boots',
        'inventory',
        'questStatus',
        'magic_beans_purchased',
        'poe_collector_score',
        'scarecrowsSongChildFlag',
        'scarecrowsSong'
    ];
    constructor(ModLoader: IModLoaderAPI, log: ILogger, core: IZ64Core) {
        super();
        this.ModLoader = ModLoader;
        this.emulator = ModLoader.emulator;
        this.swords = new Z64CORE.Z64.SwordsEquipment(this.emulator, core);
        this.shields = new Z64CORE.Z64.ShieldsEquipment(this.emulator);
        this.tunics = new Z64CORE.OoT.TunicsEquipment(this.emulator);
        this.boots = new Z64CORE.OoT.BootsEquipment(this.emulator);
        this.inventory = new Z64CORE.OoT.Inventory(this.emulator, log);
        this.questStatus = new Z64CORE.OoT.QuestStatus(this.emulator);
        this.keyManager = new Z64CORE.Z64.KeyManager(this.emulator);
        this.dungeonItemManager = new Z64CORE.Z64.DungeonItemManager(this.emulator);
    }
    // https://wiki.cloudmodding.com/oot/Entrance_Table
    // https://wiki.cloudmodding.com/oot/Entrance_Table_(Data)
    get entrance_index(): number {
        return this.emulator.rdramRead32(this.entrance_index_addr);
    }
    set entrance_index(index: number) {
        this.emulator.rdramWrite32(this.entrance_index_addr, index);
    }
    get cutscene_number(): number {
        return this.emulator.rdramRead16(this.cutscene_number_addr);
    }
    set cutscene_number(index: number) {
        this.emulator.rdramWrite16(this.cutscene_number_addr, index);
    }
    get world_time(): number {
        return this.emulator.rdramRead16(this.world_time_addr);
    }
    set world_time(time: number) {
        this.emulator.rdramWrite16(this.world_time_addr, time);
    }
    get world_night_flag(): boolean {
        return this.emulator.rdramRead32(this.world_night_addr) === 1;
    }
    set world_night_flag(bool: boolean) {
        this.emulator.rdramWrite32(
            this.world_night_addr,
            (function (bool: boolean) {
                return bool ? 1 : 0;
            })(bool)
        );
    }
    get zeldaz_string(): string {
        return this.emulator.rdramReadBuffer(this.zeldaz_addr, 6).toString('ascii');
    }
    get death_counter(): number {
        return this.emulator.rdramRead16(this.death_addr);
    }
    set death_counter(deaths: number) {
        this.emulator.rdramWrite16(this.death_addr, deaths);
    }
    get player_name(): string {
        return Z64API.zeldaString.decode(
            this.emulator.rdramReadBuffer(this.player_name_addr, 8)
        );
    }
    set player_name(str: string){
        this.emulator.rdramWriteBuffer(this.player_name_addr, Z64API.zeldaString.encode(str));
    }
    // Will always be false normally.
    get dd_flag(): boolean {
        return this.emulator.rdramRead16(this.dd_flag_addr) === 1;
    }
    set dd_flag(bool: boolean) {
        this.emulator.rdramWrite16(
            this.dd_flag_addr,
            (function (bool: boolean) {
                return bool ? 1 : 0;
            })(bool)
        );
    }
    get heart_containers(): number {
        return this.emulator.rdramRead16(this.heart_container_addr) / 0x10;
    }
    set heart_containers(num: number) {
        this.emulator.rdramWrite16(this.heart_container_addr, num * 0x10);
    }
    get health(): number {
        return this.emulator.rdramRead16(this.health_addr);
    }
    set health(hearts: number) {
        this.emulator.rdramWrite16(this.health_addr, hearts);
    }
    get magic_meter_size(): Z64API.Z64.Magic {
        return this.emulator.rdramRead8(this.magic_meter_size_addr);
    }
    // Several things need to be set in order for magic to function properly.
    set magic_meter_size(size: Z64API.Z64.Magic) {
        switch (size) {
            case Z64API.Z64.Magic.NONE: {
                this.emulator.rdramWrite8(this.magic_flag_1_addr, 0);
                this.emulator.rdramWrite8(this.magic_flag_2_addr, 0);
                this.emulator.rdramWrite8(this.magic_fill_cap_addr, Z64API.Z64.MagicQuantities.NONE);
                this.emulator.rdramWrite8(this.magic_meter_size_addr, 0);
                break;
            }
            case Z64API.Z64.Magic.NORMAL: {
                this.emulator.rdramWrite8(this.magic_flag_1_addr, 1);
                this.emulator.rdramWrite8(this.magic_flag_2_addr, 0);
                this.emulator.rdramWrite8(this.magic_fill_cap_addr, Z64API.Z64.MagicQuantities.NORMAL);
                this.emulator.rdramWrite8(this.magic_meter_size_addr, 0);
                break;
            }
            case Z64API.Z64.Magic.EXTENDED: {
                this.emulator.rdramWrite8(this.magic_flag_1_addr, 1);
                this.emulator.rdramWrite8(this.magic_flag_2_addr, 1);
                this.emulator.rdramWrite8(this.magic_fill_cap_addr, Z64API.Z64.MagicQuantities.EXTENDED);
                this.emulator.rdramWrite8(this.magic_meter_size_addr, 0);
                break;
            }
        }
    }

    get magic_current(): number {
        return this.emulator.rdramRead8(this.magic_current_addr);
    }

    set magic_current(amount: number) {
        this.emulator.rdramWrite8(this.magic_current_addr, amount);
    }
    get rupee_count(): number {
        return this.emulator.rdramRead16(this.rupees_address);
    }
    set rupee_count(dosh: number) {
        this.emulator.rdramWrite16(this.rupees_address, dosh);
    }
    get navi_timer(): number {
        return this.emulator.rdramRead16(this.navi_timer_addr);
    }
    set navi_timer(time: number) {
        this.emulator.rdramWrite16(this.navi_timer_addr, time);
    }
    get checksum() {
        return this.emulator.rdramRead16(this.checksum_addr);
    }
    get age(): Z64API.Z64.AgeOrForm {
        return this.emulator.rdramRead32(this.age_addr);
    }
    set age(age: Z64API.Z64.AgeOrForm) {
        this.emulator.rdramWrite32(this.age_addr, age);
    }
    get magic_beans_purchased(): number {
        return this.emulator.rdramRead8(this.magic_beans_addr);
    }
    set magic_beans_purchased(amt: number) {
        this.emulator.rdramWrite8(this.magic_beans_addr, amt);
    }
    get poe_collector_score(): number {
        return this.emulator.rdramRead32(this.poe_score_addr);
    }
    set poe_collector_score(pts: number) {
        this.emulator.rdramWrite32(this.poe_score_addr, pts);
    }
    get permSceneData(): Buffer {
        return this.emulator.rdramReadBuffer(this.scene_data_addr, 0xb0c);
    }
    set permSceneData(buf: Buffer) {
        this.emulator.rdramWriteBuffer(this.scene_data_addr, buf);
    }
    get eventFlags(): Buffer {
        return this.emulator.rdramReadBuffer(this.event_data_addr, 0x1c);
    }
    set eventFlags(buf: Buffer) {
        this.emulator.rdramWriteBuffer(this.event_data_addr, buf);
    }
    get itemFlags(): Buffer {
        return this.emulator.rdramReadBuffer(this.item_flag_addr, 0x8);
    }
    set itemFlags(buf: Buffer) {
        this.emulator.rdramWriteBuffer(this.item_flag_addr, buf);
    }
    get infTable(): Buffer {
        return this.emulator.rdramReadBuffer(this.inf_table_addr, 0x3c);
    }
    set infTable(buf: Buffer) {
        this.emulator.rdramWriteBuffer(this.inf_table_addr, buf);
    }
    get skulltulaFlags(): Buffer {
        return this.emulator.rdramReadBuffer(this.skulltula_table_addr, 0x18);
    }
    set skulltulaFlags(buf: Buffer) {
        this.emulator.rdramWriteBuffer(this.skulltula_table_addr, buf);
    }
    get scarecrowsSongChildFlag(): boolean {
        return this.emulator.rdramRead16(this.scarecrowsSongChildFlag_addr) === 1;
    }
    set scarecrowsSongChildFlag(bool: boolean) {
        this.emulator.rdramWrite16(
            this.scarecrowsSongChildFlag_addr,
            (function (bool: boolean) {
                return bool ? 1 : 0;
            })(bool)
        );
    }
    get scarecrowsSong(): Buffer {
        return this.emulator.rdramReadBuffer(this.scarecrowsSong_addr, 0x80);
    }
    set scarecrowsSong(buf: Buffer) {
        this.emulator.rdramWriteBuffer(this.scarecrowsSong_addr, buf);
        this.emulator.rdramWriteBuffer(this.scarecrowsSong_addr_1, buf);
        //this.emulator.rdramWriteBuffer(this.scarecrowsSong_addr_2, buf);
    }
    get double_defense(): number {
        return this.emulator.rdramRead8(this.double_defense_addr_1);
    }
    set double_defense(n: number) {
        this.emulator.rdramWrite8(this.double_defense_addr_1, n);
        if (n > 0) {
            this.emulator.rdramWrite8(this.double_defense_addr_2, 0x1);
        } else {
            this.emulator.rdramWrite8(this.double_defense_addr_2, 0x0);
        }
    }

    get bButton(): number {
        return this.emulator.rdramRead8(this.instance + 0x68);
    }

    get index(): number {
        return this.emulator.rdramRead32(this.instance + this.index_addr);
    }
}
