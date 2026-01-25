import type { LinkSource, LinkCategory } from '@/services/links/links.types';

export const SOURCES: { key: '' | LinkSource; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'other', label: 'Other' },
];

export const CATEGORIES: { key: '' | LinkCategory; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'nature', label: 'Nature' },
  { key: 'cooking', label: 'Cooking' },
  { key: 'food', label: 'Food' },
  { key: 'sports', label: 'Sports' },
  { key: 'music', label: 'Music' },
  { key: 'tech', label: 'Tech' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'other', label: 'Other' },
];

export const SOURCE_COLORS: Record<LinkSource, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  tiktok: '#000000',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  other: '#6B7280',
};

export const HORZ_PADDING = 20;
export const CARD_GAP = 14;

export const getColumns = (width: number) =>
  width < 380 ? 1 : width < 600 ? 2 : 3;

export function truncate(str: string, max = 50): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + '...';
}

export function formatCategory(cat: string | null): string {
  if (!cat) return '';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}
