import GetSitemapLinks from 'sitemap-links';
import DynamicPath, { getStaticProps } from './index';

export default DynamicPath;
export { getStaticProps };

export const getStaticPaths = async () => {
  const sitemapLink = process.env.WEBFLOW_URL + `/sitemap.xml`;
  const links = await GetSitemapLinks(sitemapLink).catch((err) => {
    console.log(err);
  });

  const paths = [];
  for (let link of links) {
    let url = new URL(link);
    const path = url.pathname.replace(`/`, ``).split(`/`);
    if (!path.length || !path[0]) continue;
    paths.push({
      params: { path },
    });
  }

  return {
    paths,
    fallback: `blocking`,
  };
};
