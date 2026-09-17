import * as migration_20260527_031700_add_excerpt from './20260527_031700_add_excerpt'
import * as migration_20260916_033156_production_schema_compatibility from './20260916_033156_production_schema_compatibility'
import * as migration_20260916_231700_volunteer_term_acceptance_snapshot from './20260916_231700_volunteer_term_acceptance_snapshot'
import * as migration_20260916_234500_volunteer_resignation from './20260916_234500_volunteer_resignation'
import * as migration_20260917_000100_volunteer_whatsapp from './20260917_000100_volunteer_whatsapp'

export const migrations = [
  {
    up: migration_20260527_031700_add_excerpt.up,
    down: migration_20260527_031700_add_excerpt.down,
    name: '20260527_031700_add_excerpt',
  },
  {
    up: migration_20260916_033156_production_schema_compatibility.up,
    down: migration_20260916_033156_production_schema_compatibility.down,
    name: '20260916_033156_production_schema_compatibility',
  },
  {
    up: migration_20260916_231700_volunteer_term_acceptance_snapshot.up,
    down: migration_20260916_231700_volunteer_term_acceptance_snapshot.down,
    name: '20260916_231700_volunteer_term_acceptance_snapshot',
  },
  {
    up: migration_20260916_234500_volunteer_resignation.up,
    down: migration_20260916_234500_volunteer_resignation.down,
    name: '20260916_234500_volunteer_resignation',
  },
  {
    up: migration_20260917_000100_volunteer_whatsapp.up,
    down: migration_20260917_000100_volunteer_whatsapp.down,
    name: '20260917_000100_volunteer_whatsapp',
  },
]
