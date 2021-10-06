import { StringDecoder } from "string_decoder";

const ControlCodeMap: Record<string, string> = {
    "br": "\x04",
    "/color": "\x05\x40",
    "i": "\x08",
    "/i": "\x09",
    "stay": "\x0A",
    "event": "\x0B",
    "UNK_0D": "\x0D",
    "name": "\x0F",
    "ocarina": "\x10",
    "UNK_11": "\x11",
    "marathon": "\x16",
    "race": "\x17",
    "points": "\x18",
    "skulltulas": "\x19",
    "noskip": "\x1A",
    "ch2": "\x1B",
    "ch3": "\x1C",
    "fish": "\x1D",
    "time": "\x1F",
    "A": "\x9F",
	"B": "\xA0",
	"C": "\xA1",
	"L": "\xA2",
	"R": "\xA3",
	"Z": "\xA4",
	"^": "\xB5", // work around for the second pass
	"v": "\xA6",
	"<": "\xA7",
	">": "\xA8",
	"TARGET": "\xA9",
	"STICK": "\xAA",
	"+": "\xAB"
}

const ValControlCodeMap: Record<string, (num: number) => string> = {
    "br": num => String.fromCharCode(0x0C, num),
    "color": num => String.fromCharCode(0x05, num),
    "step": num => String.fromCharCode(0x06, num),
    "fade": num => String.fromCharCode(0x0E, num),
    "icon": num => String.fromCharCode(0x13, num),
    "speed": num => String.fromCharCode(0x14, num),
    "record": num => String.fromCharCode(0x1E, num),
    "next": num => {
        let buf = Buffer.alloc(2);
        buf.writeUInt16BE(num);
        return String.fromCharCode(0x07, buf[0], buf[1]);
    },
    "sound": num => {
        let buf = Buffer.alloc(2);
        buf.writeUInt16BE(num);
        return String.fromCharCode(0x12, buf[0], buf[1]);
    },
    "bg": num => {
        let buf = Buffer.alloc(4);
        buf.writeUInt32BE(num);
        return String.fromCharCode(0x15, buf[1], buf[2], buf[3]);
    },
}

function parse_control_codes(str: string) {
    str = str.replace(/\n/g, "\x01");
    const reg1 = new RegExp(`\\[(${Object.keys(ControlCodeMap).join("|").replace(/\//g, "\\/").replace(/\+/g, "\\+").replace(/\^/g, "\\^")})\\]`, "g");
    // console.log(reg1)
    str = str.replace(reg1, (match, key) => ControlCodeMap[key]);
    const reg2 = new RegExp(`\\[(${Object.keys(ValControlCodeMap).join("|")})=([^\\]]+)\\]`, "g");
    // console.log(reg2)
    str = str.replace(reg2, (match, key, arg) => {
        // console.log(`key: ${key}, parsed: ${Number.parseInt(arg).toString(16).toUpperCase()}, buf: ${Buffer.from(ValControlCodeMap[key](Number.parseInt(arg))).toString('hex').toUpperCase()}`);
        return ValControlCodeMap[key](Number.parseInt(arg));
    });
    
    return str;
}

function char_to_oot(code: string) {
    switch (code) {
        case "\x5C": return "";
        case "\xA5": return "\x5C";
        case "\xB5": return "\xA5";
        case "\u203E": return "\x7F";
        case "\xC0": return "\x80";
        case "\xC1": return "\x81";
        case "\xEE": return "\x81";
        case "\xC2": return "\x82";
        case "\xC4": return "\x83";
        case "\xC7": return "\x84";
        case "\xC8": return "\x85";
        case "\xC9": return "\x86";
        case "\xCA": return "\x87";
        case "\xCB": return "\x88";
        case "\xCF": return "\x89";
        case "\xD4": return "\x8A";
        case "\xD6": return "\x8B";
        case "\xD9": return "\x8C";
        case "\xDB": return "\x8D";
        case "\xDC": return "\x8E";
        case "\xDF": return "\x8F";
        case "\xE0": return "\x90";
        case "\xE1": return "\x91";
        case "\xE2": return "\x92";
        case "\xE4": return "\x93";
        case "\xE7": return "\x94";
        case "\xE8": return "\x95";
        case "\xE9": return "\x96";
        case "\xEA": return "\x97";
        case "\xEB": return "\x98";
        case "\xEF": return "\x99";
        case "\xF4": return "\x9A";
        case "\xF6": return "\x9B";
        case "\xF9": return "\x9C";
        case "\xFB": return "\x9D";
        case "\xFC": return "\x9E";
        default: return code;
    }
}

export default function str_to_oot(str: string) {
    let chars = parse_control_codes(str).split("");
    let buf = Buffer.alloc(chars.length + 1);
    for (let i = 0; i < chars.length; i++) {
        buf[i] = char_to_oot(chars[i]).charCodeAt(0);
    }
    buf[buf.length - 1] = 0x02;
    return buf;
}