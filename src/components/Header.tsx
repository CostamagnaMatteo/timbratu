"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { nomeMese, mesePrecedente, meseSuccessivo } from "@/lib/date-utils";
import { formatMinuti } from "@/lib/calcolo-ore";

interface Props {
  anno:          number;
  mese:          number;
  saldoTotaleMin: number;
}

export function Header({ anno, mese, saldoTotaleMin }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const navMese = (a: number, m: number) => {
    router.push(`/mese/${a}/${String(m).padStart(2, "0")}`);
  };

  const prev = mesePrecedente(anno, mese);
  const next = meseSuccessivo(anno, mese);

  const saldoPositivo = saldoTotaleMin >= 0;
  const saldoLabel    = formatMinuti(saldoTotaleMin);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">

        {/* Logo + navigazione mese */}
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-gray-800">Timbratu</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navMese(prev.anno, prev.mese)}
              className="p-1.5 rounded hover:bg-gray-100 transition text-gray-500"
              aria-label="Mese precedente"
            >
              ←
            </button>
            <span className="text-sm font-medium text-gray-700 w-36 text-center">
              {nomeMese(mese)} {anno}
            </span>
            <button
              onClick={() => navMese(next.anno, next.mese)}
              className="p-1.5 rounded hover:bg-gray-100 transition text-gray-500"
              aria-label="Mese successivo"
            >
              →
            </button>
          </div>
        </div>

        {/* Saldo + utente */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Saldo mensile:{" "}
            <span className={`font-semibold ${saldoPositivo ? "text-green-600" : "text-red-600"}`}>
              {saldoLabel}
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
