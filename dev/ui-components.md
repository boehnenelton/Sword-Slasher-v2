# dev/ui-components.md - Component Specification Ledger

## Components Summary

### 1. GameViewport (`src/components/GameViewport.tsx`)
- **Container**: HTML5 Canvas pixel-art renderer with retro CRT scanline overlay option.
- **Controls**: Interactive game rendering, top-down camera following Shadow Link, directional sword slash, spin attack visual effects, Ganon dark aura particles, Zelda kidnap trigger.
- **Data Source**: BEJSON 105 grid cells, chunk matrices, actor instances, world objects, and physics bodies.

### 2. IntroStartScreen (`src/components/IntroStartScreen.tsx`)
- **Visuals**: Pixel art logo, floating dark cubes (BEJSON 104/105 cube taxonomy), pulsing dark red aura, Shadow Link silhouette.
- **Audio**: Web Audio API retro chiptune synth engine playing ominous dark chiptune music.
- **Actions**: "START DARK QUEST", "INSTRUCTIONS & CONTROLS", "TOGGLE AUDIO", "SETTINGS".

### 3. DialogueOverlay (`src/components/DialogueOverlay.tsx`)
- **Visuals**: Pixel-art dialogue box with character portrait (Ganon, Shadow Link, Princess Zelda, Hermit, Guard).
- **Function**: Parses BEJSON 105 `events.105.bejson` opcode scripts (`SHOW_DIALOGUE`, `PLAY_SFX`, `GIVE_ITEM`, `OBJECTIVE_SET`).

### 4. GameHUD (`src/components/GameHUD.tsx`)
- **Elements**: Hearts Container (Health Points), Magic Bar, Active Item/Weapon Badge, Level Title, Quest Objective Tracker, Live BEJSON 105 Telemetry (FPS, Physics Bodies, Collisions).

### 5. HorizToolbar (`src/components/HorizToolbar.tsx`)
- **Behavior**: Contextual scrolling header toolbar with section buttons (Game Canvas, File Hub / Inventory, BEJSON Database Viewer, Telemetry HUD, Settings, About / Meta-UI).

### 6. MetaUIModal (`src/components/MetaUIModal.tsx`)
- **Structure**: Three-Tab Architecture (Tab 1: About / Account with Elton Boehnen credit, Tab 2: Change Log, Tab 3: Reusable Assets Schema Exporter with Copy/Save/ZIP).

### 7. SettingsModal (`src/components/SettingsModal.tsx`)
- **Features**: Audio volume, CRT scanline toggle, difficulty, Gemini AI key configuration with compulsory `[ ] Enable External Custom Keys` toggle checkbox.
