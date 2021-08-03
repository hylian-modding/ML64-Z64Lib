import { IDungeonItemContainer } from './IDungeonItemContainer';
export interface IDungeonItemManager {
  //OoT
  DEKU_TREE: IDungeonItemContainer;
  DODONGOS_CAVERN: IDungeonItemContainer;
  JABJ_JABUS_BELLY: IDungeonItemContainer;
  FOREST_TEMPLE: IDungeonItemContainer;
  FIRE_TEMPLE: IDungeonItemContainer;
  WATER_TEMPLE: IDungeonItemContainer;
  SPIRIT_TEMPLE: IDungeonItemContainer;
  SHADOW_TEMPLE: IDungeonItemContainer;
  BOTTOM_OF_THE_WELL: IDungeonItemContainer;
  ICE_CAVERN: IDungeonItemContainer;
  GANONS_CASTLE: IDungeonItemContainer;
  //MM
  WOODFALL_TEMPLE: IDungeonItemContainer;
  SNOWHEAD_TEMPLE: IDungeonItemContainer;
  GREAT_BAY_TEMPLE: IDungeonItemContainer;
  STONE_TOWER_TEMPLE: IDungeonItemContainer;

  getRawBuffer(): Buffer;
  setRawBuffer(buf: Buffer): void;
}
