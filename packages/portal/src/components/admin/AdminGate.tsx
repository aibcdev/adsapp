import { useState } from "react";
import { getAdminKey, setAdminKey } from "../../lib/adminApi";

export function AdminGate({ children }: { children: (key: string) => React.ReactNode }) {
  const [key, setKey] = useState(getAdminKey());
  const [input, setInput] = useState("");

  if (!key) {
    return (
      <div className="mx-auto max-w-md">
        <p className="text-sm text-zinc-400">Enter your AIBC_ADMIN_KEY.</p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2"
          placeholder="Admin key"
        />
        <button
          type="button"
          onClick={() => {
            const k = input.trim();
            setAdminKey(k);
            setKey(k);
          }}
          className="aibc-btn-primary mt-4 w-full"
        >
          Unlock
        </button>
      </div>
    );
  }

  return <>{children(key)}</>;
}
