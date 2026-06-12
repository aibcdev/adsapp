import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-aibc-border py-8 text-center text-xs text-neutral-500">
      <div className="mb-3 flex justify-center gap-6">
        <Link to="/privacy" className="hover:text-white">
          Privacy
        </Link>
        <Link to="/terms" className="hover:text-white">
          Terms
        </Link>
        <a href="mailto:watchaibc@gmail.com" className="hover:text-white">
          Support
        </a>
      </div>
      <p>© {new Date().getFullYear()} aibc · Privacy-safe · No source code collection</p>
    </footer>
  );
}
