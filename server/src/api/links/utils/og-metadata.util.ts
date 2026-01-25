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

/**
 * Fetch Open Graph metadata (og:image, og:title) from a URL.
 * Used as fallback when thumbnailUrl/title are not provided on link create.
 */
export async function fetchOgMetadata(url: string): Promise<{
  thumbnailUrl: string | null;
  title: string | null;
}> {
  const result = { thumbnailUrl: null as string | null, title: null as string | null };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; LinkSaver/1.0; +https://github.com)',
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
