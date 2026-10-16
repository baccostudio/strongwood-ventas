import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/STRONGWOOD_COCINAS"].map((path) => ({
    url: new URL(path, siteConfig.url).href,
  }));
}
