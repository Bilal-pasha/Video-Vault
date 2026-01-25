/**
 * YouTube (and Shorts) often don't expose og:image to server-side fetch.
 * Derive thumbnail from video ID when URL is youtube.com/watch, youtube.com/shorts, or youtu.be.
 */
const YOUTUBE_VIDEO_ID_REGEX =
  /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

export function getYoutubeThumbnailUrl(url: string): string | null {
  const match = url.match(YOUTUBE_VIDEO_ID_REGEX);
  if (!match?.[1]) return null;
  const videoId = match[1];
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** Browser-like User-Agent to improve OG/thumbnail fetch for Instagram, Facebook, etc. */
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Try Instagram oEmbed for thumbnail (may still return thumbnail_url on some endpoints).
 */
export async function getInstagramThumbnailUrl(url: string): Promise<string | null> {
  if (!/instagram\.com|instagr\.am/i.test(url)) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail_url?: string };
    const href = data?.thumbnail_url;
    if (typeof href === 'string' && href.startsWith('http')) return href;
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch Open Graph metadata (og:image, og:title) from a URL.
 * Uses a browser-like User-Agent so Instagram/Facebook are more likely to return full HTML with og:image.
 */
export async function fetchOgMetadata(url: string): Promise<{
  thumbnailUrl: string | null;
  title: string | null;
}> {
  const result = { thumbnailUrl: null as string | null, title: null as string | null };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return result;

    const html = await res.text();

    const ogImageMatch =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogImageMatch?.[1]) {
      const href = ogImageMatch[1].trim();
      if (href.startsWith('http')) result.thumbnailUrl = href;
      else if (href.startsWith('//')) result.thumbnailUrl = `https:${href}`;
    }

    const ogTitleMatch =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitleMatch?.[1]) {
      result.title = ogTitleMatch[1].trim().slice(0, 500) || null;
    }
  } catch {
    // Ignore fetch/parse errors; caller proceeds without metadata
  }

  return result;
}
