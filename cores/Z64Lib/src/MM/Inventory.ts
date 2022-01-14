import IMemory from 'modloader64_api/IMemory';
import { FlagManager } from 'modloader64_api/FlagManager';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import { ILogger } from 'modloader64_api/IModLoaderAPI';
import { NONAME } from 'dns';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsZ64';

export class Inventory extends JSONTemplate implements Z64API.MM.IInventory {
    private emulator: IMemory;
    private instance: number = Z64CORE.Z64.Z64_SAVE;
    private inventory_addr: number = this.instance + 0x0070;
    private inventory_ammo_addr: number = this.instance + 0x00A0;
    private inventory_upgrades_addr: number = this.instance + 0x00B8;
    private log: ILogger;
    jsonFields: string[] = [
        'wallet',
        'magicBeansCount',
        'dekuSticksCapacity',
        'dekuNutsCapacity',
        'bombBag',
        'quiver',
        'FIELD_OCARINA',
        'FIELD_HEROES_BOW',
        'FIELD_FIRE_ARROW',
        'FIELD_ICE_ARROW',
        'FIELD_LIGHT_ARROW',
        'FIELD_QUEST_ITEM_1',
        'FIELD_BOMB',
        'FIELD_BOMBCHU',
        'FIELD_DEKU_STICKS',
        'FIELD_DEKU_NUT',
        'FIELD_MAGIC_BEAN',
        'FIELD_QUEST_ITEM_2',
        'FIELD_POWDER_KEG',
        'FIELD_PICTOGRAPH_BOX',
        'FIELD_LENS_OF_TRUTH',
        'FIELD_HOOKSHOT',
        'FIELD_GREAT_FAIRYS_SWORD',
        'FIELD_QUEST_ITEM_3',
        'FIELD_BOTTLE1',
        'FIELD_BOTTLE2',
        'FIELD_BOTTLE3',
        'FIELD_BOTTLE4',
        'FIELD_BOTTLE5',
        'FIELD_BOTTLE6',
        'FIELD_MASK_POSTMAN',
        'FIELD_MASK_ALL_NIGHT',
        'FIELD_MASK_BLAST',
        'FIELD_MASK_STONE',
        'FIELD_MASK_GREAT_FAIRY',
        'FIELD_MASK_DEKU',
        'FIELD_MASK_KEATON',
        'FIELD_MASK_BREMEN',
        'FIELD_MASK_BUNNY_HOOD',
        'FIELD_MASK_DON_GERO',
        'FIELD_MASK_OF_SCENTS',
        'FIELD_MASK_GORON',
        'FIELD_MASK_ROMANI',
        'FIELD_MASK_CIRCUS_LEADER',
        'FIELD_MASK_KAFEI',
        'FIELD_MASK_COUPLES',
        'FIELD_MASK_OF_TRUTH',
        'FIELD_MASK_ZORA',
        'FIELD_MASK_KAMERO',
        'FIELD_MASK_GIBDO',
        'FIELD_MASK_GARO',
        'FIELD_MASK_CAPTAIN',
        'FIELD_MASK_GIANT',
        'FIELD_MASK_FIERCE_DEITY',
    ];

    constructor(emu: IMemory, log: ILogger) {
        super();
        this.emulator = emu;
        this.log = log;
    }

    get FIELD_OCARINA(): Z64API.Z64.Ocarina {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.OCARINA_OF_TIME);
        switch (val) {
            case Z64API.MM.InventoryItem.OCARINA_OF_TIME:
                return Z64API.Z64.Ocarina.OCARINA_OF_TIME;
            default:
                return Z64API.Z64.Ocarina.NONE;
        }
    }
    set FIELD_OCARINA(item: Z64API.Z64.Ocarina) {
        if (item === this.FIELD_OCARINA) return;

        switch (item) {
            case Z64API.Z64.Ocarina.NONE:
                this.setItemInSlot(Z64API.MM.InventoryItem.NONE, Z64API.MM.InventorySlots.OCARINA_OF_TIME);
                break;
            case Z64API.Z64.Ocarina.OCARINA_OF_TIME:
                this.setItemInSlot(
                    Z64API.MM.InventoryItem.OCARINA_OF_TIME,
                    Z64API.MM.InventorySlots.OCARINA_OF_TIME
                );
                break;
        }
    }

    get FIELD_HEROES_BOW(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.HEROES_BOW)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_HEROES_BOW(bow: boolean) {
        let value = bow ? Z64API.MM.InventoryItem.HEROES_BOW : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.HEROES_BOW)
    }

    get FIELD_FIRE_ARROW(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.FIRE_ARROWS)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_FIRE_ARROW(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.FIRE_ARROW : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.FIRE_ARROWS)
    }

    get FIELD_ICE_ARROW(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.ICE_ARROWS)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_ICE_ARROW(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.ICE_ARROW : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.ICE_ARROWS)
    }

    get FIELD_LIGHT_ARROW(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.LIGHT_ARROWS)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_LIGHT_ARROW(lightA: boolean) {
        let value = lightA ? Z64API.MM.InventoryItem.LIGHT_ARROW : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.LIGHT_ARROWS)
    }

    get FIELD_BOMB(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.BOMBS)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_BOMB(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.BOMB : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.BOMBS)
    }

    get FIELD_BOMBCHU(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.BOMBCHUS)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_BOMBCHU(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.BOMBCHU : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.BOMBCHUS)
    }

    get FIELD_DEKU_STICKS(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.DEKU_STICKS)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_DEKU_STICKS(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.DEKU_STICK : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.DEKU_STICKS)
    }

    get FIELD_DEKU_NUT(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.DEKU_NUTS)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_DEKU_NUT(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.DEKU_NUT : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.DEKU_NUTS)
    }

    get FIELD_MAGIC_BEAN(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MAGIC_BEANS)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MAGIC_BEAN(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MAGIC_BEANS : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MAGIC_BEANS)
    }

    get FIELD_POWDER_KEG(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.POWDER_KEG)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_POWDER_KEG(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.POWDER_KEG : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.POWDER_KEG)
    }

    get FIELD_PICTOGRAPH_BOX(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.PICTOGRAPH_BOX)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_PICTOGRAPH_BOX(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.PICTOGRAPH_BOX : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.PICTOGRAPH_BOX)
    }

    get FIELD_LENS_OF_TRUTH(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.LENS_OF_TRUTH)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_LENS_OF_TRUTH(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.LENS_OF_TRUTH : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.LENS_OF_TRUTH)
    }

    get FIELD_HOOKSHOT(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.HOOKSHOT)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_HOOKSHOT(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.HOOKSHOT : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.HOOKSHOT)
    }

    get FIELD_GREAT_FAIRYS_SWORD(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.GREAT_FAIRYS_SWORD)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_GREAT_FAIRYS_SWORD(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.GREAT_FAIRYS_SWORD : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.GREAT_FAIRYS_SWORD)
    }

    get FIELD_MASK_POSTMAN(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_POSTMAN)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_POSTMAN(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_POSTMAN : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_POSTMAN)
    }

    get FIELD_MASK_ALL_NIGHT(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_ALL_NIGHT)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_ALL_NIGHT(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_ALL_NIGHT : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_ALL_NIGHT)
    }

    get FIELD_MASK_BLAST(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_BLAST)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_BLAST(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_BLAST : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_BLAST)
    }

    get FIELD_MASK_STONE(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_STONE)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_STONE(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_STONE : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_STONE)
    }

    get FIELD_MASK_GREAT_FAIRY(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_GREAT_FAIRY)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_GREAT_FAIRY(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_GREAT_FAIRY : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_GREAT_FAIRY)
    }

    get FIELD_MASK_DEKU(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_DEKU)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_DEKU(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_DEKU : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_DEKU)
    }

    get FIELD_MASK_KEATON(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_KEATON)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_KEATON(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_KEATON : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_KEATON)
    }

    get FIELD_MASK_BREMEN(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_BREMEN)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_BREMEN(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_BREMEN : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_BREMEN)
    }

    get FIELD_MASK_BUNNY_HOOD(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_BUNNY_HOOD)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_BUNNY_HOOD(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_BUNNY_HOOD : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_BUNNY_HOOD)
    }

    get FIELD_MASK_DON_GERO(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_DON_GERO)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_DON_GERO(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_DON_GERO : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_DON_GERO)
    }

    get FIELD_MASK_OF_SCENTS(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_OF_SCENTS)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_OF_SCENTS(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_OF_SCENTS : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_OF_SCENTS)
    }

    get FIELD_MASK_GORON(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_GORON)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_GORON(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_GORON : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_GORON)
    }

    get FIELD_MASK_ROMANI(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_ROMANI)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_ROMANI(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_ROMANI : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_ROMANI)
    }

    get FIELD_MASK_CIRCUS_LEADER(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_CIRCUS_LEADER)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_CIRCUS_LEADER(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_CIRCUS_LEADER : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_CIRCUS_LEADER)
    }

    get FIELD_MASK_KAFEI(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_KAFEI)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_KAFEI(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_KAFEI : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_KAFEI)
    }

    get FIELD_MASK_COUPLES(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_COUPLES)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_COUPLES(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_COUPLES : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_COUPLES)
    }

    get FIELD_MASK_OF_TRUTH(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_OF_TRUTH)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_OF_TRUTH(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_OF_TRUTH : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_OF_TRUTH)
    }

    get FIELD_MASK_ZORA(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_ZORA)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_ZORA(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_ZORA : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_ZORA)
    }

    get FIELD_MASK_KAMERO(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_KAMERO)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_KAMERO(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_KAMERO : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_KAMERO)
    }


    get FIELD_MASK_GIBDO(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_GIBDO)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_GIBDO(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_GIBDO : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_GIBDO)
    }

    get FIELD_MASK_GARO(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_GARO)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_GARO(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_GARO : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_GARO)
    }


    get FIELD_MASK_CAPTAIN(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_CAPTAIN)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_CAPTAIN(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_CAPTAIN : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_CAPTAIN)
    }

    get FIELD_MASK_GIANT(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_GIANT)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_GIANT(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_GIANT : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_GIANT)
    }

    get FIELD_MASK_FIERCE_DEITY(): boolean {
        let val = this.getItemInSlot(Z64API.MM.InventorySlots.MASK_FIERCE_DEITY)
        return !(val === Z64API.MM.InventoryItem.NONE);
    }
    set FIELD_MASK_FIERCE_DEITY(bool: boolean) {
        let value = bool ? Z64API.MM.InventoryItem.MASK_FIERCE_DEITY : Z64API.MM.InventoryItem.NONE;
        this.setItemInSlot(value, Z64API.MM.InventorySlots.MASK_FIERCE_DEITY)
    }


    isChildTradeFinished(): boolean {
        throw new Error("Method not implemented.");
    }
    isAdultTradeFinished(): boolean {
        throw new Error("Method not implemented.");
    }

    set bombBag(bb: Z64API.Z64.AmmoUpgrade) {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x3
        );
        switch (bb) {
            case Z64API.Z64.AmmoUpgrade.NONE:
                buf[0x3] = 0x00;
                buf[0x4] = 0x00;
                break;
            case Z64API.Z64.AmmoUpgrade.BASE:
                buf[0x3] = 0x00;
                buf[0x4] = 0x01;
                break;
            case Z64API.Z64.AmmoUpgrade.UPGRADED:
                buf[0x3] = 0x01;
                buf[0x4] = 0x00;
                break;
            case Z64API.Z64.AmmoUpgrade.MAX:
                buf[0x3] = 0x01;
                buf[0x4] = 0x01;
                break;
        }
        this.emulator.rdramWriteBits8(this.inventory_upgrades_addr + 0x3, buf);
    }

    get bombBag(): Z64API.Z64.AmmoUpgrade {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x3
        );
        let str = buf.slice(3, 5).toString('hex');
        switch (str) {
            case '0000':
                return Z64API.Z64.AmmoUpgrade.NONE;
            case '0001':
                return Z64API.Z64.AmmoUpgrade.BASE;
            case '0100':
                return Z64API.Z64.AmmoUpgrade.UPGRADED;
            case '0101':
                return Z64API.Z64.AmmoUpgrade.MAX;
        }
        return Z64API.Z64.AmmoUpgrade.NONE;
    }

    set dekuSticksCapacity(bb: Z64API.Z64.AmmoUpgrade) {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x1
        );
        switch (bb) {
            case Z64API.Z64.AmmoUpgrade.NONE:
                buf[0x5] = 0x00;
                buf[0x6] = 0x00;
                break;
            case Z64API.Z64.AmmoUpgrade.BASE:
                buf[0x5] = 0x00;
                buf[0x6] = 0x01;
                break;
            case Z64API.Z64.AmmoUpgrade.UPGRADED:
                buf[0x5] = 0x01;
                buf[0x6] = 0x00;
                break;
            case Z64API.Z64.AmmoUpgrade.MAX:
                buf[0x5] = 0x01;
                buf[0x6] = 0x01;
                break;
        }
        this.emulator.rdramWriteBits8(this.inventory_upgrades_addr + 0x1, buf);
    }

    get dekuSticksCapacity(): Z64API.Z64.AmmoUpgrade {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x1
        );
        let str = buf.slice(5, 7).toString('hex');
        switch (str) {
            case '0000':
                return Z64API.Z64.AmmoUpgrade.NONE;
            case '0001':
                return Z64API.Z64.AmmoUpgrade.BASE;
            case '0100':
                return Z64API.Z64.AmmoUpgrade.UPGRADED;
            case '0101':
                return Z64API.Z64.AmmoUpgrade.MAX;
        }
        return Z64API.Z64.AmmoUpgrade.NONE;
    }

    set dekuNutsCapacity(bb: Z64API.Z64.AmmoUpgrade) {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x1
        );
        switch (bb) {
            case Z64API.Z64.AmmoUpgrade.NONE:
                buf[0x2] = 0x00;
                buf[0x3] = 0x00;
                break;
            case Z64API.Z64.AmmoUpgrade.BASE:
                buf[0x2] = 0x00;
                buf[0x3] = 0x01;
                break;
            case Z64API.Z64.AmmoUpgrade.UPGRADED:
                buf[0x2] = 0x01;
                buf[0x3] = 0x00;
                break;
            case Z64API.Z64.AmmoUpgrade.MAX:
                buf[0x2] = 0x01;
                buf[0x3] = 0x01;
                break;
        }
        this.emulator.rdramWriteBits8(this.inventory_upgrades_addr + 0x1, buf);
    }

    get dekuNutsCapacity(): Z64API.Z64.AmmoUpgrade {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x1
        );
        let str = buf.slice(2, 4).toString('hex');
        switch (str) {
            case '0000':
                return Z64API.Z64.AmmoUpgrade.NONE;
            case '0001':
                return Z64API.Z64.AmmoUpgrade.BASE;
            case '0100':
                return Z64API.Z64.AmmoUpgrade.UPGRADED;
            case '0101':
                return Z64API.Z64.AmmoUpgrade.MAX;
        }
        return Z64API.Z64.AmmoUpgrade.NONE;
    }

    get quiver(): Z64API.Z64.AmmoUpgrade {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x3
        );
        let str = buf.slice(6, 8).toString('hex');
        switch (str) {
            case '0000':
                return Z64API.Z64.AmmoUpgrade.NONE;
            case '0001':
                return Z64API.Z64.AmmoUpgrade.BASE;
            case '0100':
                return Z64API.Z64.AmmoUpgrade.UPGRADED;
            case '0101':
                return Z64API.Z64.AmmoUpgrade.MAX;
        }
        return Z64API.Z64.AmmoUpgrade.NONE;
    }

    set quiver(q: Z64API.Z64.AmmoUpgrade) {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x3
        );
        switch (q) {
            case Z64API.Z64.AmmoUpgrade.NONE:
                buf[0x6] = 0x00;
                buf[0x7] = 0x00;
                break;
            case Z64API.Z64.AmmoUpgrade.BASE:
                buf[0x6] = 0x00;
                buf[0x7] = 0x01;
                break;
            case Z64API.Z64.AmmoUpgrade.UPGRADED:
                buf[0x6] = 0x01;
                buf[0x7] = 0x00;
                break;
            case Z64API.Z64.AmmoUpgrade.MAX:
                buf[0x6] = 0x01;
                buf[0x7] = 0x01;
                break;
        }
        this.emulator.rdramWriteBits8(this.inventory_upgrades_addr + 0x3, buf);
    }

    get wallet(): Z64API.Z64.Wallet {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x2
        );
        let str = buf.slice(2, 4).toString('hex');
        switch (str) {
            case '0000':
                return Z64API.Z64.Wallet.CHILD;
            case '0001':
                return Z64API.Z64.Wallet.ADULT;
            case '0100':
                return Z64API.Z64.Wallet.GIANT;
        }
        return Z64API.Z64.Wallet.CHILD;
    }

    set wallet(w: Z64API.Z64.Wallet) {
        let buf: Buffer = this.emulator.rdramReadBits8(
            this.inventory_upgrades_addr + 0x2
        );
        switch (w) {
            case Z64API.Z64.Wallet.CHILD:
                buf[0x2] = 0x00;
                buf[0x3] = 0x00;
                break;
            case Z64API.Z64.Wallet.ADULT:
                buf[0x2] = 0x00;
                buf[0x3] = 0x01;
                break;
            case Z64API.Z64.Wallet.GIANT:
                buf[0x2] = 0x10;
                buf[0x3] = 0x00;
                break;
        }
        this.emulator.rdramWriteBits8(this.inventory_upgrades_addr + 0x2, buf);
    }

    getMaxRupeeCount(): number {
        let addr: number = 0x801C1E2C;
        let capacities: Array<number> = [];
        for (let i = 0; i < 8; i += 2) {
            capacities.push(this.emulator.rdramRead16(addr + i));
        }
        return capacities[this.wallet];
    }

    get dekuSticksCount(): number {
        return this.getAmmoForSlot(Z64API.MM.InventorySlots.DEKU_STICKS);
    }
    set dekuSticksCount(count: number) {
        this.setAmmoInSlot(Z64API.MM.InventorySlots.DEKU_STICKS, count);
    }

    get bombsCount(): number {
        return this.getAmmoForSlot(Z64API.MM.InventorySlots.BOMBS);
    }
    set bombsCount(count: number) {
        this.setAmmoInSlot(Z64API.MM.InventorySlots.BOMBS, count);
    }

    get bombchuCount(): number {
        return this.getAmmoForSlot(Z64API.MM.InventorySlots.BOMBCHUS);
    }
    set bombchuCount(count: number) {
        this.setAmmoInSlot(Z64API.MM.InventorySlots.BOMBCHUS, count);
    }

    get powderKegCount(): number {
        return this.getAmmoForSlot(Z64API.MM.InventorySlots.POWDER_KEG);
    }
    set powderKegCount(count: number) {
        this.setAmmoInSlot(Z64API.MM.InventorySlots.POWDER_KEG, count);
    }

    get magicBeansCount(): number {
        return this.getAmmoForSlot(Z64API.MM.InventorySlots.MAGIC_BEANS);
    }
    set magicBeansCount(count: number) {
        this.setAmmoInSlot(Z64API.MM.InventorySlots.MAGIC_BEANS, count);
    }

    get arrows(): number {
        return this.getAmmoForSlot(Z64API.MM.InventorySlots.HEROES_BOW);
    }
    set arrows(count: number) {
        this.setAmmoInSlot(Z64API.MM.InventorySlots.HEROES_BOW, count);
    }

    get dekuNutsCount(): number {
        return this.getAmmoForSlot(Z64API.MM.InventorySlots.DEKU_NUTS);
    }
    set dekuNutsCount(count: number) {
        this.setAmmoInSlot(Z64API.MM.InventorySlots.DEKU_NUTS, count);
    }

    get photoCount(): number {
        return this.getAmmoForSlot(0x1C); //slot: save + inventoryCount + 0x1C
    }
    set photoCount(count: number) {
        this.setAmmoInSlot(0x1C, count);
    }

    get FIELD_BOTTLE1(): Z64API.MM.InventoryItem {
        return this.getItemInSlot(Z64API.MM.InventorySlots.BOTTLE1);
    }
    set FIELD_BOTTLE1(content: Z64API.MM.InventoryItem) {
        if (
            content < Z64API.MM.InventoryItem.BOTTLE_EMPTY ||
            content > Z64API.MM.InventoryItem.BOTTLE_CHATEAU_ROMANI
        ) {
            return;
        }
        this.setItemInSlot(content, Z64API.MM.InventorySlots.BOTTLE1);
    }
    get FIELD_BOTTLE2(): Z64API.MM.InventoryItem {
        return this.getItemInSlot(Z64API.MM.InventorySlots.BOTTLE2);
    }
    set FIELD_BOTTLE2(content: Z64API.MM.InventoryItem) {
        if (
            content < Z64API.MM.InventoryItem.BOTTLE_EMPTY ||
            content > Z64API.MM.InventoryItem.BOTTLE_CHATEAU_ROMANI
        ) {
            return;
        }
        this.setItemInSlot(content, Z64API.MM.InventorySlots.BOTTLE2);
    }
    get FIELD_BOTTLE3(): Z64API.MM.InventoryItem {
        return this.getItemInSlot(Z64API.MM.InventorySlots.BOTTLE3);
    }
    set FIELD_BOTTLE3(content: Z64API.MM.InventoryItem) {
        if (
            content < Z64API.MM.InventoryItem.BOTTLE_EMPTY ||
            content > Z64API.MM.InventoryItem.BOTTLE_CHATEAU_ROMANI
        ) {
            return;
        }
        this.setItemInSlot(content, Z64API.MM.InventorySlots.BOTTLE3);
    }
    get FIELD_BOTTLE4(): Z64API.MM.InventoryItem {
        return this.getItemInSlot(Z64API.MM.InventorySlots.BOTTLE4);
    }
    set FIELD_BOTTLE4(content: Z64API.MM.InventoryItem) {
        if (
            content < Z64API.MM.InventoryItem.BOTTLE_EMPTY ||
            content > Z64API.MM.InventoryItem.BOTTLE_CHATEAU_ROMANI
        ) {
            return;
        }
        this.setItemInSlot(content, Z64API.MM.InventorySlots.BOTTLE4);
    }

    get FIELD_BOTTLE5(): Z64API.MM.InventoryItem {
        return this.getItemInSlot(Z64API.MM.InventorySlots.BOTTLE5);
    }
    set FIELD_BOTTLE5(content: Z64API.MM.InventoryItem) {
        if (
            content < Z64API.MM.InventoryItem.BOTTLE_EMPTY ||
            content > Z64API.MM.InventoryItem.BOTTLE_CHATEAU_ROMANI
        ) {
            return;
        }
        this.setItemInSlot(content, Z64API.MM.InventorySlots.BOTTLE5);
    }

    get FIELD_BOTTLE6(): Z64API.MM.InventoryItem {
        return this.getItemInSlot(Z64API.MM.InventorySlots.BOTTLE6);
    }
    set FIELD_BOTTLE6(content: Z64API.MM.InventoryItem) {
        if (
            content < Z64API.MM.InventoryItem.BOTTLE_EMPTY ||
            content > Z64API.MM.InventoryItem.BOTTLE_CHATEAU_ROMANI
        ) {
            return;
        }
        this.setItemInSlot(content, Z64API.MM.InventorySlots.BOTTLE6);
    }

    hasBottle(): boolean {
        for (let i = Z64API.MM.InventorySlots.BOTTLE1; i <= Z64API.MM.InventorySlots.BOTTLE6; i++) {
            let item: Z64API.MM.InventoryItem = this.getItemInSlot(i);
            if (
                item >= Z64API.MM.InventoryItem.BOTTLE_EMPTY &&
                item <= Z64API.MM.InventoryItem.BOTTLE_CHATEAU_ROMANI //TODO: Check if Big or Small Poe in-game
            ) {
                return true;
            }
        }
        return false;
    }
    getBottleCount(): number {
        let bottles = 0;
        for (let i = Z64API.MM.InventorySlots.BOTTLE1; i <= Z64API.MM.InventorySlots.BOTTLE6; i++) {
            let item: Z64API.MM.InventoryItem = this.getItemInSlot(i);
            if (
                item >= Z64API.MM.InventoryItem.BOTTLE_EMPTY &&
                item <= Z64API.MM.InventoryItem.BOTTLE_CHATEAU_ROMANI
            ) {
                bottles++;
            }
        }
        return bottles;
    }
    getBottledItems(): Z64API.MM.InventoryItem[] {
        let bottles: Z64API.MM.InventoryItem[] = new Array();
        for (let i = Z64API.MM.InventorySlots.BOTTLE1; i <= Z64API.MM.InventorySlots.BOTTLE6; i++) {
            let item: Z64API.MM.InventoryItem = this.getItemInSlot(i);
            if (
                item >= Z64API.MM.InventoryItem.BOTTLE_EMPTY &&
                item <= Z64API.MM.InventoryItem.BOTTLE_CHATEAU_ROMANI
            ) {
                bottles.push(item);
            }
        }
        return bottles;
    }

    get FIELD_QUEST_ITEM_1(): Z64API.MM.InventoryItem {
        return this.getItemInSlot(Z64API.MM.InventorySlots.QUEST_ITEM_1);
    }
    set FIELD_QUEST_ITEM_1(item: Z64API.MM.InventoryItem) {
        if (item < Z64API.MM.InventoryItem.QSLOT1_MOONS_TEAR || item > Z64API.MM.InventoryItem.QSLOT1_TITLE_DEED_OCEAN) return;
        this.setItemInSlot(item, Z64API.MM.InventorySlots.QUEST_ITEM_1);
    }

    get FIELD_QUEST_ITEM_2(): Z64API.MM.InventoryItem {
        return this.getItemInSlot(Z64API.MM.InventorySlots.QUEST_ITEM_2);
    }
    set FIELD_QUEST_ITEM_2(item: Z64API.MM.InventoryItem) {
        if (item < Z64API.MM.InventoryItem.QSLOT2_ROOM_KEY || item > Z64API.MM.InventoryItem.QSLOT2_SPECIAL_DELIVERY_TO_MAMA) {
            return;
        }
        this.setItemInSlot(item, Z64API.MM.InventorySlots.QUEST_ITEM_2);
    }

    get FIELD_QUEST_ITEM_3(): Z64API.MM.InventoryItem {
        return this.getItemInSlot(Z64API.MM.InventorySlots.QUEST_ITEM_3);
    }
    set FIELD_QUEST_ITEM_3(item: Z64API.MM.InventoryItem) {
        if (item < Z64API.MM.InventoryItem.QSLOT3_LETTER_TO_KAFEI || item > Z64API.MM.InventoryItem.QSLOT3_PENDANT_OF_MEMORIES) {
            return;
        }
        this.setItemInSlot(item, Z64API.MM.InventorySlots.QUEST_ITEM_3);
    }

    isEvt1TradeFinished(): boolean {
        // This is going to require more complex flag checks
        return true;
    }
    isEvt2TradeFinished(): boolean {
        // This should be done with flags also
        return true;
    }
    isEvt3TradeFinished(): boolean {
        // This should be done with flags also
        return true;
    }

    getItemInSlot(slotId: number): Z64API.MM.InventoryItem {
        if (slotId < 0 || slotId > Z64API.MM.InventorySlots.MASK_FIERCE_DEITY) {
            return Z64API.MM.InventoryItem.NONE;
        }

        let itemId: number = this.emulator.rdramRead8(this.inventory_addr + slotId);
        return itemId as Z64API.MM.InventoryItem;
    }
    getSlotForItem(item: Z64API.MM.InventoryItem): number {
        for (let i = 0; i <= Z64API.MM.InventorySlots.MASK_FIERCE_DEITY; i++) {
            if (this.getItemInSlot(i) == item) {
                return i;
            }
        }
        return -1;
    }
    getSlotsForItem(item: Z64API.MM.InventoryItem): number[] {
        let slots: number[] = new Array();
        for (let i = 0; i <= Z64API.MM.InventorySlots.MASK_FIERCE_DEITY; i++) {
            if (this.getItemInSlot(i) == item) {
                slots.push(i);
            }
        }
        return slots;
    }

    hasItem(item: Z64API.MM.InventoryItem): boolean {
        return this.getSlotForItem(item) != -1;
    }

    getAmmoForItem(item: Z64API.MM.InventoryItem): number {
        if (!this.hasAmmo(item)) return 0;

        let ammo = 0;
        let slots: number[] = this.getSlotsForItem(item);
        for (let i = 0; i < slots.length; i++) {
            ammo += this.getAmmoForSlot(slots[i]);
        }
        return ammo;
    }
    hasAmmo(item: Z64API.MM.InventoryItem): boolean {
        switch (item) {
            case Z64API.MM.InventoryItem.DEKU_STICK:
            case Z64API.MM.InventoryItem.DEKU_NUT:
            case Z64API.MM.InventoryItem.HEROES_BOW:
            case Z64API.MM.InventoryItem.BOMB:
            case Z64API.MM.InventoryItem.BOMBCHU:
            case Z64API.MM.InventoryItem.POWDER_KEG:
            case Z64API.MM.InventoryItem.MAGIC_BEANS:
                return true;
        }
        return false;
    }
    getAmmoForSlot(slotId: number): number {
        if (slotId < 0 || slotId > 0xf) return 0;
        return this.emulator.rdramRead8(this.inventory_ammo_addr + slotId);
    }
    setAmmoInSlot(slot: number, amount: number): void {
        if (slot < 0 || slot >= 0xf) return;
        this.emulator.rdramWrite8(this.inventory_ammo_addr + slot, amount);
    }

    setItemInSlot(item: Z64API.MM.InventoryItem, slot: number): void {
        if (slot < 0 || slot > Z64API.MM.InventorySlots.MASK_FIERCE_DEITY) {
            return;
        }
        this.emulator.rdramWrite8(this.inventory_addr + slot, item.valueOf());
    }

    giveItem(item: Z64API.MM.InventoryItem, desiredSlot: Z64API.MM.InventorySlots) {
        if (
            this.getItemInSlot(desiredSlot) == Z64API.MM.InventoryItem.NONE ||
            this.getItemInSlot(desiredSlot) == item
        ) {
            this.setItemInSlot(item, desiredSlot);
        }
    }
    removeItem(item: Z64API.MM.InventoryItem): void {
        let slots = this.getSlotsForItem(item);
        for (let i = 0; i < slots.length; i++) {
            this.setItemInSlot(Z64API.MM.InventoryItem.NONE, i);
        }
    }
    getEmptySlots(): number[] {
        let slots: number[] = new Array();
        for (let i = 0; i <= Z64API.MM.InventorySlots.MASK_FIERCE_DEITY; i++) {
            if (this.getItemInSlot(i) == Z64API.MM.InventoryItem.NONE) {
                slots.push(i);
            }
        }
        return slots;
    }
}