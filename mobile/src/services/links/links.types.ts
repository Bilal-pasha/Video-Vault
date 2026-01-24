export type LinkSource = 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'other';

export type LinkCategory =
  | 'nature'
  | 'cooking'
  | 'food'
  | 'sports'
  | 'music'
  | 'tech'
  | 'entertainment'
  | 'other';

export interface SavedLink {
  id: string;
  url: string;
  source: LinkSource;
  title: string | null;
  category: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface CreateLinkRequest {
  url: string;
  source?: LinkSource;
  title?: string;
  category?: LinkCategory;
  thumbnailUrl?: string;
}

export interface ApiLinkResponse {
  success: boolean;
  message: string;
  data: SavedLink | SavedLink[];
}
