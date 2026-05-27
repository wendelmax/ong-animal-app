import * as migration_20260527_031700_add_excerpt from './20260527_031700_add_excerpt';

export const migrations = [
  {
    up: migration_20260527_031700_add_excerpt.up,
    down: migration_20260527_031700_add_excerpt.down,
    name: '20260527_031700_add_excerpt'
  },
];
