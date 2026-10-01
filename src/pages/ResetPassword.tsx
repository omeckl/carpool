import { useState } from "react";
import { Page } from "../types";
import { setNewPassword } from "../lib/api";
import { PASSWORD_RULE, validatePassword } from "../lib/validation";

interface ResetPasswordProps {
  navigate: (page: Page) => void;
  // Van-e érvényes, a helyreállító linkből létrehozott munkamenet.
  hasRecoverySession: boolean;
  onDone: () => void;
}

// CAR-58: új jelszó beállítása a jelszó-visszaállító e-mail linkjéről érkezve.
export default function ResetPassword({ navigate, hasRecoverySession, onDone }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (password !== confirm) {
      setError("A két jelszó nem egyezik.");
      return;
    }
    setLoading(true);
    try {
      await setNewPassword(password);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Váratlan hiba történt. Kérjük, próbáld újra később.");
    } finally {
      setLoading(false);
    }
  };

  if (!hasRecoverySession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-extrabold text-[#222222] mb-3">Érvénytelen vagy lejárt link</h1>
          <p className="text-sm text-[#717171] mb-6">
            A jelszó-visszaállító link lejárt vagy már felhasználták. Kérj új linket.
          </p>
          <button
            onClick={() => navigate("forgot-password")}
            className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
          >
            Új link kérése
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#222222]">Új jelszó beállítása</h1>
          <p className="text-[#717171] text-sm mt-1">Add meg az új jelszavadat.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-semibold text-[#222222] mb-1.5">Új jelszó</label>
            <input
              id="new-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Legalább 8 karakter"
              className="w-full border border-[#DDDDDD] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#222222] transition-colors"
            />
            <p className="text-xs text-[#717171] mt-1">{PASSWORD_RULE}</p>
          </div>
          <div>
            <label htmlFor="new-password-confirm" className="block text-sm font-semibold text-[#222222] mb-1.5">Új jelszó megerősítése</label>
            <input
              id="new-password-confirm"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Írd be még egyszer"
              className="w-full border border-[#DDDDDD] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#222222] transition-colors"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[#717171] cursor-pointer">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-[#FF385C]" />
            Jelszó megjelenítése
          </label>

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
            {loading ? "Mentés…" : "Jelszó mentése"}
          </button>
        </form>
      </div>
    </div>
  );
}
