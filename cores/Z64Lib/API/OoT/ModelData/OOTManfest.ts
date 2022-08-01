import fs from 'fs';
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { PatchTypes } from "modloader64_api/Patchers/PatchManager";
import path from 'path';
import { Z64LibSupportedGames } from '../../Utilities/Z64LibSupportedGames';
import { IManifest, ManifestBuffer } from '../../Utilities/Z64ManifestBuffer';
import { trimBuffer, Z64RomTools } from '../../Utilities/Z64RomTools';
import { Z64Offsets } from '../../Common/ModelData/IZ64Offsets';

export class OOTManifest implements IManifest {

    inject(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer, nocompress?: boolean, obj_id: number = 0x0015): number {
        let r = 0;
        // Get original zobj from ROM.
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);
        let zobj: Buffer = tools.decompressObjectFileFromRom(rom, obj_id);
        if (model.byteLength > zobj.byteLength) {
            // This shouldn't be possible because zzplayas would throw a tantrum before you got this far.
            return r;
        }
        // Clear its contents.
        ModLoader.utils.clearBuffer(zobj);
        // Load the model.
        model.copy(zobj);
        // Trim excess space.
        zobj = trimBuffer(zobj);
        // Attempt to put the file back.
        if (nocompress === undefined || nocompress === false) {
            if (!tools.recompressObjectFileIntoRom(rom, obj_id, zobj)) {
                // If we get here it means the compressed object is bigger than the original.
                // This can happen because the compression ratio ends up different due to texture differences.

                // Move the file to extended ROM space.
                r = tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, obj_id), zobj, 0);
                tools.noCRC(rom);
            }
        } else {
            // Move the file to extended ROM space.
            r = tools.relocateFileToExtendedRom(rom, tools.findDMAIndexOfObject(rom, obj_id), zobj, 0, nocompress);
            tools.noCRC(rom);
        }
        return r;
    }

    repoint(ModLoader: IModLoaderAPI, rom: Buffer, model: Buffer): boolean {
        let tools = new Z64RomTools(ModLoader, Z64LibSupportedGames.OCARINA_OF_TIME);

        let code: Buffer = tools.getCodeFile(rom);
        let files = [120, 401, 238, 34, 356, 184, 346];
        for (let i = 0; i < files.length; i++) {
            let r = tools.relocateFileToExtendedRom(rom, files[i], tools.decompressDMAFileFromRom(rom, files[i]), 0, true);
        }

        let _code = new ManifestBuffer(code);
        let _stick = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 401));
        let _hook = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 120));
        let _shield = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 238));
        let _player = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 34));
        let _cs = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 356));
        let _guard = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 184));
        let _mm = new ManifestBuffer(tools.decompressDMAFileFromRom(rom, 346));

        // Adult Link
        _code.GoTo(0xE6718);
        _code.SetAdvance(8);
        _code.Write32(Z64Offsets.DL_RFIST);                    //    Right Fist (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST);                    //    Right Fist (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_1);                    //    Right Fist + Deku Shield (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_1);                    //    Right Fist + Deku Shield (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_2);      //    Right Fist + Hylian Shield (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_2);      //    Right Fist + Hylian Shield (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_3);      //    Right Fist + Mirror Shield (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_3);      //    Right Fist + Mirror Shield (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHEATHED);           //    Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHEATHED);           //    Sheathed Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD1);           //    Deku Shield + Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD1);           //    Deku Shield + Sheathed Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD2);      //    Hylian Shield + Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD2);      //    Hylian Shield + Sheathed Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD3);      //    Mirror Shield + Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD3);      //    Mirror Shield + Sheathed Sword (Low Poly)
        _code.Write32(0x00000000);              //    ? (High Poly)
        _code.Write32(0x00000000);                  //    ? (Low Poly)
        _code.Write32(0x00000000);                  //    Deku Shield without Sheath (High Poly)
        _code.Write32(0x00000000);                  //    Deku Shield without Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_2);             //    Sword Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_2);             //    Sword Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD1_SHEATH);             //    Deku Shield + Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD1_SHEATH);             //    Deku Shield + Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD2_SHEATH);           //    Hylian Shield + Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD2_SHEATH);           //    Hylian Shield + Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD3_SHEATH);           //    Mirror Shield + Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHIELD3_SHEATH);           //    Mirror Shield + Sheath (Low Poly)
        _code.Write32(0x00000000);                  //    ? (High Poly)
        _code.Write32(0x00000000);                  //    ? (Low Poly)
        _code.Write32(0x00000000);                  //    ? (High Poly)
        _code.Write32(0x00000000);                  //    ? (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD3);          //    Left Fist + Biggoron Sword (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD3);          //    Left Fist + Biggoron Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD3_BROKEN);   //    Left Fist + Broken Giant's Knife (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD3_BROKEN);   //    Left Fist + Broken Giant's Knife (Low Poly)
        /* 36 */_code.Write32(Z64Offsets.DL_LHAND);                    //    Left Hand (High Poly)
        _code.Write32(Z64Offsets.DL_LHAND);                    //    Left Hand (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST);                    //    Left Fist (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST);                    //    Left Fist (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD1);              //    Left Fist + Kokiri Sword (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD1);              //    Left Fist + Kokiri Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD2);              //    Left Fist + Master Sword (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD2);              //    Left Fist + Master Sword (Low Poly)
        /* 44 */_code.Write32(Z64Offsets.DL_RHAND);                    //    Right Hand (High Poly)
        _code.Write32(Z64Offsets.DL_RHAND);                    //    Right Hand (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST);                    //    Right Fist (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST);                    //    Right Fist (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHEATHED);           //    Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD2_SHEATHED);           //    Sheathed Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_2);             //    Sword Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_2);             //    Sword Sheath (Low Poly)
        /* 54 */_code.Write32(Z64Offsets.DL_WAIST);                    //    Waist (High Poly)
        _code.Write32(Z64Offsets.DL_WAIST);                    //    Waist (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_BOW);                //    Right Fist + Fairy Bow (and/or Fairy Slinghot?) (Low Poly)
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_TIME);       //    Right Hand + Fairy Ocarina (High Poly)
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_TIME);       //    Right Hand + Fairy Ocarina (Low Poly)
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_TIME);       //    Right Hand + Ocarina of Time (High Poly)
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_TIME);       //    Right Hand + Ocarina of Time (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_HOOKSHOT);           //    Right Fist + Hookshot / Longshot (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_HOOKSHOT);           //    Right Fist + Hookshot / Longshot (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST_HAMMER);             //    Left Fist + Megaton Hammer (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST_HAMMER);             //    Left Fist + Megaton Hammer (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST_BOOMERANG);                    //    Left Fist + Boomerang (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST_BOOMERANG);                    //    Left Fist + Boomerang (Low Poly)
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);             //    Outstretched Left Hand for Holding Bottles (High Poly)
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);             //    Outstretched Left Hand for Holding Bottles (Low Poly)
        _code.Write32(Z64Offsets.DL_FPS_LFOREARM);             //    FPS Left Forearm
        _code.Write32(Z64Offsets.DL_FPS_LHAND);                //    FPS Left Hand
        _code.Write32(Z64Offsets.DL_RSHOULDER);                //    Right Shoulder (High Poly)
        _code.Write32(Z64Offsets.DL_FPS_RFOREARM);             //    FPS Right Forearm
        _code.Write32(Z64Offsets.DL_FPS_RHAND_BOW);            //    FPS Right Hand + Fairy Bow
        _code.GoTo(0xE6A4C);
        _code.SetAdvance(4);
        _code.Write32(Z64Offsets.DL_BOOT_LIRON);               //    Left Iron Boot
        _code.Write32(Z64Offsets.DL_BOOT_RIRON);               //    Right Iron Boot
        _code.Write32(Z64Offsets.DL_BOOT_LHOVER);              //    Left Hover Boot
        _code.Write32(Z64Offsets.DL_BOOT_RHOVER);              //    Right Hover Boot
        _code.GoTo(0xE6B28);
        _code.Write32(Z64Offsets.DL_BOTTLE);                   //    Empty Bottle
        _code.GoTo(0xE6B64);
        _code.SetAdvance(4);
        _code.Write32(Z64Offsets.DL_BOW_STRING);               //    Fairy Bow String
        _code.Float(0.0);                           //    Fairy Bow String Anchor (X Position Float)
        _code.Float(-360.4);
        //    Fairy Bow String Anchor (Y Position Float) 0xC3B43333
        // Hardcoded Assembly Pointers
        _code.GoTo(0x69112);                  //    Left Silver/Golden Gauntlet Forearm
        _code.Hi32(Z64Offsets.DL_UPGRADE_LFOREARM);
        _code.GoTo(0x69116);
        _code.Lo32(Z64Offsets.DL_UPGRADE_LFOREARM);

        _code.GoTo(0x6912E);                  //    Right Silver / Golden Gauntlet Forearm
        _code.Hi32(Z64Offsets.DL_UPGRADE_RFOREARM);
        _code.GoTo(0x69132);
        _code.Lo32(Z64Offsets.DL_UPGRADE_RFOREARM);

        _code.GoTo(0x6914E);                  //    Left Silver / Golden Gauntlet Hand (Fist)
        _code.Hi32(Z64Offsets.DL_UPGRADE_LFIST);
        _code.GoTo(0x69162);
        _code.Lo32(Z64Offsets.DL_UPGRADE_LFIST);

        _code.GoTo(0x69166);                  //    Left Silver / Golden Gauntlet Hand (Open Hand)
        _code.Hi32(Z64Offsets.DL_UPGRADE_LHAND);
        _code.GoTo(0x69172);
        _code.Lo32(Z64Offsets.DL_UPGRADE_LHAND);

        _code.GoTo(0x6919E);                  //    Right Silver / Golden Gauntlet Hand (Fist)
        _code.Hi32(Z64Offsets.DL_UPGRADE_RFIST);
        _code.GoTo(0x691A2);
        _code.Lo32(Z64Offsets.DL_UPGRADE_RFIST);

        _code.GoTo(0x691AE);                  //    Right Silver / Golden Gauntlet Hand (Open Hand)
        _code.Hi32(Z64Offsets.DL_UPGRADE_RHAND);
        _code.GoTo(0x691B2);
        _code.Lo32(Z64Offsets.DL_UPGRADE_RHAND);

        _code.GoTo(0x69DEA);                  //    FPS Right Hand + FPS Hookshot / Longshot
        _code.Hi32(Z64Offsets.DL_FPS_LHAND_HOOKSHOT);
        _code.GoTo(0x69DEE);
        _code.Lo32(Z64Offsets.DL_FPS_LHAND_HOOKSHOT);

        _code.GoTo(0x6A666);                  //    Hookshot / Longshot Aiming Reticle
        _code.Hi32(Z64Offsets.DL_HOOKSHOT_AIM);
        _code.GoTo(0x6A66A);
        _code.Lo32(Z64Offsets.DL_HOOKSHOT_AIM);

        // Arms_Hook
        _hook.GoTo(0xA72);               //    Hookshot / Longshot Spike
        _hook.Hi32(Z64Offsets.DL_HOOKSHOT_HOOK);
        _hook.GoTo(0xA76);
        _hook.Lo32(Z64Offsets.DL_HOOKSHOT_HOOK);

        _hook.GoTo(0xB66);               //    Hookshot / Longshot Chain
        _hook.Hi32(Z64Offsets.DL_HOOKSHOT_CHAIN);
        _hook.GoTo(0xB6A);
        _hook.Lo32(Z64Offsets.DL_HOOKSHOT_CHAIN);

        _hook.GoTo(0xBA8);               //    Hookshot / Longshot Object File
        _hook.Write16(0x0014);

        // ovl_Effect_Ss_Stick
        _stick.GoTo(0x32C);                //    Broken Piece of Giant's Knife
        _stick.Write32(Z64Offsets.DL_BLADEBREAK);
        _stick.GoTo(0x328);                //    Giant's Knife / Biggoron Sword Object File
        _stick.Write16(0x0014);

        _code.GoTo(0xE65A0);
        _code.Write32(0x06005830);

        // Child Link
        _code.GoTo(0xE671C);
        _code.SetAdvance(8);
        _code.Write32(Z64Offsets.DL_RFIST);                  //    Right Fist (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST);                  //    Right Fist (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_1);      //    Right Fist + Deku Shield (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_1);      //    Right Fist + Deku Shield (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_2);                  //    Right Fist + Hylian Shield (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_2);                  //    Right Fist + Hylian Shield (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_3);                  //    Right Fist + Mirror Shield (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SHIELD_3);                  //    Right Fist + Mirror Shield (Low Poly) */
        _code.Write32(Z64Offsets.DL_SWORD1_SHEATHED);         //    Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHEATHED);         //    Sheathed Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD1);      //    Deku Shield + Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD1);      //    Deku Shield + Sheathed Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD2);    //    Hylian Shield + Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD2);    //    Hylian Shield + Sheathed Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD3);         //    Mirror Shield + Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD3);         //    Mirror Shield + Sheathed Sword (Low Poly)
        _code.Write32(0x00000000);            //    ? (High Poly)
        _code.Write32(0x00000000);                //    ? (Low Poly)
        _code.Write32(Z64Offsets.DL_SHIELD1_BACK);       //    Deku Shield without Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SHIELD1_BACK);       //    Deku Shield without Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_1);           //    No Shield + Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_1);           //    No Shield + Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD1_SHEATH);           //    Deku Shield + Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD1_SHEATH);           //    Deku Shield + Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD2_SHEATH);         //    Hylian Shield + Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD2_SHEATH);         //    Hylian Shield + Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD3_SHEATH);           //    Mirror Shield + Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHIELD3_SHEATH);           //    Mirror Shield + Sheath (Low Poly)
        _code.Write32(0x00000000);                //    ? (High Poly)
        _code.Write32(0x00000000);                //    ? (Low Poly)
        _code.Write32(Z64Offsets.DL_SHIELD1_BACK);           //    Deku Shield without Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SHIELD1_BACK);           //    Deku Shield without Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_PEDESTAL_SWORD);    //    Left Fist + Biggoron Sword (High Poly)
        _code.Write32(Z64Offsets.DL_PEDESTAL_SWORD);    //    Left Fist + Biggoron Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_PEDESTAL_SWORD);    //    Left Fist + Broken Giant's Knife (High Poly)
        _code.Write32(Z64Offsets.DL_PEDESTAL_SWORD);    //    Left Fist + Broken Giant's Knife (Low Poly)
        _code.Write32(Z64Offsets.DL_LHAND);                  //    Left Hand (High Poly)
        _code.Write32(Z64Offsets.DL_LHAND);                  //    Left Hand (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST);                  //    Left Fist (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST);                  //    Left Fist (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD1);            //    Left Fist + Kokiri Sword (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD1);            //    Left Fist + Kokiri Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD1);            //    Left Fist + Master Sword (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST_SWORD1);            //    Left Fist + Master Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_RHAND);                  //    Right Hand (High Poly)
        _code.Write32(Z64Offsets.DL_RHAND);                  //    Right Hand (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST);                  //    Right Fist (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST);                  //    Right Fist (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SLINGSHOT);        //    Right Fist + Fairy Slingshot (and/or Fairy Bow?) (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SLINGSHOT);        //    Right Fist + Fairy Slingshot (and/or Fairy Bow?) (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHEATHED);         //    Sheathed Sword (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD1_SHEATHED);         //    Sheathed Sword (Low Poly)
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_1);           //    Sword Sheath (High Poly)
        _code.Write32(Z64Offsets.DL_SWORD_SHEATH_1);           //    Sword Sheath (Low Poly)
        _code.Write32(Z64Offsets.DL_WAIST);                  //    Waist (High Poly)
        _code.Write32(Z64Offsets.DL_WAIST);                  //    Waist (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SLINGSHOT);            //    Right Fist + Fairy Slingshot (and/or Fairy Bow?) (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST_SLINGSHOT);        //    Right Fist + Fairy Slingshot (and/or Fairy Bow?) (Low Poly)
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_FAIRY);    //    Right Hand + Fairy Ocarina (High Poly)
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_FAIRY);    //    Right Hand + Fairy Ocarina (Low Poly)
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_TIME);     //    Right Hand + Ocarina of Time (High Poly)
        _code.Write32(Z64Offsets.DL_RHAND_OCARINA_TIME);     //    Right Hand + Ocarina of Time (Low Poly)
        _code.Write32(Z64Offsets.DL_RFIST);                  //    Right Fist + Hookshot / Longshot (High Poly)
        _code.Write32(Z64Offsets.DL_RFIST);                  //    Right Fist + Hookshot / Longshot (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST);                  //    Left Fist + Megaton Hammer (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST);                  //    Left Fist + Megaton Hammer (Low Poly)
        _code.Write32(Z64Offsets.DL_LFIST_BOOMERANG);        //    Left Fist + Boomerang (High Poly)
        _code.Write32(Z64Offsets.DL_LFIST_BOOMERANG);        //    Left Fist + Boomerang (Low Poly)
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);           //    Outstretched Left Hand for Holding Bottles (High Poly)
        _code.Write32(Z64Offsets.DL_LHAND_BOTTLE);           //    Outstretched Left Hand for Holding Bottles (Low Poly)
        _code.Write32(0x00000000);                //    FPS Left Forearm
        _code.Write32(0x00000000);                //    FPS Left Hand
        _code.Write32(Z64Offsets.DL_RSHOULDER);              //    Right Shoulder (High Poly)
        _code.Write32(0x00000000);                //    FPS Right Forearm
        _code.Write32(Z64Offsets.DL_FPS_RARM_SLINGSHOT);     //    FPS Right Hand + Fairy Bow

        _code.GoTo(0xE6B2C);
        _code.Write32(Z64Offsets.DL_BOTTLE);                   //    Empty Bottle

        _code.GoTo(0xE6B74);
        _code.SetAdvance(4);
        _code.Write32(Z64Offsets.DL_SLINGSHOT_STRING);         //    Fairy Slingshot String
        _code.Write32(0x44178000);                  //    Fairy Slingshot String Anchor (X Position Float)
        _code.Write32(0x436C0000);                  //    Fairy Slingshot String Anchor (Y Position Float)

        // Hardcoded Assembly Pointers
        _code.GoTo(0x6922E);              //    Goron Bracelet
        _code.Hi32(Z64Offsets.DL_GORON_BRACELET);
        _code.GoTo(0x69232);
        _code.Lo32(Z64Offsets.DL_GORON_BRACELET);
        _code.GoTo(0x6A80E);                //    Deku Stick (Whole)
        _code.Hi32(Z64Offsets.DL_DEKU_STICK);
        _code.GoTo(0x6A812);
        _code.Lo32(Z64Offsets.DL_DEKU_STICK);

        // ovl_Effect_Ss_Stick
        _stick.GoTo(0x334);            //    Deku Stick
        _stick.Write32(Z64Offsets.DL_DEKU_STICK);

        _stick.GoTo(0x330);            //    Deku Stick Object File
        _stick.Write16(0x0015);

        // Item_Shield
        _shield.GoTo(0x7EE);           //    Burning Deku Shield
        _shield.Hi32(Z64Offsets.DL_SHIELD1_ODD);
        _shield.GoTo(0x7F2);
        _shield.Lo32(Z64Offsets.DL_SHIELD1_ODD);

        // ovl_player_actor
        _player.GoTo(0x2253C);
        _player.SetAdvance(4);
        _player.Write32(Z64Offsets.DL_MASK_KEATON);                //    Keaton Mask
        _player.Write32(Z64Offsets.DL_MASK_SKULL);             //    Skull Mask
        _player.Write32(Z64Offsets.DL_MASK_SPOOKY);            //    Spooky Mask
        _player.Write32(Z64Offsets.DL_MASK_BUNNY);             //    Bunny Hood
        _player.Write32(Z64Offsets.DL_GORON_MASK);             //    Goron Mask
        _player.Write32(Z64Offsets.DL_ZORA_MASK);              //    Zora Mask
        _player.Write32(Z64Offsets.DL_MASK_GERUDO);            //    Gerudo Mask
        _player.Write32(Z64Offsets.DL_MASK_TRUTH);             //    Mask of Truth

        //External_character_Masks

        // En_Cs (Graveyard Kid Spooky Mask)
        _cs.GoTo(0xE62);
        _cs.Hi32(Z64Offsets.DL_MASK_SPOOKY);
        _cs.GoTo(0xE66);
        _cs.Lo32(Z64Offsets.DL_MASK_SPOOKY);

        // En_Heishi2 (Kakariko Guard Keaton Mask)
        _guard.GoTo(0x1EA2);
        _guard.Hi32(Z64Offsets.DL_MASK_KEATON);
        _guard.GoTo(0x1EA6);
        _guard.Lo32(Z64Offsets.DL_MASK_KEATON);

        // En_Mm (Running Man Bunny Hood)
        _mm.GoTo(0x1142);
        _mm.Hi32(Z64Offsets.DL_MASK_BUNNY);
        _mm.GoTo(0x1146);
        _mm.Lo32(Z64Offsets.DL_MASK_BUNNY);

        _code.GoTo(0xE65A4);
        _code.Write32(0x06005830);

        tools.recompressDMAFileIntoRom(rom, 27, code);
        tools.recompressDMAFileIntoRom(rom, 120, _hook.buf);
        tools.recompressDMAFileIntoRom(rom, 401, _stick.buf);
        tools.recompressDMAFileIntoRom(rom, 238, _shield.buf);
        tools.recompressDMAFileIntoRom(rom, 34, _player.buf);
        tools.recompressDMAFileIntoRom(rom, 356, _cs.buf);
        tools.recompressDMAFileIntoRom(rom, 184, _guard.buf);
        tools.recompressDMAFileIntoRom(rom, 346, _mm.buf);
        return true;
    }
}