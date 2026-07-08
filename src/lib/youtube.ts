/**
 * YouTube URL helpers, shared by the LiteYouTube facade (build-time),
 * the graph compiler (prebuild), and the node card (client). One parser
 * so every surface derives the same id from the same frontmatter URL.
 */

export function videoId(u: string): string | null {
	try {
		const parsed = new URL(u);
		if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1) || null;
		if (parsed.hostname.endsWith('youtube.com')) {
			if (parsed.searchParams.get('v')) return parsed.searchParams.get('v');
			const m = parsed.pathname.match(/\/(embed|shorts|live)\/([\w-]{6,})/);
			if (m) return m[2];
		}
	} catch {
		return null;
	}
	return null;
}

/** hqdefault always exists; maxresdefault only for HD uploads. */
export const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const thumbUrlMax = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
