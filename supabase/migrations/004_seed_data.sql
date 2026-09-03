-- ============================================================
-- ZOÉ FERME ERP — Migration 004 : Données de base (seed)
-- ============================================================
-- Ces données seront insérées lors de la création d'une ferme.
-- Elles sont des valeurs par défaut pour les catégories de dépenses.

-- Note : Ces données sont insérées via une fonction appelée
-- depuis l'application lors de l'onboarding initial.

-- Fonction : initialiser une ferme avec les données de base
CREATE OR REPLACE FUNCTION initialize_farm(p_farm_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Catégories de dépenses par défaut
    INSERT INTO expense_categories (farm_id, name, description, color) VALUES
        (p_farm_id, 'Achat poussins', 'Coût d''achat des poussins d''un jour', '#EAB308'),
        (p_farm_id, 'Aliment', 'Achats d''aliments pour volailles', '#22C55E'),
        (p_farm_id, 'Médicaments & Vaccins', 'Frais vétérinaires et produits sanitaires', '#3B82F6'),
        (p_farm_id, 'Main d''œuvre', 'Salaires et rémunérations', '#8B5CF6'),
        (p_farm_id, 'Eau & Électricité', 'Charges d''eau et d''électricité', '#06B6D4'),
        (p_farm_id, 'Transport', 'Frais de transport (approvisionnement, livraison)', '#F97316'),
        (p_farm_id, 'Équipements', 'Achat ou réparation d''équipements', '#EC4899'),
        (p_farm_id, 'Litière', 'Sciure, copeaux et autres litières', '#84CC16'),
        (p_farm_id, 'Autres', 'Dépenses diverses', '#6B7280')
    ON CONFLICT DO NOTHING;

    -- Bâtiment par défaut
    INSERT INTO buildings (farm_id, name, capacity, description) VALUES
        (p_farm_id, 'Bâtiment 1', 500, 'Bâtiment principal')
    ON CONFLICT DO NOTHING;

    -- Produit aliment par défaut
    INSERT INTO feed_products (farm_id, name, brand, type, unit, weight_per_unit_kg) VALUES
        (p_farm_id, 'Aliment Démarrage', NULL, 'demarrage', 'sac', 50),
        (p_farm_id, 'Aliment Croissance', NULL, 'croissance', 'sac', 50),
        (p_farm_id, 'Aliment Finition', NULL, 'finition', 'sac', 50)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
