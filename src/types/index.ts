// ============================================================
// ZOÉ FERME ERP — Types TypeScript globaux
// ============================================================

// ---- ENUMS ----

export type UserRole = 'owner' | 'manager' | 'employee';
export type BatchStatus = 'active' | 'closed' | 'archived';
export type SupplierType = 'poussin' | 'aliment' | 'medicament' | 'materiel' | 'autre';
export type CustomerType = 'particulier' | 'revendeur' | 'restaurant' | 'autre';
export type MortalityCause = 'maladie' | 'accident' | 'inconnu' | 'reforme' | 'autre';
export type HealthRecordType = 'vaccination' | 'traitement' | 'prevention' | 'diagnostic' | 'autre';
export type HealthRoute = 'eau' | 'injection' | 'oculaire' | 'oral' | 'autre';
export type FeedType = 'demarrage' | 'croissance' | 'finition' | 'autre';
export type FeedUnit = 'kg' | 'sac' | 'tonne';
export type SaleStatus = 'pending' | 'partial' | 'paid' | 'cancelled';
export type PaymentMethod = 'especes' | 'mobile_money' | 'virement' | 'cheque' | 'autre';
export type StockCategory = 'aliment' | 'medicament' | 'consommable' | 'equipement' | 'autre';
export type StockMovementType = 'entree' | 'sortie' | 'ajustement';
export type BatchMovementType = 'transfer' | 'split' | 'merge' | 'adjustment';
export type AlertLevel = 'normal' | 'critique' | 'rupture';

// ---- ENTITÉS ----

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  location?: string;
  description?: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  farm_id: string;
  name: string;
  capacity?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  farm_id: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  type?: SupplierType;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  farm_id: string;
  name: string;
  phone?: string;
  address?: string;
  customer_type: CustomerType;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  farm_id: string;
  building_id?: string;
  supplier_id?: string;
  batch_number: string;
  start_date: string;
  initial_count: number;
  breed?: string;
  purchase_price_per_unit?: number;
  status: BatchStatus;
  notes?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BatchMovement {
  id: string;
  batch_id: string;
  date: string;
  type: BatchMovementType;
  quantity: number;
  destination_building_id?: string;
  notes?: string;
  created_at: string;
}

export interface DailyRecord {
  id: string;
  batch_id: string;
  date: string;
  living_count: number;
  water_consumption_l?: number;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MortalityRecord {
  id: string;
  batch_id: string;
  date: string;
  count: number;
  cause?: MortalityCause;
  description?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightRecord {
  id: string;
  batch_id: string;
  date: string;
  age_days?: number;
  sample_size: number;
  avg_weight_g: number;
  min_weight_g?: number;
  max_weight_g?: number;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedProduct {
  id: string;
  farm_id: string;
  name: string;
  brand?: string;
  type?: FeedType;
  unit: FeedUnit;
  weight_per_unit_kg: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedPurchase {
  id: string;
  batch_id: string;
  supplier_id?: string;
  product_id: string;
  date: string;
  quantity: number;
  unit_price: number;
  total_price: number; // Computed column
  invoice_ref?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedConsumption {
  id: string;
  batch_id: string;
  daily_record_id?: string;
  product_id: string;
  date: string;
  quantity_kg: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  batch_id: string;
  date: string;
  type: HealthRecordType;
  product_name: string;
  dose?: string;
  route?: HealthRoute;
  administered_by?: string;
  cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  farm_id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface Expense {
  id: string;
  batch_id: string;
  category_id?: string;
  supplier_id?: string;
  date: string;
  description: string;
  amount: number;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockItem {
  id: string;
  farm_id: string;
  name: string;
  category: StockCategory;
  unit: string;
  current_quantity: number;
  min_threshold?: number;
  unit_cost?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  stock_item_id: string;
  batch_id?: string;
  date: string;
  type: StockMovementType;
  quantity: number;
  unit_cost?: number;
  reason?: string;
  notes?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  batch_id: string;
  customer_id: string;
  date: string;
  status: SaleStatus;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  quantity: number;
  unit_weight_kg?: number;
  total_weight_kg?: number;
  unit_price: number;
  total_price: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  sale_id: string;
  customer_id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ---- VUES ----

export interface BatchSummary {
  id: string;
  farm_id: string;
  batch_number: string;
  start_date: string;
  end_date?: string;
  initial_count: number;
  status: BatchStatus;
  breed?: string;
  building_name?: string;
  total_mortality: number;
  mortality_rate_pct: number;
  current_count: number;
  total_sold: number;
  age_days: number;
  last_avg_weight_g?: number;
  last_weight_date?: string;
}

export interface BatchFinancials {
  id: string;
  farm_id: string;
  batch_number: string;
  start_date: string;
  status: BatchStatus;
  total_feed_cost: number;
  total_chick_cost: number;
  total_other_expenses: number;
  total_cost: number;
  total_revenue: number;
  total_paid: number;
  total_receivable: number;
  gross_margin: number;
  total_weight_sold_kg: number;
  cost_per_kg?: number;
  feed_conversion_ratio?: number;
}

export interface CustomerBalance {
  customer_id: string;
  farm_id: string;
  customer_name: string;
  phone?: string;
  customer_type: CustomerType;
  total_sales: number;
  total_invoiced: number;
  total_paid: number;
  balance_due: number;
}

export interface StockAlert {
  id: string;
  farm_id: string;
  name: string;
  category: StockCategory;
  unit: string;
  current_quantity: number;
  min_threshold?: number;
  unit_cost?: number;
  alert_level: AlertLevel;
}

export interface BatchZootechnical {
  id: string;
  farm_id: string;
  batch_number: string;
  start_date: string;
  initial_count: number;
  status: BatchStatus;
  age_days: number;
  total_mortality: number;
  mortality_rate_pct: number;
  last_avg_weight_g?: number;
  daily_weight_gain_g?: number;
  total_feed_consumed_kg: number;
  feed_conversion_ratio?: number;
}

// ---- TYPES UTILITAIRES ----

export interface KPICardData {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  color?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};
