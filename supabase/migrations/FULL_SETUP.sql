-- ============================================================
-- ZOÉ FERME ERP — SCRIPT COMPLET : Schéma + Données de test
-- Instructions :
--   1. Aller sur https://supabase.com/dashboard
--   2. Ouvrir votre projet > SQL Editor
--   3. Coller ce fichier entier et cliquer "Run"
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP TOUT (pour repartir de zéro proprement)
-- ============================================================
DROP TABLE IF EXISTS payments          CASCADE;
DROP TABLE IF EXISTS sale_items        CASCADE;
DROP TABLE IF EXISTS sales             CASCADE;
DROP TABLE IF EXISTS stock_movements   CASCADE;
DROP TABLE IF EXISTS stock_items       CASCADE;
DROP TABLE IF EXISTS expenses          CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS health_records    CASCADE;
DROP TABLE IF EXISTS feed_consumption  CASCADE;
DROP TABLE IF EXISTS feed_purchases    CASCADE;
DROP TABLE IF EXISTS feed_products     CASCADE;
DROP TABLE IF EXISTS weight_records    CASCADE;
DROP TABLE IF EXISTS mortality_records CASCADE;
DROP TABLE IF EXISTS daily_records     CASCADE;
DROP TABLE IF EXISTS batch_movements   CASCADE;
DROP TABLE IF EXISTS batches           CASCADE;
DROP TABLE IF EXISTS buildings         CASCADE;
DROP TABLE IF EXISTS customers         CASCADE;
DROP TABLE IF EXISTS suppliers         CASCADE;
DROP TABLE IF EXISTS farms             CASCADE;
DROP TABLE IF EXISTS profiles          CASCADE;
DROP VIEW  IF EXISTS batch_summary     CASCADE;
DROP VIEW  IF EXISTS batch_financials  CASCADE;
DROP VIEW  IF EXISTS customer_balances CASCADE;
DROP VIEW  IF EXISTS stock_alerts      CASCADE;
DROP VIEW  IF EXISTS batch_zootechnical CASCADE;

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'employee')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID,
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    currency TEXT NOT NULL DEFAULT 'FCFA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    contact TEXT,
    phone TEXT,
    address TEXT,
    type TEXT CHECK (type IN ('poussin', 'aliment', 'medicament', 'materiel', 'autre')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    customer_type TEXT NOT NULL DEFAULT 'particulier'
        CHECK (customer_type IN ('particulier', 'revendeur', 'restaurant', 'autre')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
    building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    batch_number TEXT NOT NULL,
    start_date DATE NOT NULL,
    initial_count INTEGER NOT NULL CHECK (initial_count > 0),
    breed TEXT,
    purchase_price_per_unit NUMERIC(12, 2),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    notes TEXT,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (farm_id, batch_number)
);

CREATE TABLE batch_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('transfer', 'split', 'merge', 'adjustment')),
    quantity INTEGER NOT NULL,
    destination_building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    living_count INTEGER NOT NULL CHECK (living_count >= 0),
    water_consumption_l NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (batch_id, date)
);

CREATE TABLE mortality_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
    cause TEXT CHECK (cause IN ('maladie', 'accident', 'inconnu', 'reforme', 'autre')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE weight_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    age_days INTEGER,
    sample_size INTEGER NOT NULL DEFAULT 10 CHECK (sample_size > 0),
    avg_weight_g NUMERIC(10, 2) NOT NULL CHECK (avg_weight_g > 0),
    min_weight_g NUMERIC(10, 2),
    max_weight_g NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE feed_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    type TEXT CHECK (type IN ('demarrage', 'croissance', 'finition', 'autre')),
    unit TEXT NOT NULL DEFAULT 'sac' CHECK (unit IN ('kg', 'sac', 'tonne')),
    weight_per_unit_kg NUMERIC(10, 2) NOT NULL DEFAULT 50,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE feed_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    product_id UUID REFERENCES feed_products(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price > 0),
    total_price NUMERIC(14, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    invoice_ref TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE feed_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    daily_record_id UUID REFERENCES daily_records(id) ON DELETE SET NULL,
    product_id UUID REFERENCES feed_products(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL CHECK (quantity_kg > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('vaccination', 'traitement', 'prevention', 'diagnostic', 'autre')),
    product_name TEXT NOT NULL,
    dose TEXT,
    route TEXT CHECK (route IN ('eau', 'injection', 'oculaire', 'oral', 'autre')),
    administered_by TEXT,
    cost NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('aliment', 'medicament', 'consommable', 'equipement', 'autre')),
    unit TEXT NOT NULL DEFAULT 'unité',
    current_quantity NUMERIC(14, 2) NOT NULL DEFAULT 0,
    min_threshold NUMERIC(14, 2) DEFAULT 0,
    unit_cost NUMERIC(12, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE NOT NULL,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('entree', 'sortie', 'ajustement')),
    quantity NUMERIC(14, 2) NOT NULL,
    unit_cost NUMERIC(12, 2),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_weight_kg NUMERIC(10, 3),
    total_weight_kg NUMERIC(10, 3),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price > 0),
    total_price NUMERIC(14, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
    date DATE NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL DEFAULT 'especes'
        CHECK (method IN ('especes', 'mobile_money', 'virement', 'cheque', 'autre')),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. INDEX
-- ============================================================
CREATE INDEX idx_batches_farm_id ON batches(farm_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_daily_records_batch_date ON daily_records(batch_id, date DESC);
CREATE INDEX idx_mortality_batch_date ON mortality_records(batch_id, date DESC);
CREATE INDEX idx_weight_batch_date ON weight_records(batch_id, date DESC);
CREATE INDEX idx_feed_purchases_batch ON feed_purchases(batch_id);
CREATE INDEX idx_feed_consumption_batch_date ON feed_consumption(batch_id, date DESC);
CREATE INDEX idx_expenses_batch ON expenses(batch_id);
CREATE INDEX idx_sales_batch ON sales(batch_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_payments_sale ON payments(sale_id);
CREATE INDEX idx_stock_movements_item ON stock_movements(stock_item_id);

-- ============================================================
-- 3. TRIGGER updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'farms','buildings','suppliers','customers','batches','daily_records',
    'mortality_records','weight_records','feed_products','feed_purchases',
    'feed_consumption','health_records','expenses','stock_items','sales',
    'sale_items','payments'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t, t);
  END LOOP;
END; $$;

-- ============================================================
-- 4. VUES ANALYTIQUES
-- ============================================================

CREATE OR REPLACE VIEW batch_summary AS
SELECT b.id, b.farm_id, b.batch_number, b.start_date, b.end_date,
    b.initial_count, b.status, b.breed, bg.name AS building_name,
    COALESCE(SUM(mr.count), 0) AS total_mortality,
    ROUND(COALESCE(SUM(mr.count), 0)::NUMERIC / NULLIF(b.initial_count, 0) * 100, 2) AS mortality_rate_pct,
    b.initial_count - COALESCE(SUM(mr.count), 0) - COALESCE(sold.total_sold, 0) AS current_count,
    COALESCE(sold.total_sold, 0) AS total_sold,
    COALESCE(b.end_date, CURRENT_DATE) - b.start_date AS age_days,
    last_w.avg_weight_g AS last_avg_weight_g,
    last_w.date AS last_weight_date
FROM batches b
LEFT JOIN buildings bg ON bg.id = b.building_id
LEFT JOIN mortality_records mr ON mr.batch_id = b.id
LEFT JOIN (
    SELECT si.batch_id, SUM(si.quantity) AS total_sold
    FROM sale_items si JOIN sales s ON s.id = si.sale_id
    WHERE s.status != 'cancelled' GROUP BY si.batch_id
) sold ON sold.batch_id = b.id
LEFT JOIN LATERAL (
    SELECT avg_weight_g, date FROM weight_records wr
    WHERE wr.batch_id = b.id ORDER BY date DESC LIMIT 1
) last_w ON TRUE
GROUP BY b.id, b.farm_id, b.batch_number, b.start_date, b.end_date,
         b.initial_count, b.status, b.breed, bg.name, sold.total_sold,
         last_w.avg_weight_g, last_w.date;

CREATE OR REPLACE VIEW batch_financials AS
SELECT b.id, b.farm_id, b.batch_number, b.start_date, b.status,
    COALESCE(fp.total_feed_cost, 0) AS total_feed_cost,
    COALESCE(b.purchase_price_per_unit * b.initial_count, 0) AS total_chick_cost,
    COALESCE(exp.total_expenses, 0) AS total_other_expenses,
    COALESCE(fp.total_feed_cost, 0) + COALESCE(b.purchase_price_per_unit * b.initial_count, 0) + COALESCE(exp.total_expenses, 0) AS total_cost,
    COALESCE(rev.total_revenue, 0) AS total_revenue,
    COALESCE(pay.total_paid, 0) AS total_paid,
    COALESCE(rev.total_revenue, 0) - COALESCE(pay.total_paid, 0) AS total_receivable,
    COALESCE(rev.total_revenue, 0) - COALESCE(fp.total_feed_cost, 0) - COALESCE(b.purchase_price_per_unit * b.initial_count, 0) - COALESCE(exp.total_expenses, 0) AS gross_margin,
    COALESCE(rev.total_weight_kg, 0) AS total_weight_sold_kg
FROM batches b
LEFT JOIN (SELECT batch_id, SUM(total_price) AS total_feed_cost FROM feed_purchases GROUP BY batch_id) fp ON fp.batch_id = b.id
LEFT JOIN (SELECT batch_id, SUM(amount) AS total_expenses FROM expenses GROUP BY batch_id) exp ON exp.batch_id = b.id
LEFT JOIN (SELECT si.batch_id, SUM(si.total_price) AS total_revenue, SUM(si.total_weight_kg) AS total_weight_kg
    FROM sale_items si JOIN sales s ON s.id = si.sale_id WHERE s.status != 'cancelled' GROUP BY si.batch_id) rev ON rev.batch_id = b.id
LEFT JOIN (SELECT s.batch_id, SUM(p.amount) AS total_paid FROM payments p JOIN sales s ON s.id = p.sale_id GROUP BY s.batch_id) pay ON pay.batch_id = b.id;

CREATE OR REPLACE VIEW customer_balances AS
SELECT c.id AS customer_id, c.farm_id, c.name AS customer_name, c.phone, c.customer_type,
    COUNT(DISTINCT s.id) AS total_sales,
    COALESCE(SUM(s.total_amount), 0) AS total_invoiced,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    COALESCE(SUM(s.total_amount), 0) - COALESCE(SUM(p.amount), 0) AS balance_due
FROM customers c
LEFT JOIN sales s ON s.customer_id = c.id AND s.status != 'cancelled'
LEFT JOIN payments p ON p.customer_id = c.id
GROUP BY c.id, c.farm_id, c.name, c.phone, c.customer_type;

CREATE OR REPLACE VIEW stock_alerts AS
SELECT si.id, si.farm_id, si.name, si.category, si.unit,
    si.current_quantity, si.min_threshold, si.unit_cost,
    CASE WHEN si.current_quantity = 0 THEN 'rupture'
         WHEN si.current_quantity <= si.min_threshold THEN 'critique'
         ELSE 'normal' END AS alert_level
FROM stock_items si WHERE si.current_quantity <= si.min_threshold;

-- ============================================================
-- 5. RLS DÉSACTIVÉ (mode développement — accès anonyme)
-- ============================================================
-- NOTE: En production, activer le RLS et l'authentification
ALTER TABLE farms             DISABLE ROW LEVEL SECURITY;
ALTER TABLE buildings         DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers         DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers         DISABLE ROW LEVEL SECURITY;
ALTER TABLE batches           DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records     DISABLE ROW LEVEL SECURITY;
ALTER TABLE mortality_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records    DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_products     DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_purchases    DISABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumption  DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_records    DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses          DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items       DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements   DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales             DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items        DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments          DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. DONNÉES DE TEST (Zoé Ferme — Yaoundé, Cameroun)
-- ============================================================

DO $$
DECLARE
  fid UUID; bat_a UUID; bat_b UUID; bat_nurs UUID;
  supp_p UUID; supp_a UUID; supp_v UUID; supp_e UUID;
  cust_r UUID; cust_m UUID; cust_h UUID; cust_me UUID; cust_s UUID; cust_f UUID;
  fp_s UUID; fp_g UUID; fp_fin UUID;
  cat1 UUID; cat2 UUID; cat3 UUID; cat4 UUID; cat5 UUID;
  cat6 UUID; cat7 UUID; cat8 UUID; cat9 UUID;
  b1 UUID; b2 UUID; b3 UUID;
  s1 UUID; s2 UUID; s3 UUID; s4 UUID; s5 UUID;
BEGIN

-- FERME
INSERT INTO farms (name, location, description, currency)
VALUES ('Zoé Ferme', 'Yaoundé, Cameroun — Zone de Nkolbisson',
        'Exploitation avicole spécialisée en poulets de chair, capacité 2 000 têtes', 'FCFA')
RETURNING id INTO fid;

-- BÂTIMENTS
INSERT INTO buildings (farm_id, name, capacity, description) VALUES
  (fid, 'Bâtiment A', 1000, 'Bâtiment principal — ventilation naturelle') RETURNING id INTO bat_a;
INSERT INTO buildings (farm_id, name, capacity, description) VALUES
  (fid, 'Bâtiment B', 800, 'Bâtiment secondaire — ventilation forcée') RETURNING id INTO bat_b;
INSERT INTO buildings (farm_id, name, capacity, description) VALUES
  (fid, 'Nurserie', 300, 'Zone de démarrage poussins') RETURNING id INTO bat_nurs;

-- FOURNISSEURS
INSERT INTO suppliers (farm_id, name, contact, phone, type, address, notes) VALUES
  (fid, 'Agri-Volailles Cameroun', 'M. Biyong Jean',   '+237 699 112 233', 'poussin',    'Zone industrielle Douala',  'Fournisseur Ross 308')  RETURNING id INTO supp_p;
INSERT INTO suppliers (farm_id, name, contact, phone, type, address, notes) VALUES
  (fid, 'SODECOTON Aliments',      'Mme Abena Claire', '+237 677 445 566', 'aliment',    'Yaoundé — Marché central',  'Livraison 48h')          RETURNING id INTO supp_a;
INSERT INTO suppliers (farm_id, name, contact, phone, type, address, notes) VALUES
  (fid, 'PharmVet Cameroun',        'Dr. Essomba Paul', '+237 655 789 012', 'medicament', 'Yaoundé — Bastos',          'Vétérinaire agréé')      RETURNING id INTO supp_v;
INSERT INTO suppliers (farm_id, name, contact, phone, type, address, notes) VALUES
  (fid, 'AgroEquip SARL',            'M. Ondoua Marc',   '+237 690 321 654', 'materiel',   'Yaoundé — Mendong',         'Matériels élevage')      RETURNING id INTO supp_e;

-- CLIENTS
INSERT INTO customers (farm_id, name, phone, address, customer_type, notes) VALUES
  (fid, 'Restaurant Le Palais',  '+237 699 001 122', 'Centre-ville Yaoundé',      'restaurant',  '80-100 poulets/semaine')   RETURNING id INTO cust_r;
INSERT INTO customers (farm_id, name, phone, address, customer_type, notes) VALUES
  (fid, 'Marché de Mfoundi',     '+237 677 334 556', 'Marché Mfoundi, Yaoundé',   'revendeur',   'Paiement cash')            RETURNING id INTO cust_m;
INSERT INTO customers (farm_id, name, phone, address, customer_type, notes) VALUES
  (fid, 'Hôtel Hilton Yaoundé',  '+237 222 234 234', 'Blvd du 20 Mai, Yaoundé',   'restaurant',  'Exige certificat sanitaire') RETURNING id INTO cust_h;
INSERT INTO customers (farm_id, name, phone, address, customer_type, notes) VALUES
  (fid, 'Mme Nguele Sophie',     '+237 655 789 234', 'Quartier Bastos, Yaoundé',  'particulier', 'Cliente bi-mensuelle')     RETURNING id INTO cust_me;
INSERT INTO customers (farm_id, name, phone, address, customer_type, notes) VALUES
  (fid, 'Super Marché Dovv',      '+237 222 212 121', 'Rue Nachtigal, Yaoundé',    'revendeur',   'Contrat mensuel 200 têtes') RETURNING id INTO cust_s;
INSERT INTO customers (farm_id, name, phone, address, customer_type, notes) VALUES
  (fid, 'Restaurant Chez Fokou', '+237 690 456 789', 'Quartier Nlongkak, Yaoundé','restaurant',  'Commandes régulières')     RETURNING id INTO cust_f;

-- PRODUITS ALIMENT
INSERT INTO feed_products (farm_id, name, brand, type, unit, weight_per_unit_kg, description) VALUES
  (fid, 'Nutri-Start Broiler',  'SODECOTON', 'demarrage',  'sac', 25, 'Démarrage 0-14j, 22% protéines')  RETURNING id INTO fp_s;
INSERT INTO feed_products (farm_id, name, brand, type, unit, weight_per_unit_kg, description) VALUES
  (fid, 'Nutri-Grow Broiler',   'SODECOTON', 'croissance', 'sac', 50, 'Croissance 15-35j, 20% protéines') RETURNING id INTO fp_g;
INSERT INTO feed_products (farm_id, name, brand, type, unit, weight_per_unit_kg, description) VALUES
  (fid, 'Nutri-Finish Broiler', 'SODECOTON', 'finition',   'sac', 50, 'Finition 36j+, 18% protéines')     RETURNING id INTO fp_fin;

-- CATÉGORIES DÉPENSES
INSERT INTO expense_categories (farm_id, name, color) VALUES (fid, 'Achat poussins', '#EAB308')       RETURNING id INTO cat1;
INSERT INTO expense_categories (farm_id, name, color) VALUES (fid, 'Aliment', '#22C55E')               RETURNING id INTO cat2;
INSERT INTO expense_categories (farm_id, name, color) VALUES (fid, 'Médicaments & Vaccins', '#3B82F6') RETURNING id INTO cat3;
INSERT INTO expense_categories (farm_id, name, color) VALUES (fid, 'Main d''œuvre', '#8B5CF6')          RETURNING id INTO cat4;
INSERT INTO expense_categories (farm_id, name, color) VALUES (fid, 'Eau & Électricité', '#06B6D4')     RETURNING id INTO cat5;
INSERT INTO expense_categories (farm_id, name, color) VALUES (fid, 'Transport', '#F97316')             RETURNING id INTO cat6;
INSERT INTO expense_categories (farm_id, name, color) VALUES (fid, 'Équipements', '#EC4899')           RETURNING id INTO cat7;
INSERT INTO expense_categories (farm_id, name, color) VALUES (fid, 'Litière', '#84CC16')               RETURNING id INTO cat8;
INSERT INTO expense_categories (farm_id, name, color) VALUES (fid, 'Autres', '#6B7280')               RETURNING id INTO cat9;

-- STOCKS
INSERT INTO stock_items (farm_id, name, category, unit, current_quantity, min_threshold, unit_cost) VALUES
  (fid, 'Nutri-Start Broiler',     'aliment',     'sac',        12,  5,  9500),
  (fid, 'Nutri-Grow Broiler',      'aliment',     'sac',        35, 10, 14500),
  (fid, 'Nutri-Finish Broiler',    'aliment',     'sac',        20, 10, 13500),
  (fid, 'Vaccin Newcastle',         'medicament',  'dose (100)',  8,  2,  4500),
  (fid, 'Vaccin Gumboro',           'medicament',  'dose (100)',  3,  3,  5200),
  (fid, 'Vitamine C Stress',        'medicament',  'kg',          2.5, 1, 18000),
  (fid, 'Sciure de bois (litière)', 'consommable', 'sac',        15,  5,  1500),
  (fid, 'Désinfectant ViruCid',     'consommable', 'litre',       4,  2, 12000),
  (fid, 'Abreuvoirs automatiques',  'equipement',  'unité',      24,  5, 35000),
  (fid, 'Mangeoires tubulaires',    'equipement',  'unité',      18,  5, 18000);

-- ── LOT 1 — TERMINÉ (juillet-août 2024) ─────────────────────
INSERT INTO batches (farm_id, building_id, supplier_id, batch_number, start_date, end_date,
    initial_count, breed, purchase_price_per_unit, status, notes)
VALUES (fid, bat_a, supp_p, 'LOT-2024-07', '2024-07-01', '2024-08-12',
    500, 'Ross 308', 550, 'closed', 'Lot terminé — 42 jours')
RETURNING id INTO b1;

INSERT INTO mortality_records (batch_id, date, count, cause, description) VALUES
  (b1, '2024-07-04',  3, 'inconnu',  'Mortalités initiales J3-J4'),
  (b1, '2024-07-08',  2, 'maladie',  'Légère diarrhée'),
  (b1, '2024-07-15',  5, 'inconnu',  'Chaleur intense 40°C'),
  (b1, '2024-07-22',  2, 'accident', 'Étouffement'),
  (b1, '2024-07-30',  3, 'maladie',  'Coryza'),
  (b1, '2024-08-05',  2, 'inconnu',  NULL);

INSERT INTO weight_records (batch_id, date, age_days, sample_size, avg_weight_g, min_weight_g, max_weight_g, notes) VALUES
  (b1, '2024-07-08',  7, 20,  168,  145,  195, 'J7 — conforme Ross'),
  (b1, '2024-07-15', 14, 20,  382,  340,  425, 'J14 — légèrement bas'),
  (b1, '2024-07-22', 21, 25,  780,  710,  855, 'J21 — bon rattrapage'),
  (b1, '2024-07-29', 28, 25, 1320, 1180, 1480, 'J28 — excellent GMQ'),
  (b1, '2024-08-05', 35, 30, 1950, 1750, 2200, 'J35 — 1ère vague prête'),
  (b1, '2024-08-12', 42, 30, 2450, 2200, 2750, 'J42 — abattage final');

INSERT INTO feed_purchases (batch_id, supplier_id, product_id, date, quantity, unit_price, invoice_ref) VALUES
  (b1, supp_a, fp_s,   '2024-07-01', 10, 9500,  'FAC-2024-0701'),
  (b1, supp_a, fp_g,   '2024-07-14', 20, 14500, 'FAC-2024-0714'),
  (b1, supp_a, fp_g,   '2024-07-21', 15, 14500, 'FAC-2024-0721'),
  (b1, supp_a, fp_fin, '2024-08-01', 20, 13500, 'FAC-2024-0801');

INSERT INTO feed_consumption (batch_id, product_id, date, quantity_kg) VALUES
  (b1, fp_s,   '2024-07-05',  50),
  (b1, fp_s,   '2024-07-10', 125),
  (b1, fp_g,   '2024-07-16', 250),
  (b1, fp_g,   '2024-07-23', 380),
  (b1, fp_g,   '2024-07-30', 450),
  (b1, fp_fin, '2024-08-06', 500);

INSERT INTO health_records (batch_id, date, type, product_name, dose, route, administered_by, cost, notes) VALUES
  (b1, '2024-07-03', 'vaccination', 'Newcastle La Sota',         '1 dose eau',  'eau',      'Dr. Essomba', 22500, 'J2 primo-vacc.'),
  (b1, '2024-07-07', 'vaccination', 'Gumboro IBD',               '1 dose eau',  'eau',      'Dr. Essomba', 26000, 'J6 primo Gumboro'),
  (b1, '2024-07-10', 'traitement',  'Amoxicilline 20%',          '1g/L 5 jours','eau',      'Responsable', 15000, 'Préventif'),
  (b1, '2024-07-14', 'vaccination', 'Newcastle Rappel H120',     '1 dose',      'oculaire', 'Dr. Essomba', 22500, 'J13 rappel'),
  (b1, '2024-07-21', 'vaccination', 'Gumboro Rappel',            '1 dose eau',  'eau',      'Dr. Essomba', 26000, 'J20 rappel'),
  (b1, '2024-07-25', 'prevention',  'Vitamine C + Électrolytes', '1g/L 3j',     'eau',      'Responsable',  9000, 'Anti-stress chaleur');

INSERT INTO expenses (batch_id, category_id, supplier_id, date, description, amount) VALUES
  (b1, cat1, supp_p, '2024-07-01', 'Achat 500 poussins Ross 308',    275000),
  (b1, cat4, NULL,   '2024-07-31', 'Salaire ouvrier juillet',         75000),
  (b1, cat5, NULL,   '2024-07-31', 'Eau + électricité juillet',       28500),
  (b1, cat6, supp_p, '2024-07-01', 'Transport poussins Douala',       15000),
  (b1, cat8, NULL,   '2024-07-01', 'Sciure de bois 10 sacs',          15000),
  (b1, cat7, NULL,   '2024-07-05', 'Réparation abreuvoir',            12000),
  (b1, cat9, NULL,   '2024-07-15', 'Produits nettoyage',               8500);

INSERT INTO sales (batch_id, customer_id, date, status, total_amount, notes) VALUES
  (b1, cust_r, '2024-08-05', 'paid',    400000, '100 poulets 1ère vague')  RETURNING id INTO s1;
INSERT INTO sales (batch_id, customer_id, date, status, total_amount, notes) VALUES
  (b1, cust_m, '2024-08-08', 'paid',    600000, '150 poulets Mfoundi')     RETURNING id INTO s2;
INSERT INTO sales (batch_id, customer_id, date, status, total_amount, notes) VALUES
  (b1, cust_h, '2024-08-10', 'paid',    525000, '75 poulets Hilton')       RETURNING id INTO s3;
INSERT INTO sales (batch_id, customer_id, date, status, total_amount, notes) VALUES
  (b1, cust_s, '2024-08-12', 'partial', 560000, 'Solde 210k dû')           RETURNING id INTO s4;
INSERT INTO sales (batch_id, customer_id, date, status, total_amount, notes) VALUES
  (b1, cust_f, '2024-08-12', 'paid',    280000, '40 poulets restants')     RETURNING id INTO s5;

INSERT INTO sale_items (sale_id, quantity, unit_weight_kg, total_weight_kg, unit_price, total_price) VALUES
  (s1, 100, 2.30, 230.0,  4000, 400000),
  (s2, 150, 2.35, 352.5,  4000, 600000),
  (s3, 75,  2.45, 183.75, 7000, 525000),
  (s4, 80,  2.40, 192.0,  7000, 560000),
  (s5, 40,  2.20, 88.0,   7000, 280000);

INSERT INTO payments (sale_id, customer_id, date, amount, method, reference) VALUES
  (s1, cust_r, '2024-08-05', 400000, 'mobile_money', 'MTN-2408-001'),
  (s2, cust_m, '2024-08-08', 600000, 'especes',      NULL),
  (s3, cust_h, '2024-08-12', 525000, 'virement',     'VIR-HILTON-0812'),
  (s4, cust_s, '2024-08-12', 350000, 'especes',      NULL),
  (s5, cust_f, '2024-08-12', 280000, 'mobile_money', 'OM-2408-045');

-- ── LOT 2 — EN COURS (28 jours) ──────────────────────────────
INSERT INTO batches (farm_id, building_id, supplier_id, batch_number, start_date,
    initial_count, breed, purchase_price_per_unit, status, notes)
VALUES (fid, bat_a, supp_p, 'LOT-2024-09-A', CURRENT_DATE - 28,
    800, 'Ross 308', 550, 'active', 'En cours — excellent démarrage')
RETURNING id INTO b2;

INSERT INTO mortality_records (batch_id, date, count, cause, description) VALUES
  (b2, CURRENT_DATE - 26, 4, 'inconnu',   'Mortalités initiales J2-J3'),
  (b2, CURRENT_DATE - 21, 2, 'accident',  'Écrasement'),
  (b2, CURRENT_DATE - 14, 3, 'maladie',   'Bronchite infectieuse'),
  (b2, CURRENT_DATE - 7,  2, 'inconnu',   NULL);

INSERT INTO weight_records (batch_id, date, age_days, sample_size, avg_weight_g, min_weight_g, max_weight_g, notes) VALUES
  (b2, CURRENT_DATE - 21, 7,  30, 175,  152, 198, 'J7 — excellent'),
  (b2, CURRENT_DATE - 14, 14, 30, 405,  370, 445, 'J14 — dessus standard'),
  (b2, CURRENT_DATE - 7,  21, 30, 830,  760, 910, 'J21 — GMQ excellent'),
  (b2, CURRENT_DATE,      28, 30, 1420, 1280, 1600,'J28 — homogène');

INSERT INTO feed_purchases (batch_id, supplier_id, product_id, date, quantity, unit_price, invoice_ref) VALUES
  (b2, supp_a, fp_s, CURRENT_DATE - 28, 16, 9500,  'FAC-2024-0901'),
  (b2, supp_a, fp_g, CURRENT_DATE - 14, 30, 14500, 'FAC-2024-0915'),
  (b2, supp_a, fp_g, CURRENT_DATE - 5,  20, 14500, 'FAC-2024-0926');

INSERT INTO feed_consumption (batch_id, product_id, date, quantity_kg) VALUES
  (b2, fp_s, CURRENT_DATE - 25, 80),
  (b2, fp_s, CURRENT_DATE - 20, 160),
  (b2, fp_g, CURRENT_DATE - 14, 350),
  (b2, fp_g, CURRENT_DATE - 7,  520);

INSERT INTO health_records (batch_id, date, type, product_name, dose, route, administered_by, cost) VALUES
  (b2, CURRENT_DATE - 26, 'vaccination', 'Newcastle La Sota', '1 dose/eau',   'eau',      'Dr. Essomba', 36000),
  (b2, CURRENT_DATE - 22, 'vaccination', 'Gumboro IBD',       '1 dose/eau',   'eau',      'Dr. Essomba', 41600),
  (b2, CURRENT_DATE - 15, 'traitement',  'Tylosine 100mg',    '500mg/L 5j',   'eau',      'Responsable', 18500),
  (b2, CURRENT_DATE - 14, 'vaccination', 'Newcastle Rappel',  '1 dose',       'oculaire', 'Dr. Essomba', 36000),
  (b2, CURRENT_DATE - 7,  'vaccination', 'Gumboro Rappel',    '1 dose/eau',   'eau',      'Dr. Essomba', 41600);

INSERT INTO expenses (batch_id, category_id, supplier_id, date, description, amount) VALUES
  (b2, cat1, supp_p, CURRENT_DATE - 28, 'Achat 800 poussins Ross 308',  440000),
  (b2, cat8, NULL,   CURRENT_DATE - 28, 'Sciure de bois 15 sacs',        22500),
  (b2, cat6, supp_p, CURRENT_DATE - 28, 'Transport poussins',            20000),
  (b2, cat4, NULL,   CURRENT_DATE - 1,  'Salaire ouvrier mois courant',  75000),
  (b2, cat5, NULL,   CURRENT_DATE - 1,  'Eau + électricité mois courant',31000);

-- ── LOT 3 — DÉMARRAGE (5 jours) ──────────────────────────────
INSERT INTO batches (farm_id, building_id, supplier_id, batch_number, start_date,
    initial_count, breed, purchase_price_per_unit, status, notes)
VALUES (fid, bat_b, supp_p, 'LOT-2024-09-B', CURRENT_DATE - 5,
    600, 'Cobb 500', 600, 'active', 'Nouveau lot — test souche Cobb 500')
RETURNING id INTO b3;

INSERT INTO mortality_records (batch_id, date, count, cause, description) VALUES
  (b3, CURRENT_DATE - 3, 5, 'inconnu', 'Mortalités initiales J2'),
  (b3, CURRENT_DATE - 1, 2, 'inconnu', NULL);

INSERT INTO weight_records (batch_id, date, age_days, sample_size, avg_weight_g, min_weight_g, max_weight_g, notes) VALUES
  (b3, CURRENT_DATE - 2, 3, 20, 65, 55, 78, 'J3 — poids entrée normal');

INSERT INTO feed_purchases (batch_id, supplier_id, product_id, date, quantity, unit_price, invoice_ref) VALUES
  (b3, supp_a, fp_s, CURRENT_DATE - 5, 12, 9500, 'FAC-2024-0930');

INSERT INTO feed_consumption (batch_id, product_id, date, quantity_kg) VALUES
  (b3, fp_s, CURRENT_DATE - 3, 45),
  (b3, fp_s, CURRENT_DATE - 1, 60);

INSERT INTO health_records (batch_id, date, type, product_name, dose, route, administered_by, cost) VALUES
  (b3, CURRENT_DATE - 3, 'vaccination', 'Newcastle La Sota', '1 dose/eau', 'eau', 'Dr. Essomba', 27000);

INSERT INTO expenses (batch_id, category_id, supplier_id, date, description, amount) VALUES
  (b3, cat1, supp_p, CURRENT_DATE - 5, 'Achat 600 poussins Cobb 500', 360000),
  (b3, cat8, NULL,   CURRENT_DATE - 5, 'Sciure de bois 12 sacs',       18000),
  (b3, cat6, NULL,   CURRENT_DATE - 5, 'Transport poussins',            18000);

END $$;

-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================
SELECT 'farms'             AS table_name, COUNT(*) AS lignes FROM farms
UNION ALL SELECT 'buildings',          COUNT(*) FROM buildings
UNION ALL SELECT 'suppliers',          COUNT(*) FROM suppliers
UNION ALL SELECT 'customers',          COUNT(*) FROM customers
UNION ALL SELECT 'batches',            COUNT(*) FROM batches
UNION ALL SELECT 'mortality_records',  COUNT(*) FROM mortality_records
UNION ALL SELECT 'weight_records',     COUNT(*) FROM weight_records
UNION ALL SELECT 'feed_products',      COUNT(*) FROM feed_products
UNION ALL SELECT 'feed_purchases',     COUNT(*) FROM feed_purchases
UNION ALL SELECT 'feed_consumption',   COUNT(*) FROM feed_consumption
UNION ALL SELECT 'health_records',     COUNT(*) FROM health_records
UNION ALL SELECT 'expense_categories', COUNT(*) FROM expense_categories
UNION ALL SELECT 'expenses',           COUNT(*) FROM expenses
UNION ALL SELECT 'stock_items',        COUNT(*) FROM stock_items
UNION ALL SELECT 'sales',              COUNT(*) FROM sales
UNION ALL SELECT 'sale_items',         COUNT(*) FROM sale_items
UNION ALL SELECT 'payments',           COUNT(*) FROM payments
ORDER BY table_name;
