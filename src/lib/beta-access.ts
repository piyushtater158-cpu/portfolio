/**
 * Beta-access norm, shared by the node card, the case page, and the
 * instructions modal. Gated projects opt in purely through content: a
 * links.other entry labelled "Request beta access" with a mailto URL
 * (see _template/index.mdx). Matching is label-keyed so any future gated
 * project gets the instructions modal with zero code changes.
 */

export const BETA_ACCESS_LABEL = 'Request beta access';

export const BETA_EMAIL = 'piyushtater158@gmail.com';

export const isBetaAccessLink = (label: string, url: string) =>
	url.startsWith('mailto:') &&
	label.trim().toLowerCase() === BETA_ACCESS_LABEL.toLowerCase();

/** What the application email must include — mirrored by the mailto body template. */
export const BETA_INSTRUCTIONS: readonly string[] = [
	'Your full name',
	'Your company or organization name',
	'Your position / role in that organization',
	'What you want to know or try, and why you need access',
	'Any details relevant to evaluating your request',
	'The Google account email the access should be granted on (used for sign-in)',
];
