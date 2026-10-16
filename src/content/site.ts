const siteUrl = new URL(process.env.SITE_URL ?? "https://www.strongwoodventas.com.ar");

if (
  !["http:", "https:"].includes(siteUrl.protocol) ||
  siteUrl.pathname !== "/" ||
  siteUrl.search ||
  siteUrl.hash ||
  siteUrl.username ||
  siteUrl.password
) {
  throw new Error("SITE_URL must be an HTTP(S) origin without a path or credentials.");
}

export const siteConfig = {
  url: siteUrl.origin,
};
