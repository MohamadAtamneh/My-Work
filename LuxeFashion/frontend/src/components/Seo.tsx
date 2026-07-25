import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'LuxeFashion';
const SITE_URL = 'https://luxefashion.com';

interface SeoProps {
  title: string;
  description: string;
  /** Canonical path, e.g. /shop/men */
  path?: string;
  /** Keep private/utility pages out of search indexes. */
  noindex?: boolean;
  /** JSON-LD structured data (rendered as application/ld+json). */
  jsonLd?: Record<string, unknown>;
}

// Per-page meta — title, description, canonical, Open Graph, Twitter card.
// Mount once per page; values deep-merge with the static defaults in index.html.
const Seo = ({ title, description, path = '/', noindex = false, jsonLd }: SeoProps) => {
  const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default Seo;
