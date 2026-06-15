import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

export function BlogArticle({ markdown }: { markdown: string }) {
  const html = marked.parse(markdown) as string;
  return (
    <article
      className="blog-article mt-10 text-lg leading-relaxed text-zinc-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
