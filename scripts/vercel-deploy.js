// ============================================================
// Déploiement automatique Zoé Ferme ERP sur Vercel
// Via API Vercel + GitHub Integration
// ============================================================
const TOKEN = process.env.VERCEL_TOKEN || ''
const H = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

const SUPABASE_URL  = 'https://hmyszecyarpadlnfsagg.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhteXN6ZWN5YXJwYWRsbmZzYWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTc5ODQsImV4cCI6MjEwMzQzMzk4NH0.N1zdZ00C2Xl4KMRnXCyQjz3n7bVwW0Ocr8zwN0TFadw'

const OK  = s => `\x1b[32m✅ ${s}\x1b[0m`
const ERR = s => `\x1b[31m❌ ${s}\x1b[0m`
const INF = s => `\x1b[36mℹ️  ${s}\x1b[0m`
const HDR = s => `\n\x1b[1m━━━ ${s} ━━━\x1b[0m`

async function api(method, path, body) {
  const r = await fetch(`https://api.vercel.com${path}`, {
    method,
    headers: H,
    body: body ? JSON.stringify(body) : undefined
  })
  return r.json()
}

async function main() {
  console.log('\n🚀 ZOÉ FERME ERP — Déploiement Vercel\n')

  // 1. Trouver l'installation GitHub Vercel
  console.log(HDR('GitHub Integration'))
  const installations = await api('GET', '/v1/integrations/git-namespaces?provider=github')
  
  let githubInstallId = null
  let orgId = null
  
  if (installations.namespaces && installations.namespaces.length > 0) {
    const ns = installations.namespaces.find(n => 
      n.slug === 'Nelson-apprentissage' || n.login === 'Nelson-apprentissage'
    ) || installations.namespaces[0]
    githubInstallId = ns.id || ns.installationId
    orgId = ns.teamId
    console.log(OK(`Namespace GitHub trouvé: ${ns.slug || ns.login} (id: ${githubInstallId})`))
  } else {
    console.log(INF('Namespaces: ' + JSON.stringify(installations).slice(0, 300)))
  }

  // 2. Créer le projet avec la connexion GitHub
  console.log(HDR('Création du projet'))
  
  const projectBody = {
    name: 'zoe-ferme-erp',
    framework: 'nextjs',
    environmentVariables: [
      { key: 'NEXT_PUBLIC_SUPABASE_URL',      value: SUPABASE_URL,  target: ['production', 'preview', 'development'], type: 'plain' },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: SUPABASE_ANON, target: ['production', 'preview', 'development'], type: 'plain' },
      { key: 'NEXT_PUBLIC_APP_NAME',          value: 'Zoé Ferme ERP', target: ['production', 'preview', 'development'], type: 'plain' },
      { key: 'NEXT_PUBLIC_CURRENCY',          value: 'FCFA',        target: ['production', 'preview', 'development'], type: 'plain' },
    ],
  }

  // Ajouter le lien GitHub si on a trouvé l'installation
  if (githubInstallId) {
    projectBody.gitRepository = {
      type: 'github',
      repo: 'Nelson-apprentissage/Zoe-ferme-erp',
    }
  }

  const project = await api('POST', '/v10/projects', projectBody)
  
  if (project.id) {
    console.log(OK(`Projet créé: ${project.name} (id: ${project.id})`))
    
    // 3. Déclencher un déploiement depuis GitHub
    console.log(HDR('Déclenchement du déploiement'))
    
    const deploy = await api('POST', '/v13/deployments', {
      name: 'zoe-ferme-erp',
      target: 'production',
      gitSource: {
        type: 'github',
        repo: 'Nelson-apprentissage/Zoe-ferme-erp',
        ref: 'main',
      },
      project: project.id,
    })

    if (deploy.url) {
      console.log(OK(`Déploiement lancé !`))
      console.log(OK(`URL de déploiement: https://${deploy.url}`))
      console.log(OK(`ID déploiement: ${deploy.id}`))
    } else if (deploy.id) {
      console.log(OK(`Déploiement en cours... ID: ${deploy.id}`))
      console.log(INF(`Vérifiez sur: https://vercel.com/nelson-apprentissage/zoe-ferme-erp`))
    } else {
      console.log(INF('Réponse déploiement: ' + JSON.stringify(deploy).slice(0, 500)))
    }
    
    console.log('\n' + '═'.repeat(60))
    console.log('🎉 PROJET CRÉÉ SUR VERCEL !')
    console.log('═'.repeat(60))
    console.log(`
  📊 Dashboard : https://vercel.com/nelson-apprentissage/zoe-ferme-erp
  🌐 URL app   : https://zoe-ferme-erp.vercel.app
  
  ⏳ Le build prend ~2 minutes, puis l'URL sera active !
    `)
    
  } else if (project.error) {
    console.log(ERR(`Erreur création projet: ${project.error.message}`))
    if (project.error.message.includes('already exists')) {
      console.log(INF('Le projet existe peut-être déjà sous un autre nom. Tentative de connexion...'))
      // Essayer de lier le repo à un projet existant
      const existing = await api('GET', '/v9/projects/zoe-ferme-erp')
      if (existing.id) {
        console.log(OK(`Projet trouvé: ${existing.name}`))
        console.log(OK(`URL: https://vercel.com/nelson-apprentissage/${existing.name}`))
      }
    }
  } else {
    console.log(ERR('Réponse inattendue: ' + JSON.stringify(project).slice(0, 500)))
  }
}

main().catch(e => { console.error(ERR(e.message)); process.exit(1) })
