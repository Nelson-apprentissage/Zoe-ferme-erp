-- ============================================================
-- ZOÉ FERME ERP — Migration 003 : Row Level Security (RLS)
-- ============================================================
-- Chaque utilisateur ne voit que les données de sa ferme.

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Helper function : récupérer les farm_ids de l'utilisateur
CREATE OR REPLACE FUNCTION get_user_farm_ids()
RETURNS SETOF UUID AS $$
    SELECT f.id FROM farms f
    JOIN profiles p ON p.id = f.owner_id
    WHERE p.user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- FARMS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own farms"
    ON farms FOR ALL USING (id IN (SELECT get_user_farm_ids()));

-- BUILDINGS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own buildings"
    ON buildings FOR ALL USING (farm_id IN (SELECT get_user_farm_ids()));

-- SUPPLIERS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own suppliers"
    ON suppliers FOR ALL USING (farm_id IN (SELECT get_user_farm_ids()));

-- CUSTOMERS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customers"
    ON customers FOR ALL USING (farm_id IN (SELECT get_user_farm_ids()));

-- BATCHES
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own batches"
    ON batches FOR ALL USING (farm_id IN (SELECT get_user_farm_ids()));

-- BATCH MOVEMENTS
ALTER TABLE batch_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own batch movements"
    ON batch_movements FOR ALL USING (
        batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- DAILY RECORDS
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own daily records"
    ON daily_records FOR ALL USING (
        batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- MORTALITY RECORDS
ALTER TABLE mortality_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mortality records"
    ON mortality_records FOR ALL USING (
        batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- WEIGHT RECORDS
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own weight records"
    ON weight_records FOR ALL USING (
        batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- FEED PRODUCTS
ALTER TABLE feed_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feed products"
    ON feed_products FOR ALL USING (farm_id IN (SELECT get_user_farm_ids()));

-- FEED PURCHASES
ALTER TABLE feed_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feed purchases"
    ON feed_purchases FOR ALL USING (
        batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- FEED CONSUMPTION
ALTER TABLE feed_consumption ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feed consumption"
    ON feed_consumption FOR ALL USING (
        batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- HEALTH RECORDS
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health records"
    ON health_records FOR ALL USING (
        batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- EXPENSE CATEGORIES
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expense categories"
    ON expense_categories FOR ALL USING (farm_id IN (SELECT get_user_farm_ids()));

-- EXPENSES
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expenses"
    ON expenses FOR ALL USING (
        batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- STOCK ITEMS
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own stock items"
    ON stock_items FOR ALL USING (farm_id IN (SELECT get_user_farm_ids()));

-- STOCK MOVEMENTS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own stock movements"
    ON stock_movements FOR ALL USING (
        stock_item_id IN (SELECT id FROM stock_items WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- SALES
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sales"
    ON sales FOR ALL USING (
        batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT get_user_farm_ids()))
    );

-- SALE ITEMS
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sale items"
    ON sale_items FOR ALL USING (
        sale_id IN (
            SELECT s.id FROM sales s
            JOIN batches b ON b.id = s.batch_id
            WHERE b.farm_id IN (SELECT get_user_farm_ids())
        )
    );

-- PAYMENTS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own payments"
    ON payments FOR ALL USING (
        sale_id IN (
            SELECT s.id FROM sales s
            JOIN batches b ON b.id = s.batch_id
            WHERE b.farm_id IN (SELECT get_user_farm_ids())
        )
    );

-- ============================================================
-- TRIGGER : Créer automatiquement un profil lors de l'inscription
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
