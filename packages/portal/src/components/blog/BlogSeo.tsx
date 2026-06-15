import { useEffect } from "react";
import type { BlogPost } from "../../lib/blog";
import { SITE_URL } from "../../lib/blog";

function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function BlogSeo({
  post,
  type = "website",
}: {
  post?: BlogPost;
  type?: "website" | "article";
}) {
  useEffect(() => {
    const title = post ? `${post.title} | AIBC Blog` : "AIBC Blog — Make Money Whilst You Code";
    const description =
      post?.description ||
      "Founder notes on AI coding, developer income, and monetizing your IDE. Written for builders who ship with Claude, Cursor, and VS Code.";
    const url = post ? `${SITE_URL}/blog/${post.slug}` : `${SITE_URL}/blog`;

    document.title = title;
    upsertMeta("description", description);
    upsertLink("canonical", url);
    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:url", url, "property");
    upsertMeta("og:type", type, "property");
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);

    const existing = document.getElementById("blog-jsonld");
    existing?.remove();

    if (post) {
      const script = document.createElement("script");
      script.id = "blog-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        author: { "@type": "Person", name: post.author },
        keywords: post.keywords.join(", "),
        mainEntityOfPage: url,
        publisher: { "@type": "Organization", name: "AIBC Media", url: SITE_URL },
      });
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById("blog-jsonld")?.remove();
    };
  }, [post, type]);

  return null;
}

export function trackBlogRead(slug: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "blog_read", { slug, page_path: `/blog/${slug}` });
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
