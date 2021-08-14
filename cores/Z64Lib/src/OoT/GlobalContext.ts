import IMemory from 'modloader64_api/IMemory';
import { JSONTemplate } from 'modloader64_api/JSONTemplate';
import { IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import * as Z64API from '../../API/imports';
import * as Z64CORE from '../importsMM';


export class GlobalContext extends JSONTemplate implements Z64API.OoT.IGlobalContext {
  private emulator: IMemory;
  private current_scene_addr = 0x0000a4;
  private switch_flags_addr = 0x001d28;
  private temp_switch_flags_addr = 0x001d2c;
  private chest_flags_addr = 0x001d38;
  private room_clear_flags_addr = 0x001d3c;
  private current_room_addr = 0x011cbc;
  private frame_count_addr = 0x011de4;
  private scene_frame_count_addr = 0x9c;
  private collectable_flag_addr = 0x01d44;
  private continue_state_addr = 0x98;
  viewStruct: Z64API.Z64.IViewStruct;
  jsonFields: string[] = ['scene', 'room', 'framecount'];

  constructor(ModLoader: IModLoaderAPI) {
      super();
      this.emulator = ModLoader.emulator;
      this.viewStruct = new Z64CORE.viewStruct(ModLoader);
  }

  get fogDistance(): number{
      return this.emulator.rdramReadPtr16(Z64CORE.Z64_GLOBAL_PTR, 0xD4);
  }

  set fogDistance(fog: number){
    this.emulator.rdramWritePtr16(Z64CORE.Z64_GLOBAL_PTR, 0xD4, fog);
  }

  get fogColor(){
      return 0;
  }

  set fogColor(color: number){
      
  }  

  get scene(): number {
      return this.emulator.rdramReadPtr16(
          Z64CORE.Z64_GLOBAL_PTR,
          this.current_scene_addr
      );
  }
  get room(): number {
      return this.emulator.rdramReadPtr8(
          Z64CORE.Z64_GLOBAL_PTR,
          this.current_room_addr
      );
  }
  get framecount(): number {
      return this.emulator.rdramReadPtr32(
          Z64CORE.Z64_GLOBAL_PTR,
          this.frame_count_addr
      );
  }
  get scene_framecount(): number {
      return this.emulator.rdramReadPtr32(
          Z64CORE.Z64_GLOBAL_PTR,
          this.scene_frame_count_addr
      );
  }
  get liveSceneData_chests(): Buffer {
      return this.emulator.rdramReadPtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.chest_flags_addr,
          0x4
      );
  }
  set liveSceneData_chests(buf: Buffer) {
      this.emulator.rdramWritePtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.chest_flags_addr,
          buf
      );
  }
  get liveSceneData_clear(): Buffer {
      return this.emulator.rdramReadPtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.room_clear_flags_addr,
          0x4
      );
  }
  set liveSceneData_clear(buf: Buffer) {
      this.emulator.rdramWritePtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.room_clear_flags_addr,
          buf
      );
  }
  get liveSceneData_switch(): Buffer {
      return this.emulator.rdramReadPtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.switch_flags_addr,
          0x4
      );
  }
  set liveSceneData_switch(buf: Buffer) {
      this.emulator.rdramWritePtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.switch_flags_addr,
          buf
      );
  }
  get liveSceneData_temp(): Buffer {
      return this.emulator.rdramReadPtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.temp_switch_flags_addr,
          0x4
      );
  }
  set liveSceneData_temp(buf: Buffer) {
      this.emulator.rdramWritePtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.temp_switch_flags_addr,
          buf
      );
  }
  get liveSceneData_collectable(): Buffer {
      return this.emulator.rdramReadPtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.collectable_flag_addr,
          0x8
      );
  }
  set liveSceneData_collectable(buf: Buffer) {
      this.emulator.rdramWritePtrBuffer(
          Z64CORE.Z64_GLOBAL_PTR,
          this.collectable_flag_addr,
          buf
      );
  }
  get continue_state(): boolean {
      return (
          this.emulator.rdramReadPtr32(
              Z64CORE.Z64_GLOBAL_PTR,
              this.continue_state_addr
          ) === 1
      );
  }

  get lastOrCurrentEntrance(): number{
      return this.emulator.rdramReadPtr16(Z64CORE.Z64_GLOBAL_PTR, 0x11E1A);
  }

  getSaveDataForCurrentScene(): Buffer {
      return this.emulator.rdramReadBuffer(
          Z64CORE.Z64_SAVE + 0x00d4 + this.scene * 0x1c,
          0x1c
      );
  }
  writeSaveDataForCurrentScene(buf: Buffer): void {
      if (buf.byteLength === 0x1c) {
          this.emulator.rdramWriteBuffer(
            Z64CORE.Z64_SAVE + 0x00d4 + this.scene * 0x1c,
              buf
          );
      }
  }
}
