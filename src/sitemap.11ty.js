import { articleHreflang, renderSitemap, siteUrl } from '../lib/seo.js';

export default class Sitemap {
  data() {
    return { permalink: '/sitemap.xml' };
  }

  render({ buildManifest, site }) {
    const published = buildManifest.posts.filter(
      ({ publicationState }) => publicationState === 'published'
    );
    const hreflang = articleHreflang(published, site);
    const languages = [...new Set([
      site.site.defaultLanguage,
      ...published.map(({ language }) => language)
    ])].sort((left, right) => left.localeCompare(right));
    const rootUrl = siteUrl({
      canonicalBaseUrl: site.hosting.canonicalBaseUrl,
      pathPrefix: site.hosting.pathPrefix ?? '/',
      relativePath: '/'
    });
    const languageVariants = languages.map((language) => ({
      language,
      url: siteUrl({
        canonicalBaseUrl: site.hosting.canonicalBaseUrl,
        pathPrefix: site.hosting.pathPrefix ?? '/',
        relativePath: `/${language}/`
      })
    }));
    const defaultLanguageUrl = languageVariants
      .find(({ language }) => language === site.site.defaultLanguage)?.url ?? rootUrl;
    const lastModified = published.map((post) =>
      post.frontmatter.editHistory?.at(-1)?.slice(0, 10)
        ?? post.frontmatter.publishAfterDate
    ).sort().at(-1);
    const landingPages = [
      { url: rootUrl, lastModified, variants: languageVariants, xDefaultUrl: rootUrl },
      ...languageVariants.map(({ url }) => ({
        url,
        lastModified,
        variants: languageVariants,
        xDefaultUrl: defaultLanguageUrl
      }))
    ];
    const articles = published.map((post) => {
      const links = hreflang.get(post.source);
      return {
        url: post.pageUrl,
        lastModified: post.frontmatter.editHistory?.at(-1)?.slice(0, 10)
          ?? post.frontmatter.publishAfterDate,
        variants: links
          .filter(({ hreflang: language }) => language !== 'x-default')
          .map(({ hreflang: language, href: url }) => ({ language, url })),
        xDefaultUrl: links.find(({ hreflang: language }) => language === 'x-default').href
      };
    });
    return renderSitemap([...landingPages, ...articles]);
  }
}
