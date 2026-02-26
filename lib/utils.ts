import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function calculateCommission(amount: number, rate: number) {
  const commission = Math.round(amount * rate)
  const organizer = amount - commission
  return { commission, organizer, total: amount }
}
