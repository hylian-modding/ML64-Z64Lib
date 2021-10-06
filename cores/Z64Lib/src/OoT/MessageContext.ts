import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { IMessageContext, IMessageEntry, MessageBoxPositions, MessageBoxTypes, TextStates, MessageModes, MessageSelectionModes, IOOTCore, IMessageOcarinaInfo, IFontContext } from "../../API/OoT/OOTAPI";
import str_to_oot from "../Common/MessageParser";

export class FontContext implements IFontContext {

    ModLoader: IModLoaderAPI;
    Ptr: number;

    constructor(ModLoader: IModLoaderAPI, _Ptr: number) {
        this.ModLoader = ModLoader;
        this.Ptr = _Ptr;
    }

    get MessageOffsetPtr(): number { return this.ModLoader.emulator.rdramRead32(this.Ptr + 0x000000) };
    get MessageLengthPtr(): number { return this.ModLoader.emulator.rdramRead32(this.Ptr + 0x000004) };
    get FontTextureBuffer(): Buffer { return this.ModLoader.emulator.rdramReadBuffer(this.Ptr + 0x000008, 0x003C00) };
    get IconBuffer(): Buffer { return this.ModLoader.emulator.rdramReadBuffer(this.Ptr + 0x003C08, 0x000080) };
    get FontBuffer(): Buffer { return this.ModLoader.emulator.rdramReadBuffer(this.Ptr + 0x003C88, 0x001400) };
    get MessageBufferPtr(): number { return (this.Ptr + 0x00DC88) };
    get MessageBuffer(): Buffer { return this.ModLoader.emulator.rdramReadBuffer(this.Ptr + 0x00DC88, 0x000500) };


    set MessageOffsetPtr(_p: number) { this.ModLoader.emulator.rdramWrite32(this.Ptr + 0x000000, _p) };
    set MessageLengthPtr(_p: number) { this.ModLoader.emulator.rdramWrite32(this.Ptr + 0x000004, _p) };
    set FontTextureBuffer(_p: Buffer) { this.ModLoader.emulator.rdramWriteBuffer(this.Ptr + 0x000008, _p) };
    set IconBuffer(_p: Buffer) { this.ModLoader.emulator.rdramWriteBuffer(this.Ptr + 0x003C08, _p) };
    set FontBuffer(_p: Buffer) { this.ModLoader.emulator.rdramWriteBuffer(this.Ptr + 0x003C88, _p) };
    set MessageBuffer(_p: Buffer) { this.ModLoader.emulator.rdramWriteBuffer(this.Ptr + 0x00DC88, _p) };

}

export class MessageOcarinaInfo implements IMessageOcarinaInfo {

    ModLoader: IModLoaderAPI;
    Ptr: number;

    constructor(ModLoader: IModLoaderAPI, _Ptr: number) {
        this.ModLoader = ModLoader;
        this.Ptr = _Ptr;
    }

    get Button(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x000000) };
    get Status(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x000001) };
    get Location(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x000002) };


    set Button(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x000000, _p) };
    set Status(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x000001, _p) };
    set Location(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x000002, _p) };
}

abstract class MessageBoxFunctions {

    MessageTablePtr = 0x8010EA8C;
    Core: IOOTCore;
    ModLoader: IModLoaderAPI;

    constructor(Core: IOOTCore, ModLoader: IModLoaderAPI) {
        this.Core = Core;
        this.ModLoader = ModLoader;
    }

    Message_GetState(msgCtx: IMessageContext): number {
        let state: number;
    
        if (msgCtx.MessageDataPtr === 0) {
            state = TextStates.NONE;
        } else if (msgCtx.MessageMode === MessageModes.TEXT_DONE) {
            if (msgCtx.SelectionMode === MessageSelectionModes.HAS_NEXT_TEXTID) {
                state = TextStates.DONE_HAS_NEXT;
            } else if (msgCtx.SelectionMode === MessageSelectionModes.TWO_CHOICE || msgCtx.SelectionMode === MessageSelectionModes.THREE_CHOICE) { // choice text
                state = TextStates.CHOICE;
            } else if (msgCtx.SelectionMode === MessageSelectionModes.EVENT || msgCtx.SelectionMode === MessageSelectionModes.PERSISTENT) { // event or persistent
                state = TextStates.EVENT;
            } else if (msgCtx.SelectionMode === MessageSelectionModes.FADING) {
                state = TextStates.DONE_FADING;
            } else {
                state = TextStates.DONE;
            }
        } else if (msgCtx.MessageMode === MessageModes.TEXT_AWAIT_NEXT) {
            state = TextStates.AWAITING_NEXT;
        } else if (msgCtx.MessageMode === MessageModes.OCARINA_DONE_PLAYING) {
            state = TextStates.DEMO_DONE;
        } else if (msgCtx.OcarinaMode === 3) { // ocarina related
            state = TextStates.OCARINA_CORRECT;
        } else if (msgCtx.MessageMode === MessageModes.OCARINA_ERROR_WAIT) {
            state = TextStates.OCARINA_ERROR;
        } else if (msgCtx.MessageMode === MessageModes.TEXT_CLOSING && msgCtx.StateTimer === 1) {
            state = TextStates.CLOSING;
        } else {
            state = TextStates.DONE_FADING;
        }
        return state;
    }

    Message_GetTableEntry(MessageID: number): number {
        let EntryIndex = 0;
        for (let i = 0; i < 0xFFFF; i++) {
            let m = (this.MessageTablePtr + (i * 8));
            if (this.ModLoader.emulator.rdramRead16(m) == MessageID) {
                EntryIndex = i;
                break;
            }
        }
        return EntryIndex;
    }
    
    Message_ModifyTableEntry(CustomMessage: MessageEntry): void {
        let m = (this.MessageTablePtr + (this.Message_GetTableEntry(CustomMessage.MessageID) * 8));
        let box: number = ((CustomMessage.MessageBoxType << 4) | (CustomMessage.MessageBoxPosition));
        this.ModLoader.emulator.rdramWrite8(m + 2, box);
    }

    Message_Spawn(MessageCtx: IMessageContext, Message: MessageEntry): void {
        this.Message_ModifyTableEntry(Message);
        let paramArray = [0x801C84A0, Message.MessageID, 0x801DAA30];
        let pAllocation = 0;
        let fnAddress = 0x800DCE14;
        this.ModLoader.utils.setTimeoutFrames(() => {
            if (pAllocation === 0) {
                pAllocation = this.ModLoader.heap!.malloc(paramArray.length * 4);
                for (let i = 0; i < paramArray.length; i++) {
                    this.ModLoader.emulator.rdramWrite32(pAllocation + (i * 4), paramArray[i]);
                }
            }
            this.Core.commandBuffer.arbitraryFunctionCall(fnAddress, pAllocation, paramArray.length).then(() => {
                this.ModLoader.heap!.free(pAllocation);
                if (this.ModLoader.emulator.rdramRead32(MessageCtx.Font.MessageBufferPtr) === 0x30313161) {
                    MessageCtx.Font.MessageBuffer = str_to_oot(Message.MessageString);
                }
            });
        }, 1);
    }
}

export default class MessageContext extends MessageBoxFunctions implements IMessageContext {

    ModLoader: IModLoaderAPI;
    Ptr: number;

    constructor(Core: IOOTCore, ModLoader: IModLoaderAPI, _Ptr: number) {
        super(Core, ModLoader);
        this.ModLoader = ModLoader;
        this.Ptr = _Ptr;
    }
    
    /* get View(): ViewContext { return new ViewContext(this.ModLoader, (this.Ptr + 0x000000)) }; */
    get Font(): FontContext { return new FontContext(this.ModLoader, (this.Ptr + 0x000128)) };
    get MessageBoxSegmentPtr(): number { return this.ModLoader.emulator.rdramRead32(this.Ptr + 0x00E2B0) };
    get TextureSegmentPtr(): number { return this.ModLoader.emulator.rdramRead32(this.Ptr + 0x00E2B4) };
    get OcarinaInfoPtr(): number { return this.ModLoader.emulator.rdramRead32(this.Ptr + 0x00E2B8) };
    get OcarinaInfo(): MessageOcarinaInfo { return new MessageOcarinaInfo(this.ModLoader, (this.Ptr + 0x00E2B8)) };
    /* get DMA(): DirectMemoryAccess { return new DirectMemoryAccess(this.ModLoader, (this.Ptr + 0x00E2BC)) }; */
    /* get OSMessageQueue(): OSMesgQueue { return new OSMesgQueue(this.ModLoader, (this.Ptr + 0x00E2DC)) }; */
    /* get OSMessage(): OSMesg { return new OSMesg(this.ModLoader, (this.Ptr + 0x00E2F4)) }; */
    get MessageID(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E2F8) };
    get SelectedMessageID(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E2FA) };
    get MessageBoxProperties(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E2FC) };
    get MessageBoxType(): MessageBoxTypes { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E2FD) };
    get MessageBoxPosition(): MessageBoxPositions { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E2FE) };
    get MessageDataPtr(): number { return this.ModLoader.emulator.rdramRead32(this.Ptr + 0x00E300) };
    get MessageMode(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E304) };
    get MessageBufferRead(): Buffer { return this.ModLoader.emulator.rdramReadBuffer(this.Ptr + 0x00E306, 0x0000C8) };
    get ReadIndex(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3CE) };
    get LoadIndex(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3D0) };
    get LoadEndIndex(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3D2) };
    get ReadEndIndex(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3D4) };
    get FastForwardMessageTimer(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3D6) };
    get CharacterXPosition(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3D8) };
    get CharacterYPosition(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3DA) };
    get CharacterColor(): Buffer { return this.ModLoader.emulator.rdramReadBuffer(this.Ptr + 0x00E3DC, 0x000008) };
    get SelectionMode(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E3E4) };
    get MessageChoiceIndex(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E3E5) };
    get ItemDisplayFlag(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E3E6) };
    get StateTimer(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E3E7) };
    get MessageSpeed(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3E8) };
    get MessageSpeedOriginal(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3EA) };
    get OcarinaLastPlayedSong(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3EC) };
    get OcarinaMode(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3EE) };
    get OcarinaAction(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3F0) };
    get OcarinaCheckIndex(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3F2) };
    get OcarinaSunSongFlag(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3F4) };
    get MessageBoxNumber(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E3F6) };
    get MessageBoxPrimitiveColorIndex(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E3F8) };
    get MessageBoxShadowColor(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E3F9) };
    get MessageBoxShift(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E3FA) };
    get MessageBoxAnimation(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E3FB) };
    get MessageBoxType2(): MessageBoxTypes { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E3FC) };
    get MessageBoxColor(): Buffer { return this.ModLoader.emulator.rdramReadBuffer(this.Ptr + 0x00E3FE, 0x000008) };
    get MessageBoxCurrentAlpha(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E406) };
    get TalkingActorPtr(): number { return this.ModLoader.emulator.rdramRead32(this.Ptr + 0x00E408) };
    get DisableWarpSongsBool(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E40C) };
    get SunSongChoice(): number { return this.ModLoader.emulator.rdramRead16(this.Ptr + 0x00E40E) };
    get LastOcarinaNoteIndex(): number { return this.ModLoader.emulator.rdramRead8(this.Ptr + 0x00E410) };


    /* set View(_p: ViewContext) { this.ModLoader.emulator.rdramWriteXX(this.Ptr + 0x000000, _p) }; */
    /* set Font(_p: FontContext) { this.ModLoader.emulator.rdramWriteXX(this.Ptr + 0x000128, _p) }; */
    set MessageBoxSegmentPtr(_p: number) { this.ModLoader.emulator.rdramWrite32(this.Ptr + 0x00E2B0, _p) };
    set TextureSegmentPtr(_p: number) { this.ModLoader.emulator.rdramWrite32(this.Ptr + 0x00E2B4, _p) };
    set OcarinaInfoPtr(_p: number) { this.ModLoader.emulator.rdramWrite32(this.Ptr + 0x00E2B8, _p) };
    /* set OcarinaInfo(_p: MessageOcarinaInfo) { this.ModLoader.emulator.rdramWriteXX(this.Ptr + 0x00E2B8, _p) }; */
    /* set DMA(_p: DirectMemoryAccess) { this.ModLoader.emulator.rdramWriteXX(this.Ptr + 0x00E2BC, _p) }; */
    /* set OSMessageQueue(_p: OSMesgQueue) { this.ModLoader.emulator.rdramWriteXX(this.Ptr + 0x00E2DC, _p) }; */
    /* set OSMessage(_p: OSMesg) { this.ModLoader.emulator.rdramWriteXX(this.Ptr + 0x00E2F4, _p) }; */
    set MessageID(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E2F8, _p) };
    set SelectedMessageID(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E2FA, _p) };
    set MessageBoxProperties(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E2FC, _p) };
    set MessageBoxType(_p: MessageBoxTypes) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E2FD, Number(_p)) };
    set MessageBoxPosition(_p: MessageBoxPositions) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E2FE, Number(_p)) };
    set MessageDataPtr(_p: number) { this.ModLoader.emulator.rdramWrite32(this.Ptr + 0x00E300, _p) };
    set MessageMode(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E304, _p) };
    set MessageBufferRead(_p: Buffer) { this.ModLoader.emulator.rdramWriteBuffer(this.Ptr + 0x00E306, _p) };
    set ReadIndex(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3CE, _p) };
    set LoadIndex(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3D0, _p) };
    set LoadEndIndex(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3D2, _p) };
    set ReadEndIndex(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3D4, _p) };
    set FastForwardMessageTimer(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3D6, _p) };
    set CharacterXPosition(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3D8, _p) };
    set CharacterYPosition(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3DA, _p) };
    set CharacterColor(_p: Buffer) { this.ModLoader.emulator.rdramWriteBuffer(this.Ptr + 0x00E3DC, _p) };
    set SelectionMode(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E3E4, _p) };
    set MessageChoiceIndex(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E3E5, _p) };
    set ItemDisplayFlag(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E3E6, _p) };
    set StateTimer(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E3E7, _p) };
    set MessageSpeed(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3E8, _p) };
    set MessageSpeedOriginal(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3EA, _p) };
    set OcarinaLastPlayedSong(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3EC, _p) };
    set OcarinaMode(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3EE, _p) };
    set OcarinaAction(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3F0, _p) };
    set OcarinaCheckIndex(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3F2, _p) };
    set OcarinaSunSongFlag(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3F4, _p) };
    set MessageBoxNumber(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E3F6, _p) };
    set MessageBoxPrimitiveColorIndex(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E3F8, _p) };
    set MessageBoxShadowColor(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E3F9, _p) };
    set MessageBoxShift(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E3FA, _p) };
    set MessageBoxAnimation(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E3FB, _p) };
    set MessageBoxType2(_p: MessageBoxTypes) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E3FC, Number(_p)) };
    set MessageBoxColor(_p: Buffer) { this.ModLoader.emulator.rdramWriteBuffer(this.Ptr + 0x00E3FE, _p) };
    set MessageBoxCurrentAlpha(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E406, _p) };
    set TalkingActorPtr(_p: number) { this.ModLoader.emulator.rdramWrite32(this.Ptr + 0x00E408, _p) };
    set DisableWarpSongsBool(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E40C, _p) };
    set SunSongChoice(_p: number) { this.ModLoader.emulator.rdramWrite16(this.Ptr + 0x00E40E, _p) };
    set LastOcarinaNoteIndex(_p: number) { this.ModLoader.emulator.rdramWrite8(this.Ptr + 0x00E410, _p) };
}

export class MessageEntry implements IMessageEntry {
    MessageID: number;
    MessageBoxType: MessageBoxTypes;
    MessageBoxPosition: MessageBoxPositions;
    MessageString: string;
    ChoiceCallback?: (choiceIndex: number)=>void;

    constructor(id: number, type: MessageBoxTypes, pos: MessageBoxPositions, msg: string, callback?: (choiceIndex: number)=>void) {
        this.MessageID = id;
        this.MessageBoxType = type;
        this.MessageBoxPosition = pos;
        this.MessageString = msg;
        this.ChoiceCallback = callback;
    }

    ChoiceFunction(choiceIndex: number) {
        if (this.ChoiceCallback !== undefined) {
            this.ChoiceCallback(choiceIndex);
        }
    }
}

/*
Here's a lovely example of setting up choice options in a custom message.

CustomMessage = new MessageEntry(
    0x011A,
    MessageBoxTypes.NORMAL,
    MessageBoxPositions.BOTTOM,
    "Aren't you a good-looking character?\n[ch2][color=0x42]\nYes\nNo[/color]",
    (choiceIndex: number) => {
        if (Message_GetState(this.MessageCtx) === TextStates.CLOSING) {
            switch(choiceIndex) {
                case 0: { Yes } break;
                case 1: { No } break;
                case 2: { Option 3 if Applicable } break;
                default: break;
            }
        }
    }
);
*/