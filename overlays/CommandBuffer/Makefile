# make options
RELEASE_BUILD ?= 1
VRAM_ADDRESS ?= 0x80800000
ULTRALIB_PATH ?= ultralib/include

PROGRAM = CommandBuffer

OOT_BIN_PATH = bin_oot
MM_BIN_PATH = bin_mm
BIN_PATH = bin

SRC_DIRS  = src
C_FILES   = $(foreach dir,$(SRC_DIRS),$(wildcard $(dir)/*.c))
OOT_O_FILES := $(foreach file,$(C_FILES),$(OOT_BIN_PATH)/$(file).o)
MM_O_FILES := $(foreach file,$(C_FILES),$(MM_BIN_PATH)/$(file).o)

# check for custom compilers
ifeq ($(shell type mips64-o32-gcc >/dev/null 2>/dev/null; echo $$?), 0)
CROSS = mips64-o32-
else ifeq ($(shell type mips64-gcc >/dev/null 2>/dev/null; echo $$?), 0)
CROSS = mips64-
else ifeq ($(shell type mips-linux-gnu-gcc >/dev/null 2>/dev/null; echo $$?), 0)
CROSS = mips-linux-gnu-
else
CROSS = mips64-elf-
endif

# tools 
AS = $(CROSS)as
CC = $(CROSS)gcc
LD = $(CROSS)ld
OBJDUMP = $(CROSS)objdump
OBJCOPY = $(CROSS)objcopy
NOVL	= ./novl

# base dirs
BUILD_DIR = build
SRC_DIR = src
INCLUDE_DIR = include

# files for build
C_FILES = $(foreach dir,$(SRC_DIR),$(wildcard $(dir)/*.c))
O_FILES = $(foreach file,$(C_FILES),$(BUILD_DIR)/$(file).o)
O_FILES_OOT = $(foreach file,$(C_FILES),$(BUILD_DIR)/$(file).o_oot)
O_FILES_MM = $(foreach file,$(C_FILES),$(BUILD_DIR)/$(file).o_mm)

# flags
U64_D_FLAGS = -D_LANGUAGE_C -DF3DEX_GBI_2
ML64_D_FLAGS = -D_MLDEBUG -DGAMESTATE_CAVE
GAME_VERSION_D_FLAGS = -DGAME_VERSION_1_0
I_FLAGS = -I$(INCLUDE_DIR) -I$(LIBZ64_PATH) -I$(ULTRALIB_PATH)

ifeq ($(RELEASE_BUILD),1)
OPT_FLAGS = -O1
OPT_FLAGS2 = -mfix4300 -mno-check-zero-division -mno-memcpy -mno-shared -fno-unroll-loops -ffreestanding -mframe-header-opt -fno-reorder-blocks -fno-inline-functions -falign-functions=16 -fwrapv -fmerge-all-constants -ffast-math -fno-stack-protector -fmodulo-sched -fmodulo-sched-allow-regmoves -fira-hoist-pressure -fweb -floop-interchange -fsplit-paths -fallow-store-data-races
OPT_FLAGS3 = 
else
OPT_FLAGS = -g3
OPT_FLAGS2 = -mfix4300 -mno-check-zero-division -mno-memcpy -mno-shared -fno-unroll-loops -ffreestanding -mframe-header-opt -fno-inline-functions -falign-functions=64 -fwrapv
endif

CFLAGS = -G 0 $(I_FLAGS) $(U64_D_FLAGS) $(ML64_D_FLAGS) $(GAME_VERSION_D_FLAGS) $(OPT_FLAGS) $(OPT_FLAGS2) $(OPT_FLAGS3) -std=gnu11 -mtune=vr4300 -march=vr4300 -mabi=32 -mips3 -w
LDFLAGS = -L$(LIBZ64_PATH) -T libzelda64.ld --emit-relocs


default: entry dirs $(PROGRAM)

$(OOT_BIN_PATH)/%.c.o: %.c dirs
	$(CC) -c $(CFLAGS) -DGAME_OOT -o $@ $<

$(MM_BIN_PATH)/%.c.o: %.c dirs
	$(CC) -c $(CFLAGS) -DGAME_MM -D_FINALROM -o $@ $<

$(OOT_BIN_PATH)/$(PROGRAM).oot: $(OOT_O_FILES)
	$(LD) $(LDFLAGS) -o $@.elf $(OOT_O_FILES)
	$(NOVL) -s -c -A $(VRAM_ADDRESS) -o $@.ovl $@.elf

$(MM_BIN_PATH)/$(PROGRAM).mm: $(MM_O_FILES)
	$(LD) $(LDFLAGS) -o $@.elf $(MM_O_FILES)
	$(NOVL) -s -c -A $(VRAM_ADDRESS) -o $@.ovl $@.elf

$(PROGRAM): $(OOT_BIN_PATH)/$(PROGRAM).oot $(MM_BIN_PATH)/$(PROGRAM).mm
	cp $(OOT_BIN_PATH)/$(PROGRAM).oot.ovl $(BIN_PATH)/$(PROGRAM)_oot.ovl
	cp $(MM_BIN_PATH)/$(PROGRAM).mm.ovl $(BIN_PATH)/$(PROGRAM)_mm.ovl

dirs: entry
	mkdir -p $(BIN_PATH)
	$(foreach dir,$(SRC_DIRS),$(shell mkdir -p $(OOT_BIN_PATH)/$(dir)))
	$(foreach dir,$(SRC_DIRS),$(shell mkdir -p $(MM_BIN_PATH)/$(dir)))

entry:
	@echo -n "ENTRY_POINT = "$(VRAM_ADDRESS) > entry.ld
	@echo ";" >> entry.ld

clean:
	rm -rf $(OOT_BIN_PATH) $(MM_BIN_PATH) $(BIN_PATH)

