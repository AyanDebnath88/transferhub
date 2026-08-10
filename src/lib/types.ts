export interface Transfer {
  id: string;
  title: string;
  summary: string;
  players: string[];
  clubs: string[];
  type: 'confirmed' | 'rumour' | 'news';
  confidence: number; // 1-10
  source: string;
  sourceUrl: string;
  image: string | null;
  publishedAt: string;
  slug: string;
  tags: string[];
}

export interface FeedSource {
  name: string;
  url: string;
  confidence: number; // base confidence for this source
}
