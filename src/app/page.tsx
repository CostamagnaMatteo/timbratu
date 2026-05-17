"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { ModaleTimbratura } from "@/components/ModaleTimbratura";
import {
  getTimbrattureMese,
  getTutteLeAggregazioni,
  setTimbratura,
} from "@/lib/firestore";
import { aggrega } from "@/lib/aggregazione";
import { calcolaMese, calcolaGiorno, formatMinuti } from "@/lib/calcolo-ore";
import {
  giorniDelMese,
  nomeMese,
  isWeekend,
  nomeGiorno,
  mesePrecedente,
  meseSuccessivo,
} from "@/lib/date-utils";
import { Timbratura, TipoGiornata } from "@/types/timbratura";

// ── costanti ─────────────────────────────────────────────────────────────

const ORARIO_CONTRATTUALE_MIN = 432; // 7h 12min

const TIPO_LABELS: Record<TipoGiornata, string> = {
  lavoro:   "Lavoro",
  ferie:    "Ferie",
  permesso: "Permesso",
  malattia: "Malattia",
  festivo:  "Festivo",
};

// ── helpers ───────────────────────────────────────────────────────────────

function oggiLocale(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface BilancioParts {
  segno: "+" | "-";
  ore: number;
  minuti: number;
}

function splitBilancio(min: number): BilancioParts {
  const abs = Math.abs(min);
  return {
    segno: min >= 0 ? "+" : "-",
    ore: Math.floor(abs / 60),
    minuti: abs % 60,
  };
}

function etichettaGiorno(data: string): string {
  return `${nomeGiorno(data).toLowerCase()} ${data.slice(8)}`;
}

// ── MonthPicker ──────────────────────────────────────────────────────────

function MonthPicker({
  anno,
  mese,
  onChange,
}: {
  anno: number;
  mese: number;
  onChange: (a: number, m: number) => void;
}) {
  const { anno: annoPrev, mese: mesePrev } = mesePrecedente(anno, mese);
  const { anno: annoNext, mese: meseNext } = meseSuccessivo(anno, mese);
  const annoCorrente = new Date().getFullYear();
  const label = `${nomeMese(mese).toLowerCase()}${anno !== annoCorrente ? ` ${anno}` : ""}`;

  return (
    <div className="flex items-center gap-2 w-full">
      <button
        onClick={() => onChange(annoPrev, mesePrev)}
        aria-label="Mese precedente"
        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-100 transition text-xl leading-none"
      >
        ‹
      </button>
      <div className="flex-1 text-center">
        <span className="text-2xl font-semibold text-zinc-900">{label}</span>
      </div>
      <button
        onClick={() => onChange(annoNext, meseNext)}
        aria-label="Mese successivo"
        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-100 transition text-xl leading-none"
      >
        ›
      </button>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = "zinc",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  color?: "emerald" | "red" | "zinc" | "amber";
}) {
  const textColor: Record<string, string> = {
    emerald: "text-emerald-600",
    red:     "text-red-500",
    zinc:    "text-zinc-800",
    amber:   "text-amber-500",
  };

  return (
    <div className="bg-white rounded-xl border border-[#ebe2cc] p-3 flex flex-col gap-0.5 min-h-[76px]">
      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest leading-none">
        {label}
      </span>
      <span className={`text-xl font-bold tabular-nums leading-snug ${textColor[color]}`}>
        {value}
      </span>
      {sub && (
        <span className="text-[11px] text-zinc-400 leading-tight">{sub}</span>
      )}
    </div>
  );
}

// ── Skeleton placeholders ────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#ebe2cc] p-3 min-h-[76px] flex flex-col gap-2 animate-pulse">
      <div className="h-2.5 w-12 bg-zinc-100 rounded" />
      <div className="h-6 w-20 bg-zinc-100 rounded" />
      <div className="h-2 w-16 bg-zinc-100 rounded" />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 animate-pulse">
      <div className="h-3 w-28 bg-zinc-100 rounded-full" />
      <div className="h-14 w-48 bg-zinc-100 rounded-2xl" />
      <div className="h-7 w-36 bg-zinc-100 rounded-full" />
    </div>
  );
}

function LedgerSkeleton() {
  return (
    <div className="flex flex-col gap-2 pt-2 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-8 bg-zinc-100 rounded" />
      ))}
    </div>
  );
}

// ── DayRow (ledger) ──────────────────────────────────────────────────────

function DayRow({
  data,
  timbratura,
  onClick,
}: {
  data: string;
  timbratura: Timbratura;
  onClick: () => void;
}) {
  const { tipo, fasce } = timbratura;
  const isLavoro = tipo === "lavoro" && fasce?.length;

  const orario = isLavoro
    ? `${fasce![0].entrata} → ${fasce![fasce!.length - 1].uscita}`
    : TIPO_LABELS[tipo].toLowerCase();

  const { saldo, isPositivo } = isLavoro
    ? (() => {
        const { saldoMin } = calcolaGiorno(fasce!);
        return { saldo: formatMinuti(saldoMin), isPositivo: saldoMin >= 0 };
      })()
    : { saldo: "—", isPositivo: null };

  return (
    <button
      onClick={onClick}
      className="grid grid-cols-[60px_1fr_auto] items-center gap-2 py-2.5 border-b border-zinc-100 last:border-0 text-left w-full hover:bg-zinc-50 rounded-lg px-1 transition"
    >
      <span className="text-[13px] font-medium text-zinc-700 tabular-nums">
        {etichettaGiorno(data)}
      </span>
      <span className="text-[13px] text-zinc-400 font-mono truncate">{orario}</span>
      <span
        className={[
          "text-[13px] font-semibold tabular-nums text-right w-[72px] shrink-0",
          isPositivo === null
            ? "text-zinc-400"
            : isPositivo
            ? "text-emerald-600"
            : "text-red-500",
        ].join(" ")}
      >
        {saldo}
      </span>
    </button>
  );
}

// ── HomeContent ───────────────────────────────────────────────────────────

function HomeContent() {
  const { user, logout } = useAuth();

  const now = new Date();
  const [anno, setAnno]   = useState(now.getFullYear());
  const [mese, setMese]   = useState(now.getMonth() + 1);
  const dataOggi = oggiLocale();

  const [timbrature, setTimbrature]               = useState<Record<string, Timbratura>>({});
  const [saldoComplessivoMin, setSaldoComplessivo] = useState(0);
  const [loading, setLoading]                     = useState(true);
  const [modaleData, setModaleData]               = useState<string | null>(null);

  const caricaDati = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [datiMese, aggregazioni] = await Promise.all([
        getTimbrattureMese(user.uid, anno, mese),
        getTutteLeAggregazioni(user.uid),
      ]);
      setTimbrature(datiMese);
      setSaldoComplessivo(aggregazioni.reduce((acc, a) => acc + a.saldoTotaleMin, 0));
    } finally {
      setLoading(false);
    }
  }, [user, anno, mese]);

  useEffect(() => { caricaDati(); }, [caricaDati]);

  // ── calcoli ───────────────────────────────────────────────────────────

  const isCurrentMonth =
    anno === now.getFullYear() && mese === now.getMonth() + 1;

  const giorni = giorniDelMese(anno, mese);
  const giorniLavorativiTotali = giorni.filter((g) => !isWeekend(g)).length;
  const giorniRimanenti        = giorni.filter((g) => g >= dataOggi && !isWeekend(g)).length;

  const { saldoTotaleMin, giorniLavorativi } = calcolaMese(timbrature);

  const oggiTimbratura = isCurrentMonth ? timbrature[dataOggi] : undefined;
  const oreOggiMin =
    oggiTimbratura?.tipo === "lavoro" && oggiTimbratura.fasce?.length
      ? calcolaGiorno(oggiTimbratura.fasce).oreNetteMin
      : null;
  const saldoOggiMin =
    oggiTimbratura?.tipo === "lavoro" && oggiTimbratura.fasce?.length
      ? calcolaGiorno(oggiTimbratura.fasce).saldoMin
      : null;

  const assenze = Object.values(timbrature).reduce(
    (acc, t) => {
      if (t.tipo !== "lavoro") acc[t.tipo] = (acc[t.tipo] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<TipoGiornata, number>>
  );

  const mediaGiornalieraMin =
    giorniLavorativi > 1 ? saldoTotaleMin / giorniLavorativi : null;
  const saldoProiettatoMin =
    mediaGiornalieraMin !== null && isCurrentMonth
      ? Math.round(saldoTotaleMin + mediaGiornalieraMin * giorniRimanenti)
      : null;

  const ultimiGiorni = Object.entries(timbrature)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 5);

  const hero     = splitBilancio(saldoComplessivoMin);
  const mesePill = splitBilancio(saldoTotaleMin);

  // ── salva timbratura ──────────────────────────────────────────────────

  const handleSalva = async (data: string, t: Timbratura) => {
    if (!user) return;
    await setTimbratura(user.uid, data, t);
    await aggrega(
      user.uid,
      parseInt(data.slice(0, 4)),
      parseInt(data.slice(5, 7)),
      dataOggi
    );
    setModaleData(null);
    caricaDati();
  };

  // ── render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f3e6]">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-[#f8f3e6]/90 backdrop-blur border-b border-[#ebe2cc] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-base font-semibold text-zinc-900 tracking-tight">Timbratuu</span>
          <div className="flex items-center gap-2">
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
                className="w-8 h-8 rounded-full border border-zinc-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600">
                {user?.displayName?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <button
              onClick={logout}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-28 flex flex-col gap-5">

        {/* ── Month picker ───────────────────────────────────────────── */}
        <div className="pt-5">
          <MonthPicker
            anno={anno}
            mese={mese}
            onChange={(a, m) => { setAnno(a); setMese(m); }}
          />
        </div>

        {/* ── Hero saldo ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 py-4">
          {loading ? (
            <HeroSkeleton />
          ) : (
            <>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
                La tua banca ore
              </span>

              <div className="flex items-baseline gap-1 leading-none">
                <span className="text-6xl font-bold tabular-nums text-zinc-900">
                  {hero.segno}{hero.ore}
                </span>
                <span
                  className={`text-2xl font-semibold tabular-nums ${
                    saldoComplessivoMin >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  h {String(hero.minuti).padStart(2, "0")}m
                </span>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium tabular-nums ${
                  saldoTotaleMin >= 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {isCurrentMonth ? "questo mese" : nomeMese(mese).toLowerCase()}{" "}
                <span className="font-bold">
                  {mesePill.segno}{mesePill.ore}h {String(mesePill.minuti).padStart(2, "0")}m
                </span>
              </span>
            </>
          )}
        </div>

        {/* ── 2×2 stat grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* OGGI */}
              <StatCard
                label="Oggi"
                value={
                  oreOggiMin !== null
                    ? `${Math.floor(oreOggiMin / 60)}h ${String(oreOggiMin % 60).padStart(2, "0")}m`
                    : oggiTimbratura
                    ? TIPO_LABELS[oggiTimbratura.tipo]
                    : "—"
                }
                sub={
                  saldoOggiMin !== null
                    ? `${formatMinuti(saldoOggiMin)} vs contratto`
                    : !isCurrentMonth
                    ? "altro mese"
                    : undefined
                }
                color={
                  oreOggiMin !== null
                    ? saldoOggiMin !== null && saldoOggiMin >= 0
                      ? "emerald"
                      : "red"
                    : "zinc"
                }
              />

              {/* GIORNI */}
              <StatCard
                label="Giorni"
                value={`${giorniLavorativi} / ${giorniLavorativiTotali}`}
                sub="lavorati"
                color="zinc"
              />

              {/* PROIEZIONE */}
              <StatCard
                label="Proiezione"
                value={
                  saldoProiettatoMin !== null
                    ? formatMinuti(saldoProiettatoMin)
                    : "—"
                }
                sub={
                  saldoProiettatoMin !== null
                    ? "fine mese"
                    : giorniLavorativi <= 1
                    ? "≥ 2 giorni lavorati"
                    : "solo mese corrente"
                }
                color={
                  saldoProiettatoMin !== null
                    ? saldoProiettatoMin >= 0
                      ? "emerald"
                      : "red"
                    : "zinc"
                }
              />

              {/* ASSENZE */}
              <StatCard
                label="Assenze"
                value={
                  <span className="flex flex-wrap gap-1 mt-0.5">
                    {(
                      [
                        { k: "ferie",    sigla: "F", cls: "bg-emerald-100 text-emerald-700" },
                        { k: "permesso", sigla: "P", cls: "bg-orange-100 text-orange-700"  },
                        { k: "malattia", sigla: "M", cls: "bg-red-100 text-red-700"        },
                      ] as { k: TipoGiornata; sigla: string; cls: string }[]
                    ).map(({ k, sigla, cls }) => (
                      <span
                        key={k}
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}
                      >
                        {sigla} {assenze[k] ?? 0}
                      </span>
                    ))}
                  </span>
                }
              />
            </>
          )}
        </div>

        {/* ── Ledger — ultimi giorni ──────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-[#ebe2cc] px-3 pb-1 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
              Ultimi giorni
            </span>
            <Link
              href={`/mese/${anno}/${String(mese).padStart(2, "0")}`}
              className="text-xs text-zinc-500 hover:text-zinc-800 transition"
            >
              vai al mese →
            </Link>
          </div>

          {loading ? (
            <LedgerSkeleton />
          ) : ultimiGiorni.length === 0 ? (
            <p className="text-sm text-zinc-400 py-5 text-center">
              Nessuna timbratura questo mese.
            </p>
          ) : (
            <div className="flex flex-col">
              {ultimiGiorni.map(([data, t]) => (
                <DayRow
                  key={data}
                  data={data}
                  timbratura={t}
                  onClick={() => setModaleData(data)}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      {/* ── FAB ───────────────────────────────────────────────────────── */}
      <button
        onClick={() => setModaleData(dataOggi)}
        aria-label="Timbra oggi"
        className="fixed bottom-6 right-4 flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-5 py-3.5 rounded-full shadow-lg hover:bg-zinc-800 active:scale-95 transition-all z-10"
      >
        <span className="text-base leading-none font-light">+</span>
        timbra oggi
      </button>

      {/* ── Modale timbratura ─────────────────────────────────────────── */}
      {modaleData && (
        <ModaleTimbratura
          data={modaleData}
          iniziale={timbrature[modaleData] ?? null}
          onSalva={(t) => handleSalva(modaleData, t)}
          onChiudi={() => setModaleData(null)}
        />
      )}
    </div>
  );
}

// ── export ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
