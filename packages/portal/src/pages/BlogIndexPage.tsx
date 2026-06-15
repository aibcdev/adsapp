import { Link } from "react-router-dom";
import { BlogLayout } from "../components/blog/BlogLayout";
import { BlogSeo } from "../components/blog/BlogSeo";
import { getPublishedPosts } from "../lib/blog";

export function BlogIndexPage() {
  const posts = getPublishedPosts();

  return (
    <BlogLayout>
      <BlogSeo />
      <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-700">AIBC Blog</p>
      <h1 className="mt-3 font-brand-heading text-4xl leading-tight text-zinc-950 md:text-5xl">
        Notes from the edge of AI coding
      </h1>
      <p className="mt-4 text-lg text-zinc-600">
        Founder-style essays on making money while you code — no fluff, no popups, just honest takes for developers
        shipping with Claude, Cursor, and VS Code.
      </p>

      <ul className="mt-14 space-y-10 border-t border-zinc-200 pt-10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={`/blog/${post.slug}`} className="group block">
              <time className="font-mono text-xs text-zinc-500">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {post.readMinutes} min read
              </time>
              <h2 className="mt-2 font-brand-heading text-2xl text-zinc-900 transition group-hover:text-emerald-800 md:text-3xl">
                {post.title}
              </h2>
              <p className="mt-2 text-base text-zinc-600">{post.description}</p>
              {post.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      {posts.length === 0 ? (
        <p className="mt-12 text-zinc-500">Posts coming soon.</p>
      ) : null}
    </BlogLayout>
  );
}
