import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine les classes Tailwind de manière intelligente
 * Utilise clsx pour la logique conditionnelle et tailwind-merge pour éviter les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number, locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100); // Convertit les centimes en euros
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat('fr-FR', options ?? defaultOptions).format(new Date(date));
}

/**
 * Génère un slug à partir d'une chaîne
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/[^\w-]+/g, '') // Supprime les caractères non alphanumériques
    .replace(/--+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-+/, '') // Supprime les tirets au début
    .replace(/-+$/, ''); // Supprime les tirets à la fin
}

/**
 * Tronque un texte avec "..."
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone français
 */
export function isValidFrenchPhone(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

/**
 * Formate un numéro de téléphone français
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return match.slice(1).join(' ');
  }
  return phone;
}

/**
 * Génère les initiales d'un nom
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Délai asynchrone
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Vérifie si on est côté client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Copie du texte dans le presse-papiers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isClient()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}


// Retourne le pseudo si défini, sinon le prénom uniquement
export function getDisplayName(user: {
  firstName: string;
  lastName?: string;
  pseudo?: string | null;
}): string {
  if (user.pseudo?.trim()) return user.pseudo.trim();
  return user.firstName;
}
