import { IManifest, ManifestBuffer } from "../Z64ManifestBuffer";
import { Z64RomTools, trimBuffer } from "../Z64RomTools";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { Z64LibSupportedGames } from "../Z64LibSupportedGames";
import { PatchTypes } from 'modloader64_api/Patchers/PatchManager';
import fs from 'fs';
import path from 'path';

export class OOTChildManifest implements IManifest {

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer) {
        // Get original zobj from ROM.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let zobj: Buffer = tools.decompressObjectFileFromRom(rom, OBJ_CHILD);
        if (model.byteLength > zobj.byteLength) {
            // This shouldn't be possible because zzplayas would throw a tantrum before you got this far.
            return;
        }
        // Clear its contents.
        ModLoader.utils.clearBuffer(zobj);
        // Load the model.
        model.copy(zobj);
        // Trim excess space.
        zobj = trimBuffer(zobj);
        // Attempt to put the file back.
        if (!tools.recompressObjectFileIntoRom(rom, OBJ_CHILD, zobj)) {
            // If we get here it means the compressed object is bigger than the original.
            // This can happen because the compression ratio ends up different due to texture differences.

            // Move the file to extended ROM space.
            tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, OBJ_CHILD), zobj, 0x37800);
        }
    }

    repoint(ModLoader: IModLoaderAPI, rom: Buffer): void {

        // Pull out necessary files.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let code: ManifestBuffer = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, DMA_CODE));
        let SS_STICK: ManifestBuffer = new ManifestBuffer(tools.decompressParticleFileFromRom(rom, P_VROM_SS_STICK));
        let ITEM_SHIELD: ManifestBuffer = new ManifestBuffer(tools.decompressActorFileFromRom(rom, A_VROM_ITEM_SHIELD));
        let PLAYER_ACTOR: ManifestBuffer = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, DMA_OVL_PLAYER_ACTOR));
        let GRAVE_CHILD: ManifestBuffer = new ManifestBuffer(tools.decompressActorFileFromRom(rom, A_VROM_GRAVE_CHILD));
        fs.writeFileSync(global.ModLoader.startdir + "/grave.ovl", GRAVE_CHILD.buf);
        let GUARD_ACTOR: ManifestBuffer = new ManifestBuffer(tools.decompressActorFileFromRom(rom, A_VROM_GUARD));
        let RUNNING_MAN: ManifestBuffer = new ManifestBuffer(tools.decompressActorFileFromRom(rom, A_VROM_RUNNING_MAN));

        // Patch them in accordance with the manifest.
        code.GoTo(VROM_CODE + 0xE671C);
        code.SetAdvance(8);
        code.Write32(LUT_DL_RFIST);                  //    Right Fist (High Poly)
        code.Write32(LUT_DL_RFIST);                  //    Right Fist (Low Poly)
        code.Write32(LUT_DL_RFIST_SHIELD_DEKU);      //    Right Fist + Deku Shield (High Poly)
        code.Write32(LUT_DL_RFIST_SHIELD_DEKU);      //    Right Fist + Deku Shield (Low Poly)
        code.Write32(LUT_DL_RFIST);                  //    Right Fist + Hylian Shield (High Poly)
        code.Write32(LUT_DL_RFIST);                  //    Right Fist + Hylian Shield (Low Poly)
        code.Write32(LUT_DL_RFIST);                  //    Right Fist + Mirror Shield (High Poly)
        code.Write32(LUT_DL_RFIST);                  //    Right Fist + Mirror Shield (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);         //    Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);         //    Sheathed Sword (Low Poly)
        code.Write32(LUT_DL_SWORD_SHIELD_DEKU);      //    Deku Shield + Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHIELD_DEKU);      //    Deku Shield + Sheathed Sword (Low Poly)
        code.Write32(LUT_DL_SWORD_SHIELD_HYLIAN);    //    Hylian Shield + Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHIELD_HYLIAN);    //    Hylian Shield + Sheathed Sword (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);         //    Mirror Shield + Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);         //    Mirror Shield + Sheathed Sword (Low Poly)
        code.Write32(0x00000000);            //    ? (High Poly)
        code.Write32(0x00000000);                //    ? (Low Poly)
        code.Write32(LUT_DL_SHIELD_DEKU_BACK);       //    Deku Shield without Sheath (High Poly)
        code.Write32(LUT_DL_SHIELD_DEKU_BACK);       //    Deku Shield without Sheath (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);           //    No Shield + Sheath (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);           //    No Shield + Sheath (Low Poly)
        code.Write32(LUT_DL_SHEATH0_DEKU);           //    Deku Shield + Sheath (High Poly)
        code.Write32(LUT_DL_SHEATH0_DEKU);           //    Deku Shield + Sheath (Low Poly)
        code.Write32(LUT_DL_SHEATH0_HYLIAN);         //    Hylian Shield + Sheath (High Poly)
        code.Write32(LUT_DL_SHEATH0_HYLIAN);         //    Hylian Shield + Sheath (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);           //    Mirror Shield + Sheath (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);           //    Mirror Shield + Sheath (Low Poly)
        code.Write32(0x00000000);                //    ? (High Poly)
        code.Write32(0x00000000);                //    ? (Low Poly)
        code.Write32(LUT_DL_SHIELD_DEKU_BACK);           //    Deku Shield without Sheath (High Poly)
        code.Write32(LUT_DL_SHIELD_DEKU_BACK);           //    Deku Shield without Sheath (Low Poly)
        code.Write32(LUT_DL_LHAND_PEDESTALSWORD);    //    Left Fist + Biggoron Sword (High Poly)
        code.Write32(LUT_DL_LHAND_PEDESTALSWORD);    //    Left Fist + Biggoron Sword (Low Poly)
        code.Write32(LUT_DL_LHAND_PEDESTALSWORD);    //    Left Fist + Broken Giant's Knife (High Poly)
        code.Write32(LUT_DL_LHAND_PEDESTALSWORD);    //    Left Fist + Broken Giant's Knife (Low Poly)
        code.Write32(LUT_DL_LHAND);                  //    Left Hand (High Poly)
        code.Write32(LUT_DL_LHAND);                  //    Left Hand (Low Poly)
        code.Write32(LUT_DL_LFIST);                  //    Left Fist (High Poly)
        code.Write32(LUT_DL_LFIST);                  //    Left Fist (Low Poly)
        code.Write32(LUT_DL_LFIST_SWORD);            //    Left Fist + Kokiri Sword (High Poly)
        code.Write32(LUT_DL_LFIST_SWORD);            //    Left Fist + Kokiri Sword (Low Poly)
        code.Write32(LUT_DL_LFIST_SWORD);            //    Left Fist + Master Sword (High Poly)
        code.Write32(LUT_DL_LFIST_SWORD);            //    Left Fist + Master Sword (Low Poly)
        code.Write32(LUT_DL_RHAND);                  //    Right Hand (High Poly)
        code.Write32(LUT_DL_RHAND);                  //    Right Hand (Low Poly)
        code.Write32(LUT_DL_RFIST);                  //    Right Fist (High Poly)
        code.Write32(LUT_DL_RFIST);                  //    Right Fist (Low Poly)
        code.Write32(LUT_DL_RFIST_SLINGSHOT);        //    Right Fist + Fairy Slingshot (and/or Fairy Bow?) (High Poly)
        code.Write32(LUT_DL_RFIST_SLINGSHOT);        //    Right Fist + Fairy Slingshot (and/or Fairy Bow?) (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);         //    Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);         //    Sheathed Sword (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);           //    Sword Sheath (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);           //    Sword Sheath (Low Poly)
        code.Write32(LUT_DL_WAIST);                  //    Waist (High Poly)
        code.Write32(LUT_DL_WAIST);                  //    Waist (Low Poly)
        code.Write32(LUT_DL_RFIST_SLINGSHOT);            //    Right Fist + Fairy Slingshot (and/or Fairy Bow?) (High Poly)
        code.Write32(LUT_DL_RFIST_SLINGSHOT);        //    Right Fist + Fairy Slingshot (and/or Fairy Bow?) (Low Poly)
        code.Write32(LUT_DL_RHAND_OCARINA_FAIRY);    //    Right Hand + Fairy Ocarina (High Poly)
        code.Write32(LUT_DL_RHAND_OCARINA_FAIRY);    //    Right Hand + Fairy Ocarina (Low Poly)
        code.Write32(LUT_DL_RHAND_OCARINA_TIME);     //    Right Hand + Ocarina of Time (High Poly)
        code.Write32(LUT_DL_RHAND_OCARINA_TIME);     //    Right Hand + Ocarina of Time (Low Poly)
        code.Write32(LUT_DL_RFIST);                  //    Right Fist + Hookshot / Longshot (High Poly)
        code.Write32(LUT_DL_RFIST);                  //    Right Fist + Hookshot / Longshot (Low Poly)
        code.Write32(LUT_DL_LFIST);                  //    Left Fist + Megaton Hammer (High Poly)
        code.Write32(LUT_DL_LFIST);                  //    Left Fist + Megaton Hammer (Low Poly)
        code.Write32(LUT_DL_LFIST_BOOMERANG);        //    Left Fist + Boomerang (High Poly)
        code.Write32(LUT_DL_LFIST_BOOMERANG);        //    Left Fist + Boomerang (Low Poly)
        code.Write32(LUT_DL_LHAND_BOTTLE);           //    Outstretched Left Hand for Holding Bottles (High Poly)
        code.Write32(LUT_DL_LHAND_BOTTLE);           //    Outstretched Left Hand for Holding Bottles (Low Poly)
        code.Write32(0x00000000);                //    FPS Left Forearm
        code.Write32(0x00000000);                //    FPS Left Hand
        code.Write32(LUT_DL_RSHOULDER);              //    Right Shoulder (High Poly)
        code.Write32(0x00000000);                //    FPS Right Forearm
        code.Write32(LUT_DL_FPS_RARM_SLINGSHOT);     //    FPS Right Hand + Fairy Bow

        code.GoTo(VROM_CODE + 0xE6B2C);
        code.Write32(LUT_DL_BOTTLE);                   //    Empty Bottle

        code.GoTo(VROM_CODE + 0xE6B74);
        code.SetAdvance(4);
        code.Write32(LUT_DL_SLINGSHOT_STRING);         //    Fairy Slingshot String
        code.Write32(0x44178000);                  //    Fairy Slingshot String Anchor (X Position Float)
        code.Write32(0x436C0000);                  //    Fairy Slingshot String Anchor (Y Position Float)

        // Hardcoded Assembly Pointers
        code.GoTo(VROM_CODE + 0x6922E);              //    Goron Bracelet
        code.Hi32(LUT_DL_GORON_BRACELET);
        code.GoTo(VROM_CODE + 0x69232);
        code.Lo32(LUT_DL_GORON_BRACELET);
        code.GoTo(VROM_CODE + 0x6A80E);                //    Deku Stick (Whole)
        code.Hi32(LUT_DL_DEKU_STICK);
        code.GoTo(VROM_CODE + 0x6A812);
        code.Lo32(LUT_DL_DEKU_STICK);

        // ovl_Effect_Ss_Stick
        SS_STICK.GoTo(VROM_SS_STICK + 0x334);            //    Deku Stick
        SS_STICK.Write32(LUT_DL_DEKU_STICK);

        SS_STICK.GoTo(VROM_SS_STICK + 0x330);            //    Deku Stick Object File
        SS_STICK.Write16(OBJ_CHILD);

        // Item_Shield
        ITEM_SHIELD.GoTo(VROM_ITEM_SHIELD + 0x7EE);           //    Burning Deku Shield
        ITEM_SHIELD.Hi32(LUT_DL_SHIELD_DEKU_ODD);
        ITEM_SHIELD.GoTo(VROM_ITEM_SHIELD + 0x7F2);
        ITEM_SHIELD.Lo32(LUT_DL_SHIELD_DEKU_ODD);

        // ovl_player_actor
        PLAYER_ACTOR.GoTo(VROM_PLAYER + 0x2253C);
        PLAYER_ACTOR.SetAdvance(4);
        PLAYER_ACTOR.Write32(LUT_DL_MASK_KEATON);                //    Keaton Mask
        PLAYER_ACTOR.Write32(LUT_DL_MASK_SKULL);             //    Skull Mask
        PLAYER_ACTOR.Write32(LUT_DL_MASK_SPOOKY);            //    Spooky Mask
        PLAYER_ACTOR.Write32(LUT_DL_MASK_BUNNY);             //    Bunny Hood
        PLAYER_ACTOR.Write32(LUT_DL_MASK_GORON);             //    Goron Mask
        PLAYER_ACTOR.Write32(LUT_DL_MASK_ZORA);              //    Zora Mask
        PLAYER_ACTOR.Write32(LUT_DL_MASK_GERUDO);            //    Gerudo Mask
        PLAYER_ACTOR.Write32(LUT_DL_MASK_TRUTH);             //    Mask of Truth

        //External_character_Masks

        // En_Cs (Graveyard Kid Spooky Mask)
        GRAVE_CHILD.GoTo(VROM_GRAVE_CHILD + 0xE62);
        GRAVE_CHILD.Hi32(LUT_DL_MASK_SPOOKY);
        GRAVE_CHILD.GoTo(VROM_GRAVE_CHILD + 0xE66);
        GRAVE_CHILD.Lo32(LUT_DL_MASK_SPOOKY);

        // En_Heishi2 (Kakariko Guard Keaton Mask)
        GUARD_ACTOR.GoTo(VROM_GUARD + 0x1EA2);
        GUARD_ACTOR.Hi32(LUT_DL_MASK_KEATON);
        GUARD_ACTOR.GoTo(VROM_GUARD + 0x1EA6);
        GUARD_ACTOR.Lo32(LUT_DL_MASK_KEATON);

        // En_Mm (Running Man Bunny Hood)
        RUNNING_MAN.GoTo(VROM_RUNNING_MAN + 0x1142);
        RUNNING_MAN.Hi32(LUT_DL_MASK_BUNNY);
        RUNNING_MAN.GoTo(VROM_RUNNING_MAN + 0x1146);
        RUNNING_MAN.Lo32(LUT_DL_MASK_BUNNY);

        // Put them back.
        tools.recompressDMAFileIntoRom(rom, DMA_CODE, code.buf);
        tools.recompressParticleFileIntoRom(rom, P_VROM_SS_STICK, SS_STICK.buf);
        tools.recompressActorFileIntoRom(rom, A_VROM_ITEM_SHIELD, ITEM_SHIELD.buf);
        tools.recompressDMAFileIntoRom(rom, DMA_OVL_PLAYER_ACTOR, PLAYER_ACTOR.buf);
        tools.recompressActorFileIntoRom(rom, A_VROM_GRAVE_CHILD, GRAVE_CHILD.buf);
        tools.recompressActorFileIntoRom(rom, A_VROM_GUARD, GUARD_ACTOR.buf);
        tools.recompressActorFileIntoRom(rom, A_VROM_RUNNING_MAN, RUNNING_MAN.buf);

        rom = PatchTypes.get(".bps")!.patch(rom, fs.readFileSync(path.join(__dirname, "../", "no_crc.txt")));
    }
}

const VROM_CODE: number = 0;
const VROM_SS_STICK: number = 0;
const P_VROM_SS_STICK: number = 16;
const OBJ_CHILD: number = 0x0015;
const A_VROM_ITEM_SHIELD: number = 238;
const VROM_ITEM_SHIELD: number = 0;
const VROM_PLAYER: number = 0;
const VROM_GRAVE_CHILD: number = 0;
const A_VROM_GRAVE_CHILD: number = 364;
const VROM_GUARD: number = 0;
const A_VROM_GUARD: number = 179;
const VROM_RUNNING_MAN: number = 0;
const A_VROM_RUNNING_MAN: number = 354;
const DMA_OVL_PLAYER_ACTOR: number = 34;
const DMA_CODE: number = 27;

const LUT_DL_SHIELD_DEKU: number = 0x50D0;
const LUT_DL_WAIST: number = 0x50D8;
const LUT_DL_RTHIGH: number = 0x50E0;
const LUT_DL_RSHIN: number = 0x50E8;
const LUT_DL_RFOOT: number = 0x50F0;
const LUT_DL_LTHIGH: number = 0x50F8;
const LUT_DL_LSHIN: number = 0x5100;
const LUT_DL_LFOOT: number = 0x5108;
const LUT_DL_HEAD: number = 0x5110;
const LUT_DL_HAT: number = 0x5118;
const LUT_DL_COLLAR: number = 0x5120;
const LUT_DL_LSHOULDER: number = 0x5128;
const LUT_DL_LFOREARM: number = 0x5130;
const LUT_DL_RSHOULDER: number = 0x5138;
const LUT_DL_RFOREARM: number = 0x5140;
const LUT_DL_TORSO: number = 0x5148;
const LUT_DL_LHAND: number = 0x5150;
const LUT_DL_LFIST: number = 0x5158;
const LUT_DL_LHAND_BOTTLE: number = 0x5160;
const LUT_DL_RHAND: number = 0x5168;
const LUT_DL_RFIST: number = 0x5170;
const LUT_DL_SWORD_SHEATH: number = 0x5178;
const LUT_DL_SWORD_HILT: number = 0x5180;
const LUT_DL_SWORD_BLADE: number = 0x5188;
const LUT_DL_SLINGSHOT: number = 0x5190;
const LUT_DL_OCARINA_FAIRY: number = 0x5198;
const LUT_DL_OCARINA_TIME: number = 0x51A0;
const LUT_DL_DEKU_STICK: number = 0x51A8;
const LUT_DL_BOOMERANG: number = 0x51B0;
const LUT_DL_SHIELD_HYLIAN_BACK: number = 0x51B8;
const LUT_DL_BOTTLE: number = 0x51C0;
const LUT_DL_MASTER_SWORD: number = 0x51C8;
const LUT_DL_GORON_BRACELET: number = 0x51D0;
const LUT_DL_FPS_RIGHT_ARM: number = 0x51D8;
const LUT_DL_SLINGSHOT_STRING: number = 0x51E0;
const LUT_DL_MASK_BUNNY: number = 0x51E8;
const LUT_DL_MASK_GERUDO: number = 0x51F0;
const LUT_DL_MASK_GORON: number = 0x51F8;
const LUT_DL_MASK_KEATON: number = 0x5200;
const LUT_DL_MASK_SPOOKY: number = 0x5208;
const LUT_DL_MASK_TRUTH: number = 0x5210;
const LUT_DL_MASK_ZORA: number = 0x5218;
const LUT_DL_MASK_SKULL: number = 0x5220;
const DL_SWORD_SHEATHED: number = 0x5228;
const LUT_DL_SWORD_SHEATHED: number = 0x5248;
const DL_SHIELD_DEKU_ODD: number = 0x5250;
const LUT_DL_SHIELD_DEKU_ODD: number = 0x5260;
const DL_SHIELD_DEKU_BACK: number = 0x5268;
const LUT_DL_SHIELD_DEKU_BACK: number = 0x5278;
const DL_SWORD_SHIELD_HYLIAN: number = 0x5280;
const LUT_DL_SWORD_SHIELD_HYLIAN: number = 0x5290;
const DL_SWORD_SHIELD_DEKU: number = 0x5298;
const LUT_DL_SWORD_SHIELD_DEKU: number = 0x52A8;
const DL_SHEATH0_HYLIAN: number = 0x52B0;
const LUT_DL_SHEATH0_HYLIAN: number = 0x52C0;
const DL_SHEATH0_DEKU: number = 0x52C8;
const LUT_DL_SHEATH0_DEKU: number = 0x52D8;
const DL_LFIST_SWORD: number = 0x52E0;
const LUT_DL_LFIST_SWORD: number = 0x52F8;
const DL_LHAND_PEDESTALSWORD: number = 0x5300;
const LUT_DL_LHAND_PEDESTALSWORD: number = 0x5310;
const DL_LFIST_BOOMERANG: number = 0x5318;
const LUT_DL_LFIST_BOOMERANG: number = 0x5328;
const DL_RFIST_SHIELD_DEKU: number = 0x5330;
const LUT_DL_RFIST_SHIELD_DEKU: number = 0x5340;
const DL_RFIST_SLINGSHOT: number = 0x5348;
const LUT_DL_RFIST_SLINGSHOT: number = 0x5358;
const DL_RHAND_OCARINA_FAIRY: number = 0x5360;
const LUT_DL_RHAND_OCARINA_FAIRY: number = 0x5370;
const DL_RHAND_OCARINA_TIME: number = 0x5378;
const LUT_DL_RHAND_OCARINA_TIME: number = 0x5388;
const DL_FPS_RARM_SLINGSHOT: number = 0x5390;
const LUT_DL_FPS_RARM_SLINGSHOT: number = 0x53A0;