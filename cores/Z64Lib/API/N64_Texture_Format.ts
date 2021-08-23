/*
Color Formats:
RGBA	= 000
YUV	= 001
CI	= 010
IA	= 011
I	= 100

Bit Sizes:
4	= 00
8	= 01
16	= 10
32	= 11


RGBA16	= 0b00010 = 0x02
RGBA32	= 0b00011 = 0x03
YUV16	= 0b00110 = 0x06
CI4	    = 0b01000 = 0x08
CI8	    = 0b01001 = 0x09
IA4	    = 0b01100 = 0x0C
IA8	    = 0b01101 = 0x0D
IA16	= 0b01110 = 0x0E
I4	    = 0b10000 = 0x10
I8	    = 0b10001 = 0x11
*/

export const enum N64_Texture_Format {
    RGBA16	= 0x02,
    RGBA32	= 0x03,
    YUV16	= 0x06,
    CI4		= 0x08,
    CI8		= 0x09,
    IA4		= 0x0C,
    IA8		= 0x0D,
    IA16	= 0x0E,
    I4		= 0x10,
    I8		= 0x11
}