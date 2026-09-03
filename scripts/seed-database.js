// ============================================================
// ZOÉ FERME ERP — Script de seed via fetch natif (Node v18+)
// ============================================================
const SUPABASE_URL = 'https://hmyszecyarpadlnfsagg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhteXN6ZWN5YXJwYWRsbmZzYWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTc5ODQsImV4cCI6MjEwMzQzMzk4NH0.N1zdZ00C2Xl4KMRnXCyQjz3n7bVwW0Ocr8zwN0TFadw'

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
}

const OK  = (s) => `\x1b[32m✅ ${s}\x1b[0m`
const ERR = (s) => `\x1b[31m❌ ${s}\x1b[0m`
const INF = (s) => `\x1b[36mℹ️  ${s}\x1b[0m`
const TTL = (s) => `\x1b[33m\n━━━ ${s} ━━━\x1b[0m`

async function req(method, table, body, query = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`
  const opts = { method, headers: HEADERS }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(url, opts)
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = text }
  if (!res.ok) throw new Error(`[${table}] ${res.status}: ${JSON.stringify(json).slice(0, 200)}`)
  return json
}

const insert = async (table, data, label) => {
  const result = await req('POST', table, Array.isArray(data) ? data : [data])
  const arr = Array.isArray(result) ? result : [result]
  console.log(OK(`${label} (${arr.length} ligne(s))`))
  return arr
}

const del = async (table) => {
  try {
    await req('DELETE', table, null, '?id=neq.00000000-0000-0000-0000-000000000000')
    console.log(INF(`Table ${table} vidée`))
  } catch(e) { console.log(INF(`Table ${table}: ${e.message.slice(0,80)}`)) }
}

// Helper date relative à aujourd'hui
const d = (offset) => {
  const dt = new Date()
  dt.setDate(dt.getDate() + offset)
  return dt.toISOString().split('T')[0]
}

async function main() {
  console.log('\n🐔 ZOÉ FERME ERP — Initialisation de la base de données\n')

  // ── NETTOYAGE ───────────────────────────────────────────
  console.log(TTL('Nettoyage'))
  for (const t of ['payments','sale_items','sales','stock_movements','stock_items',
    'expenses','expense_categories','health_records','feed_consumption',
    'feed_purchases','feed_products','weight_records','mortality_records',
    'daily_records','batches','customers','suppliers','buildings','farms']) {
    await del(t)
  }

  // ── 1. FERME ────────────────────────────────────────────
  console.log(TTL('Ferme'))
  const [farm] = await insert('farms', {
    name: 'Zoé Ferme',
    location: 'Yaoundé, Cameroun — Zone de Nkolbisson',
    description: 'Exploitation avicole spécialisée en poulets de chair, capacité 2 000 têtes',
    currency: 'FCFA'
  }, 'Ferme principale')
  const fid = farm.id

  // ── 2. BÂTIMENTS ────────────────────────────────────────
  console.log(TTL('Bâtiments'))
  const [batA, batB, batNurs] = await insert('buildings', [
    { farm_id: fid, name: 'Bâtiment A', capacity: 1000, description: 'Bâtiment principal — ventilation naturelle' },
    { farm_id: fid, name: 'Bâtiment B', capacity: 800,  description: 'Bâtiment secondaire — ventilation forcée' },
    { farm_id: fid, name: 'Nurserie',   capacity: 300,  description: 'Zone de démarrage poussins d\'un jour' },
  ], 'Bâtiments (3)')

  // ── 3. FOURNISSEURS ─────────────────────────────────────
  console.log(TTL('Fournisseurs'))
  const [suppPoussin, suppAliment, suppVet, suppEquip] = await insert('suppliers', [
    { farm_id: fid, name: 'Agri-Volailles Cameroun', contact: 'M. Biyong Jean',   phone: '+237 699 112 233', type: 'poussin',    address: 'Zone industrielle Douala',    notes: 'Principal fournisseur de poussins Ross 308' },
    { farm_id: fid, name: 'SODECOTON Aliments',      contact: 'Mme Abena Claire', phone: '+237 677 445 566', type: 'aliment',    address: 'Yaoundé — Marché central',    notes: 'Aliments industriels, livraison 48h' },
    { farm_id: fid, name: 'PharmVet Cameroun',        contact: 'Dr. Essomba Paul', phone: '+237 655 789 012', type: 'medicament', address: 'Yaoundé — Quartier Bastos',   notes: 'Vétérinaire et vaccins agréé' },
    { farm_id: fid, name: 'AgroEquip SARL',            contact: 'M. Ondoua Marc',   phone: '+237 690 321 654', type: 'materiel',   address: 'Yaoundé — Mendong',          notes: 'Matériels d\'élevage' },
  ], 'Fournisseurs (4)')

  // ── 4. CLIENTS ──────────────────────────────────────────
  console.log(TTL('Clients'))
  const [custResto, custMarche, custHilton, custMme, custSuperM, custFokou] = await insert('customers', [
    { farm_id: fid, name: 'Restaurant Le Palais',  phone: '+237 699 001 122', address: 'Centre-ville Yaoundé',        customer_type: 'restaurant',  notes: 'Client fidèle, 80-100 poulets/sem.' },
    { farm_id: fid, name: 'Marché de Mfoundi',     phone: '+237 677 334 556', address: 'Marché Mfoundi, Yaoundé',     customer_type: 'revendeur',   notes: 'Revendeur en gros, paiement cash' },
    { farm_id: fid, name: 'Hôtel Hilton Yaoundé',  phone: '+237 222 234 234', address: 'Boulevard du 20 Mai',         customer_type: 'restaurant',  notes: 'Hôtel 5★ — exige certificat sanitaire' },
    { farm_id: fid, name: 'Mme Nguele Sophie',     phone: '+237 655 789 234', address: 'Quartier Bastos, Yaoundé',    customer_type: 'particulier', notes: 'Cliente régulière bi-mensuelle' },
    { farm_id: fid, name: 'Super Marché Dovv',      phone: '+237 222 212 121', address: 'Rue Nachtigal, Yaoundé',      customer_type: 'revendeur',   notes: 'Contrat mensuel 200 poulets' },
    { farm_id: fid, name: 'Restaurant Chez Fokou', phone: '+237 690 456 789', address: 'Quartier Nlongkak, Yaoundé', customer_type: 'restaurant',  notes: 'Maquis populaire, commandes régulières' },
  ], 'Clients (6)')

  // ── 5. PRODUITS ALIMENT ─────────────────────────────────
  console.log(TTL('Produits aliment'))
  const [feedStart, feedGrow, feedFinish] = await insert('feed_products', [
    { farm_id: fid, name: 'Nutri-Start Broiler',  brand: 'SODECOTON', type: 'demarrage',  unit: 'sac', weight_per_unit_kg: 25, description: 'Aliment démarrage 0-14j, 22% protéines' },
    { farm_id: fid, name: 'Nutri-Grow Broiler',   brand: 'SODECOTON', type: 'croissance', unit: 'sac', weight_per_unit_kg: 50, description: 'Aliment croissance 15-35j, 20% protéines' },
    { farm_id: fid, name: 'Nutri-Finish Broiler', brand: 'SODECOTON', type: 'finition',   unit: 'sac', weight_per_unit_kg: 50, description: 'Aliment finition 36j+, 18% protéines' },
  ], 'Produits aliment (3)')

  // ── 6. CATÉGORIES DÉPENSES ──────────────────────────────
  console.log(TTL('Catégories de dépenses'))
  const [catPoussin, catAliment, catVet, catMain, catEau, catTransport, catEquip, catLitiere, catAutres] = await insert('expense_categories', [
    { farm_id: fid, name: 'Achat poussins',       color: '#EAB308' },
    { farm_id: fid, name: 'Aliment',               color: '#22C55E' },
    { farm_id: fid, name: 'Médicaments & Vaccins', color: '#3B82F6' },
    { farm_id: fid, name: 'Main d\'œuvre',          color: '#8B5CF6' },
    { farm_id: fid, name: 'Eau & Électricité',      color: '#06B6D4' },
    { farm_id: fid, name: 'Transport',              color: '#F97316' },
    { farm_id: fid, name: 'Équipements',            color: '#EC4899' },
    { farm_id: fid, name: 'Litière',                color: '#84CC16' },
    { farm_id: fid, name: 'Autres',                 color: '#6B7280' },
  ], 'Catégories (9)')

  // ── 7. STOCKS ───────────────────────────────────────────
  console.log(TTL('Stocks'))
  await insert('stock_items', [
    { farm_id: fid, name: 'Nutri-Start Broiler',      category: 'aliment',     unit: 'sac',         current_quantity: 12,  min_threshold: 5,  unit_cost: 9500  },
    { farm_id: fid, name: 'Nutri-Grow Broiler',       category: 'aliment',     unit: 'sac',         current_quantity: 35,  min_threshold: 10, unit_cost: 14500 },
    { farm_id: fid, name: 'Nutri-Finish Broiler',     category: 'aliment',     unit: 'sac',         current_quantity: 20,  min_threshold: 10, unit_cost: 13500 },
    { farm_id: fid, name: 'Vaccin Newcastle',          category: 'medicament',  unit: 'dose (100)',  current_quantity: 8,   min_threshold: 2,  unit_cost: 4500  },
    { farm_id: fid, name: 'Vaccin Gumboro',            category: 'medicament',  unit: 'dose (100)',  current_quantity: 3,   min_threshold: 3,  unit_cost: 5200  },
    { farm_id: fid, name: 'Vitamine C Stress',         category: 'medicament',  unit: 'kg',          current_quantity: 2.5, min_threshold: 1,  unit_cost: 18000 },
    { farm_id: fid, name: 'Sciure de bois (litière)',  category: 'consommable', unit: 'sac',         current_quantity: 15,  min_threshold: 5,  unit_cost: 1500  },
    { farm_id: fid, name: 'Désinfectant ViruCid',      category: 'consommable', unit: 'litre',       current_quantity: 4,   min_threshold: 2,  unit_cost: 12000 },
    { farm_id: fid, name: 'Abreuvoirs automatiques',   category: 'equipement',  unit: 'unité',       current_quantity: 24,  min_threshold: 5,  unit_cost: 35000 },
    { farm_id: fid, name: 'Mangeoires tubulaires',     category: 'equipement',  unit: 'unité',       current_quantity: 18,  min_threshold: 5,  unit_cost: 18000 },
  ], 'Articles en stock (10)')

  // ── 8. LOT 1 — TERMINÉ ──────────────────────────────────
  console.log(TTL('Lot 1 — Terminé (LOT-2024-07)'))
  const [b1] = await insert('batches', {
    farm_id: fid, building_id: batA.id, supplier_id: suppPoussin.id,
    batch_number: 'LOT-2024-07', start_date: '2024-07-01', end_date: '2024-08-12',
    initial_count: 500, breed: 'Ross 308', purchase_price_per_unit: 550,
    status: 'closed', notes: 'Lot terminé — 42 jours, résultats satisfaisants'
  }, 'Lot 1')

  await insert('mortality_records', [
    { batch_id: b1.id, date: '2024-07-04', count: 3, cause: 'inconnu',  description: 'Mortalités initiales J3-J4' },
    { batch_id: b1.id, date: '2024-07-08', count: 2, cause: 'maladie',  description: 'Légère diarrhée' },
    { batch_id: b1.id, date: '2024-07-15', count: 5, cause: 'inconnu',  description: 'Chaleur intense 40°C' },
    { batch_id: b1.id, date: '2024-07-22', count: 2, cause: 'accident', description: 'Étouffement distribution aliment' },
    { batch_id: b1.id, date: '2024-07-30', count: 3, cause: 'maladie',  description: 'Quelques cas de coryza' },
    { batch_id: b1.id, date: '2024-08-05', count: 2, cause: 'inconnu' },
  ], 'Mortalités lot 1 (17 têtes)')

  await insert('weight_records', [
    { batch_id: b1.id, date: '2024-07-08', age_days: 7,  sample_size: 20, avg_weight_g: 168,  min_weight_g: 145, max_weight_g: 195 },
    { batch_id: b1.id, date: '2024-07-15', age_days: 14, sample_size: 20, avg_weight_g: 382,  min_weight_g: 340, max_weight_g: 425 },
    { batch_id: b1.id, date: '2024-07-22', age_days: 21, sample_size: 25, avg_weight_g: 780,  min_weight_g: 710, max_weight_g: 855 },
    { batch_id: b1.id, date: '2024-07-29', age_days: 28, sample_size: 25, avg_weight_g: 1320, min_weight_g: 1180, max_weight_g: 1480 },
    { batch_id: b1.id, date: '2024-08-05', age_days: 35, sample_size: 30, avg_weight_g: 1950, min_weight_g: 1750, max_weight_g: 2200 },
    { batch_id: b1.id, date: '2024-08-12', age_days: 42, sample_size: 30, avg_weight_g: 2450, min_weight_g: 2200, max_weight_g: 2750, notes: 'Abattage final' },
  ], 'Pesées lot 1 (6 relevés)')

  await insert('feed_purchases', [
    { batch_id: b1.id, supplier_id: suppAliment.id, product_id: feedStart.id,  date: '2024-07-01', quantity: 10, unit_price: 9500,  invoice_ref: 'FAC-2024-0701' },
    { batch_id: b1.id, supplier_id: suppAliment.id, product_id: feedGrow.id,   date: '2024-07-14', quantity: 20, unit_price: 14500, invoice_ref: 'FAC-2024-0714' },
    { batch_id: b1.id, supplier_id: suppAliment.id, product_id: feedGrow.id,   date: '2024-07-21', quantity: 15, unit_price: 14500, invoice_ref: 'FAC-2024-0721' },
    { batch_id: b1.id, supplier_id: suppAliment.id, product_id: feedFinish.id, date: '2024-08-01', quantity: 20, unit_price: 13500, invoice_ref: 'FAC-2024-0801' },
  ], 'Achats aliment lot 1')

  await insert('feed_consumption', [
    { batch_id: b1.id, product_id: feedStart.id,  date: '2024-07-05', quantity_kg: 50 },
    { batch_id: b1.id, product_id: feedStart.id,  date: '2024-07-10', quantity_kg: 125 },
    { batch_id: b1.id, product_id: feedGrow.id,   date: '2024-07-16', quantity_kg: 250 },
    { batch_id: b1.id, product_id: feedGrow.id,   date: '2024-07-23', quantity_kg: 380 },
    { batch_id: b1.id, product_id: feedGrow.id,   date: '2024-07-30', quantity_kg: 450 },
    { batch_id: b1.id, product_id: feedFinish.id, date: '2024-08-06', quantity_kg: 500 },
  ], 'Consommation aliment lot 1')

  await insert('health_records', [
    { batch_id: b1.id, date: '2024-07-03', type: 'vaccination', product_name: 'Newcastle La Sota',     dose: '1 dose/eau', route: 'eau',      administered_by: 'Dr. Essomba', cost: 22500 },
    { batch_id: b1.id, date: '2024-07-07', type: 'vaccination', product_name: 'Gumboro IBD',           dose: '1 dose/eau', route: 'eau',      administered_by: 'Dr. Essomba', cost: 26000 },
    { batch_id: b1.id, date: '2024-07-10', type: 'traitement',  product_name: 'Amoxicilline 20%',      dose: '1g/L 5j',    route: 'eau',      administered_by: 'Responsable', cost: 15000 },
    { batch_id: b1.id, date: '2024-07-14', type: 'vaccination', product_name: 'Newcastle Rappel H120', dose: '1 dose',     route: 'oculaire', administered_by: 'Dr. Essomba', cost: 22500 },
    { batch_id: b1.id, date: '2024-07-21', type: 'vaccination', product_name: 'Gumboro Rappel',        dose: '1 dose/eau', route: 'eau',      administered_by: 'Dr. Essomba', cost: 26000 },
    { batch_id: b1.id, date: '2024-07-25', type: 'prevention',  product_name: 'Vitamine C + Électrolytes', dose: '1g/L 3j', route: 'eau',   administered_by: 'Responsable', cost: 9000, notes: 'Stress chaleur' },
  ], 'Soins lot 1 (6 actes)')

  await insert('expenses', [
    { batch_id: b1.id, category_id: catPoussin.id,   supplier_id: suppPoussin.id, date: '2024-07-01', description: 'Achat 500 poussins Ross 308 J1', amount: 275000 },
    { batch_id: b1.id, category_id: catMain.id,                                   date: '2024-07-31', description: 'Salaire ouvrier juillet',          amount: 75000 },
    { batch_id: b1.id, category_id: catEau.id,                                    date: '2024-07-31', description: 'Eau + électricité juillet',         amount: 28500 },
    { batch_id: b1.id, category_id: catTransport.id, supplier_id: suppPoussin.id, date: '2024-07-01', description: 'Transport poussins Douala',         amount: 15000 },
    { batch_id: b1.id, category_id: catLitiere.id,                                date: '2024-07-01', description: 'Sciure de bois 10 sacs',            amount: 15000 },
    { batch_id: b1.id, category_id: catEquip.id,                                  date: '2024-07-05', description: 'Réparation abreuvoir',              amount: 12000 },
    { batch_id: b1.id, category_id: catAutres.id,                                 date: '2024-07-15', description: 'Produits nettoyage bâtiment',        amount: 8500 },
  ], 'Dépenses lot 1')

  const sales1 = await insert('sales', [
    { batch_id: b1.id, customer_id: custResto.id,  date: '2024-08-05', status: 'paid',    total_amount: 400000 },
    { batch_id: b1.id, customer_id: custMarche.id, date: '2024-08-08', status: 'paid',    total_amount: 600000 },
    { batch_id: b1.id, customer_id: custHilton.id, date: '2024-08-10', status: 'paid',    total_amount: 525000 },
    { batch_id: b1.id, customer_id: custSuperM.id, date: '2024-08-12', status: 'partial', total_amount: 560000, notes: 'Solde 210k dû' },
    { batch_id: b1.id, customer_id: custFokou.id,  date: '2024-08-12', status: 'paid',    total_amount: 280000 },
  ], 'Ventes lot 1 (5)')

  await insert('sale_items', [
    { sale_id: sales1[0].id, quantity: 100, unit_weight_kg: 2.30, total_weight_kg: 230.0,  unit_price: 4000, total_price: 400000 },
    { sale_id: sales1[1].id, quantity: 150, unit_weight_kg: 2.35, total_weight_kg: 352.5,  unit_price: 4000, total_price: 600000 },
    { sale_id: sales1[2].id, quantity: 75,  unit_weight_kg: 2.45, total_weight_kg: 183.75, unit_price: 7000, total_price: 525000, description: 'Sélection Hilton' },
    { sale_id: sales1[3].id, quantity: 80,  unit_weight_kg: 2.40, total_weight_kg: 192.0,  unit_price: 7000, total_price: 560000 },
    { sale_id: sales1[4].id, quantity: 40,  unit_weight_kg: 2.20, total_weight_kg: 88.0,   unit_price: 7000, total_price: 280000 },
  ], 'Articles vente lot 1')

  await insert('payments', [
    { sale_id: sales1[0].id, customer_id: custResto.id,  date: '2024-08-05', amount: 400000, method: 'mobile_money', reference: 'MTN-2408-001' },
    { sale_id: sales1[1].id, customer_id: custMarche.id, date: '2024-08-08', amount: 600000, method: 'especes' },
    { sale_id: sales1[2].id, customer_id: custHilton.id, date: '2024-08-12', amount: 525000, method: 'virement',     reference: 'VIR-HILTON-0812' },
    { sale_id: sales1[3].id, customer_id: custSuperM.id, date: '2024-08-12', amount: 350000, method: 'especes',      notes: 'Acompte — solde 210k dû' },
    { sale_id: sales1[4].id, customer_id: custFokou.id,  date: '2024-08-12', amount: 280000, method: 'mobile_money', reference: 'OM-2408-045' },
  ], 'Paiements lot 1')

  // ── 9. LOT 2 — EN COURS (28 jours) ─────────────────────
  console.log(TTL('Lot 2 — Actif depuis 28 jours (LOT-2024-09-A)'))
  const [b2] = await insert('batches', {
    farm_id: fid, building_id: batA.id, supplier_id: suppPoussin.id,
    batch_number: 'LOT-2024-09-A', start_date: d(-28),
    initial_count: 800, breed: 'Ross 308', purchase_price_per_unit: 550,
    status: 'active', notes: 'En cours — excellent démarrage homogène'
  }, 'Lot 2')

  await insert('mortality_records', [
    { batch_id: b2.id, date: d(-26), count: 4, cause: 'inconnu',   description: 'Mortalités initiales J2-J3' },
    { batch_id: b2.id, date: d(-21), count: 2, cause: 'accident',  description: 'Écrasement lors ramassage' },
    { batch_id: b2.id, date: d(-14), count: 3, cause: 'maladie',   description: 'Légère bronchite infectieuse' },
    { batch_id: b2.id, date: d(-7),  count: 2, cause: 'inconnu' },
  ], 'Mortalités lot 2 (11 têtes)')

  await insert('weight_records', [
    { batch_id: b2.id, date: d(-21), age_days: 7,  sample_size: 30, avg_weight_g: 175,  min_weight_g: 152, max_weight_g: 198, notes: 'J7 — très bon démarrage' },
    { batch_id: b2.id, date: d(-14), age_days: 14, sample_size: 30, avg_weight_g: 405,  min_weight_g: 370, max_weight_g: 445, notes: 'J14 — au-dessus standard Ross' },
    { batch_id: b2.id, date: d(-7),  age_days: 21, sample_size: 30, avg_weight_g: 830,  min_weight_g: 760, max_weight_g: 910, notes: 'J21 — excellent GMQ' },
    { batch_id: b2.id, date: d(0),   age_days: 28, sample_size: 30, avg_weight_g: 1420, min_weight_g: 1280, max_weight_g: 1600, notes: 'J28 — poids homogène' },
  ], 'Pesées lot 2 (4 relevés)')

  await insert('feed_purchases', [
    { batch_id: b2.id, supplier_id: suppAliment.id, product_id: feedStart.id, date: d(-28), quantity: 16, unit_price: 9500,  invoice_ref: 'FAC-2024-0901' },
    { batch_id: b2.id, supplier_id: suppAliment.id, product_id: feedGrow.id,  date: d(-14), quantity: 30, unit_price: 14500, invoice_ref: 'FAC-2024-0915' },
    { batch_id: b2.id, supplier_id: suppAliment.id, product_id: feedGrow.id,  date: d(-5),  quantity: 20, unit_price: 14500, invoice_ref: 'FAC-2024-0926' },
  ], 'Achats aliment lot 2')

  await insert('feed_consumption', [
    { batch_id: b2.id, product_id: feedStart.id, date: d(-25), quantity_kg: 80 },
    { batch_id: b2.id, product_id: feedStart.id, date: d(-20), quantity_kg: 160 },
    { batch_id: b2.id, product_id: feedGrow.id,  date: d(-14), quantity_kg: 350 },
    { batch_id: b2.id, product_id: feedGrow.id,  date: d(-7),  quantity_kg: 520 },
  ], 'Consommation aliment lot 2')

  await insert('health_records', [
    { batch_id: b2.id, date: d(-26), type: 'vaccination', product_name: 'Newcastle La Sota',  dose: '1 dose/eau',  route: 'eau',      administered_by: 'Dr. Essomba', cost: 36000 },
    { batch_id: b2.id, date: d(-22), type: 'vaccination', product_name: 'Gumboro IBD',        dose: '1 dose/eau',  route: 'eau',      administered_by: 'Dr. Essomba', cost: 41600 },
    { batch_id: b2.id, date: d(-15), type: 'traitement',  product_name: 'Tylosine 100mg',     dose: '500mg/L 5j',  route: 'eau',      administered_by: 'Responsable', cost: 18500, notes: 'Bronchite infectieuse' },
    { batch_id: b2.id, date: d(-14), type: 'vaccination', product_name: 'Newcastle Rappel',   dose: '1 dose collyre', route: 'oculaire', administered_by: 'Dr. Essomba', cost: 36000 },
    { batch_id: b2.id, date: d(-7),  type: 'vaccination', product_name: 'Gumboro Rappel',     dose: '1 dose/eau',  route: 'eau',      administered_by: 'Dr. Essomba', cost: 41600 },
  ], 'Soins lot 2 (5 actes)')

  await insert('expenses', [
    { batch_id: b2.id, category_id: catPoussin.id,   supplier_id: suppPoussin.id, date: d(-28), description: 'Achat 800 poussins Ross 308',        amount: 440000 },
    { batch_id: b2.id, category_id: catLitiere.id,                                date: d(-28), description: 'Sciure de bois 15 sacs',             amount: 22500 },
    { batch_id: b2.id, category_id: catTransport.id, supplier_id: suppPoussin.id, date: d(-28), description: 'Transport poussins Douala-Yaoundé',   amount: 20000 },
    { batch_id: b2.id, category_id: catMain.id,                                   date: d(-1),  description: 'Salaire ouvrier — mois courant',      amount: 75000 },
    { batch_id: b2.id, category_id: catEau.id,                                    date: d(-1),  description: 'Eau + électricité — mois courant',    amount: 31000 },
  ], 'Dépenses lot 2')

  // ── 10. LOT 3 — NOUVEAU (5 jours) ──────────────────────
  console.log(TTL('Lot 3 — Démarrage il y a 5 jours (LOT-2024-09-B)'))
  const [b3] = await insert('batches', {
    farm_id: fid, building_id: batB.id, supplier_id: suppPoussin.id,
    batch_number: 'LOT-2024-09-B', start_date: d(-5),
    initial_count: 600, breed: 'Cobb 500', purchase_price_per_unit: 600,
    status: 'active', notes: 'Nouveau lot — souche Cobb 500 pour test performance'
  }, 'Lot 3')

  await insert('mortality_records', [
    { batch_id: b3.id, date: d(-3), count: 5, cause: 'inconnu', description: 'Mortalités initiales normales J2' },
    { batch_id: b3.id, date: d(-1), count: 2, cause: 'inconnu' },
  ], 'Mortalités lot 3 (7 têtes)')

  await insert('weight_records', [
    { batch_id: b3.id, date: d(-2), age_days: 3, sample_size: 20, avg_weight_g: 65, min_weight_g: 55, max_weight_g: 78, notes: 'J3 — poids entrée normal' },
  ], 'Pesées lot 3')

  await insert('feed_purchases', [
    { batch_id: b3.id, supplier_id: suppAliment.id, product_id: feedStart.id, date: d(-5), quantity: 12, unit_price: 9500, invoice_ref: 'FAC-2024-0930' },
  ], 'Achats aliment lot 3')

  await insert('feed_consumption', [
    { batch_id: b3.id, product_id: feedStart.id, date: d(-3), quantity_kg: 45 },
    { batch_id: b3.id, product_id: feedStart.id, date: d(-1), quantity_kg: 60 },
  ], 'Consommation aliment lot 3')

  await insert('health_records', [
    { batch_id: b3.id, date: d(-3), type: 'vaccination', product_name: 'Newcastle La Sota', dose: '1 dose/eau', route: 'eau', administered_by: 'Dr. Essomba', cost: 27000, notes: 'J2 — primo Newcastle' },
  ], 'Santé lot 3')

  await insert('expenses', [
    { batch_id: b3.id, category_id: catPoussin.id,   supplier_id: suppPoussin.id, date: d(-5), description: 'Achat 600 poussins Cobb 500', amount: 360000 },
    { batch_id: b3.id, category_id: catLitiere.id,                                date: d(-5), description: 'Sciure de bois 12 sacs',       amount: 18000 },
    { batch_id: b3.id, category_id: catTransport.id,                              date: d(-5), description: 'Transport poussins',            amount: 18000 },
  ], 'Dépenses lot 3')

  // ── RAPPORT FINAL ────────────────────────────────────────
  console.log('\n' + '═'.repeat(60))
  console.log('🎉  BASE DE DONNÉES INITIALISÉE AVEC SUCCÈS !')
  console.log('═'.repeat(60))
  console.log(`
  📦 Ferme           : Zoé Ferme — Yaoundé, Cameroun
  🏗️  Bâtiments      : 3 (Bât. A · Bât. B · Nurserie)
  🤝  Fournisseurs   : 4 (poussins, aliment, veto, équip.)
  👥  Clients         : 6 (restaurants, revendeurs, particulier)
  🌾  Produits aliment: 3 (démarrage, croissance, finition)
  🧾  Catég. dépenses : 9
  📦  Articles stock  : 10

  🐔  LOTS DE PRODUCTION :
     • LOT-2024-07    → Terminé   | 500 poussins | 42j | Ross 308
     • LOT-2024-09-A  → En cours  | 800 poussins | 28j | Ross 308
     • LOT-2024-09-B  → Démarrage | 600 poussins |  5j | Cobb 500

  💰  DONNÉES FINANCIÈRES :
     • Lot 1  : CA = 2 365 000 FCFA — solde 210k impayé
     • Lots 2+3 : en cours, dépenses déjà enregistrées

  🌐  Ouvrez http://localhost:3000 — les données sont en live !
  `)
}

main().catch(e => { console.error('\x1b[31m❌ ERREUR:\x1b[0m', e.message); process.exit(1) })
