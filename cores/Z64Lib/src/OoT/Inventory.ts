import IMemory from 'modloader64_api/IMemory';
import { FlagManager } from 'modloader64_api/FlagManager';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import { ILogger } from 'modloader64_api/IModLoaderAPI';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsOoT';

export class Inventory extends JSONTemplate implements Z64API.OoT.IInventory {
  private emulator: IMemory;
  private instance: number = Z64CORE.Z64_SAVE;
  private inventory_addr: number = this.instance + 0x0074;
  private inventory_ammo_addr: number = this.instance + 0x008c;
  private inventory_upgrades_addr: number = this.instance + 0x00a0;
  private log: ILogger;
  jsonFields: string[] = [
      'dekuSticks',
      'dekuNuts',
      'bombs',
      'bombchus',
      'magicBeans',
      'fairySlingshot',
      'fairyBow',
      'fireArrows',
      'iceArrows',
      'lightArrows',
      'dinsFire',
      'faroresWind',
      'nayrusLove',
      'ocarina',
      'hookshot',
      'boomerang',
      'lensOfTruth',
      'megatonHammer',
      'bottle_1',
      'bottle_2',
      'bottle_3',
      'bottle_4',
      'childTradeItem',
      'adultTradeItem',
      'Z64API.Z64.Wallet',
      'quiver',
      'bulletBag',
      'bombBag',
      'dekuNutsCapacity',
      'dekuSticksCapacity',
      'swimming',
      'strength',
  ];

  constructor(emu: IMemory, log: ILogger) {
      super();
      this.emulator = emu;
      this.log = log;
  }

  set strength(bb: Z64API.OoT.Strength) {
      let buf: Buffer = this.emulator.rdramReadBits8(
          this.inventory_upgrades_addr + 0x3
      );
      switch (bb) {
      case Z64API.OoT.Strength.NONE:
          buf[0x0] = 0x00;
          buf[0x1] = 0x00;
          break;
      case Z64API.OoT.Strength.GORON_BRACELET:
          buf[0x0] = 0x00;
          buf[0x1] = 0x01;
          break;
      case Z64API.OoT.Strength.SILVER_GAUNTLETS:
          buf[0x0] = 0x01;
          buf[0x1] = 0x00;
          break;
      case Z64API.OoT.Strength.GOLDEN_GAUNTLETS:
          buf[0x0] = 0x01;
          buf[0x1] = 0x01;
          break;
      }
      this.emulator.rdramWriteBits8(this.inventory_upgrades_addr + 0x3, buf);
  }

  get strength(): Z64API.OoT.Strength {
      let buf: Buffer = this.emulator.rdramReadBits8(
          this.inventory_upgrades_addr + 0x3
      );
      let str = buf.slice(0, 2).toString('hex');
      switch (str) {
      case '0000':
          return Z64API.OoT.Strength.NONE;
      case '0001':
          return Z64API.OoT.Strength.GORON_BRACELET;
      case '0100':
          return Z64API.OoT.Strength.SILVER_GAUNTLETS;
      case '0101':
          return Z64API.OoT.Strength.GOLDEN_GAUNTLETS;
      }
      return Z64API.OoT.Strength.NONE;
  }

  set swimming(bb: Z64API.OoT.ZoraScale) {
      let buf: Buffer = this.emulator.rdramReadBits8(
          this.inventory_upgrades_addr + 0x2
      );
      switch (bb) {
      case Z64API.OoT.ZoraScale.NONE:
          buf[0x5] = 0x00;
          buf[0x6] = 0x00;
          break;
      case Z64API.OoT.ZoraScale.SILVER:
          buf[0x5] = 0x00;
          buf[0x6] = 0x01;
          break;
      case Z64API.OoT.ZoraScale.GOLDEN:
          buf[0x5] = 0x01;
          buf[0x6] = 0x00;
          break;
      }
      this.emulator.rdramWriteBits8(this.inventory_upgrades_addr + 0x2, buf);
  }

  get swimming(): Z64API.OoT.ZoraScale {
      let buf: Buffer = this.emulator.rdramReadBits8(
          this.inventory_upgrades_addr + 0x2
      );
      let str = buf.slice(5, 7).toString('hex');
      switch (str) {
      case '0000':
          return Z64API.OoT.ZoraScale.NONE;
      case '0001':
          return Z64API.OoT.ZoraScale.SILVER;
      case '0100':
          return Z64API.OoT.ZoraScale.GOLDEN;
      }
      return Z64API.OoT.ZoraScale.NONE;
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

  get bulletBag(): Z64API.Z64.AmmoUpgrade {
      let buf: Buffer = this.emulator.rdramReadBits8(
          this.inventory_upgrades_addr + 0x2
      );
      let str = buf.slice(0, 2).toString('hex');
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

  set bulletBag(bb: Z64API.Z64.AmmoUpgrade) {
      let buf: Buffer = this.emulator.rdramReadBits8(
          this.inventory_upgrades_addr + 0x2
      );
      switch (bb) {
      case Z64API.Z64.AmmoUpgrade.NONE:
          buf[0x0] = 0x00;
          buf[0x1] = 0x00;
          break;
      case Z64API.Z64.AmmoUpgrade.BASE:
          buf[0x0] = 0x00;
          buf[0x1] = 0x01;
          break;
      case Z64API.Z64.AmmoUpgrade.UPGRADED:
          buf[0x0] = 0x01;
          buf[0x1] = 0x00;
          break;
      case Z64API.Z64.AmmoUpgrade.MAX:
          buf[0x0] = 0x01;
          buf[0x1] = 0x01;
          break;
      }
      this.emulator.rdramWriteBits8(this.inventory_upgrades_addr + 0x2, buf);
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

  get Wallet(): Z64API.Z64.Wallet {
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
      case '0101':
          return Z64API.Z64.Wallet.TYCOON;
      }
      return Z64API.Z64.Wallet.CHILD;
  }

  set Wallet(w: Z64API.Z64.Wallet) {
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
      case Z64API.Z64.Wallet.TYCOON:
          buf[0x2] = 0x01;
          buf[0x3] = 0x01;
      }
      this.emulator.rdramWriteBits8(this.inventory_upgrades_addr + 0x2, buf);
  }

  getMaxRupeeCount(): number{
      let addr: number = 0x800F8CEC;
      let capacities: Array<number> = [];
      for (let i = 0; i < 8; i+=2){
          capacities.push(this.emulator.rdramRead16(addr + i));
      }
      return capacities[this.Wallet];
  }

  get dekuSticks(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.DEKU_STICKS);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set dekuSticks(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.DEKU_STICK : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.DEKU_STICKS);
  }

  get dekuSticksCount(): number {
      return this.getAmmoForSlot(Z64API.OoT.InventorySlots.DEKU_STICKS);
  }
  set dekuSticksCount(count: number) {
      this.setAmmoInSlot(Z64API.OoT.InventorySlots.DEKU_STICKS, count);
  }

  get dekuNuts(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.DEKU_NUTS);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set dekuNuts(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.DEKU_NUT : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.DEKU_NUTS);
  }

  get dekuNutsCount(): number {
      return this.getAmmoForSlot(Z64API.OoT.InventorySlots.DEKU_NUTS);
  }
  set dekuNutsCount(count: number) {
      this.setAmmoInSlot(Z64API.OoT.InventorySlots.DEKU_NUTS, count);
  }

  get bombs(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.BOMBS);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set bombs(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.BOMB : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.BOMBS);
  }

  get bombsCount(): number {
      return this.getAmmoForSlot(Z64API.OoT.InventorySlots.BOMBS);
  }
  set bombsCount(count: number) {
      this.setAmmoInSlot(Z64API.OoT.InventorySlots.BOMBS, count);
  }

  get bombchus(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.BOMBCHUS);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set bombchus(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.BOMBCHU : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.BOMBCHUS);
  }

  get bombchuCount(): number {
      return this.getAmmoForSlot(Z64API.OoT.InventorySlots.BOMBCHUS);
  }
  set bombchuCount(count: number) {
      this.setAmmoInSlot(Z64API.OoT.InventorySlots.BOMBCHUS, count);
  }

  get magicBeans(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.MAGIC_BEANS);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set magicBeans(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.MAGIC_BEAN : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.MAGIC_BEANS);
  }

  get magicBeansCount(): number {
      return this.getAmmoForSlot(Z64API.OoT.InventorySlots.MAGIC_BEANS);
  }
  set magicBeansCount(count: number) {
      this.setAmmoInSlot(Z64API.OoT.InventorySlots.MAGIC_BEANS, count);
  }

  get fairySlingshot(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.FAIRY_SLINGSHOT);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set fairySlingshot(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.FAIRY_SLINGSHOT : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.FAIRY_SLINGSHOT);
  }

  get dekuSeeds(): number {
      return this.getAmmoForSlot(Z64API.OoT.InventorySlots.FAIRY_SLINGSHOT);
  }
  set dekuSeeds(count: number) {
      this.setAmmoInSlot(Z64API.OoT.InventorySlots.FAIRY_SLINGSHOT, count);
  }

  get fairyBow(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.FAIRY_BOW);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set fairyBow(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.FAIRY_BOW : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.FAIRY_BOW);
  }

  get arrows(): number {
      return this.getAmmoForSlot(Z64API.OoT.InventorySlots.FAIRY_BOW);
  }
  set arrows(count: number) {
      this.setAmmoInSlot(Z64API.OoT.InventorySlots.FAIRY_BOW, count);
  }

  get fireArrows(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.FIRE_ARROWS);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set fireArrows(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.FIRE_ARROW : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.FIRE_ARROWS);
  }

  get iceArrows(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.ICE_ARROWS);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set iceArrows(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.ICE_ARROW : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.ICE_ARROWS);
  }

  get lightArrows(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.LIGHT_ARROWS);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set lightArrows(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.LIGHT_ARROW : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.LIGHT_ARROWS);
  }

  get dinsFire(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.DINS_FIRE);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set dinsFire(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.DINS_FIRE : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.DINS_FIRE);
  }

  get faroresWind(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.FARORES_WIND);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set faroresWind(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.FARORES_WIND : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.FARORES_WIND);
  }

  get nayrusLove(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.NAYRUS_LOVE);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set nayrusLove(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.NAYRUS_LOVE : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.NAYRUS_LOVE);
  }
  get ocarina(): Z64API.Z64.Ocarina {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.OCARINA);
      switch (val) {
      case Z64API.OoT.InventoryItem.FAIRY_OCARINA:
          return Z64API.Z64.Ocarina.FAIRY_OCARINA;
      case Z64API.OoT.InventoryItem.OCARINA_OF_TIME:
          return Z64API.Z64.Ocarina.OCARINA_OF_TIME;
      default:
          return Z64API.Z64.Ocarina.NONE;
      }
  }
  set ocarina(item: Z64API.Z64.Ocarina) {
      if (item === this.ocarina) return;

      switch (item) {
      case Z64API.Z64.Ocarina.NONE:
          this.setItemInSlot(Z64API.OoT.InventoryItem.NONE, Z64API.OoT.InventorySlots.OCARINA);
          break;
      case Z64API.Z64.Ocarina.FAIRY_OCARINA:
          this.setItemInSlot(Z64API.OoT.InventoryItem.FAIRY_OCARINA, Z64API.OoT.InventorySlots.OCARINA);
          break;
      case Z64API.Z64.Ocarina.OCARINA_OF_TIME:
          this.setItemInSlot(
              Z64API.OoT.InventoryItem.OCARINA_OF_TIME,
              Z64API.OoT.InventorySlots.OCARINA
          );
          break;
      }
  }

  get hookshot(): Z64API.OoT.Hookshot {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.HOOKSHOT);
      switch (val) {
      case Z64API.OoT.InventoryItem.HOOKSHOT:
          return Z64API.OoT.Hookshot.HOOKSHOT;
      case Z64API.OoT.InventoryItem.LONGSHOT:
          return Z64API.OoT.Hookshot.LONGSHOT;
      default:
          return Z64API.OoT.Hookshot.NONE;
      }
  }
  set hookshot(item: Z64API.OoT.Hookshot) {
      if (item === this.hookshot) return;

      switch (item) {
      case Z64API.OoT.Hookshot.NONE:
          this.setItemInSlot(Z64API.OoT.InventoryItem.NONE, Z64API.OoT.InventorySlots.HOOKSHOT);
          break;
      case Z64API.OoT.Hookshot.HOOKSHOT:
          this.setItemInSlot(Z64API.OoT.InventoryItem.HOOKSHOT, Z64API.OoT.InventorySlots.HOOKSHOT);
          break;
      case Z64API.OoT.Hookshot.LONGSHOT:
          this.setItemInSlot(Z64API.OoT.InventoryItem.LONGSHOT, Z64API.OoT.InventorySlots.HOOKSHOT);
          break;
      }
  }

  get boomerang(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.BOOMERANG);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set boomerang(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.BOOMERANG : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.BOOMERANG);
  }

  get lensOfTruth(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.LENS_OF_TRUTH);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set lensOfTruth(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.LENS_OF_TRUTH : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.LENS_OF_TRUTH);
  }

  get megatonHammer(): boolean {
      let val = this.getItemInSlot(Z64API.OoT.InventorySlots.MEGATON_HAMMER);
      return !(val === Z64API.OoT.InventoryItem.NONE);
  }
  set megatonHammer(bool: boolean) {
      let value = bool ? Z64API.OoT.InventoryItem.MEGATON_HAMMER : Z64API.OoT.InventoryItem.NONE;
      this.setItemInSlot(value, Z64API.OoT.InventorySlots.MEGATON_HAMMER);
  }

  get bottle_1(): Z64API.OoT.InventoryItem {
      return this.getItemInSlot(Z64API.OoT.InventorySlots.BOTTLE1);
  }
  set bottle_1(content: Z64API.OoT.InventoryItem) {
      this.setItemInSlot(content, Z64API.OoT.InventorySlots.BOTTLE1);
  }

  get bottle_2(): Z64API.OoT.InventoryItem {
      return this.getItemInSlot(Z64API.OoT.InventorySlots.BOTTLE2);
  }
  set bottle_2(content: Z64API.OoT.InventoryItem) {
      this.setItemInSlot(content, Z64API.OoT.InventorySlots.BOTTLE2);
  }

  get bottle_3(): Z64API.OoT.InventoryItem {
      return this.getItemInSlot(Z64API.OoT.InventorySlots.BOTTLE3);
  }
  set bottle_3(content: Z64API.OoT.InventoryItem) {
      this.setItemInSlot(content, Z64API.OoT.InventorySlots.BOTTLE3);
  }

  get bottle_4(): Z64API.OoT.InventoryItem {
      return this.getItemInSlot(Z64API.OoT.InventorySlots.BOTTLE4);
  }
  set bottle_4(content: Z64API.OoT.InventoryItem) {
      this.setItemInSlot(content, Z64API.OoT.InventorySlots.BOTTLE4);
  }

  hasBottle(): boolean {
      for (let i = Z64API.OoT.InventorySlots.BOTTLE1; i <= Z64API.OoT.InventorySlots.BOTTLE4; i++) {
          let item: Z64API.OoT.InventoryItem = this.getItemInSlot(i);
          if (
              item >= Z64API.OoT.InventoryItem.EMPTY_BOTTLE &&
        item <= Z64API.OoT.InventoryItem.BOTTLED_POE
          ) {
              return true;
          }
      }
      return false;
  }
  getBottleCount(): number {
      let bottles = 0;
      for (let i = Z64API.OoT.InventorySlots.BOTTLE1; i <= Z64API.OoT.InventorySlots.BOTTLE4; i++) {
          let item: Z64API.OoT.InventoryItem = this.getItemInSlot(i);
          if (
              item >= Z64API.OoT.InventoryItem.EMPTY_BOTTLE &&
        item <= Z64API.OoT.InventoryItem.BOTTLED_POE
          ) {
              bottles++;
          }
      }
      return bottles;
  }
  getBottledItems(): Z64API.OoT.InventoryItem[] {
      let bottles: Z64API.OoT.InventoryItem[] = new Array();
      for (let i = Z64API.OoT.InventorySlots.BOTTLE1; i <= Z64API.OoT.InventorySlots.BOTTLE4; i++) {
          let item: Z64API.OoT.InventoryItem = this.getItemInSlot(i);
          if (
              item >= Z64API.OoT.InventoryItem.EMPTY_BOTTLE &&
        item <= Z64API.OoT.InventoryItem.BOTTLED_POE
          ) {
              bottles.push(item);
          }
      }
      return bottles;
  }

  get childTradeItem(): Z64API.OoT.InventoryItem {
      return this.getItemInSlot(Z64API.OoT.InventorySlots.CHILD_TRADE_ITEM);
  }
  set childTradeItem(item: Z64API.OoT.InventoryItem) {
      this.setItemInSlot(item, Z64API.OoT.InventorySlots.CHILD_TRADE_ITEM);
  }

  get adultTradeItem(): Z64API.OoT.InventoryItem {
      return this.getItemInSlot(Z64API.OoT.InventorySlots.ADULT_TRADE_ITEM);
  }
  set adultTradeItem(item: Z64API.OoT.InventoryItem) {
      this.setItemInSlot(item, Z64API.OoT.InventorySlots.ADULT_TRADE_ITEM);
  }

  isChildTradeFinished(): boolean {
      // This is going to require more complex flag checks
      return true;
  }
  isAdultTradeFinished(): boolean {
      // This should be done with flags also
      return true;
  }

  getItemInSlot(slotId: number): Z64API.OoT.InventoryItem {
      if (slotId < 0 || slotId > Z64API.OoT.InventorySlots.CHILD_TRADE_ITEM) {
          return Z64API.OoT.InventoryItem.NONE;
      }

      let itemId: number = this.emulator.rdramRead8(this.inventory_addr + slotId);
      return itemId as Z64API.OoT.InventoryItem;
  }
  getSlotForItem(item: Z64API.OoT.InventoryItem): number {
      for (let i = 0; i <= Z64API.OoT.InventorySlots.CHILD_TRADE_ITEM; i++) {
          if (this.getItemInSlot(i) == item) {
              return i;
          }
      }
      return -1;
  }
  getSlotsForItem(item: Z64API.OoT.InventoryItem): number[] {
      let slots: number[] = new Array();
      for (let i = 0; i <= Z64API.OoT.InventorySlots.CHILD_TRADE_ITEM; i++) {
          if (this.getItemInSlot(i) == item) {
              slots.push(i);
          }
      }
      return slots;
  }

  hasItem(item: Z64API.OoT.InventoryItem): boolean {
      return this.getSlotForItem(item) != -1;
  }

  getAmmoForItem(item: Z64API.OoT.InventoryItem): number {
      if (!this.hasAmmo(item)) return 0;

      let ammo = 0;
      let slots: number[] = this.getSlotsForItem(item);
      for (let i = 0; i < slots.length; i++) {
          ammo += this.getAmmoForSlot(slots[i]);
      }
      return ammo;
  }
  hasAmmo(item: Z64API.OoT.InventoryItem): boolean {
      switch (item) {
      case Z64API.OoT.InventoryItem.DEKU_STICK:
      case Z64API.OoT.InventoryItem.DEKU_NUT:
      case Z64API.OoT.InventoryItem.FAIRY_SLINGSHOT:
      case Z64API.OoT.InventoryItem.FAIRY_BOW:
      case Z64API.OoT.InventoryItem.BOMB:
      case Z64API.OoT.InventoryItem.BOMBCHU:
      case Z64API.OoT.InventoryItem.MAGIC_BEAN:
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

  setItemInSlot(item: Z64API.OoT.InventoryItem, slot: number): void {
      if (slot < 0 || slot > Z64API.OoT.InventorySlots.CHILD_TRADE_ITEM) {
          return;
      }
      this.emulator.rdramWrite8(this.inventory_addr + slot, item.valueOf());
  }
  giveItem(item: Z64API.OoT.InventoryItem, desiredSlot: Z64API.OoT.InventorySlots) {
      if (
          this.getItemInSlot(desiredSlot) == Z64API.OoT.InventoryItem.NONE ||
      this.getItemInSlot(desiredSlot) == item
      ) {
          this.setItemInSlot(item, desiredSlot);
      }
  }
  removeItem(item: Z64API.OoT.InventoryItem): void {
      let slots = this.getSlotsForItem(item);
      for (let i = 0; i < slots.length; i++) {
          this.setItemInSlot(Z64API.OoT.InventoryItem.NONE, i);
      }
  }
  getEmptySlots(): number[] {
      let slots: number[] = new Array();
      for (let i = 0; i <= Z64API.OoT.InventorySlots.CHILD_TRADE_ITEM; i++) {
          if (this.getItemInSlot(i) == Z64API.OoT.InventoryItem.NONE) {
              slots.push(i);
          }
      }
      return slots;
  }
}
