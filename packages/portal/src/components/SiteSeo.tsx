import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  seoForPath,
} from "../lib/seo";

function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra?.sizes
    ? `link[rel="${rel}"][sizes="${extra.sizes}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (extra?.sizes) el.sizes = extra.sizes;
    if (extra?.type) el.type = extra.type;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function SiteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/blog")) return;

    const seo = seoForPath(pathname);
    const url = `${SITE_URL}${seo.path === "/" ? "" : seo.path}`;

    document.title = seo.title;
    upsertMeta("description", seo.description);
    upsertLink("canonical", url);
    upsertMeta("robots", seo.noindex ? "noindex, nofollow" : "index, follow");

    upsertMeta("og:site_name", SITE_NAME, "property");
    upsertMeta("og:title", seo.title, "property");
    upsertMeta("og:description", seo.description, "property");
    upsertMeta("og:url", url, "property");
    upsertMeta("og:type", seo.type ?? "website", "property");
    upsertMeta("og:image", OG_IMAGE, "property");
    upsertMeta("og:image:alt", `${SITE_NAME} — ${DEFAULT_DESCRIPTION}`, "property");

    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", seo.title);
    upsertMeta("twitter:description", seo.description);
    upsertMeta("twitter:image", OG_IMAGE);

    const existing = document.getElementById("site-jsonld");
    existing?.remove();

    if (seo.path === "/") {
      const script = document.createElement("script");
      script.id = "site-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/icon-512.png`,
            email: "aibcmedia@outlook.com",
          },
          {
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: DEFAULT_DESCRIPTION,
            publisher: { "@type": "Organization", name: SITE_NAME },
          },
        ],
      });
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById("site-jsonld")?.remove();
    };
  }, [pathname]);

  return null;
}
