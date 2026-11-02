# Sword Slasher Engine JS: Direct Translation to BEJSON 105 (Integrity Era 105 Specification)

**Document Classification:** Direct BEJSON 104 → BEJSON 105 Schema, Folder & Payload Translation  
**Target System:** `Sword_Slasher_Engine_JS` (Dark Link Theme · Release 300 · Integrity Era 105)  
**Author Attribution:** Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · https://www.google.com/search?q=github.com/boehnenelton  
**Applied Standards:** `bejson-104-core` (105 Headroom) · `code-taxonomy-architect` · `component-taxonomy-architect` · `terms-cartographer`  
**Effective Date:** October 25, 2026  

## 1. BEJSON 104 to BEJSON 105 Direct Translation Rules

Translating `Sword_Slasher_Engine_JS` from **Foundational Era 104 (`104` / `104a` / `104db`)** to **Integrity Era 105 (`105` / `105a` / `105db`)** preserves positional array performance (`Fields` + 2D `Values`) while upgrading every separated folder entity with **inline relational constraints, write-owner lock headers, and dual-tier `type` enforcement**.

| Specification Dimension | Era 104 (`104` / `104a` / `104db`) | Era 105 Direct Translation (`105` / `105a` / `105db`) |
| :--- | :--- | :--- |
| **Format Version String** | `"Format_Version": "104"` \| `"104a"` \| `"104db"` | `"Format_Version": "105"` \| `"105a"` \| `"105db"` |
| **File Extensions** | `104a.mfdb.bejson`, `*.104.bejson`, `*.104a.bejson` | `105a.mfdb.bejson`, `*.105.bejson`, `*.105a.bejson` |
| **Mandatory Root Headers** | `Format`, `Format_Version`, `Format_Creator`, `Records_Type`, `Fields`, `Values` | Adds `Schema_Version: "2.0.0-105"`, `Write_Owner_Module`, `Primary_Key_Field`, `Type_Discriminator_Field`, `Domain_Type_Field` |
| **Bidirectional Parent Link** | `"Parent_Hierarchy": "104a.mfdb.bejson"` | `"Parent_Hierarchy": "../manifest/105a.mfdb.bejson"` |
| **Field Descriptor Object** | `{"name": "actor_uuid", "type": "string"}` | `{"name": "actor_uuid", "type": "string", "required": true, "primary_key": true}` |
| **Inline Foreign Key Rules** | Stored externally in `schema_registry` | Declared inline on the field descriptor: `"foreign_key": {"references": "levels.lvl_uuid", "on_delete": "cascade"}` |
| **Inline Type Enum Rules** | Unconstrained `string` | Declared inline on `<prefix>_record_type` and `<prefix>_*_type` fields via `"enum": [...]` |
| **Positional `type` Layout** | Ad-hoc or absent | **Pos 0**: `<prefix>_uuid` · **Pos 1**: `<prefix>_record_type` · **Pos 2**: `<prefix>_<domain>_type` |

## 2. BEJSON 105 Folder-Separated Directory Architecture

Every data type resides in its own dedicated folder using `.105.bejson` (entity tables) or `.105a.bejson` (manifests & configuration tables):

```text
Sword_Slasher_Engine_JS/
├── config/
│   ├── project_meta/
│   │   └── bejson_project.105a.bejson          [Format_Version: "105a" | Prefix: proj_ ]
│   └── engine_config/
│       └── engine_config.105a.bejson           [Format_Version: "105a" | Prefix: cfg_  ]
├── data/
│   ├── manifest/
│   │   └── 105a.mfdb.bejson                    [Format_Version: "105a" | Prefix: mfdb_ ]
│   ├── schemas/
│   │   └── schema_registry.105a.bejson         [Format_Version: "105a" | Prefix: schm_ ]
│   ├── biomes/
│   │   └── biomes.105.bejson                   [Format_Version: "105"  | Prefix: biome_]
│   ├── levels/
│   │   └── levels.105.bejson                   [Format_Version: "105"  | Prefix: lvl_  ]
│   ├── chunks/
│   │   └── cave_chunk_0_0.105.bejson           [Format_Version: "105"  | Prefix: chk_  ]
│   ├── actor_stats/
│   │   └── actor_stats.105.bejson              [Format_Version: "105"  | Prefix: stat_ ]
│   ├── actors/
│   │   └── actors.105.bejson                   [Format_Version: "105"  | Prefix: actor_]
│   ├── items/
│   │   └── items.105.bejson                    [Format_Version: "105"  | Prefix: item_ ]
│   ├── objects/
│   │   └── objects.105.bejson                  [Format_Version: "105"  | Prefix: obj_  ]
│   ├── object_rules/
│   │   └── object_rules.105.bejson             [Format_Version: "105"  | Prefix: rule_ ]
│   ├── portals/
│   │   └── portals.105.bejson                  [Format_Version: "105"  | Prefix: port_ ]
│   ├── events/
│   │   └── events.105.bejson                   [Format_Version: "105"  | Prefix: evt_  ]
│   ├── sprites/
│   │   └── sprites_manifest.105a.bejson        [Format_Version: "105a" | Prefix: spr_  ]
│   ├── tiles/
│   │   └── tiles_manifest.105a.bejson          [Format_Version: "105a" | Prefix: tile_ ]
│   ├── audio/
│   │   └── audio_manifest.105a.bejson          [Format_Version: "105a" | Prefix: aud_  ]
│   ├── runtime_physics/
│   │   └── physics_world.105.bejson            [Format_Version: "105"  | Prefix: phys_ ]
│   ├── runtime_assets/
│   │   └── asset_cache.105a.bejson             [Format_Version: "105a" | Prefix: asst_ ]
│   ├── runtime_events/
│   │   └── event_bus_log.105.bejson            [Format_Version: "105"  | Prefix: ebus_ ]
│   ├── runtime_grid/
│   │   └── grid_cells.105.bejson               [Format_Version: "105"  | Prefix: grid_ ]
│   └── runtime_telemetry/
│       └── frame_telemetry.105.bejson          [Format_Version: "105"  | Prefix: telm_ ]
```

## 3. Master 104 → 105 Translation Map Across All 22 Data Types

| # | Legacy / 104 Path | Translated 105 Path | 105 Format | `Records_Type[0]` | Pos 0 PK | Pos 1 Record `type` | Pos 2 Domain `type` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `data/104a.mfdb.bejson` | `data/manifest/105a.mfdb.bejson` | `105a` | `MfdbManifest` | `mfdb_uuid` | `mfdb_record_type` | `mfdb_entity_category_type` |
| **2** | `data/schemas/schema_registry.104a.bejson` | `data/schemas/schema_registry.105a.bejson` | `105a` | `SchemaRegistry` | `schm_uuid` | `schm_record_type` | `schm_format_variant_type` |
| **3** | `data/biomes/biomes.104.bejson` | `data/biomes/biomes.105.bejson` | `105` | `WorldBiome` | `biome_uuid` | `biome_record_type` | `biome_generation_mode_type` |
| **4** | `data/levels/levels.104.bejson` | `data/levels/levels.105.bejson` | `105` | `GameLevel` | `lvl_uuid` | `lvl_record_type` | `lvl_environment_zone_type` |
| **5** | `data/chunks/cave_chunk_0_0.104.bejson` | `data/chunks/cave_chunk_0_0.105.bejson` | `105` | `TileChunkMatrix` | `chk_uuid` | `chk_record_type` | `chk_storage_encoding_type` |
| **6** | `data/actor_stats/actor_stats.104.bejson` | `data/actor_stats/actor_stats.105.bejson` | `105` | `ActorArchetype` | `stat_uuid` | `stat_record_type` | `stat_archetype_behavior_type` |
| **7** | `data/actors/actors.104.bejson` | `data/actors/actors.105.bejson` | `105` | `ActorInstance` | `actor_uuid` | `actor_record_type` | `actor_entity_role_type` |
| **8** | `data/items/items.104.bejson` | `data/items/items.105.bejson` | `105` | `ItemDefinition` | `item_uuid` | `item_record_type` | `item_category_type` |
| **9** | `data/objects/objects.104.bejson` | `data/objects/objects.105.bejson` | `105` | `WorldObject` | `obj_uuid` | `obj_record_type` | `obj_prop_category_type` |
| **10** | `data/object_rules.bejson` | `data/object_rules/object_rules.105.bejson` | `105` | `ObjectPhysicsRule` | `rule_uuid` | `rule_record_type` | `rule_category_type` |
| **11** | `data/portals/portals.104.bejson` | `data/portals/portals.105.bejson` | `105` | `WorldPortal` | `port_uuid` | `port_record_type` | `port_transition_trigger_type` |
| **12** | `data/events/events.104.bejson` | `data/events/events.105.bejson` | `105` | `GameEvent` | `evt_uuid` | `evt_record_type` | `evt_trigger_type` |
| **13** | `data/assets/sprites_manifest.104a.bejson` | `data/sprites/sprites_manifest.105a.bejson` | `105a` | `SpriteAssetManifest` | `spr_uuid` | `spr_record_type` | `spr_animation_sheet_type` |
| **14** | `data/assets/tiles_manifest.104a.bejson` | `data/tiles/tiles_manifest.105a.bejson` | `105a` | `TileAssetManifest` | `tile_uuid` | `tile_record_type` | `tile_layer_category_type` |
| **15** | `data/assets/audio_manifest.104a.bejson` | `data/audio/audio_manifest.105a.bejson` | `105a` | `AudioAssetManifest` | `aud_uuid` | `aud_record_type` | `aud_channel_category_type` |
| **16** | `PhysicsWorld` (in-memory `104`) | `data/runtime_physics/physics_world.105.bejson` | `105` | `RuntimePhysicsBody` | `phys_uuid` | `phys_record_type` | `phys_kinematic_body_type` |
| **17** | `AssetRegistry` (in-memory `104a`) | `data/runtime_assets/asset_cache.105a.bejson` | `105a` | `RuntimeAssetCache` | `asst_uuid` | `asst_record_type` | `asst_resource_media_type` |
| **18** | `EventRegistry` (in-memory `104`) | `data/runtime_events/event_bus_log.105.bejson` | `105` | `RuntimeEventLog` | `ebus_uuid` | `ebus_record_type` | `ebus_signal_channel_type` |
| **19** | `Grid` (in-memory `104`) | `data/runtime_grid/grid_cells.105.bejson` | `105` | `RuntimeGridCell` | `grid_uuid` | `grid_record_type` | `grid_terrain_surface_type` |
| **20** | `EngineTelemetry` (in-memory HUD) | `data/runtime_telemetry/frame_telemetry.105.bejson` | `105` | `RuntimeTelemetryFrame` | `telm_uuid` | `telm_record_type` | `telm_health_severity_type` |
| **21** | `config/config.json` (`104a`) | `config/engine_config/engine_config.105a.bejson` | `105a` | `EngineConfiguration` | `cfg_uuid` | `cfg_record_type` | `cfg_parameter_value_type` |
| **22** | `bejson_project.json` (`104a`) | `config/project_meta/bejson_project.105a.bejson` | `105a` | `ProjectMetadata` | `proj_uuid` | `proj_record_type` | `proj_package_category_type` |

## 4. Direct BEJSON 105 Document Translations (All 22 Data Types)

### 4.1 `data/manifest/105a.mfdb.bejson` (`MfdbManifest`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105a",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Database_Title": "Sword Slasher RPG MFDB 105 Database",
  "Database_Version": "2.0.0",
  "Package_Version": "101",
  "Project_GUID": "7487b35b-cf83-402f-93e7-f796f61cac6d",
  "Versioned_UUID": "7c3a1afc-fa29-4a3c-9588-083f8e4b9789",
  "Write_Owner_Module": "lib_bejson_Gaming_mfdb_manager.js",
  "Primary_Key_Field": "mfdb_uuid",
  "Type_Discriminator_Field": "mfdb_record_type",
  "Domain_Type_Field": "mfdb_entity_category_type",
  "Records_Type": ["MfdbManifest"],
  "Fields": [
    { "name": "mfdb_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "mfdb_record_type", "type": "string", "required": true, "enum": ["MfdbManifest"] },
    { "name": "mfdb_entity_category_type", "type": "string", "required": true, "enum": ["SCHEMA", "WORLD", "ACTOR", "ITEM", "EVENT", "ASSET", "CHUNK", "RUNTIME", "CONFIG"] },
    { "name": "mfdb_entity_slug_code", "type": "string", "required": true },
    { "name": "mfdb_folder_directory_path", "type": "string", "required": true },
    { "name": "mfdb_relative_file_path", "type": "string", "required": true },
    { "name": "mfdb_execution_load_order_count", "type": "integer", "required": true },
    { "name": "mfdb_format_version_type", "type": "string", "required": true, "enum": ["105", "105a", "105db"] },
    { "name": "mfdb_is_required_boot_flag", "type": "boolean", "required": true },
    { "name": "mfdb_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    ["8711ea5c-c3a4-4e66-b630-8345f8b2d332", "MfdbManifest", "SCHEMA", "schema_registry", "data/schemas/", "../schemas/schema_registry.105a.bejson", 1, "105a", true, "2026-10-25T21:04:00Z"],
    ["8a8afe8c-ba10-490d-a042-e000e1159951", "MfdbManifest", "WORLD", "biomes", "data/biomes/", "../biomes/biomes.105.bejson", 10, "105", true, "2026-10-25T21:04:00Z"],
    ["c94e120a-3b11-48f2-9c12-15b20d9f4110", "MfdbManifest", "WORLD", "object_rules", "data/object_rules/", "../object_rules/object_rules.105.bejson", 15, "105", true, "2026-10-25T21:04:00Z"],
    ["d3dd6ec1-54ee-48a5-aa1a-0d7ccdd27067", "MfdbManifest", "WORLD", "levels", "data/levels/", "../levels/levels.105.bejson", 20, "105", true, "2026-10-25T21:04:00Z"],
    ["d5c2cc9b-5f5f-47d5-85a3-bb0462051230", "MfdbManifest", "ACTOR", "actor_stats", "data/actor_stats/", "../actor_stats/actor_stats.105.bejson", 30, "105", true, "2026-10-25T21:04:00Z"],
    ["e3a57343-6c59-4996-8265-d81dc2b0ea10", "MfdbManifest", "ASSET", "sprites_manifest", "data/sprites/", "../sprites/sprites_manifest.105a.bejson", 35, "105a", false, "2026-10-25T21:04:00Z"],
    ["fd7762e9-4b52-488f-95e7-df077315b444", "MfdbManifest", "ASSET", "tiles_manifest", "data/tiles/", "../tiles/tiles_manifest.105a.bejson", 36, "105a", false, "2026-10-25T21:04:00Z"],
    ["a19f44d2-81c3-4e01-b712-5549e81c0921", "MfdbManifest", "ASSET", "audio_manifest", "data/audio/", "../audio/audio_manifest.105a.bejson", 37, "105a", false, "2026-10-25T21:04:00Z"],
    ["6afd57c2-f0ab-4e8b-84a8-8454bcdbb900", "MfdbManifest", "ITEM", "items", "data/items/", "../items/items.105.bejson", 40, "105", true, "2026-10-25T21:04:00Z"],
    ["6690d77a-79f7-4282-a0a8-608820d4ac2e", "MfdbManifest", "ACTOR", "actors", "data/actors/", "../actors/actors.105.bejson", 50, "105", true, "2026-10-25T21:04:00Z"],
    ["8568c5c4-ca21-4704-952b-7af6219a9cea", "MfdbManifest", "WORLD", "portals", "data/portals/", "../portals/portals.105.bejson", 60, "105", true, "2026-10-25T21:04:00Z"],
    ["bcea9610-1e3a-4ff2-909a-b3f8e65d7c5f", "MfdbManifest", "EVENT", "events", "data/events/", "../events/events.105.bejson", 70, "105", true, "2026-10-25T21:04:00Z"],
    ["f13f2303-e8d7-41f2-8f63-d20ef390f04d", "MfdbManifest", "WORLD", "objects", "data/objects/", "../objects/objects.105.bejson", 80, "105", false, "2026-10-25T21:04:00Z"],
    ["fc6df8b6-5b73-4e7f-80f8-35d5c992f9cf", "MfdbManifest", "CHUNK", "chunks", "data/chunks/", "../chunks/cave_chunk_0_0.105.bejson", 90, "105", true, "2026-10-25T21:04:00Z"]
  ]
}
```

### 4.2 `data/schemas/schema_registry.105a.bejson` (`SchemaRegistry`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105a",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_schema_validator.js",
  "Primary_Key_Field": "schm_uuid",
  "Type_Discriminator_Field": "schm_record_type",
  "Domain_Type_Field": "schm_format_variant_type",
  "Records_Type": ["SchemaRegistry"],
  "Fields": [
    { "name": "schm_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "schm_record_type", "type": "string", "required": true, "enum": ["SchemaRegistry"] },
    { "name": "schm_format_variant_type", "type": "string", "required": true, "enum": ["105", "105a", "105db"] },
    { "name": "schm_domain_layer_type", "type": "string", "required": true, "enum": ["PERSISTENCE", "ASSET_MANIFEST", "RUNTIME_STATE", "SYSTEM_CONFIG"] },
    { "name": "schm_target_entity_name", "type": "string", "required": true },
    { "name": "schm_entity_prefix_code", "type": "string", "required": true },
    { "name": "schm_dedicated_folder_path", "type": "string", "required": true },
    { "name": "schm_relative_file_path", "type": "string", "required": true },
    { "name": "schm_primary_key_field_name", "type": "string", "required": true },
    { "name": "schm_type_discriminator_field_name", "type": "string", "required": true },
    { "name": "schm_domain_type_field_name", "type": "string", "required": true },
    { "name": "schm_foreign_keys_rules_json", "type": "string", "required": true },
    { "name": "schm_write_owner_module_name", "type": "string", "required": true },
    { "name": "schm_summary_description_text", "type": "string", "required": true },
    { "name": "schm_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    ["10500001-a001-4000-8000-000000000001", "SchemaRegistry", "105a", "PERSISTENCE", "MfdbManifest", "mfdb_", "data/manifest/", "../manifest/105a.mfdb.bejson", "mfdb_uuid", "mfdb_record_type", "mfdb_entity_category_type", "[]", "lib_bejson_Gaming_mfdb_manager.js", "Master MFDB 105 multi-file manifest", "2026-10-25T21:04:00Z"],
    ["10500002-a002-4000-8000-000000000002", "SchemaRegistry", "105", "PERSISTENCE", "WorldBiome", "biome_", "data/biomes/", "../biomes/biomes.105.bejson", "biome_uuid", "biome_record_type", "biome_generation_mode_type", "[{\"field\":\"biome_base_tile_uuid_fk\",\"references\":\"tiles.tile_uuid\",\"on_delete\":\"restrict\"}]", "lib_bejson_Gaming_world_generator.js", "Biome visual style and procedural scatter rules", "2026-10-25T21:04:00Z"],
    ["10500003-a003-4000-8000-000000000003", "SchemaRegistry", "105", "PERSISTENCE", "GameLevel", "lvl_", "data/levels/", "../levels/levels.105.bejson", "lvl_uuid", "lvl_record_type", "lvl_environment_zone_type", "[{\"field\":\"lvl_biome_uuid_fk\",\"references\":\"biomes.biome_uuid\",\"on_delete\":\"restrict\"},{\"field\":\"lvl_bgm_audio_uuid_fk\",\"references\":\"audio.aud_uuid\",\"on_delete\":\"set_null\"}]", "lib_bejson_Gaming_level_loader.js", "Game world level bounds and victory conditions", "2026-10-25T21:04:00Z"],
    ["10500004-a004-4000-8000-000000000004", "SchemaRegistry", "105", "PERSISTENCE", "TileChunkMatrix", "chk_", "data/chunks/", "../chunks/cave_chunk_0_0.105.bejson", "chk_uuid", "chk_record_type", "chk_storage_encoding_type", "[{\"field\":\"chk_lvl_uuid_fk\",\"references\":\"levels.lvl_uuid\",\"on_delete\":\"cascade\"}]", "lib_bejson_Gaming_grid_manager.js", "Spatial 16x16 tile chunk matrices", "2026-10-25T21:04:00Z"],
    ["10500005-a005-4000-8000-000000000005", "SchemaRegistry", "105", "PERSISTENCE", "ActorArchetype", "stat_", "data/actor_stats/", "../actor_stats/actor_stats.105.bejson", "stat_uuid", "stat_record_type", "stat_archetype_behavior_type", "[{\"field\":\"stat_default_sprite_uuid_fk\",\"references\":\"sprites.spr_uuid\",\"on_delete\":\"set_null\"}]", "lib_bejson_Gaming_actor_registry.js", "Base combat stats, progression, and role archetypes", "2026-10-25T21:04:00Z"],
    ["10500006-a006-4000-8000-000000000006", "SchemaRegistry", "105", "PERSISTENCE", "ActorInstance", "actor_", "data/actors/", "../actors/actors.105.bejson", "actor_uuid", "actor_record_type", "actor_entity_role_type", "[{\"field\":\"actor_lvl_uuid_fk\",\"references\":\"levels.lvl_uuid\",\"on_delete\":\"cascade\"},{\"field\":\"actor_stat_uuid_fk\",\"references\":\"actor_stats.stat_uuid\",\"on_delete\":\"restrict\"},{\"field\":\"actor_weapon_item_uuid_fk\",\"references\":\"items.item_uuid\",\"on_delete\":\"set_null\"},{\"field\":\"actor_armor_item_uuid_fk\",\"references\":\"items.item_uuid\",\"on_delete\":\"set_null\"},{\"field\":\"actor_interaction_evt_uuid_fk\",\"references\":\"events.evt_uuid\",\"on_delete\":\"set_null\"}]", "lib_bejson_Gaming_actor_controller.js", "Spawned game characters, monsters, and NPC instances", "2026-10-25T21:04:00Z"],
    ["10500007-a007-4000-8000-000000000007", "SchemaRegistry", "105", "PERSISTENCE", "ItemDefinition", "item_", "data/items/", "../items/items.105.bejson", "item_uuid", "item_record_type", "item_category_type", "[]", "lib_bejson_Gaming_inventory_manager.js", "Weapons, armor, consumables, and gear", "2026-10-25T21:04:00Z"],
    ["10500008-a008-4000-8000-000000000008", "SchemaRegistry", "105", "PERSISTENCE", "WorldObject", "obj_", "data/objects/", "../objects/objects.105.bejson", "obj_uuid", "obj_record_type", "obj_prop_category_type", "[{\"field\":\"obj_lvl_uuid_fk\",\"references\":\"levels.lvl_uuid\",\"on_delete\":\"cascade\"},{\"field\":\"obj_rule_uuid_fk\",\"references\":\"object_rules.rule_uuid\",\"on_delete\":\"restrict\"},{\"field\":\"obj_interaction_evt_uuid_fk\",\"references\":\"events.evt_uuid\",\"on_delete\":\"set_null\"}]", "lib_bejson_Gaming_object_manager.js", "Placed environmental props and containers", "2026-10-25T21:04:00Z"],
    ["10500009-a009-4000-8000-000000000009", "SchemaRegistry", "105", "PERSISTENCE", "ObjectPhysicsRule", "rule_", "data/object_rules/", "../object_rules/object_rules.105.bejson", "rule_uuid", "rule_record_type", "rule_category_type", "[{\"field\":\"rule_biome_uuid_fk\",\"references\":\"biomes.biome_uuid\",\"on_delete\":\"set_null\"}]", "lib_bejson_Gaming_bejson_physics.js", "Collider and interaction rules for world objects", "2026-10-25T21:04:00Z"],
    ["10500010-a010-4000-8000-000000000010", "SchemaRegistry", "105", "PERSISTENCE", "WorldPortal", "port_", "data/portals/", "../portals/portals.105.bejson", "port_uuid", "port_record_type", "port_transition_trigger_type", "[{\"field\":\"port_source_lvl_uuid_fk\",\"references\":\"levels.lvl_uuid\",\"on_delete\":\"cascade\"},{\"field\":\"port_target_lvl_uuid_fk\",\"references\":\"levels.lvl_uuid\",\"on_delete\":\"cascade\"},{\"field\":\"port_requires_item_uuid_fk\",\"references\":\"items.item_uuid\",\"on_delete\":\"set_null\"}]", "lib_bejson_Gaming_level_loader.js", "Level transitions and teleporters", "2026-10-25T21:04:00Z"],
    ["10500011-a011-4000-8000-000000000011", "SchemaRegistry", "105", "PERSISTENCE", "GameEvent", "evt_", "data/events/", "../events/events.105.bejson", "evt_uuid", "evt_record_type", "evt_trigger_type", "[{\"field\":\"evt_lvl_uuid_fk\",\"references\":\"levels.lvl_uuid\",\"on_delete\":\"cascade\"}]", "lib_bejson_Gaming_bejson_events.js", "Dialogue, triggers, and opcode scripts", "2026-10-25T21:04:00Z"]
  ]
}
```

### 4.3 `data/biomes/biomes.105.bejson` (`WorldBiome`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_world_generator.js",
  "Primary_Key_Field": "biome_uuid",
  "Type_Discriminator_Field": "biome_record_type",
  "Domain_Type_Field": "biome_generation_mode_type",
  "Records_Type": ["WorldBiome"],
  "Fields": [
    { "name": "biome_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "biome_record_type", "type": "string", "required": true, "enum": ["WorldBiome"] },
    { "name": "biome_generation_mode_type", "type": "string", "required": true, "enum": ["STATIC", "PROCEDURAL", "HYBRID"] },
    { "name": "biome_climate_category_type", "type": "string", "required": true, "enum": ["SUBTERRANEAN", "FOREST", "DUNGEON", "OVERWORLD"] },
    { "name": "biome_slug_code", "type": "string", "required": true },
    { "name": "biome_display_title", "type": "string", "required": true },
    { "name": "biome_base_tile_uuid_fk", "type": "string", "required": true, "foreign_key": { "references": "tiles.tile_uuid", "on_delete": "restrict" } },
    { "name": "biome_base_tile_slug_code", "type": "string", "required": true },
    { "name": "biome_cluster_rules_json", "type": "string", "required": true },
    { "name": "biome_scatter_rules_json", "type": "string", "required": true },
    { "name": "biome_ambient_color_hex", "type": "string", "required": true },
    { "name": "biome_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    [
      "0f94d339-50d0-4daf-aa01-88eeea870b2a",
      "WorldBiome",
      "HYBRID",
      "SUBTERRANEAN",
      "cave",
      "Forgotten Cavern",
      "7019444c-4dc1-4921-9784-77e5521fc8a2",
      "stone_floor",
      "{\"clusters\": [{\"tile\": \"stalagmite\", \"rate\": 0.08}, {\"tile\": \"ore_vein\", \"rate\": 0.04}]}",
      "{\"scatter\": [{\"object\": \"torch\", \"spacing\": 6}, {\"object\": \"rubble\", \"rate\": 0.15}]}",
      "#18181b",
      "2026-10-25T21:04:00Z"
    ]
  ]
}
```

### 4.4 `data/levels/levels.105.bejson` (`GameLevel`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_level_loader.js",
  "Primary_Key_Field": "lvl_uuid",
  "Type_Discriminator_Field": "lvl_record_type",
  "Domain_Type_Field": "lvl_environment_zone_type",
  "Records_Type": ["GameLevel"],
  "Fields": [
    { "name": "lvl_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "lvl_record_type", "type": "string", "required": true, "enum": ["GameLevel"] },
    { "name": "lvl_environment_zone_type", "type": "string", "required": true, "enum": ["CAVERN_DUNGEON", "BOSS_ARENA", "SAFE_HUB", "OVERWORLD_FIELD"] },
    { "name": "lvl_victory_condition_type", "type": "string", "required": true, "enum": ["DEFEAT_ALL_ENEMIES", "REACH_PORTAL", "COLLECT_ITEM", "SURVIVE_TIMER", "NONE"] },
    { "name": "lvl_slug_code", "type": "string", "required": true },
    { "name": "lvl_display_title", "type": "string", "required": true },
    { "name": "lvl_width_tiles_count", "type": "integer", "required": true },
    { "name": "lvl_height_tiles_count", "type": "integer", "required": true },
    { "name": "lvl_tile_unit_size_px", "type": "integer", "required": true },
    { "name": "lvl_biome_uuid_fk", "type": "string", "required": true, "foreign_key": { "references": "biomes.biome_uuid", "on_delete": "restrict" } },
    { "name": "lvl_bgm_audio_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "audio.aud_uuid", "on_delete": "set_null" } },
    { "name": "lvl_bgm_track_slug_code", "type": "string", "required": false },
    { "name": "lvl_victory_condition_payload_json", "type": "string", "required": false },
    { "name": "lvl_created_utc_timestamp", "type": "string", "required": true },
    { "name": "lvl_updated_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    [
      "fa8b5962-afc8-439c-966a-470241c6d3f7",
      "GameLevel",
      "CAVERN_DUNGEON",
      "DEFEAT_ALL_ENEMIES",
      "forgotten_cavern",
      "Forgotten Cavern - Level 1",
      32,
      32,
      16,
      "0f94d339-50d0-4daf-aa01-88eeea870b2a",
      "a0011223-3445-4556-8667-778899aabbcc",
      "ambient_drip",
      "{\"type\": \"DEFEAT_ALL_ENEMIES\", \"target_faction\": \"HOSTILE\"}",
      "2026-10-25T21:04:00Z",
      "2026-10-25T21:04:00Z"
    ]
  ]
}
```

### 4.5 `data/chunks/cave_chunk_0_0.105.bejson` (`TileChunkMatrix`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_grid_manager.js",
  "Primary_Key_Field": "chk_uuid",
  "Type_Discriminator_Field": "chk_record_type",
  "Domain_Type_Field": "chk_storage_encoding_type",
  "Records_Type": ["TileChunkMatrix"],
  "Fields": [
    { "name": "chk_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "chk_record_type", "type": "string", "required": true, "enum": ["TileChunkMatrix"] },
    { "name": "chk_storage_encoding_type", "type": "string", "required": true, "enum": ["DENSE_MATRIX_16X16", "SPARSE_TILE_LIST"] },
    { "name": "chk_lvl_uuid_fk", "type": "string", "required": true, "foreign_key": { "references": "levels.lvl_uuid", "on_delete": "cascade" } },
    { "name": "chk_lvl_slug_code", "type": "string", "required": true },
    { "name": "chk_grid_coord_x_index", "type": "integer", "required": true },
    { "name": "chk_grid_coord_y_index", "type": "integer", "required": true },
    { "name": "chk_width_tiles_count", "type": "integer", "required": true },
    { "name": "chk_height_tiles_count", "type": "integer", "required": true },
    { "name": "chk_ground_layer_matrix_json", "type": "string", "required": true },
    { "name": "chk_decor_layer_matrix_json", "type": "string", "required": true },
    { "name": "chk_fringe_layer_matrix_json", "type": "string", "required": true },
    { "name": "chk_collision_bitmask_matrix_json", "type": "string", "required": true },
    { "name": "chk_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    [
      "cbe3d495-b527-4268-8b26-9df51dfeba6f",
      "TileChunkMatrix",
      "DENSE_MATRIX_16X16",
      "fa8b5962-afc8-439c-966a-470241c6d3f7",
      "forgotten_cavern",
      0,
      0,
      16,
      16,
      "[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]",
      "[]",
      "[]",
      "[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]",
      "2026-10-25T21:04:00Z"
    ]
  ]
}
```

### 4.6 `data/actor_stats/actor_stats.105.bejson` (`ActorArchetype`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_actor_registry.js",
  "Primary_Key_Field": "stat_uuid",
  "Type_Discriminator_Field": "stat_record_type",
  "Domain_Type_Field": "stat_archetype_behavior_type",
  "Records_Type": ["ActorArchetype"],
  "Fields": [
    { "name": "stat_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "stat_record_type", "type": "string", "required": true, "enum": ["ActorArchetype"] },
    { "name": "stat_archetype_behavior_type", "type": "string", "required": true, "enum": ["HERO_CONTROLLER", "STATIC_NPC", "WANDERING_NPC", "MELEE_CHASER", "BOSS_PHASED"] },
    { "name": "stat_alignment_faction_type", "type": "string", "required": true, "enum": ["PLAYER", "FRIENDLY", "HOSTILE", "NEUTRAL"] },
    { "name": "stat_archetype_slug_code", "type": "string", "required": true },
    { "name": "stat_display_role_title", "type": "string", "required": true },
    { "name": "stat_max_health_points_count", "type": "integer", "required": true },
    { "name": "stat_base_attack_power_metric", "type": "integer", "required": true },
    { "name": "stat_base_defense_rating_metric", "type": "integer", "required": true },
    { "name": "stat_movement_speed_px_per_sec_metric", "type": "number", "required": true },
    { "name": "stat_hitbox_width_px", "type": "integer", "required": true },
    { "name": "stat_hitbox_height_px", "type": "integer", "required": true },
    { "name": "stat_knockback_force_metric", "type": "integer", "required": true },
    { "name": "stat_experience_reward_count", "type": "integer", "required": true },
    { "name": "stat_start_potions_count", "type": "integer", "required": true },
    { "name": "stat_potion_heal_amount_count", "type": "integer", "required": true },
    { "name": "stat_level_up_hp_bonus_count", "type": "integer", "required": true },
    { "name": "stat_level_up_attack_bonus_metric", "type": "integer", "required": true },
    { "name": "stat_level_up_defense_bonus_metric", "type": "integer", "required": true },
    { "name": "stat_is_victory_target_flag", "type": "boolean", "required": true },
    { "name": "stat_is_static_immovable_flag", "type": "boolean", "required": true },
    { "name": "stat_default_sprite_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "sprites.spr_uuid", "on_delete": "set_null" } },
    { "name": "stat_fallback_color_hex", "type": "string", "required": true },
    { "name": "stat_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    ["967bec9e-e89b-40bf-9194-f07227e4f7a1", "ActorArchetype", "HERO_CONTROLLER", "PLAYER", "player", "Swordsman Hero", 100, 15, 5, 120.0, 32, 32, 2, 0, 1, 40, 10, 3, 2, false, false, "5f2bd77b-4cbb-49d7-9580-bd04e736fff4", "#DE2626", "2026-10-25T21:04:00Z"],
    ["f34bebc3-90c5-4fcc-b40b-300dbdd4cb31", "ActorArchetype", "STATIC_NPC", "FRIENDLY", "villager", "Cave Hermit", 50, 0, 2, 40.0, 32, 32, 5, 0, 0, 0, 0, 0, 0, false, true, "80662083-3d23-4ea2-9d47-890cb96a61a3", "#1a1a1a", "2026-10-25T21:04:00Z"],
    ["6f08ff8c-ae51-4a46-895c-651ad32a07ea", "ActorArchetype", "MELEE_CHASER", "HOSTILE", "slime", "Cavern Green Slime", 30, 8, 1, 60.0, 32, 32, 0, 25, 0, 0, 0, 0, 0, true, false, "38b093d3-ee7c-462b-a18e-b9f989e0833f", "#000000", "2026-10-25T21:04:00Z"]
  ]
}
```

### 4.7 `data/actors/actors.105.bejson` (`ActorInstance`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_actor_controller.js",
  "Primary_Key_Field": "actor_uuid",
  "Type_Discriminator_Field": "actor_record_type",
  "Domain_Type_Field": "actor_entity_role_type",
  "Records_Type": ["ActorInstance"],
  "Fields": [
    { "name": "actor_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "actor_record_type", "type": "string", "required": true, "enum": ["ActorInstance"] },
    { "name": "actor_entity_role_type", "type": "string", "required": true, "enum": ["PLAYER", "NPC_DIALOGUE", "NPC_MERCHANT", "ENEMY_MOB", "ENEMY_BOSS"] },
    { "name": "actor_fsm_lifecycle_state_type", "type": "string", "required": true, "enum": ["IDLE", "MOVING", "ATTACKING", "HURT", "DIALOGUE", "DEAD"] },
    { "name": "actor_lvl_uuid_fk", "type": "string", "required": true, "foreign_key": { "references": "levels.lvl_uuid", "on_delete": "cascade" } },
    { "name": "actor_stat_uuid_fk", "type": "string", "required": true, "foreign_key": { "references": "actor_stats.stat_uuid", "on_delete": "restrict" } },
    { "name": "actor_archetype_slug_code", "type": "string", "required": true },
    { "name": "actor_display_name", "type": "string", "required": true },
    { "name": "actor_start_position_x_px", "type": "number", "required": true },
    { "name": "actor_start_position_y_px", "type": "number", "required": true },
    { "name": "actor_current_position_x_px", "type": "number", "required": true },
    { "name": "actor_current_position_y_px", "type": "number", "required": true },
    { "name": "actor_facing_direction_type", "type": "string", "required": true, "enum": ["UP", "DOWN", "LEFT", "RIGHT"] },
    { "name": "actor_current_health_points_count", "type": "integer", "required": true },
    { "name": "actor_override_attack_power_metric", "type": "integer", "required": true },
    { "name": "actor_override_defense_rating_metric", "type": "integer", "required": true },
    { "name": "actor_weapon_item_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "items.item_uuid", "on_delete": "set_null" } },
    { "name": "actor_armor_item_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "items.item_uuid", "on_delete": "set_null" } },
    { "name": "actor_interaction_evt_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "events.evt_uuid", "on_delete": "set_null" } },
    { "name": "actor_inventory_item_uuids_json", "type": "string", "required": true },
    { "name": "actor_created_utc_timestamp", "type": "string", "required": true },
    { "name": "actor_updated_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    [
      "2d70ddc2-4471-4d88-af8a-ec96832571ce",
      "ActorInstance",
      "PLAYER",
      "IDLE",
      "fa8b5962-afc8-439c-966a-470241c6d3f7",
      "967bec9e-e89b-40bf-9194-f07227e4f7a1",
      "player",
      "Eldon the Wanderer",
      128.0,
      224.0,
      128.0,
      224.0,
      "DOWN",
      100,
      15,
      5,
      "d7efa941-b0b8-4f8f-bd00-72d0277a1b0d",
      null,
      null,
      "[\"6ff5b8c1-466e-44fb-8592-41f44cbbf8c5\"]",
      "2026-10-25T21:04:00Z",
      "2026-10-25T21:04:00Z"
    ],
    [
      "3464096b-6f5b-4a48-87b4-f68e70edd6f8",
      "ActorInstance",
      "NPC_DIALOGUE",
      "IDLE",
      "fa8b5962-afc8-439c-966a-470241c6d3f7",
      "f34bebc3-90c5-4fcc-b40b-300dbdd4cb31",
      "villager",
      "Hermit Barnaby",
      256.0,
      224.0,
      256.0,
      224.0,
      "LEFT",
      50,
      0,
      2,
      null,
      null,
      "994b1b9c-42b1-415f-8d21-6233d967239e",
      "[]",
      "2026-10-25T21:04:00Z",
      "2026-10-25T21:04:00Z"
    ]
  ]
}
```

### 4.8 `data/items/items.105.bejson` (`ItemDefinition`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_inventory_manager.js",
  "Primary_Key_Field": "item_uuid",
  "Type_Discriminator_Field": "item_record_type",
  "Domain_Type_Field": "item_category_type",
  "Records_Type": ["ItemDefinition"],
  "Fields": [
    { "name": "item_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "item_record_type", "type": "string", "required": true, "enum": ["ItemDefinition"] },
    { "name": "item_category_type", "type": "string", "required": true, "enum": ["WEAPON", "ARMOR", "SHIELD", "TOOL", "CONSUMABLE", "KEY_ITEM"] },
    { "name": "item_sub_category_type", "type": "string", "required": true, "enum": ["BROADSWORD", "DAGGER", "BOW", "HEAL_POTION", "BUFF_ELIXIR", "PORTAL_KEY"] },
    { "name": "item_equipment_slot_type", "type": "string", "required": true, "enum": ["SLOT_SWORD", "SLOT_SHIELD", "SLOT_ARMOR", "SLOT_TOOL", "NONE"] },
    { "name": "item_rarity_tier_type", "type": "string", "required": true, "enum": ["COMMON", "UNCOMMON", "RARE", "LEGENDARY"] },
    { "name": "item_slug_code", "type": "string", "required": true },
    { "name": "item_display_name", "type": "string", "required": true },
    { "name": "item_attack_bonus_metric", "type": "integer", "required": true },
    { "name": "item_defense_bonus_metric", "type": "integer", "required": true },
    { "name": "item_heal_potency_count", "type": "integer", "required": true },
    { "name": "item_color_badge_hex", "type": "string", "required": true },
    { "name": "item_description_text", "type": "string", "required": true },
    { "name": "item_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    ["d7efa941-b0b8-4f8f-bd00-72d0277a1b0d", "ItemDefinition", "WEAPON", "BROADSWORD", "SLOT_SWORD", "UNCOMMON", "iron_broadsword", "Iron Broadsword", 12, 0, 0, "#DE2626", "A sharp steel blade forged for heavy slashing.", "2026-10-25T21:04:00Z"],
    ["6ff5b8c1-466e-44fb-8592-41f44cbbf8c5", "ItemDefinition", "CONSUMABLE", "HEAL_POTION", "NONE", "COMMON", "vitality_elixir", "Vitality Elixir", 0, 0, 40, "#FFFFFF", "Restores 40 health points upon drinking.", "2026-10-25T21:04:00Z"]
  ]
}
```

### 4.9 `data/objects/objects.105.bejson` (`WorldObject`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_object_manager.js",
  "Primary_Key_Field": "obj_uuid",
  "Type_Discriminator_Field": "obj_record_type",
  "Domain_Type_Field": "obj_prop_category_type",
  "Records_Type": ["WorldObject"],
  "Fields": [
    { "name": "obj_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "obj_record_type", "type": "string", "required": true, "enum": ["WorldObject"] },
    { "name": "obj_prop_category_type", "type": "string", "required": true, "enum": ["LIGHT_SOURCE", "CONTAINER_CHEST", "DESTRUCTIBLE_PROP", "HAZARD_TRAP", "STATIC_OBSTACLE"] },
    { "name": "obj_lvl_uuid_fk", "type": "string", "required": true, "foreign_key": { "references": "levels.lvl_uuid", "on_delete": "cascade" } },
    { "name": "obj_rule_uuid_fk", "type": "string", "required": true, "foreign_key": { "references": "object_rules.rule_uuid", "on_delete": "restrict" } },
    { "name": "obj_slug_code", "type": "string", "required": true },
    { "name": "obj_display_name", "type": "string", "required": true },
    { "name": "obj_tile_coord_x_index", "type": "integer", "required": true },
    { "name": "obj_tile_coord_y_index", "type": "integer", "required": true },
    { "name": "obj_is_solid_blocking_flag", "type": "boolean", "required": true },
    { "name": "obj_interaction_evt_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "events.evt_uuid", "on_delete": "set_null" } },
    { "name": "obj_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    [
      "813cb168-2718-4099-ab29-b986aebc1ccd",
      "WorldObject",
      "LIGHT_SOURCE",
      "fa8b5962-afc8-439c-966a-470241c6d3f7",
      "f8812345-6789-4abc-8def-012345678902",
      "wall_torch",
      "Cavern Torch",
      4,
      7,
      false,
      null,
      "2026-10-25T21:04:00Z"
    ]
  ]
}
```

### 4.10 `data/object_rules/object_rules.105.bejson` (`ObjectPhysicsRule`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_physics.js",
  "Primary_Key_Field": "rule_uuid",
  "Type_Discriminator_Field": "rule_record_type",
  "Domain_Type_Field": "rule_category_type",
  "Records_Type": ["ObjectPhysicsRule"],
  "Fields": [
    { "name": "rule_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "rule_record_type", "type": "string", "required": true, "enum": ["ObjectPhysicsRule"] },
    { "name": "rule_category_type", "type": "string", "required": true, "enum": ["WALL_BOUNDARY", "FLORA_OBSTACLE", "FURNITURE_PROP", "INTERACTIVE_CONTAINER", "SURFACE_HAZARD"] },
    { "name": "rule_sub_category_type", "type": "string", "required": true, "enum": ["SOLID_WALL", "BREAKABLE", "CHEST", "LIGHT_PROP", "SLOW_TERRAIN", "SPIKE_HAZARD"] },
    { "name": "rule_object_slug_code", "type": "string", "required": true },
    { "name": "rule_biome_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "biomes.biome_uuid", "on_delete": "set_null" } },
    { "name": "rule_is_solid_blocking_flag", "type": "boolean", "required": true },
    { "name": "rule_is_interactable_flag", "type": "boolean", "required": true },
    { "name": "rule_contact_damage_points_count", "type": "integer", "required": true },
    { "name": "rule_speed_multiplier_metric", "type": "number", "required": true },
    { "name": "rule_knockback_force_metric", "type": "integer", "required": true },
    { "name": "rule_hitbox_width_px", "type": "integer", "required": true },
    { "name": "rule_hitbox_height_px", "type": "integer", "required": true },
    { "name": "rule_lifespan_seconds_metric", "type": "number", "required": true },
    { "name": "rule_fallback_color_hex", "type": "string", "required": true },
    { "name": "rule_description_text", "type": "string", "required": true },
    { "name": "rule_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    ["f8812345-6789-4abc-8def-012345678901", "ObjectPhysicsRule", "WALL_BOUNDARY", "SOLID_WALL", "cave_wall", "0f94d339-50d0-4daf-aa01-88eeea870b2a", true, false, 0, 1.0, 0, 16, 16, -1.0, "#000000", "Impassable cavern rock boundary wall.", "2026-10-25T21:04:00Z"],
    ["f8812345-6789-4abc-8def-012345678902", "ObjectPhysicsRule", "FURNITURE_PROP", "LIGHT_PROP", "wall_torch", "0f94d339-50d0-4daf-aa01-88eeea870b2a", false, false, 0, 1.0, 0, 16, 16, -1.0, "#DE2626", "Mounted cavern wall torch emitting ambient light.", "2026-10-25T21:04:00Z"]
  ]
}
```

### 4.11 `data/portals/portals.105.bejson` (`WorldPortal`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_level_loader.js",
  "Primary_Key_Field": "port_uuid",
  "Type_Discriminator_Field": "port_record_type",
  "Domain_Type_Field": "port_transition_trigger_type",
  "Records_Type": ["WorldPortal"],
  "Fields": [
    { "name": "port_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "port_record_type", "type": "string", "required": true, "enum": ["WorldPortal"] },
    { "name": "port_transition_trigger_type", "type": "string", "required": true, "enum": ["STEP_ON_TILE", "INTERACT_DOOR", "BOSS_DEFEAT_UNLOCK", "ONE_WAY_DROP"] },
    { "name": "port_slug_code", "type": "string", "required": true },
    { "name": "port_source_lvl_uuid_fk", "type": "string", "required": true, "foreign_key": { "references": "levels.lvl_uuid", "on_delete": "cascade" } },
    { "name": "port_source_tile_coord_x_index", "type": "integer", "required": true },
    { "name": "port_source_tile_coord_y_index", "type": "integer", "required": true },
    { "name": "port_target_lvl_uuid_fk", "type": "string", "required": true, "foreign_key": { "references": "levels.lvl_uuid", "on_delete": "cascade" } },
    { "name": "port_target_spawn_coord_x_index", "type": "integer", "required": true },
    { "name": "port_target_spawn_coord_y_index", "type": "integer", "required": true },
    { "name": "port_requires_item_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "items.item_uuid", "on_delete": "set_null" } },
    { "name": "port_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    [
      "3cf77a77-c513-4b62-9b6c-4c161785d10b",
      "WorldPortal",
      "STEP_ON_TILE",
      "cavern_north_loop_arch",
      "fa8b5962-afc8-439c-966a-470241c6d3f7",
      15,
      1,
      "fa8b5962-afc8-439c-966a-470241c6d3f7",
      15,
      28,
      null,
      "2026-10-25T21:04:00Z"
    ]
  ]
}
```

### 4.12 `data/events/events.105.bejson` (`GameEvent`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_events.js",
  "Primary_Key_Field": "evt_uuid",
  "Type_Discriminator_Field": "evt_record_type",
  "Domain_Type_Field": "evt_trigger_type",
  "Records_Type": ["GameEvent"],
  "Fields": [
    { "name": "evt_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "evt_record_type", "type": "string", "required": true, "enum": ["GameEvent"] },
    { "name": "evt_trigger_type", "type": "string", "required": true, "enum": ["INTERACTION", "PROXIMITY", "ZONE_ENTER", "ON_DEATH", "CUTSCENE_AUTO"] },
    { "name": "evt_script_format_type", "type": "string", "required": true, "enum": ["OBJECT_OPCODE_V2", "TUPLE_COMMAND_V1"] },
    { "name": "evt_slug_code", "type": "string", "required": true },
    { "name": "evt_lvl_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "levels.lvl_uuid", "on_delete": "cascade" } },
    { "name": "evt_trigger_coord_x_px", "type": "number", "required": false },
    { "name": "evt_trigger_coord_y_px", "type": "number", "required": false },
    { "name": "evt_opcodes_list_json", "type": "string", "required": true },
    { "name": "evt_condition_expression_text", "type": "string", "required": false },
    { "name": "evt_is_repeatable_flag", "type": "boolean", "required": true },
    { "name": "evt_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    [
      "994b1b9c-42b1-415f-8d21-6233d967239e",
      "GameEvent",
      "INTERACTION",
      "OBJECT_OPCODE_V2",
      "hermit_greeting",
      "fa8b5962-afc8-439c-966a-470241c6d3f7",
      256.0,
      224.0,
      "[{\"op\": \"SHOW_DIALOGUE\", \"speaker\": \"Hermit Barnaby\", \"text\": \"Deep in these caverns, the slimes grow hungry. Keep your blade polished!\"}, {\"op\": \"PLAY_SFX\", \"sound\": \"chime_bell\"}, {\"op\": \"GIVE_ITEM\", \"item_uuid\": \"6ff5b8c1-466e-44fb-8592-41f44cbbf8c5\"}]",
      null,
      false,
      "2026-10-25T21:04:00Z"
    ]
  ]
}
```

### 4.13 `data/sprites/sprites_manifest.105a.bejson` (`SpriteAssetManifest`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105a",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_assets.js",
  "Primary_Key_Field": "spr_uuid",
  "Type_Discriminator_Field": "spr_record_type",
  "Domain_Type_Field": "spr_animation_sheet_type",
  "Records_Type": ["SpriteAssetManifest"],
  "Fields": [
    { "name": "spr_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "spr_record_type", "type": "string", "required": true, "enum": ["SpriteAssetManifest"] },
    { "name": "spr_animation_sheet_type", "type": "string", "required": true, "enum": ["DIRECTIONAL_4WAY", "STATIC_SINGLE", "SLASH_VFX_STRIP", "PROJECTILE_LOOP"] },
    { "name": "spr_slug_code", "type": "string", "required": true },
    { "name": "spr_frame_width_px", "type": "integer", "required": true },
    { "name": "spr_frame_height_px", "type": "integer", "required": true },
    { "name": "spr_total_frames_count", "type": "integer", "required": true },
    { "name": "spr_walk_frame_duration_ms_metric", "type": "integer", "required": true },
    { "name": "spr_attack_frame_duration_ms_metric", "type": "integer", "required": true },
    { "name": "spr_palette_tint_hex", "type": "string", "required": true },
    { "name": "spr_image_source_data_uri", "type": "string", "required": false },
    { "name": "spr_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    ["5f2bd77b-4cbb-49d7-9580-bd04e736fff4", "SpriteAssetManifest", "DIRECTIONAL_4WAY", "hero_swordsman_sheet", 32, 32, 16, 125, 90, "#DE2626", null, "2026-10-25T21:04:00Z"],
    ["80662083-3d23-4ea2-9d47-890cb96a61a3", "SpriteAssetManifest", "DIRECTIONAL_4WAY", "hermit_npc_sheet", 32, 32, 8, 125, 0, "#FFFFFF", null, "2026-10-25T21:04:00Z"],
    ["38b093d3-ee7c-462b-a18e-b9f989e0833f", "SpriteAssetManifest", "DIRECTIONAL_4WAY", "slime_green_sheet", 32, 32, 4, 150, 100, "#000000", null, "2026-10-25T21:04:00Z"]
  ]
}
```

### 4.14 `data/tiles/tiles_manifest.105a.bejson` (`TileAssetManifest`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105a",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_assets.js",
  "Primary_Key_Field": "tile_uuid",
  "Type_Discriminator_Field": "tile_record_type",
  "Domain_Type_Field": "tile_layer_category_type",
  "Records_Type": ["TileAssetManifest"],
  "Fields": [
    { "name": "tile_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "tile_record_type", "type": "string", "required": true, "enum": ["TileAssetManifest"] },
    { "name": "tile_layer_category_type", "type": "string", "required": true, "enum": ["GROUND_TERRAIN", "WALL_BOUNDARY", "LIQUID_HAZARD", "DECOR_OVERLAY", "FRINGE_CANOPY"] },
    { "name": "tile_slug_code", "type": "string", "required": true },
    { "name": "tile_integer_index_code", "type": "integer", "required": true },
    { "name": "tile_width_px", "type": "integer", "required": true },
    { "name": "tile_height_px", "type": "integer", "required": true },
    { "name": "tile_is_solid_blocking_flag", "type": "boolean", "required": true },
    { "name": "tile_footstep_audio_uuid_fk", "type": "string", "required": false, "foreign_key": { "references": "audio.aud_uuid", "on_delete": "set_null" } },
    { "name": "tile_material_sound_slug_code", "type": "string", "required": true },
    { "name": "tile_image_source_data_uri", "type": "string", "required": false },
    { "name": "tile_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    ["7019444c-4dc1-4921-9784-77e5521fc8a2", "TileAssetManifest", "GROUND_TERRAIN", "stone_floor", 1, 32, 32, false, null, "footstep_stone", null, "2026-10-25T21:04:00Z"],
    ["23e26250-8bd4-4982-9fcd-f6f134ab3ac8", "TileAssetManifest", "WALL_BOUNDARY", "stone_wall", 2, 32, 32, true, null, "hit_wall", null, "2026-10-25T21:04:00Z"],
    ["952f6b55-6f37-4640-a102-4bea49cb3d8f", "TileAssetManifest", "LIQUID_HAZARD", "cavern_water", 3, 32, 32, true, null, "water_splash", null, "2026-10-25T21:04:00Z"]
  ]
}
```

### 4.15 `data/audio/audio_manifest.105a.bejson` (`AudioAssetManifest`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105a",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_assets.js",
  "Primary_Key_Field": "aud_uuid",
  "Type_Discriminator_Field": "aud_record_type",
  "Domain_Type_Field": "aud_channel_category_type",
  "Records_Type": ["AudioAssetManifest"],
  "Fields": [
    { "name": "aud_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "aud_record_type", "type": "string", "required": true, "enum": ["AudioAssetManifest"] },
    { "name": "aud_channel_category_type", "type": "string", "required": true, "enum": ["BGM_AMBIENT_LOOP", "SFX_COMBAT", "SFX_UI_CHIME", "SFX_FOOTSTEP"] },
    { "name": "aud_slug_code", "type": "string", "required": true },
    { "name": "aud_display_title", "type": "string", "required": true },
    { "name": "aud_duration_ms_metric", "type": "integer", "required": true },
    { "name": "aud_default_volume_ratio_metric", "type": "number", "required": true },
    { "name": "aud_is_looping_flag", "type": "boolean", "required": true },
    { "name": "aud_audio_source_data_uri", "type": "string", "required": false },
    { "name": "aud_created_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    ["a0011223-3445-4556-8667-778899aabbcc", "AudioAssetManifest", "BGM_AMBIENT_LOOP", "ambient_drip", "Cavern Echoes & Water Drip", 48000, 0.65, true, null, "2026-10-25T21:04:00Z"],
    ["a0011223-3445-4556-8667-778899aabbcd", "AudioAssetManifest", "SFX_UI_CHIME", "chime_bell", "Hermit Dialogue Bell", 420, 0.85, false, null, "2026-10-25T21:04:00Z"],
    ["a0011223-3445-4556-8667-778899aabbce", "AudioAssetManifest", "SFX_COMBAT", "sword_slash", "Dark Link Blade Swing", 180, 0.90, false, null, "2026-10-25T21:04:00Z"]
  ]
}
```

### 4.16 `data/runtime_physics/physics_world.105.bejson` (`RuntimePhysicsBody`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_physics.js",
  "Primary_Key_Field": "phys_uuid",
  "Type_Discriminator_Field": "phys_record_type",
  "Domain_Type_Field": "phys_kinematic_body_type",
  "Records_Type": ["RuntimePhysicsBody"],
  "Fields": [
    { "name": "phys_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "phys_record_type", "type": "string", "required": true, "enum": ["RuntimePhysicsBody"] },
    { "name": "phys_kinematic_body_type", "type": "string", "required": true, "enum": ["DYNAMIC_PLAYER", "DYNAMIC_ACTOR", "STATIC_TILE_WALL", "STATIC_PROP", "TRIGGER_SENSOR"] },
    { "name": "phys_owner_entity_uuid_fk", "type": "string", "required": true },
    { "name": "phys_position_x_px", "type": "number", "required": true },
    { "name": "phys_position_y_px", "type": "number", "required": true },
    { "name": "phys_hitbox_width_px", "type": "number", "required": true },
    { "name": "phys_hitbox_height_px", "type": "number", "required": true },
    { "name": "phys_velocity_x_px_per_tick_metric", "type": "number", "required": true },
    { "name": "phys_velocity_y_px_per_tick_metric", "type": "number", "required": true },
    { "name": "phys_is_static_collider_flag", "type": "boolean", "required": true },
    { "name": "phys_mass_ratio_metric", "type": "number", "required": true }
  ],
  "Values": [
    ["bb001122-3344-4556-8778-99aabbccddee", "RuntimePhysicsBody", "DYNAMIC_PLAYER", "2d70ddc2-4471-4d88-af8a-ec96832571ce", 128.0, 224.0, 16.0, 16.0, 0.0, 0.0, false, 1.0],
    ["bb001122-3344-4556-8778-99aabbccddf0", "RuntimePhysicsBody", "STATIC_PROP", "3464096b-6f5b-4a48-87b4-f68e70edd6f8", 256.0, 224.0, 32.0, 32.0, 0.0, 0.0, true, 0.0]
  ]
}
```

### 4.17 `data/runtime_assets/asset_cache.105a.bejson` (`RuntimeAssetCache`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105a",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_assets.js",
  "Primary_Key_Field": "asst_uuid",
  "Type_Discriminator_Field": "asst_record_type",
  "Domain_Type_Field": "asst_resource_media_type",
  "Records_Type": ["RuntimeAssetCache"],
  "Fields": [
    { "name": "asst_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "asst_record_type", "type": "string", "required": true, "enum": ["RuntimeAssetCache"] },
    { "name": "asst_resource_media_type", "type": "string", "required": true, "enum": ["IMAGE_SPRITE", "IMAGE_TILESET", "AUDIO_BUFFER"] },
    { "name": "asst_lookup_slug_code", "type": "string", "required": true },
    { "name": "asst_source_uri_path", "type": "string", "required": true },
    { "name": "asst_is_loaded_ready_flag", "type": "boolean", "required": true },
    { "name": "asst_cached_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": []
}
```

### 4.18 `data/runtime_events/event_bus_log.105.bejson` (`RuntimeEventLog`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_events.js",
  "Primary_Key_Field": "ebus_uuid",
  "Type_Discriminator_Field": "ebus_record_type",
  "Domain_Type_Field": "ebus_signal_channel_type",
  "Records_Type": ["RuntimeEventLog"],
  "Fields": [
    { "name": "ebus_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "ebus_record_type", "type": "string", "required": true, "enum": ["RuntimeEventLog"] },
    { "name": "ebus_signal_channel_type", "type": "string", "required": true, "enum": ["LIFECYCLE_BOOT", "LIFECYCLE_START", "LIFECYCLE_STOP", "UI_FRAME_UPDATE", "SCRIPT_OP_TRIGGER"] },
    { "name": "ebus_event_name_code", "type": "string", "required": true },
    { "name": "ebus_occurred_epoch_ms_timestamp", "type": "integer", "required": true }
  ],
  "Values": [
    ["cc001122-3344-4556-8778-99aabbccddee", "RuntimeEventLog", "LIFECYCLE_BOOT", "BootstrapCompleted", 1792962240000],
    ["cc001122-3344-4556-8778-99aabbccddf0", "RuntimeEventLog", "LIFECYCLE_START", "GameStarted", 1792962240016]
  ]
}
```

### 4.19 `data/runtime_grid/grid_cells.105.bejson` (`RuntimeGridCell`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_grid.js",
  "Primary_Key_Field": "grid_uuid",
  "Type_Discriminator_Field": "grid_record_type",
  "Domain_Type_Field": "grid_terrain_surface_type",
  "Records_Type": ["RuntimeGridCell"],
  "Fields": [
    { "name": "grid_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "grid_record_type", "type": "string", "required": true, "enum": ["RuntimeGridCell"] },
    { "name": "grid_terrain_surface_type", "type": "string", "required": true, "enum": ["EMPTY", "STONE_FLOOR", "STONE_WALL", "CAVERN_WATER"] },
    { "name": "grid_row_coord_index", "type": "integer", "required": true },
    { "name": "grid_column_coord_index", "type": "integer", "required": true },
    { "name": "grid_is_solid_blocking_flag", "type": "boolean", "required": true }
  ],
  "Values": [
    ["dd001122-3344-4556-8778-99aabbccddee", "RuntimeGridCell", "STONE_WALL", 0, 0, true],
    ["dd001122-3344-4556-8778-99aabbccddf0", "RuntimeGridCell", "STONE_FLOOR", 1, 1, false]
  ]
}
```

### 4.20 `data/runtime_telemetry/frame_telemetry.105.bejson` (`RuntimeTelemetryFrame`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Parent_Hierarchy": "../manifest/105a.mfdb.bejson",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_game.js",
  "Primary_Key_Field": "telm_uuid",
  "Type_Discriminator_Field": "telm_record_type",
  "Domain_Type_Field": "telm_health_severity_type",
  "Records_Type": ["RuntimeTelemetryFrame"],
  "Fields": [
    { "name": "telm_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "telm_record_type", "type": "string", "required": true, "enum": ["RuntimeTelemetryFrame"] },
    { "name": "telm_health_severity_type", "type": "string", "required": true, "enum": ["NOMINAL_60FPS", "DEGRADED_LOW_FPS", "CRITICAL_PHYSICS_BOTTLENECK", "CRITICAL_RENDER_BOTTLENECK"] },
    { "name": "telm_rolling_fps_count", "type": "integer", "required": true },
    { "name": "telm_frame_duration_ms_metric", "type": "number", "required": true },
    { "name": "telm_update_duration_ms_metric", "type": "number", "required": true },
    { "name": "telm_draw_duration_ms_metric", "type": "number", "required": true },
    { "name": "telm_physics_duration_ms_metric", "type": "number", "required": true },
    { "name": "telm_actor_sync_duration_ms_metric", "type": "number", "required": true },
    { "name": "telm_chunk_draw_duration_ms_metric", "type": "number", "required": true },
    { "name": "telm_collision_checks_count", "type": "integer", "required": true },
    { "name": "telm_total_bodies_count", "type": "integer", "required": true },
    { "name": "telm_static_bodies_count", "type": "integer", "required": true },
    { "name": "telm_dynamic_bodies_count", "type": "integer", "required": true },
    { "name": "telm_tiles_drawn_count", "type": "integer", "required": true },
    { "name": "telm_tiles_culled_count", "type": "integer", "required": true },
    { "name": "telm_used_js_heap_mb_metric", "type": "number", "required": true },
    { "name": "telm_alerts_list_json", "type": "string", "required": true }
  ],
  "Values": [
    ["ee001122-3344-4556-8778-99aabbccddee", "RuntimeTelemetryFrame", "NOMINAL_60FPS", 60, 4.2, 1.1, 3.1, 0.8, 0.1, 1.9, 120, 62, 60, 2, 256, 0, 14.25, "[]"]
  ]
}
```

### 4.21 `config/engine_config/engine_config.105a.bejson` (`EngineConfiguration`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105a",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Write_Owner_Module": "lib_bejson_Gaming_bejson_game.js",
  "Primary_Key_Field": "cfg_uuid",
  "Type_Discriminator_Field": "cfg_record_type",
  "Domain_Type_Field": "cfg_parameter_value_type",
  "Records_Type": ["EngineConfiguration"],
  "Fields": [
    { "name": "cfg_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "cfg_record_type", "type": "string", "required": true, "enum": ["EngineConfiguration"] },
    { "name": "cfg_parameter_value_type", "type": "string", "required": true, "enum": ["STRING", "NUMBER", "BOOLEAN", "JSON_OBJECT"] },
    { "name": "cfg_subsystem_scope_type", "type": "string", "required": true, "enum": ["CORE_RUNTIME", "RENDER_VIEWPORT", "TELEMETRY_HUD", "INPUT_DECK", "WORLD_BOOT"] },
    { "name": "cfg_setting_key_code", "type": "string", "required": true },
    { "name": "cfg_setting_serialized_value_text", "type": "string", "required": true },
    { "name": "cfg_description_text", "type": "string", "required": true },
    { "name": "cfg_updated_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    ["ff001122-3344-4556-8778-99aabbccdde1", "EngineConfiguration", "STRING", "CORE_RUNTIME", "engine_version", "2.0.0-105", "Vanilla JavaScript Engine BEJSON 105 release version.", "2026-10-25T21:04:00Z"],
    ["ff001122-3344-4556-8778-99aabbccdde2", "EngineConfiguration", "STRING", "RENDER_VIEWPORT", "default_canvas_id", "ss-canvas", "Default HTML5 canvas element ID.", "2026-10-25T21:04:00Z"],
    ["ff001122-3344-4556-8778-99aabbccdde3", "EngineConfiguration", "NUMBER", "RENDER_VIEWPORT", "view_fraction", "0.6", "Viewport canvas height ratio (0.6 for split screen, 1.0 for full screen).", "2026-10-25T21:04:00Z"],
    ["ff001122-3344-4556-8778-99aabbccdde4", "EngineConfiguration", "BOOLEAN", "TELEMETRY_HUD", "telemetry_enabled", "true", "Enable live on-screen telemetry HUD and bottleneck alerts.", "2026-10-25T21:04:00Z"],
    ["ff001122-3344-4556-8778-99aabbccdde5", "EngineConfiguration", "STRING", "WORLD_BOOT", "default_level_id", "forgotten_cavern", "Default initial level slug or UUID to load.", "2026-10-25T21:04:00Z"]
  ]
}
```

### 4.22 `config/project_meta/bejson_project.105a.bejson` (`ProjectMetadata`)

```json
{
  "Format": "BEJSON",
  "Format_Version": "105a",
  "Format_Creator": "Elton Boehnen",
  "Schema_Version": "2.0.0-105",
  "Write_Owner_Module": "lib_bejson_Core_bejson_bejson.js",
  "Primary_Key_Field": "proj_uuid",
  "Type_Discriminator_Field": "proj_record_type",
  "Domain_Type_Field": "proj_package_category_type",
  "Records_Type": ["ProjectMetadata"],
  "Fields": [
    { "name": "proj_uuid", "type": "string", "required": true, "primary_key": true },
    { "name": "proj_record_type", "type": "string", "required": true, "enum": ["ProjectMetadata"] },
    { "name": "proj_package_category_type", "type": "string", "required": true, "enum": ["APP", "LIBRARY", "STANDALONE_TOOL"] },
    { "name": "proj_application_runtime_type", "type": "string", "required": true, "enum": ["JAVASCRIPT_BROWSER", "NODE_CLI", "HYBRID_PWA"] },
    { "name": "proj_detection_index_type", "type": "string", "required": true, "enum": ["DIRECT_SCAFFOLD", "MFDB_SCANNER"] },
    { "name": "proj_name_code", "type": "string", "required": true },
    { "name": "proj_semantic_version_code", "type": "string", "required": true },
    { "name": "proj_package_integer_version_code", "type": "string", "required": true },
    { "name": "proj_root_directory_path", "type": "string", "required": true },
    { "name": "proj_global_guid_code", "type": "string", "required": true },
    { "name": "proj_session_uuid", "type": "string", "required": true },
    { "name": "proj_author_display_name", "type": "string", "required": true },
    { "name": "proj_description_text", "type": "string", "required": true },
    { "name": "proj_lifecycle_status_code", "type": "string", "required": true },
    { "name": "proj_main_executable_file_path", "type": "string", "required": true },
    { "name": "proj_bejson_library_version_code", "type": "string", "required": true },
    { "name": "proj_archive_filename_name", "type": "string", "required": true },
    { "name": "proj_package_checksum_sha256_code", "type": "string", "required": true },
    { "name": "proj_modified_utc_timestamp", "type": "string", "required": true }
  ],
  "Values": [
    [
      "7487b35b-cf83-402f-93e7-f796f61cac6d",
      "ProjectMetadata",
      "APP",
      "JAVASCRIPT_BROWSER",
      "DIRECT_SCAFFOLD",
      "Sword_Slasher_Engine_JS",
      "2.0.0",
      "101",
      "/storage/emulated/0/Download/Sword_Slasher_Engine_JS",
      "GUID_PLACEHOLDER",
      "19a493ba-26dd-4b7a-b804-436c484fcee7",
      "Elton Boehnen",
      "Standalone Vanilla JavaScript game engine for Sword Slasher RPG on BEJSON 105 MFDB.",
      "Active",
      "index.html",
      "300",
      "Sword_Slasher_Engine_JS-V200-PKG101.zip",
      "",
      "2026-10-25T21:04:00Z"
    ]
  ]
}
```

## 5. BEJSON 105 Core Engine & Validator Upgrade (`src/engine/lib_bejson_Core_bejson_bejson.js`)

To support both legacy `104`/`104a`/`104db` and the translated `105`/`105a`/`105db` specifications seamlessly in `lib_bejson_Core_bejson_bejson.js`:

```javascript
/**
 * Library:        lib_bejson_Core_bejson_bejson.js
 * Family:         Core
 * Author:         Elton Boehnen
 * Format_Creator: Elton Boehnen
 * Release_Version: 300
 * Schema_Era:     104 + 105 (Integrity Era)
 */
const SUPPORTED_BEJSON_VERSIONS = ["104", "104a", "104db", "105", "105a", "105db"];

function bejsonCoreCreate105(recordType, fields, values = [], integrityHeaders = {}) {
  return {
    Format: "BEJSON",
    Format_Version: "105",
    Format_Creator: "Elton Boehnen",
    Schema_Version: "2.0.0-105",
    Records_Type: [recordType],
    ...integrityHeaders,
    Fields: fields,
    Values: values
  };
}

function bejsonCoreCreate105a(recordType, fields, values = [], customHeaders = {}) {
  return {
    Format: "BEJSON",
    Format_Version: "105a",
    Format_Creator: "Elton Boehnen",
    Schema_Version: "2.0.0-105",
    Records_Type: [recordType],
    ...customHeaders,
    Fields: fields,
    Values: values
  };
}

function bejsonCoreValidate105Document(bejsonDocument) {
  const errors = [];
  if (!bejsonDocument || bejsonDocument.Format !== "BEJSON") {
    errors.push("E_INVALID_FORMAT: Format must equal 'BEJSON'");
  }
  if (bejsonDocument.Format_Creator !== "Elton Boehnen") {
    errors.push("E_INVALID_FORMAT_CREATOR: Format_Creator must equal 'Elton Boehnen'");
  }
  if (!SUPPORTED_BEJSON_VERSIONS.includes(bejsonDocument.Format_Version)) {
    errors.push(`E_INVALID_VERSION: Unsupported Format_Version '${bejsonDocument.Format_Version}'`);
  }
  const fields = bejsonDocument.Fields || [];
  const values = bejsonDocument.Values || [];
  values.forEach((row, rowIndex) => {
    if (row.length !== fields.length) {
      errors.push(`E_RECORD_LENGTH_MISMATCH: Row ${rowIndex} has ${row.length} columns, expected ${fields.length}`);
      return;
    }
    fields.forEach((fieldDef, colIndex) => {
      const cellValue = row[colIndex];
      if (cellValue === null) {
        if (fieldDef.required) {
          errors.push(`E_NULL_VIOLATION: Row ${rowIndex} column '${fieldDef.name}' is required`);
        }
        return;
      }
      if (Array.isArray(fieldDef.enum) && !fieldDef.enum.includes(cellValue)) {
        errors.push(`E_ENUM_VIOLATION: Row ${rowIndex} column '${fieldDef.name}' value '${cellValue}' not in [${fieldDef.enum.join(", ")}]`);
      }
    });
  });
  return { valid: errors.length === 0, errors };
}
```
