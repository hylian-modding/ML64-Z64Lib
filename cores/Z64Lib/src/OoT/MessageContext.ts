import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { Z64 } from "../../API/imports";
import { IMessageContext, IMessageEntry, MessageBoxPositions, MessageBoxTypes, TextStates, MessageModes, MessageSelectionModes, IOOTCore } from "../../API/OoT/OOTAPI";
import str_to_oot from "../Common/MessageParser";

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

export class MessageBoxFunctions {

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