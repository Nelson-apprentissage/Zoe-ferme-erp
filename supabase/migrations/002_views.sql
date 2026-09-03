-- ============================================================
-- ZOÉ FERME ERP — Migration 002 : Vues calculées
-- ============================================================

-- ============================================================
-- VUE 1 : Résumé complet d'un lot
-- ============================================================
CREATE OR REPLACE VIEW batch_summary AS
SELECT
    b.id,
    b.farm_id,
    b.batch_number,
    b.start_date,
    b.end_date,
    b.initial_count,
    b.status,
    b.breed,
    bg.name AS building_name,

    -- Mortalité
    COALESCE(SUM(mr.count), 0) AS total_mortality,
    ROUND(COALESCE(SUM(mr.count), 0)::NUMERIC / NULLIF(b.initial_count, 0) * 100, 2) AS mortality_rate_pct,

    -- Effectif vivant actuel
    b.initial_count - COALESCE(SUM(mr.count), 0) - COALESCE(sold.total_sold, 0) AS current_count,

    -- Ventes
    COALESCE(sold.total_sold, 0) AS total_sold,

    -- Age en jours
    COALESCE(b.end_date, CURRENT_DATE) - b.start_date AS age_days,

    -- Dernier poids moyen
    last_w.avg_weight_g AS last_avg_weight_g,
    last_w.date AS last_weight_date

FROM batches b
LEFT JOIN buildings bg ON bg.id = b.building_id
LEFT JOIN mortality_records mr ON mr.batch_id = b.id
LEFT JOIN (
    SELECT si.batch_id, SUM(si.quantity) AS total_sold
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.status != 'cancelled'
    GROUP BY si.batch_id
) sold ON sold.batch_id = b.id
LEFT JOIN LATERAL (
    SELECT avg_weight_g, date
    FROM weight_records wr
    WHERE wr.batch_id = b.id
    ORDER BY date DESC
    LIMIT 1
) last_w ON TRUE
GROUP BY b.id, b.farm_id, b.batch_number, b.start_date, b.end_date,
         b.initial_count, b.status, b.breed, bg.name,
         sold.total_sold, last_w.avg_weight_g, last_w.date;

-- ============================================================
-- VUE 2 : Finances d'un lot
-- ============================================================
CREATE OR REPLACE VIEW batch_financials AS
SELECT
    b.id,
    b.farm_id,
    b.batch_number,
    b.start_date,
    b.status,

    -- Coûts aliment
    COALESCE(fp.total_feed_cost, 0) AS total_feed_cost,

    -- Coûts poussins
    COALESCE(b.purchase_price_per_unit * b.initial_count, 0) AS total_chick_cost,

    -- Autres dépenses
    COALESCE(exp.total_expenses, 0) AS total_other_expenses,

    -- Coût total
    COALESCE(fp.total_feed_cost, 0)
    + COALESCE(b.purchase_price_per_unit * b.initial_count, 0)
    + COALESCE(exp.total_expenses, 0) AS total_cost,

    -- Recettes
    COALESCE(rev.total_revenue, 0) AS total_revenue,

    -- Paiements reçus
    COALESCE(pay.total_paid, 0) AS total_paid,

    -- Créances
    COALESCE(rev.total_revenue, 0) - COALESCE(pay.total_paid, 0) AS total_receivable,

    -- Marge
    COALESCE(rev.total_revenue, 0)
    - COALESCE(fp.total_feed_cost, 0)
    - COALESCE(b.purchase_price_per_unit * b.initial_count, 0)
    - COALESCE(exp.total_expenses, 0) AS gross_margin,

    -- Poids vendu total (kg)
    COALESCE(rev.total_weight_kg, 0) AS total_weight_sold_kg,

    -- Prix de revient par kg vendu
    CASE WHEN COALESCE(rev.total_weight_kg, 0) > 0
        THEN ROUND((
            COALESCE(fp.total_feed_cost, 0)
            + COALESCE(b.purchase_price_per_unit * b.initial_count, 0)
            + COALESCE(exp.total_expenses, 0)
        ) / rev.total_weight_kg, 2)
        ELSE NULL
    END AS cost_per_kg,

    -- Indice de consommation (aliment consommé / poids produit)
    CASE WHEN COALESCE(rev.total_weight_kg, 0) > 0
        THEN ROUND(COALESCE(fc.total_feed_consumed_kg, 0) / rev.total_weight_kg, 3)
        ELSE NULL
    END AS feed_conversion_ratio

FROM batches b
LEFT JOIN (
    SELECT batch_id, SUM(total_price) AS total_feed_cost
    FROM feed_purchases
    GROUP BY batch_id
) fp ON fp.batch_id = b.id
LEFT JOIN (
    SELECT batch_id, SUM(amount) AS total_expenses
    FROM expenses
    GROUP BY batch_id
) exp ON exp.batch_id = b.id
LEFT JOIN (
    SELECT si.batch_id,
           SUM(si.total_price) AS total_revenue,
           SUM(si.total_weight_kg) AS total_weight_kg
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.status != 'cancelled'
    GROUP BY si.batch_id
) rev ON rev.batch_id = b.id
LEFT JOIN (
    SELECT s.batch_id, SUM(p.amount) AS total_paid
    FROM payments p
    JOIN sales s ON s.id = p.sale_id
    GROUP BY s.batch_id
) pay ON pay.batch_id = b.id
LEFT JOIN (
    SELECT batch_id, SUM(quantity_kg) AS total_feed_consumed_kg
    FROM feed_consumption
    GROUP BY batch_id
) fc ON fc.batch_id = b.id;

-- ============================================================
-- VUE 3 : Soldes clients
-- ============================================================
CREATE OR REPLACE VIEW customer_balances AS
SELECT
    c.id AS customer_id,
    c.farm_id,
    c.name AS customer_name,
    c.phone,
    c.customer_type,
    COUNT(DISTINCT s.id) AS total_sales,
    COALESCE(SUM(s.total_amount), 0) AS total_invoiced,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    COALESCE(SUM(s.total_amount), 0) - COALESCE(SUM(p.amount), 0) AS balance_due
FROM customers c
LEFT JOIN sales s ON s.customer_id = c.id AND s.status != 'cancelled'
LEFT JOIN payments p ON p.customer_id = c.id
GROUP BY c.id, c.farm_id, c.name, c.phone, c.customer_type;

-- ============================================================
-- VUE 4 : Alertes stock
-- ============================================================
CREATE OR REPLACE VIEW stock_alerts AS
SELECT
    si.id,
    si.farm_id,
    si.name,
    si.category,
    si.unit,
    si.current_quantity,
    si.min_threshold,
    si.unit_cost,
    CASE
        WHEN si.current_quantity = 0 THEN 'rupture'
        WHEN si.current_quantity <= si.min_threshold THEN 'critique'
        ELSE 'normal'
    END AS alert_level
FROM stock_items si
WHERE si.current_quantity <= si.min_threshold;

-- ============================================================
-- VUE 5 : Performance zootechnique d'un lot
-- ============================================================
CREATE OR REPLACE VIEW batch_zootechnical AS
SELECT
    b.id,
    b.farm_id,
    b.batch_number,
    b.start_date,
    b.initial_count,
    b.status,

    -- Age
    COALESCE(b.end_date, CURRENT_DATE) - b.start_date AS age_days,

    -- Mortalité
    COALESCE(SUM(mr.count), 0) AS total_mortality,
    ROUND(COALESCE(SUM(mr.count), 0)::NUMERIC / NULLIF(b.initial_count, 0) * 100, 2) AS mortality_rate_pct,

    -- Dernier poids moyen (g)
    last_w.avg_weight_g AS last_avg_weight_g,

    -- GMQ (Gain Moyen Quotidien en g/j)
    CASE WHEN (COALESCE(b.end_date, CURRENT_DATE) - b.start_date) > 0
        THEN ROUND(last_w.avg_weight_g / (COALESCE(b.end_date, CURRENT_DATE) - b.start_date), 2)
        ELSE NULL
    END AS daily_weight_gain_g,

    -- Consommation aliment totale (kg)
    COALESCE(fc.total_feed_consumed_kg, 0) AS total_feed_consumed_kg,

    -- IC (Indice de Consommation)
    CASE WHEN last_w.avg_weight_g > 0 AND b.initial_count > 0
        THEN ROUND(
            COALESCE(fc.total_feed_consumed_kg, 0) * 1000
            / (last_w.avg_weight_g * (b.initial_count - COALESCE(SUM(mr.count), 0))), 3
        )
        ELSE NULL
    END AS feed_conversion_ratio

FROM batches b
LEFT JOIN mortality_records mr ON mr.batch_id = b.id
LEFT JOIN LATERAL (
    SELECT avg_weight_g
    FROM weight_records wr
    WHERE wr.batch_id = b.id
    ORDER BY date DESC
    LIMIT 1
) last_w ON TRUE
LEFT JOIN (
    SELECT batch_id, SUM(quantity_kg) AS total_feed_consumed_kg
    FROM feed_consumption
    GROUP BY batch_id
) fc ON fc.batch_id = b.id
GROUP BY b.id, b.farm_id, b.batch_number, b.start_date, b.end_date,
         b.initial_count, b.status, last_w.avg_weight_g, fc.total_feed_consumed_kg;
