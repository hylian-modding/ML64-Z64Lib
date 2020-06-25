import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { Z64RomTools, trimBuffer } from "../Z64RomTools";
import { Z64LibSupportedGames } from "../Z64LibSupportedGames";
import { IManifest, ManifestBuffer } from "../Z64ManifestBuffer";

export class OOTAdultManifest implements IManifest {

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): void {

        // Get original zobj from ROM.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let zobj: Buffer = tools.decompressObjectFileFromRom(rom, OBJ_BOY);
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
        if (!tools.recompressObjectFileIntoRom(rom, OBJ_BOY, zobj)) {
            // If we get here it means the compressed object is bigger than the original.
            // This can happen because the compression ratio ends up different due to texture differences.

            // Move the file to extended ROM space.
            tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, OBJ_BOY), zobj, 0x37800);
        }
    }

    repoint(ModLoader: IModLoaderAPI, rom: Buffer): void {
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let code: ManifestBuffer = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, DMA_CODE));
        let SS_STICK: ManifestBuffer = new ManifestBuffer(tools.decompressParticleFileFromRom(rom, P_VROM_SS_STICK));
        let ARMS_HOOK: ManifestBuffer = new ManifestBuffer(tools.decompressActorFileFromRom(rom, A_VROM_ARMS_HOOK));

        code.GoTo(VROM_CODE + 0xE6718);
        code.SetAdvance(8);
        code.Write32(LUT_DL_RFIST);                    //    Right Fist (High Poly)
        code.Write32(LUT_DL_RFIST);                    //    Right Fist (Low Poly)
        code.Write32(LUT_DL_RFIST);                    //    Right Fist + Deku Shield (High Poly)
        code.Write32(LUT_DL_RFIST);                    //    Right Fist + Deku Shield (Low Poly)
        code.Write32(LUT_DL_RFIST_SHIELD_HYLIAN);      //    Right Fist + Hylian Shield (High Poly)
        code.Write32(LUT_DL_RFIST_SHIELD_HYLIAN);      //    Right Fist + Hylian Shield (Low Poly)
        code.Write32(LUT_DL_RFIST_SHIELD_MIRROR);      //    Right Fist + Mirror Shield (High Poly)
        code.Write32(LUT_DL_RFIST_SHIELD_MIRROR);      //    Right Fist + Mirror Shield (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);           //    Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);           //    Sheathed Sword (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);           //    Deku Shield + Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);           //    Deku Shield + Sheathed Sword (Low Poly)
        code.Write32(LUT_DL_SWORD_SHIELD_HYLIAN);      //    Hylian Shield + Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHIELD_HYLIAN);      //    Hylian Shield + Sheathed Sword (Low Poly)
        code.Write32(LUT_DL_SWORD_SHIELD_MIRROR);      //    Mirror Shield + Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHIELD_MIRROR);      //    Mirror Shield + Sheathed Sword (Low Poly)
        code.Write32(0x00000000);              //    ? (High Poly)
        code.Write32(0x00000000);                  //    ? (Low Poly)
        code.Write32(0x00000000);                  //    Deku Shield without Sheath (High Poly)
        code.Write32(0x00000000);                  //    Deku Shield without Sheath (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);             //    Sword Sheath (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);             //    Sword Sheath (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);             //    Deku Shield + Sheath (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);             //    Deku Shield + Sheath (Low Poly)
        code.Write32(LUT_DL_SHEATH0_HYLIAN);           //    Hylian Shield + Sheath (High Poly)
        code.Write32(LUT_DL_SHEATH0_HYLIAN);           //    Hylian Shield + Sheath (Low Poly)
        code.Write32(LUT_DL_SHEATH0_MIRROR);           //    Mirror Shield + Sheath (High Poly)
        code.Write32(LUT_DL_SHEATH0_MIRROR);           //    Mirror Shield + Sheath (Low Poly)
        code.Write32(0x00000000);                  //    ? (High Poly)
        code.Write32(0x00000000);                  //    ? (Low Poly)
        code.Write32(0x00000000);                  //    ? (High Poly)
        code.Write32(0x00000000);                  //    ? (Low Poly)
        code.Write32(LUT_DL_LFIST_LONGSWORD);          //    Left Fist + Biggoron Sword (High Poly)
        code.Write32(LUT_DL_LFIST_LONGSWORD);          //    Left Fist + Biggoron Sword (Low Poly)
        code.Write32(LUT_DL_LFIST_LONGSWORD_BROKEN);   //    Left Fist + Broken Giant's Knife (High Poly)
        code.Write32(LUT_DL_LFIST_LONGSWORD_BROKEN);   //    Left Fist + Broken Giant's Knife (Low Poly)
        code.Write32(LUT_DL_LHAND);                    //    Left Hand (High Poly)
        code.Write32(LUT_DL_LHAND);                    //    Left Hand (Low Poly)
        code.Write32(LUT_DL_LFIST);                    //    Left Fist (High Poly)
        code.Write32(LUT_DL_LFIST);                    //    Left Fist (Low Poly)
        code.Write32(LUT_DL_LFIST_SWORD);              //    Left Fist + Kokiri Sword (High Poly)
        code.Write32(LUT_DL_LFIST_SWORD);              //    Left Fist + Kokiri Sword (Low Poly)
        code.Write32(LUT_DL_LFIST_SWORD);              //    Left Fist + Master Sword (High Poly)
        code.Write32(LUT_DL_LFIST_SWORD);              //    Left Fist + Master Sword (Low Poly)
        code.Write32(LUT_DL_RHAND);                    //    Right Hand (High Poly)
        code.Write32(LUT_DL_RHAND);                    //    Right Hand (Low Poly)
        code.Write32(LUT_DL_RFIST);                    //    Right Fist (High Poly)
        code.Write32(LUT_DL_RFIST);                    //    Right Fist (Low Poly)
        code.Write32(LUT_DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (High Poly)
        code.Write32(LUT_DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);           //    Sheathed Sword (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATHED);           //    Sheathed Sword (Low Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);             //    Sword Sheath (High Poly)
        code.Write32(LUT_DL_SWORD_SHEATH);             //    Sword Sheath (Low Poly)
        code.Write32(LUT_DL_WAIST);                    //    Waist (High Poly)
        code.Write32(LUT_DL_WAIST);                    //    Waist (Low Poly)
        code.Write32(LUT_DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (High Poly)
        code.Write32(LUT_DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (Low Poly)
        code.Write32(LUT_DL_RHAND_OCARINA_TIME);       //    Right Hand + Fairy Ocarina (High Poly)
        code.Write32(LUT_DL_RHAND_OCARINA_TIME);       //    Right Hand + Fairy Ocarina (Low Poly)
        code.Write32(LUT_DL_RHAND_OCARINA_TIME);       //    Right Hand + Ocarina of Time (High Poly)
        code.Write32(LUT_DL_RHAND_OCARINA_TIME);       //    Right Hand + Ocarina of Time (Low Poly)
        code.Write32(LUT_DL_RFIST_HOOKSHOT);           //    Right Fist + Hookshot / Longshot (High Poly)
        code.Write32(LUT_DL_RFIST_HOOKSHOT);           //    Right Fist + Hookshot / Longshot (Low Poly)
        code.Write32(LUT_DL_LFIST_HAMMER);             //    Left Fist + Megaton Hammer (High Poly)
        code.Write32(LUT_DL_LFIST_HAMMER);             //    Left Fist + Megaton Hammer (Low Poly)
        code.Write32(LUT_DL_LFIST);                    //    Left Fist + Boomerang (High Poly)
        code.Write32(LUT_DL_LFIST);                    //    Left Fist + Boomerang (Low Poly)
        code.Write32(LUT_DL_LHAND_BOTTLE);             //    Outstretched Left Hand for Holding Bottles (High Poly)
        code.Write32(LUT_DL_LHAND_BOTTLE);             //    Outstretched Left Hand for Holding Bottles (Low Poly)
        code.Write32(LUT_DL_FPS_LFOREARM);             //    FPS Left Forearm
        code.Write32(LUT_DL_FPS_LHAND);                //    FPS Left Hand
        code.Write32(LUT_DL_RSHOULDER);                //    Right Shoulder (High Poly)
        code.Write32(LUT_DL_FPS_RFOREARM);             //    FPS Right Forearm
        code.Write32(LUT_DL_FPS_RHAND_BOW);            //    FPS Right Hand + Fairy Bow

        code.GoTo(VROM_CODE + 0xE6A4C);
        code.SetAdvance(4);
        code.Write32(LUT_DL_BOOT_LIRON);               //    Left Iron Boot
        code.Write32(LUT_DL_BOOT_RIRON);               //    Right Iron Boot
        code.Write32(LUT_DL_BOOT_LHOVER);              //    Left Hover Boot
        code.Write32(LUT_DL_BOOT_RHOVER);              //    Right Hover Boot

        code.GoTo(VROM_CODE + 0xE6B28);
        code.Write32(LUT_DL_BOTTLE);                   //    Empty Bottle

        code.GoTo(VROM_CODE + 0xE6B64);
        code.SetAdvance(4);
        code.Write32(LUT_DL_BOW_STRING);               //    Fairy Bow String
        code.Float(0.0);                           //    Fairy Bow String Anchor (X Position Float)
        code.Float(-360.4);                        //    Fairy Bow String Anchor (Y Position Float) 0xC3B43333

        // Hardcoded Assembly Pointers
        code.GoTo(VROM_CODE + 0x69112);                  //    Left Silver/Golden Gauntlet Forearm
        code.Hi32(LUT_DL_UPGRADE_LFOREARM);
        code.GoTo(VROM_CODE + 0x69116);
        code.Lo32(LUT_DL_UPGRADE_LFOREARM);

        code.GoTo(VROM_CODE + 0x6912E);                  //    Right Silver / Golden Gauntlet Forearm
        code.Hi32(LUT_DL_UPGRADE_RFOREARM);
        code.GoTo(VROM_CODE + 0x69132);
        code.Lo32(LUT_DL_UPGRADE_RFOREARM);

        code.GoTo(VROM_CODE + 0x6914E);                  //    Left Silver / Golden Gauntlet Hand (Fist)
        code.Hi32(LUT_DL_UPGRADE_LFIST);
        code.GoTo(VROM_CODE + 0x69162);
        code.Lo32(LUT_DL_UPGRADE_LFIST);

        code.GoTo(VROM_CODE + 0x69166);                  //    Left Silver / Golden Gauntlet Hand (Open Hand)
        code.Hi32(LUT_DL_UPGRADE_LHAND);
        code.GoTo(VROM_CODE + 0x69172);
        code.Lo32(LUT_DL_UPGRADE_LHAND);

        code.GoTo(VROM_CODE + 0x6919E);                  //    Right Silver / Golden Gauntlet Hand (Fist)
        code.Hi32(LUT_DL_UPGRADE_RFIST);
        code.GoTo(VROM_CODE + 0x691A2);
        code.Lo32(LUT_DL_UPGRADE_RFIST);

        code.GoTo(VROM_CODE + 0x691AE);                  //    Right Silver / Golden Gauntlet Hand (Open Hand)
        code.Hi32(LUT_DL_UPGRADE_RHAND);
        code.GoTo(VROM_CODE + 0x691B2);
        code.Lo32(LUT_DL_UPGRADE_RHAND);

        code.GoTo(VROM_CODE + 0x69DEA);                  //    FPS Right Hand + FPS Hookshot / Longshot
        code.Hi32(LUT_DL_FPS_LHAND_HOOKSHOT);
        code.GoTo(VROM_CODE + 0x69DEE);
        code.Lo32(LUT_DL_FPS_LHAND_HOOKSHOT);

        code.GoTo(VROM_CODE + 0x6A666);                  //    Hookshot / Longshot Aiming Reticle
        code.Hi32(LUT_DL_HOOKSHOT_AIM);
        code.GoTo(VROM_CODE + 0x6A66A);
        code.Lo32(LUT_DL_HOOKSHOT_AIM);

        // Arms_Hook
        ARMS_HOOK.GoTo(VROM_ARMS_HOOK + 0xA72);               //    Hookshot / Longshot Spike
        ARMS_HOOK.Hi32(LUT_DL_HOOKSHOT_HOOK);
        ARMS_HOOK.GoTo(VROM_ARMS_HOOK + 0xA76);
        ARMS_HOOK.Lo32(LUT_DL_HOOKSHOT_HOOK);

        ARMS_HOOK.GoTo(VROM_ARMS_HOOK + 0xB66);               //    Hookshot / Longshot Chain
        ARMS_HOOK.Hi32(LUT_DL_HOOKSHOT_CHAIN);
        ARMS_HOOK.GoTo(VROM_ARMS_HOOK + 0xB6A);
        ARMS_HOOK.Lo32(LUT_DL_HOOKSHOT_CHAIN);

        ARMS_HOOK.GoTo(VROM_ARMS_HOOK + 0xBA8);               //    Hookshot / Longshot Object File
        ARMS_HOOK.Write16(OBJ_BOY);

        // ovl_Effect_Ss_Stick
        SS_STICK.GoTo(VROM_SS_STICK + 0x32C);                //    Broken Piece of Giant's Knife
        SS_STICK.Write32(LUT_DL_BLADEBREAK);

        SS_STICK.GoTo(VROM_SS_STICK + 0x328);                //    Giant's Knife / Biggoron Sword Object File
        SS_STICK.Write16(OBJ_BOY);

        tools.recompressDMAFileIntoRom(rom, DMA_CODE, code.buf);
        tools.recompressParticleFileIntoRom(rom, P_VROM_SS_STICK, SS_STICK.buf);
        tools.recompressActorFileIntoRom(rom, A_VROM_ARMS_HOOK, ARMS_HOOK.buf);
    }
}

const VROM_CODE: number = 0;
const VROM_SS_STICK: number = 0;
const A_VROM_ARMS_HOOK = 102;
const OBJ_BOY: number = 0x0014;
const DMA_CODE: number = 27;
const P_VROM_SS_STICK: number = 16;
const VROM_ARMS_HOOK = 0;

const LUT_DL_WAIST: number = 0x5090;
const LUT_DL_RTHIGH: number = 0x5098;
const LUT_DL_RSHIN: number = 0x50A0;
const LUT_DL_RFOOT: number = 0x50A8;
const LUT_DL_LTHIGH: number = 0x50B0;
const LUT_DL_LSHIN: number = 0x50B8;
const LUT_DL_LFOOT: number = 0x50C0;
const LUT_DL_HEAD: number = 0x50C8;
const LUT_DL_HAT: number = 0x50D0;
const LUT_DL_COLLAR: number = 0x50D8;
const LUT_DL_LSHOULDER: number = 0x50E0;
const LUT_DL_LFOREARM: number = 0x50E8;
const LUT_DL_RSHOULDER: number = 0x50F0;
const LUT_DL_RFOREARM: number = 0x50F8;
const LUT_DL_TORSO: number = 0x5100;
const LUT_DL_LHAND: number = 0x5108;
const LUT_DL_LFIST: number = 0x5110;
const LUT_DL_LHAND_BOTTLE: number = 0x5118;
const LUT_DL_RHAND: number = 0x5120;
const LUT_DL_RFIST: number = 0x5128;
const LUT_DL_SWORD_SHEATH: number = 0x5130;
const LUT_DL_SWORD_HILT: number = 0x5138;
const LUT_DL_SWORD_BLADE: number = 0x5140;
const LUT_DL_LONGSWORD_HILT: number = 0x5148;
const LUT_DL_LONGSWORD_BLADE: number = 0x5150;
const LUT_DL_LONGSWORD_BROKEN: number = 0x5158;
const LUT_DL_SHIELD_HYLIAN: number = 0x5160;
const LUT_DL_SHIELD_MIRROR: number = 0x5168;
const LUT_DL_HAMMER: number = 0x5170;
const LUT_DL_BOTTLE: number = 0x5178;
const LUT_DL_BOW: number = 0x5180;
const LUT_DL_OCARINA_TIME: number = 0x5188;
const LUT_DL_HOOKSHOT: number = 0x5190;
const LUT_DL_UPGRADE_LFOREARM: number = 0x5198;
const LUT_DL_UPGRADE_LHAND: number = 0x51A0;
const LUT_DL_UPGRADE_LFIST: number = 0x51A8;
const LUT_DL_UPGRADE_RFOREARM: number = 0x51B0;
const LUT_DL_UPGRADE_RHAND: number = 0x51B8;
const LUT_DL_UPGRADE_RFIST: number = 0x51C0;
const LUT_DL_BOOT_LIRON: number = 0x51C8;
const LUT_DL_BOOT_RIRON: number = 0x51D0;
const LUT_DL_BOOT_LHOVER: number = 0x51D8;
const LUT_DL_BOOT_RHOVER: number = 0x51E0;
const LUT_DL_FPS_LFOREARM: number = 0x51E8;
const LUT_DL_FPS_LHAND: number = 0x51F0;
const LUT_DL_FPS_RFOREARM: number = 0x51F8;
const LUT_DL_FPS_RHAND: number = 0x5200;
const LUT_DL_FPS_HOOKSHOT: number = 0x5208;
const LUT_DL_HOOKSHOT_CHAIN: number = 0x5210;
const LUT_DL_HOOKSHOT_HOOK: number = 0x5218;
const LUT_DL_HOOKSHOT_AIM: number = 0x5220;
const LUT_DL_BOW_STRING: number = 0x5228;
const LUT_DL_BLADEBREAK: number = 0x5230;
const LUT_DL_SWORD_SHEATHED: number = 0x5238;
const LUT_DL_SHIELD_HYLIAN_BACK: number = 0x5258;
const LUT_DL_SHIELD_MIRROR_BACK: number = 0x5268;
const LUT_DL_SWORD_SHIELD_HYLIAN: number = 0x5278;
const LUT_DL_SWORD_SHIELD_MIRROR: number = 0x5288;
const LUT_DL_SHEATH0_HYLIAN: number = 0x5298;
const LUT_DL_SHEATH0_MIRROR: number = 0x52A8;
const LUT_DL_LFIST_SWORD: number = 0x52B8;
const LUT_DL_LFIST_LONGSWORD: number = 0x52D0;
const LUT_DL_LFIST_LONGSWORD_BROKEN: number = 0x52E8;
const LUT_DL_LFIST_HAMMER: number = 0x5300;
const LUT_DL_RFIST_SHIELD_HYLIAN: number = 0x5310;
const LUT_DL_RFIST_SHIELD_MIRROR: number = 0x5320;
const LUT_DL_RFIST_BOW: number = 0x5330;
const LUT_DL_RFIST_HOOKSHOT: number = 0x5340;
const LUT_DL_RHAND_OCARINA_TIME: number = 0x5350;
const LUT_DL_FPS_RHAND_BOW: number = 0x5360;
const LUT_DL_FPS_LHAND_HOOKSHOT: number = 0x5370;