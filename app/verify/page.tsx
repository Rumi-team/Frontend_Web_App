"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function VerifyForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/");
      else setEmail(user.email || "");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/access-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/rumi");
      router.refresh();
    } else {
      setError(data.error || "Invalid access code");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="mb-6">
          <h1 className="text-white text-xl font-semibold">Early Access</h1>
          {email && (
            <div className="flex items-center justify-between mt-1">
              <p className="text-zinc-400 text-sm">
                Signed in with{" "}
                <span className="text-yellow-400">
                  {email.includes("privaterelay.appleid.com") ? "your Apple ID" : email}
                </span>
              </p>
              <button
                onClick={handleSignOut}
                className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors ml-3 shrink-0"
              >
                Sign out
              </button>
            </div>
          )}
          <p className="text-zinc-400 text-sm mt-3">
            Rumi is invite-only. Enter your access code to continue.
          </p>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-yellow-400 tracking-widest font-mono uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
            autoFocus
            required
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full bg-yellow-400 text-black rounded-lg py-2.5 text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50 transition-colors"
          >
            {loading ? "Verifying..." : "Get Access →"}
          </button>
        </form>
        <p className="text-zinc-600 text-xs mt-5 text-center">
          No code?{" "}
          <a
            href="mailto:support@rumi.team"
            className="text-zinc-500 hover:text-yellow-400 transition-colors"
          >
            Request early access
          </a>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-zinc-400 text-sm">Loading...</div>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
