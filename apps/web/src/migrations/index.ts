import * as migration_20260527_031700_add_excerpt from './20260527_031700_add_excerpt';
import * as migration_20260916_033156_production_schema_compatibility from './20260916_033156_production_schema_compatibility';

export const migrations = [
  {
    up: migration_20260527_031700_add_excerpt.up,
    down: migration_20260527_031700_add_excerpt.down,
    name: '20260527_031700_add_excerpt',
  },
  {
    up: migration_20260916_033156_production_schema_compatibility.up,
    down: migration_20260916_033156_production_schema_compatibility.down,
    name: '20260916_033156_production_schema_compatibility'
  },
];
