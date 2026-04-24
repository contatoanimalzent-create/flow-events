import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

function parseEnvFile(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((accumulator, line) => {
      const separatorIndex = line.indexOf('=')
      if (separatorIndex === -1) {
        return accumulator
      }

      const key = line.slice(0, separatorIndex).trim()
      const value = line.slice(separatorIndex + 1).trim()
      accumulator[key] = value
      return accumulator
    }, {})
}

async function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')
  const fileContents = await readFile(envPath, 'utf8').catch(() => '')
  const fileEnv = fileContents ? parseEnvFile(fileContents) : {}
  return {
    ...fileEnv,
    ...process.env,
  }
}

function readFlag(name) {
  return process.argv.includes(name)
}

function readOption(name) {
  const prefix = `${name}=`
  const match = process.argv.find((argument) => argument.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}

async function main() {
  const env = await loadEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL
  const demoSeedKey = env.DEMO_SEED_KEY
  const reset = readFlag('--reset')
  const attachProfileId = readOption('--attach-profile-id')

  if (!supabaseUrl) {
    throw new Error('Defina VITE_SUPABASE_URL ou SUPABASE_URL antes de rodar o seed demo.')
  }

  if (!demoSeedKey) {
    throw new Error('Defina DEMO_SEED_KEY no ambiente antes de chamar a edge function demo-seed.')
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/demo-seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-demo-seed-key': demoSeedKey,
    },
    body: JSON.stringify({
      reset,
      attachProfileId,
    }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error ?? `Falha ao executar demo-seed (${response.status}).`)
  }

  const summary = payload.summary ?? {}
  console.log('Demo seed aplicado com sucesso.')
  console.log(`Organização: ${summary.organizationSlug ?? 'animalz-grand-experiences'}`)
  console.log(`Evento: ${summary.eventSlug ?? 'animalz-nocturne-sessions-2026'}`)
  console.log(`Tickets vendidos: ${summary.ticketsSold ?? 0}`)
  console.log(`Pedidos: ${summary.orders ?? 0}`)
  console.log(`Clientes: ${summary.customers ?? 0}`)
  console.log(`Staff: ${summary.staffMembers ?? 0}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Falha inesperada ao aplicar o demo seed.')
  process.exit(1)
})
