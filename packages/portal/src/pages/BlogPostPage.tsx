import { DEVELOPER_SHARE_PCT } from "@aibc/shared";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { BlogArticle } from "../components/blog/BlogArticle";
import { BlogBackLink, BlogLayout } from "../components/blog/BlogLayout";
import { BlogSeo, trackBlogRead } from "../components/blog/BlogSeo";
import { getPostBySlug, getRelatedPosts } from "../lib/blog";

export function BlogPostPage() {
  const { slug = "" } = useParams();
  const post = getPostBySlug(slug);
  const related = getRelatedPosts(slug, 2);

  useEffect(() => {
    if (post) trackBlogRead(post.slug);
  }, [post]);

  if (!post) {
    return (
      <BlogLayout>
        <BlogBackLink />
        <h1 className="mt-8 font-brand-heading text-3xl text-zinc-900">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-emerald-700 underline">
          Back to blog
        </Link>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <BlogSeo post={post} type="article" />
      <BlogBackLink />
      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-500">
          <time>
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{post.readMinutes} min read</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>
        <h1 className="mt-4 font-brand-heading text-4xl leading-tight text-zinc-950 md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-xl text-zinc-600">{post.description}</p>
      </header>

      <BlogArticle markdown={post.body} />

      <div className="mt-14 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="font-brand-heading text-xl text-zinc-900">Install free. Keep {DEVELOPER_SHARE_PCT}%.</p>
        <p className="mt-2 text-sm text-zinc-600">
          One sponsored line in your AI spinner — no popups.{" "}
          <Link to="/developers/how-it-works" className="text-emerald-700 underline">
            See how it works
          </Link>{" "}
          or{" "}
          <Link to="/#install" className="text-emerald-700 underline">
            install now
          </Link>
          .
        </p>
      </div>

      {related.length ? (
        <section className="mt-14 border-t border-zinc-200 pt-10">
          <h2 className="font-mono text-xs uppercase tracking-widest text-zinc-500">Keep reading</h2>
          <ul className="mt-6 space-y-6">
            {related.map((r) => (
              <li key={r.slug}>
                <Link to={`/blog/${r.slug}`} className="font-brand-heading text-xl text-zinc-900 hover:text-emerald-800">
                  {r.title}
                </Link>
                <p className="mt-1 text-sm text-zinc-600">{r.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </BlogLayout>
  );
}
