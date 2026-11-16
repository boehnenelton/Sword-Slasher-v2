1.1 Subpixel Velocity Accumulation & Terrain Modifiers
During each non-lag NTSC frame (incremented via the 8-bit frame counter at $1A ; Spannerisms
PRNG Explication), the movement engine reads the filtered D-pad state at $F0 / $F4 and
writes Link's intended walking directions into bitwise register $67 ( 0000abcd : Up, Down, Left,
Right). Speed index register $5E and speed modifier $57 index a velocity lookup table in ROM
that writes signed per-frame pixel deltas into $30 ( dY ) and $31 ( dX ) (Bank $7E RAM Map).
Because SNES pixel coordinates are integers, fractional speeds accumulate across frames
before incrementing $20 or $22 (ZSR.GG Movement & Superspeed Documentation):
Movement State RAM State /
Flag
Cardinal
Velocity
Diagonal
Velocity
Kinematic Notes &
Modifiers
Normal Walk $5D=0x00,
$5E=0x00
1.500 px/f ~1.0625 px/f Alternates 1 px and
2 px steps; subpixel
accumulator resets
on stop (ZSR.GG).
PAGE 2 OF 10ALTTP COMBAT PHYSICS, TIMING & ENEMY AI REPORT
Movement State RAM State /
Flag
Cardinal
Velocity
Diagonal
Velocity
Kinematic Notes &
Modifiers
Tall Grass / Shallow
Water
$0114 Tile
Check
~1.125–1.25
px/f
~0.875 px/f Slight drag modifier
via $57 ( 0x01–
0x0F ); triggers
SFX
$012E=0x1A/0x1
C (00:58:09).
Manual Stairs /
Ladders
$58 & 0x07
== 0x07
0.6875 px/f N/A (1D
Axis)
Requires $02C0
nonzero; stair-
pumping
approaches 1.0
px/f (ZSR.GG).
Pegasus Boots Dash $5E=0x10,
$0372=1
4.000 px/f 2.625 px/f Preceded by 32-
frame charge-in-
place ( $02F1:
0x40→0x20 ) (RAM
Map; ZSR.GG).
Moving Floor
(Mothula)
$0320,
$0310/$0312
Base ± Floor
V
Base ± Floor
V
16-bit conveyor
velocity vectors
( $0310 Y, $0312
X) add directly to
Link (RAM Map).
KINEMATIC PIPELINE: D-PAD INPUT, DIAGONAL WALL SLIDING & DASH BONK RECOIL
1. INPUT & FACING LATCH
$F0/$F4: Joypad 1 Poll
$67: Walk Bitmask (UDLR)
$2F: Facing (0=U,2=D,4=L,6=R)
$50: Facing Lock (Sword Held)
First-input latch holds cardinal
facing during 8-way motion
Deltas → $30 (dY), $31 (dX)
2. WALL DEFLECTION ($6B/$6D)
Tiles 0x10–0x13 (\ and /)
\ Wall: U=0x1A R=0x25 D=0x15 L=0x2A
/ Wall: U=0x19 L=0x26 R=0x29 D=0x16
45° Angle → Slide Along Wall
90° Angle → Deadlock ($6D)
Ledge Jump: N-frame push into
$5D = 0x11 (Falling State)
3. DASH & BONK PHYSICS
$02F1: 0x40 → 0x20 (32f)
$5E = 0x10 (4.0 px/f Dash)
$0372: Dash/Bonk Active Flag
Turn Cancel → $5D = 0x12 Skid
Hard Wall Hit → $5D = 0x02
Z-Axis Hop ($24) + Screen Shake
Ancilla $1D + SFX $02F8
FIG 1. Subpixel Movement, Diagonal Wall Deflection & Pegasus Dash Recoil State Machine
(Bank $7E RAM Map; DaveControl 00:36:53–00:47:18).
1.2 Diagonal Wall-Sliding Math & Pegasus Boots Dash States
When Link contacts an angled wall (tile types 0x10 through 0x13 , tracked in bitfield
$38[0x02] ), the collision resolver compares Link's movement vector against the wall slope and
PAGE 3 OF 10ALTTP COMBAT PHYSICS, TIMING & ENEMY AI REPORT
writes a state code into $6B (Bank $7E RAM Map; DaveControl, 00:42:32–00:43:11): against a
\ wall, moving Up writes 0x1A , Right writes 0x25 , Down writes 0x15 , and Left writes 0x2A ;
against a / wall, moving Up writes 0x19 , Left writes 0x26 , Right writes 0x29 , and Down
writes 0x16 . If Link's input vector hits the wall at a 45° incidence angle, the engine projects his
motion along the wall tangent so he slides smoothly around corners. Conversely, if the player
holds two orthogonal inputs directly perpendicular (90°) into a diagonal wall, the value transfers
to deadlock register $6D and Link halts in place.
Activating the Pegasus Boots initializes countdown timer $02F1 at 0x40 (64) and decrements it
to 0x20 (32), locking Link in a 32-frame stationary wind-up (Bank $7E RAM Map) before
launching him at 4.0 px/frame ( $5E = 0x10 ) with bounce flag $0372 = 1 . Pressing a non-
dash direction transitions Link into skid state $5D = 0x12 ( $012E = 0x23 slip sound), whereas
colliding with a solid obstacle triggers state $5D = 0x02 (recoil), spawns screen-shake ancilla
$1D (Spannerisms Ancilla Table), launches Link upward along the Z-axis ( $24 ), and sets flag
$02F8 to play a thud when his bounce lands.
02 SWORDPLAY FRAME TIMING, HITBOX GEOMETRY & SPIN
ATTACK
To appreciate how A Link to the Past modernized top-down swordplay, DaveControl (01:26:32–
01:46:08) and Displaced Gamers (00:10:03–00:22:30, 00:31:45–00:32:55) contrast it directly
with the assembly logic of Zelda 1. In Zelda 1, pressing A cycles RAM state $B9 through a rigid
15-frame linear stab: 4 frames of wind-up (State 1 , where Link pulls his shield aside with zero
hitbox), 8 active collision frames (State 2 , where the subroutine compares |Weapon_Center -
Enemy_Center| against a 12×16 or 16×12 pixel box offset by +6, +8 ), and 3 retraction
recovery frames (States 3, 4, 5 , 1 frame each) before returning to 0 (Displaced Gamers).
Because Zelda 1's stab only covered a narrow forward rectangle, any enemy approaching from a
45° diagonal angle was impossible to hit without repositioning.
SWORDPLAY EVOLUTION: NES 15-FRAME STAB VS. SNES ARCING SLASH & SPIN ATTACK ($3C)
A. NES ZELDA 1 LINEAR STAB (RAM $B9 // 15 FRAMES)
St 1: 4f Wind St 2: 8f Active (12x16) St 3-5: 3f End
Linear hitbox; zero diagonal quadrant coverage
B. SNES ALTTP 180° ARCING SLASH (RAM $3A / $3D)
1. Off-Hand Arc 2. 45° Diagonal 3. Apex Extension
Sweeps diagonal quadrants; buffered via timer $3D
C. HOLD-B STATE MACHINE ($3C / $50 / $031C–$031E)
• Hold B ($3A Bit 7 = 1) → Locks Facing ($50 != 0)
• Active Poke State: Blade extended straight out
Deals reduced Poke Class ($1, $1, $2, $3); clinks walls
• Charge Threshold ($3C Lower Nibble Full + SFX 0x37)
Spawns charge sparkle Ancilla $3C → Max Sparkle $0D
• Release B → $3C Upper Nibble = 9, $5D = 0x03/0x1E
360° clockwise sweep via $031E (+4 offset per facing)
Promotes Damage Class +1 Tier (Classes $2, $3, $4, $5)
FIG 2. Frame-by-Frame Swordplay Architecture comparing Displaced Gamers' NES Trace with
SNES ALttP Sword & Spin Attack Registers (Spannerisms; RAM Map).
