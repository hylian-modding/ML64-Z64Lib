.set noreorder

.section .text

# Very fast memset, length MUST be aligned to 4 bytes
# A0 = dest, A1 = value, A2 = length
.global memset_fast_32
memset_fast_32:
1$:
    sw      $a1, 0x0($a0)
    addi    $a2, -4
    bnez    $a2, 1$
    addi    $a0, 4
2$:
    jr      $ra
    nop


