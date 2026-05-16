"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { getTimbrattureMese, getTutteLeTimbrature } from "@/lib/firestore";
import { calcolaMese, calcolaGiorno, formatMinuti, formatOre } from "@/lib/calcolo-ore";
import { giorniDelMese, nomeMese, isWeekend } from "@/lib/date-utils";
import { Timbratura, TipoGiornata } from "@/types/timbratura";

const ORARIO_CONTRATTUALE_MIN = 432;

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "red" | "blue" | "gray";
}) {
  const colors: Record<string, string> = {
    green: "text-green-600",
    red:   "text-red-600",
    blue:  "text-blue-600",
    gray:  "text-gray-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${accent ? colors[accent] : "text-gray-800"}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function HomeContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const now     = new Date();
  const anno    = now.getFullYear();
  const mese    = now.getMonth() + 1;
  const oggi    = now.toISOString().slice(0, 10);

  const [timbrature, setTimbrature]       = useState<Record<string, Timbratura>>({});
  const [tutteTimbrature, setTutte]       = useState<Record<string, Timbratura>>({});
  const [loading, setLoading]             = useState(true);

  const carica = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [datiMese, datiTutti] = await Promise.all([
        getTimbrattureMese(user.uid, anno, mese),
        getTutteLeTimbrature(user.uid),
      ]);
      setTimbrature(datiMese);
      setTutte(datiTutti);
    } finally {
      setLoading(false);
    }
  }, [user, anno, mese]);

  useEffect(() => { carica(); }, [carica]);

  const giorni = giorniDelMese(anno, mese);

  // Giorni lavorativi del mese (no weekend)
  const giorniLavorativiTotali = giorni.filter((g) => !isWeekend(g)).length;

  // Giorni lavorativi rimanenti da oggi in poi (incluso oggi)
  const giorniRimanenti = giorni.filter((g) => g >= oggi && !isWeekend(g)).length;

  const { saldoTotaleMin, giorniLavorativi } = calcolaMese(timbrature);
  const { saldoTotaleMin: saldoComplessivoMin } = calcolaMese(tutteTimbrature);

  // Ore lavorate oggi
  const oggiTimbratura = timbrature[oggi];
  const oreLavorateOggiMin =
    oggiTimbratura?.tipo === "lavoro" && oggiTimbratura.fasce?.length
      ? calcolaGiorno(oggiTimbratura.fasce).oreNetteMin
      : null;

  // Distribuzione tipi (escluso lavoro)
  const conteggioTipi = Object.values(timbrature).reduce(
    (acc, t) => {
      if (t.tipo !== "lavoro") acc[t.tipo] = (acc[t.tipo] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<TipoGiornata, number>>
  );

  // Proiezione saldo a fine mese
  const mediaGiornalieraMin =
    giorniLavorativi > 0 ? saldoTotaleMin / giorniLavorativi : 0;
  const saldoProiettatoMin =
    saldoTotaleMin + mediaGiornalieraMin * giorniRimanenti;

  const saldoPositivo = saldoTotaleMin >= 0;

  const tipoLabels: Record<string, string> = {
    ferie:    "Ferie",
    permesso: "Permessi",
    malattia: "Malattia",
    festivo:  "Festivi",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-gray-800">Timbratu</Link>
          <div className="flex items-center gap-3">
            {user?.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm text-gray-700 hidden sm:block">{user?.displayName}</span>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-700 transition"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Titolo sezione */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {nomeMese(mese)} {anno}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Riepilogo mese corrente</p>
          </div>
          <button
            onClick={() =>
              router.push(`/mese/${anno}/${String(mese).padStart(2, "0")}`)
            }
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            Vai al dettaglio →
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Caricamento...</div>
        ) : (
          <>
            {/* Saldo complessivo */}
            <div className="mb-6">
              <StatCard
                label="Saldo complessivo (tutti i mesi)"
                value={formatMinuti(saldoComplessivoMin)}
                accent={saldoComplessivoMin >= 0 ? "green" : "red"}
              />
            </div>

            {/* Card principali */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <StatCard
                label="Saldo mese"
                value={formatMinuti(saldoTotaleMin)}
                sub={`su ${giorniLavorativi} giorni lavorati`}
                accent={saldoPositivo ? "green" : "red"}
              />
              <StatCard
                label="Giorni lavorati"
                value={`${giorniLavorativi} / ${giorniLavorativiTotali}`}
                sub={`${giorniRimanenti} giorni rimanenti`}
                accent="blue"
              />
              <StatCard
                label="Oggi"
                value={
                  oreLavorateOggiMin !== null
                    ? formatOre(oreLavorateOggiMin)
                    : oggiTimbratura
                    ? tipoLabels[oggiTimbratura.tipo] ?? oggiTimbratura.tipo
                    : "Non timbrato"
                }
                sub={
                  oreLavorateOggiMin !== null
                    ? saldoPositivo || oreLavorateOggiMin >= ORARIO_CONTRATTUALE_MIN
                      ? `+${formatOre(oreLavorateOggiMin - ORARIO_CONTRATTUALE_MIN)} rispetto al contratto`
                      : `${formatOre(ORARIO_CONTRATTUALE_MIN - oreLavorateOggiMin)} mancanti`
                    : undefined
                }
                accent={
                  oreLavorateOggiMin === null
                    ? "gray"
                    : oreLavorateOggiMin >= ORARIO_CONTRATTUALE_MIN
                    ? "green"
                    : "red"
                }
              />
            </div>

            {/* Card secondarie */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(conteggioTipi).map(([tipo, conteggio]) => (
                <StatCard
                  key={tipo}
                  label={tipoLabels[tipo] ?? tipo}
                  value={`${conteggio} ${conteggio === 1 ? "giorno" : "giorni"}`}
                />
              ))}

              {giorniLavorativi > 1 && (
                <StatCard
                  label="Proiezione fine mese"
                  value={formatMinuti(Math.round(saldoProiettatoMin))}
                  sub="se mantieni la media attuale"
                  accent={saldoProiettatoMin >= 0 ? "green" : "red"}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
