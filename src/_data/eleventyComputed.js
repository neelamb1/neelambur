import { hreflangCluster, siteUrl } from '../../lib/seo.js';

function publicationUrl(site, relativePath) {
  return siteUrl({
    canonicalBaseUrl: site.hosting.canonicalBaseUrl,
    pathPrefix: site.hosting.pathPrefix ?? '/',
    relativePath
  });
}

export function pageCanonical({ page, post, site }) {
  if (post != null || typeof page?.url !== 'string' || page.url === '/404.html') return null;
  return publicationUrl(site, page.url);
}

export function pageHreflangLinks({ languages, page, post, site }) {
  if (post != null || !Array.isArray(languages) || languages.length === 0) return [];
  const rootUrl = publicationUrl(site, '/');
  const variants = languages.map((language) => ({
    language,
    url: publicationUrl(site, `/${language}/`)
  }));
  if (page?.url === '/') return hreflangCluster(variants, rootUrl);
  if (!languages.some((language) => page?.url === `/${language}/`)) return [];
  const defaultUrl = variants.find(
    ({ language }) => language === site.site.defaultLanguage
  )?.url ?? rootUrl;
  return hreflangCluster(variants, defaultUrl);
}

export default {
  pageCanonical,
  pageHreflangLinks
};
