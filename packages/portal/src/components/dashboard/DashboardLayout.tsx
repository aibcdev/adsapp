import { Link } from "react-router-dom";
import { AibcLogo } from "../brand/AibcLogo";

export function DashboardLayout({
  email,
  onSignOut,
  children,
}: {
  email?: string;
  onSignOut: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell text-zinc-900">
      <header className="border-b border-zinc-200/80 bg-white/80 px-6 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/">
            <AibcLogo size="sm" variant="light" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {email ? (
              <>
                <span className="hidden text-zinc-500 sm:inline">Signed in</span>
                <span className="font-medium text-zinc-800">{email}</span>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-50"
                >
                  Sign out
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
