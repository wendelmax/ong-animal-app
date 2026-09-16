import { spawnSync } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const run = (script, args = []) => {
  const result = spawnSync(npm, ['run', script, '--', ...args], {
    env: process.env,
    input: script === 'migrate' ? 'y\n' : undefined,
    stdio: script === 'migrate' ? ['pipe', 'inherit', 'inherit'] : 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

if (process.env.VERCEL_ENV === 'production') {
  run('migrate')
}

run('generate:importmap')
run('build')
