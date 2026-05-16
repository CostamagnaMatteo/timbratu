"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { formatMinuti } from "@/lib/calcolo-ore";

interface Props {
  anno:           number;
  mese:           number;
  saldoTotaleMin: number;
}

export function Header({ anno, mese, saldoTotaleMin }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const valore = `${anno}-${String(mese).padStart(2, "0")}`;

  const handleMese = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [a, m] = e.target.value.split("-");
    if (a && m) router.push(`/mese/${a}/${m}`);
  };

  const saldoPositivo = saldoTotaleMin >= 0;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">

        {/* Logo + datepicker mese */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-gray-800 hover:text-gray-600 transition">
            Timbratu
          </Link>
          <input
            type="month"
            value={valore}
            onChange={handleMese}
            className="text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Saldo + utente */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Saldo:{" "}
            <span className={`font-semibold ${saldoPositivo ? "text-green-600" : "text-red-600"}`}>
              {formatMinuti(saldoTotaleMin)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user?.photoURL && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm text-gray-700 hidden sm:block">{user?.displayName}</span>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-700 transition ml-1"
            >
              Esci
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
