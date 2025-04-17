/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://www.atprotoworld.com",
  generateRobotsTxt: true,
  exclude: ["/twitter-image.*", "/opengraph-image.*", "/icon.*"],
};

export default config;
