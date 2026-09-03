// ============================================================
// ZOÉ FERME ERP — Exécution directe SQL via pg + Supabase
// Connexion directe PostgreSQL avec SSL
// ============================================================
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const PROJECT_REF = 'hmyszecyarpadlnfsagg'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhteXN6ZWN5YXJwYWRsbmZzYWdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzg1Nzk4NCwiZXhwIjoyMTAzNDMzOTg0fQ.3TU4va0UKEXgr7_SHHG6bnvT2Xeq-JE5Zu9KnKwtknE'

const OK  = (s) => `\x1b[32m✅ ${s}\x1b[0m`
const ERR = (s) => `\x1b[31m❌ ${s}\x1b[0m`
const INF = (s) => `\x1b[36mℹ️  ${s}\x1b[0m`

// Connexion via le connection pooler Supabase (IPv4, port 5432)
// User: postgres.[project-ref], Password: service_role_key (mode JWT auth)
const connectionConfigs = [
  // Tentative 1 : Transaction pooler (port 6543)
  {
    host: `aws-0-eu-central-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: SERVICE_KEY,
    ssl: { rejectUnauthorized: false }
  },
  // Tentative 2 : Session pooler (port 5432)
  {
    host: `aws-0-eu-central-1.pooler.supabase.com`,
    port: 5432,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: SERVICE_KEY,
    ssl: { rejectUnauthorized: false }
  },
  // Tentative 3 : Direct DB connection
  {
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: SERVICE_KEY,
    ssl: { rejectUnauthorized: false }
  },
]

async function tryConnect() {
  for (let i = 0; i < connectionConfigs.length; i++) {
    const cfg = connectionConfigs[i]
    console.log(INF(`Tentative ${i+1}: ${cfg.host}:${cfg.port} (user: ${cfg.user})`))
    const client = new Client(cfg)
    try {
      await client.connect()
      const res = await client.query('SELECT current_database() as db, current_user as usr')
      console.log(OK(`Connecté ! DB: ${res.rows[0].db}, User: ${res.rows[0].usr}`))
      return client
    } catch(e) {
      console.log(`   → Échec: ${e.message.slice(0, 100)}`)
      try { await client.end() } catch {}
    }
  }
  return null
}

async function main() {
  console.log('\n🐔 ZOÉ FERME ERP — Connexion directe PostgreSQL\n')
  
  const client = await tryConnect()
  if (!client) {
    console.log(ERR('Impossible de se connecter. Le service role key ne permet pas la connexion directe PostgreSQL.'))
    console.log('\n⚠️  Supabase nécessite le mot de passe de la base de données (différent du service role key)')
    console.log('   Trouvable sur : Dashboard > Settings > Database > Database password\n')
    process.exit(1)
  }

  try {
    console.log('\n📂 Lecture du script SQL...')
    const sqlFile = path.join(__dirname, '../supabase/migrations/FULL_SETUP.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    console.log(INF(`Script SQL lu : ${sql.length} caractères`))
    console.log('\n🚀 Exécution du script complet...\n')
    
    await client.query(sql)
    
    console.log(OK('Script SQL exécuté avec succès !'))
    
    // Vérification
    const tables = ['farms','batches','customers','sales','expenses','mortality_records']
    for (const t of tables) {
      const r = await client.query(`SELECT COUNT(*) as n FROM ${t}`)
      console.log(OK(`${t}: ${r.rows[0].n} lignes`))
    }
    
    console.log('\n' + '═'.repeat(50))
    console.log('🎉 BASE DE DONNÉES PRÊTE ! Ouvrez http://localhost:3000')
    console.log('═'.repeat(50) + '\n')
    
  } finally {
    await client.end()
  }
}

main().catch(e => { console.error(ERR(e.message)); process.exit(1) })
