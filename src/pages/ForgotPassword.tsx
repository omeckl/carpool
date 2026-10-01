import { useState } from "react";
import { Page } from "../types";
import { requestPasswordReset } from "../lib/api";

interface ForgotPasswordProps {
  navigate: (page: Page) => void;
  goBack: () => void;
}

// CAR-58: elfelejtett jelszó — a visszajelzés szándékosan semleges, hogy ne
// lehessen vele kideríteni, létezik-e fiók egy adott e-mail címmel.
export default function ForgotPassword({ navigate, goBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Váratlan hiba történt. Kérjük, próbáld újra később.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-[#717171] hover:text-[#222222] mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>
          Vissza
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#222222]">Elfelejtett jelszó</h1>
          <p className="text-[#717171] text-sm mt-1">
            Add meg a fiókodhoz tartozó e-mail címet, és küldünk egy linket az új jelszó beállításához.
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 border bg-green-50 border-green-200 text-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" className="flex-shrink-0"><polyline points="20,6 9,17 4,12"/></svg>
              <span className="text-sm font-medium text-green-700">
                Ha ezzel a címmel van fiók, elküldtük a levelet. Nézd meg a beérkező leveleidet (és a spam mappát is).
              </span>
            </div>
            <button
              onClick={() => navigate("login")}
              className="text-sm font-semibold text-[#FF385C] hover:underline"
            >
              Vissza a bejelentkezéshez
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-semibold text-[#222222] mb-1.5">E-mail cím</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="peter@email.hu"
                required
                autoComplete="email"
                className="w-full border border-[#DDDDDD] rounded-xl px-4 py-3 text-[#222222] text-sm focus:outline-none focus:border-[#222222] transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF385C] hover:bg-[#E31C5F] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
            >
              {loading ? "Küldés…" : "Link küldése"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
