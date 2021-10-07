import { JSONTemplate } from "modloader64_api/JSONTemplate";
import IMemory from "modloader64_api/IMemory";
import { ILogger } from "modloader64_api/IModLoaderAPI";
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';

export class SaveContext extends JSONTemplate implements Z64API.MM.ISaveContext {

    private emulator: IMemory;
    save_context: number = Z64CORE.Z64.Z64_SAVE;
    inventory: Z64CORE.MM.Inventory;
    questStatus: Z64API.MM.IQuestStatus;
    owlStatues: Z64API.MM.IOwlStatues;
    keyManager: Z64API.MM.IKeyManager;
    dungeonItemManager: Z64API.IDungeonItemManager;
    photo: Z64API.MM.IPhoto;
    stray: Z64API.MM.IStray;
    skull: Z64API.MM.ISkull;
    swords: Z64CORE.Z64.SwordsEquipment;
    sword_helper: Z64API.MM.ISwordHelper;
    shields: Z64CORE.Z64.ShieldsEquipment;
    commandBuffer!: Z64API.ICommandBuffer;

    jsonFields: string[] = [
        'entrance_index',
        'cutscene_number',
        'world_time',
        'world_night_flag',
        'minimap_flags',
        'map_visible',
        'map_visited',
        'player_name',
        'heart_containers',
        'magic_meter_size',
        'magic_current',
        'rupee_count',
        'owlStatues',
        'checksum',
        'form',
        'swords',
        'shields',
        'double_defense',
        'have_tatl',
        'inventory',
        'masks',
        'questStatus',
        'intro_flag',
        'updrades',
        'spider_house_mask_order',
        'bomber_code',
        'permFlags',
        'photo',
        'skull',
        'stray',
        'pictoboxUsed'
    ];

    constructor(emu: IMemory, log: ILogger, core: Z64API.MM.IMMCore) {
        super();
        this.emulator = emu;
        this.swords = new Z64CORE.Z64.SwordsEquipment(emu, this.commandBuffer);
        this.sword_helper = this.swords;
        this.shields = new Z64CORE.Z64.ShieldsEquipment(emu);
        this.inventory = new Z64CORE.MM.Inventory(emu, log);
        this.questStatus = new Z64CORE.MM.QuestStatus(emu);
        this.owlStatues = new Z64CORE.MM.OwlStatues(emu);
        this.keyManager = new Z64CORE.Z64.KeyManager(emu);
        this.dungeonItemManager = new Z64CORE.Z64.DungeonItemManager(emu);
        this.photo = new Z64CORE.MM.Photo(emu);
        this.stray = new Z64CORE.MM.Stray(emu);
        this.skull = new Z64CORE.MM.Skull(emu);
    }

    get checksum(): number {
        return this.emulator.rdramReadBuffer(0x801EF694, 0x6).readUIntBE(0x0, 0x6);
    }

    get form(): number {
        return this.emulator.rdramRead8(this.save_context + 0x0020);
    }

    get hearts(): number {
        return this.emulator.rdramRead16(0x801EF6A6);
    }

    set hearts(flag: number) {
        this.emulator.rdramWrite16(0x801EF6A6, flag);
    }

    get health_mod(): number {
        return this.emulator.rdramRead8(0x801F35CA);
    }

    set health_mod(flag: number) {
        this.emulator.rdramWrite16(0x801F35CA, flag);
    }

    get deku_b_state() {
        return this.emulator.rdramRead32(0x801EF6C8);
    }

    set deku_b_state(flag: number) {
        this.emulator.rdramWrite32(0x801EF6C8, flag);
    }

    get razor_hits(): number {
        return this.emulator.rdramRead16(0x801EF6AC);
    }

    set razor_hits(flag: number) {
        this.emulator.rdramWrite16(0x801EF6AC, flag);
    }

    get magic(): number {
        return this.emulator.rdramRead8(0x801EF6A9);
    }

    set magic(flag: number) {
        this.emulator.rdramWrite8(0x801EF6A9, flag);
    }

    get magic_meter_size(): Z64API.Z64.Magic {
        return this.emulator.rdramRead8(0x801EF6A8);
    }

    // Several things need to be set in order for magic to function properly.
    set magic_meter_size(size: Z64API.Z64.Magic) {
        this.emulator.rdramWrite8(0x801EF6A8, size);
        switch (size) {
            case Z64API.Z64.Magic.NONE: {
                this.emulator.rdramWrite8(0x801EF6B0, 0);
                this.emulator.rdramWrite8(0x801EF6B1, 0);
                this.emulator.rdramWrite8(0x801EF6A9, Z64API.Z64.MagicQuantities.NONE);
                this.emulator.rdramWrite8(0x801EF6A8, 0);
                break;
            }
            case Z64API.Z64.Magic.NORMAL: {
                this.emulator.rdramWrite8(0x801EF6B0, 1);
                this.emulator.rdramWrite8(0x801EF6B1, 0);
                this.emulator.rdramWrite8(0x801EF6A9, Z64API.Z64.MagicQuantities.NORMAL);
                this.emulator.rdramWrite8(0x801EF6A8, 0);
                break;
            }
            case Z64API.Z64.Magic.EXTENDED: {
                this.emulator.rdramWrite8(0x801EF6B0, 1);
                this.emulator.rdramWrite8(0x801EF6B1, 1);
                this.emulator.rdramWrite8(0x801EF6A9, Z64API.Z64.MagicQuantities.EXTENDED);
                this.emulator.rdramWrite8(0x801EF6A8, 0);
                break;
            }
        }
    }

    get magic_current(): number {
        return this.emulator.rdramRead8(0x801F35A0);
    }

    set magic_current(amount: number) {
        this.emulator.rdramWrite8(0x801F35A0, amount);
    }

    get owl_statues(): number {
        return this.emulator.rdramRead16(0x801EF6B6);
    }

    set owl_statues(flag: number) {
        this.emulator.rdramWrite16(0x801EF6B6, flag);
    }

    get map_visible(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F05D0, 0x4);
    }

    set map_visible(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F05D0, flag);
    }

    get map_visited(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F05CC, 0x4);
    }

    set map_visited(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F05CC, flag);
    }

    get tunic_boots(): number {
        return this.emulator.rdramRead8(0x801EF6DC);
    }

    set tunic_boots(flag: number) {
        this.emulator.rdramWrite8(0x801EF6DC, flag);
    }

    get sword_sheild(): number {
        return this.emulator.rdramRead8(0x801EF6DD);
    }

    set sword_sheild(flag: number) {
        this.emulator.rdramWrite8(0x801EF6DD, flag);
    }

    get item_inventory(): Buffer {
        return this.emulator.rdramReadBuffer(0x801EF6E0, 0x30);
    }

    set item_inventory(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801EF6E0, flag);
    }

    get masks(): Buffer {
        return this.emulator.rdramReadBuffer(0x801EF6F8, 0x18);
    }

    set masks(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801EF6F8, flag);
    }

    get item_amts(): Buffer {
        return this.emulator.rdramReadBuffer(0x801EF710, 0x18);
    }

    set item_amts(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801EF710, flag);
    }

    get upgrades(): number {
        return this.emulator.rdramRead32(0x801EF728);
    }

    set upgrades(flag: number) {
        this.emulator.rdramWrite32(0x801EF728, flag);
    }

    get questflg1(): number {
        return this.emulator.rdramRead8(0x801EF72C);
    }

    set questflg1(flag: number) {
        this.emulator.rdramWrite8(0x801EF72C, flag);
    }

    get questflg2(): number {
        return this.emulator.rdramRead8(0x801EF72D);
    }

    set questflg2(flag: number) {
        this.emulator.rdramWrite8(0x801EF72D, flag);
    }

    get questflg3(): number {
        return this.emulator.rdramRead8(0x801EF72E);
    }

    set questflg3(flag: number) {
        this.emulator.rdramWrite8(0x801EF72E, flag);
    }

    get questflg4(): number {
        return this.emulator.rdramRead8(0x801EF72F);
    }

    set questflg4_flag(flag: number) {
        this.emulator.rdramWrite8(0x801EF72F, flag);
    }
    
    get double_defense(): number {
        return this.emulator.rdramRead8(0x801EF743);
    }

    set double_defense(flag: number) {
        this.emulator.rdramWrite8(0x801EF743, flag);
    }

    get permSceneData(): Buffer {
        return this.emulator.rdramReadBuffer(0x801EF768, 0xD20);
    }

    set permSceneData(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801EF768, flag);
    }

    get weekEventFlags(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F0568, 0x64);
    }
    set weekEventFlags(buf: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F0568, buf);
    }

    get infTable(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F067C, 0x8);
    }

    set infTable(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F067C, flag);
    }

    get minimap_flags(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F0514, 0x1C);
    }
    set minimap_flags(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F0514, flag);
    }
    
    /*get item_Flags(): Buffer {
        return this.emulator.rdramReadBuffer(inventory, 0x18);
    }

    set item_Flags(flag: Buffer) {
        this.emulator.rdramWriteBuffer(inventory, flag);
    }*/

    get day_time(): number {
        return this.emulator.rdramRead16(0x801EF67C);
    }

    set day_time(flag: number) {
        this.emulator.rdramWrite16(0x801EF67C, flag);
    }

    get day_night(): number {
        return this.emulator.rdramRead32(0x801EF680);
    }

    set day_night(flag: number) {
        this.emulator.rdramWrite32(0x801EF680, flag);
    }

    get time_speed(): number {
        return this.emulator.rdramRead32(0x801EF684);
    }

    set time_speed(flag: number) {
        this.emulator.rdramWrite32(0x801EF684, flag);
    }

    get current_day(): number {
        return this.emulator.rdramRead32(0x801EF688);
    }

    set current_day(flag: number) {
        this.emulator.rdramWrite32(0x801EF688, flag);
    }

    get current_transformation(): Z64API.Z64.AgeOrForm {
        return this.emulator.rdramRead8(0x801EF690);
    }

    set current_transformation(flag: Z64API.Z64.AgeOrForm) {
        this.emulator.rdramWrite8(0x801EF690, flag);
    }

    get intro_flag(): number {
        return this.emulator.rdramRead8(0x801EF675);
    }

    set intro_flag(flag: number) {
        this.emulator.rdramWrite8(0x801EF675, flag);
    }

    get have_tatl(): number {
        return this.emulator.rdramRead8(0x801EF692);
    }

    set have_tatl(flag: number) {
        this.emulator.rdramWrite8(0x801EF692, flag);
    }

    get heart_containers(): number {
        return this.emulator.rdramRead16(0x801EF6A4) / 0x10;
    }

    set heart_containers(flag: number) {
        this.emulator.rdramWrite16(0x801EF6A4, flag * 0x10);
    }

    get rupees(): number {
        return this.emulator.rdramRead16(0x801EF6AA);
    }

    set rupees(flag: number) {
        this.emulator.rdramWrite16(0x801EF6AA, flag);
    }

    get bank(): number {
        return this.emulator.rdramRead16(0x801F054E);
    }

    set bank(flag: number) {
        this.emulator.rdramWrite16(0x801F054E, flag);
    }

    get lottery_numbers_day1(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F065C, 0x3);
    }

    set lottery_numbers_day1(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F065C, flag);
    }

    get lottery_numbers_day2(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F065F, 0x3);
    }

    set lottery_numbers_day2(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F065F, flag);
    }

    get lottery_numbers_day3(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F0662, 0x3);
    }

    set lottery_numbers_day3(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F0662, flag);
    }

    get spider_house_mask_order(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F0665, 0x6);
    }

    set spider_house_mask_order(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F0665, flag);
    }

    get bomber_code(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F066B, 0x5);
    }

    set bomber_code(flag: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F066B, flag);
    }

    get pictoboxUsed(): boolean {
        return this.emulator.rdramReadBit8(0x801EF72C, 6);
    }

    set pictoboxUsed(b: boolean) {
        this.emulator.rdramWriteBit8(0x801EF72C, 6, b);
    }

    get permFlags(): Buffer {
        return this.emulator.rdramReadBuffer(0x801F35D8, 0x960);
    }

    set permFlags(b: Buffer) {
        this.emulator.rdramWriteBuffer(0x801F35D8, b);
    }
}