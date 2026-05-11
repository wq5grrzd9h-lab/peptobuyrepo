import { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { posts } from "@/lib/blog";

const BASE = "https://peptobuy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/shop`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/blog`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/about`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/terms`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/shop/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...blogPages];
}
