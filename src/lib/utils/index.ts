import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formater un montant en FCFA
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA'
}

// Formater un nombre avec séparateurs
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Formater une date en français
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

// Formater une date courte
export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateStr))
}

// Calculer le pourcentage
export function calcPercent(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100 * 100) / 100
}

// Calculer l'âge en jours depuis une date
export function calcAgeDays(startDate: string, endDate?: string): number {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  const diffMs = end.getTime() - start.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

// Déterminer la couleur selon la valeur (pour les indicateurs)
export function getStatusColor(
  value: number,
  thresholds: { warning: number; danger: number },
  inverse = false
): 'green' | 'yellow' | 'red' {
  if (inverse) {
    if (value <= thresholds.warning) return 'green'
    if (value <= thresholds.danger) return 'yellow'
    return 'red'
  }
  if (value >= thresholds.danger) return 'green'
  if (value >= thresholds.warning) return 'yellow'
  return 'red'
}

// Tronquer un texte
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}

// Générer une couleur aléatoire pour les graphiques
export const CHART_COLORS = [
  '#22C55E', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1'
]
