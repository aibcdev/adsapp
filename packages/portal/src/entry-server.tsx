import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { AEO_SEO } from "./lib/aeoContent";
import { AboutPage } from "./pages/AboutPage";
import { DevelopersIndexPage } from "./pages/DevelopersIndexPage";
import { FaqPage } from "./pages/FaqPage";
import { GuidesIndexPage } from "./pages/GuidesIndexPage";
import { VsIndexPage } from "./pages/VsIndexPage";

const PAGES: Record<string, () => JSX.Element> = {
  "/about": AboutPage,
  "/faq": FaqPage,
  "/guides": GuidesIndexPage,
  "/developers": DevelopersIndexPage,
  "/vs": VsIndexPage,
};

export const PRERENDER_PATHS = Object.keys(PAGES);

export function render(url: string) {
  const Page = PAGES[url];
  const seo = AEO_SEO[url];
  if (!Page || !seo) throw new Error(`No prerender page for ${url}`);
  const html = renderToString(
    <MemoryRouter initialEntries={[url]}>
      <Page />
    </MemoryRouter>,
  );
  return { html, title: seo.title, description: seo.description, path: url };
}
