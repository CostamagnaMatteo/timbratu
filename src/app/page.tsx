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
import { calcolaMese, calcolaGiorno } from "@/lib/calcolo-ore";
import {
  giorniDelMese,
  nomeMese,
  isWeekend,
  nomeGiorno,
  mesePrecedente,
  meseSuccessivo,
} from "@/lib/date-utils";
import { Shift, ShiftType } from "@/types/shift";

// ── costanti ─────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<ShiftType, string> = {
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

function splitBilancio(min: number) {
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

function formatM(min: number): string {
  const segno = min >= 0 ? "+" : "-";
  const abs   = Math.abs(min);
  const ore   = Math.floor(abs / 60);
  const m     = abs % 60;
  return ore > 0
    ? `${segno}${ore}h ${String(m).padStart(2, "0")}m`
    : `${segno}${m}m`;
}

// Saldo della settimana corrente (lun-dom) sulle timbrature caricate
function calcolaSaldoSettimana(timbrature: Record<string, Shift>): number {
  const now = new Date();
  const dow = now.getDay();
  const diff = dow === 0 ? 6 : dow - 1;
  const lunedi = new Date(now);
  lunedi.setDate(now.getDate() - diff);

  let saldo = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(lunedi);
    d.setDate(lunedi.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const t = timbrature[key];
    if (t?.tipo === "lavoro" && t.fasce?.length) {
      saldo += calcolaGiorno(t.fasce).saldoMin;
    }
  }
  return saldo;
}

// Somma dei delta positivi del mese (straordinari lordi)
function calcolaStraordinari(timbrature: Record<string, Shift>): number {
  return Object.values(timbrature)
    .filter((t) => t.tipo === "lavoro" && t.fasce?.length)
    .reduce((acc, t) => {
      const { saldoMin } = calcolaGiorno(t.fasce!);
      return saldoMin > 0 ? acc + saldoMin : acc;
    }, 0);
}

// ── MonthBar ──────────────────────────────────────────────────────────────

function MonthBar({
  anno,
  mese,
  nextDisabled,
  onChange,
}: {
  anno: number;
  mese: number;
  nextDisabled: boolean;
  onChange: (a: number, m: number) => void;
}) {
  const { anno: annoPrev, mese: mesePrev } = mesePrecedente(anno, mese);
  const { anno: annoNext, mese: meseNext } = meseSuccessivo(anno, mese);
  const label = `${nomeMese(mese).toLowerCase()} ${anno}`;

  return (
    <div className="flex items-center gap-2 w-full border-2 border-zinc-800 rounded-xl px-2 py-1.5 shadow-[2px_2px_0_0_rgba(31,29,26,0.12)]">
      <button
        onClick={() => onChange(annoPrev, mesePrev)}
        aria-label="Mese precedente"
        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-700 hover:bg-carta-200 transition text-2xl leading-none"
      >
        ‹
      </button>
      <div className="flex-1 text-center">
        <span className="text-2xl font-semibold text-zinc-900 font-caveat">{label}</span>
      </div>
      <button
        onClick={() => { if (!nextDisabled) onChange(annoNext, meseNext); }}
        aria-label="Mese successivo"
        disabled={nextDisabled}
        title={nextDisabled ? "non puoi andare oltre il mese corrente" : undefined}
        className={[
          "w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border text-2xl leading-none transition",
          nextDisabled
            ? "border-zinc-300 text-zinc-300 cursor-not-allowed bg-carta-200/50"
            : "border-zinc-700 text-zinc-700 hover:bg-carta-200",
        ].join(" ")}
      >
        ›
      </button>
    </div>
  );
}

// ── TodayInProgressCard ───────────────────────────────────────────────────

function TodayInProgressCard({
  data,
  entrata,
  onModifica,
  onChiudiFascia,
}: {
  data: string;
  entrata: string;
  onModifica: () => void;
  onChiudiFascia: () => void;
}) {
  return (
    <div className="rounded-xl border-2 border-zinc-800 bg-carta-50 p-3 flex flex-col gap-2 shadow-[2px_2px_0_0_rgba(31,29,26,0.12)]">
      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-zinc-800 font-caveat">
          oggi · {etichettaGiorno(data)}
        </span>
        <span className="text-sm text-zinc-400 font-patrick-hand">in corso…</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums text-zinc-800 font-caveat">
          {entrata} → ?
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-1">
        <button
          onClick={onModifica}
          className="px-3 py-1.5 rounded-full border-2 border-zinc-800 text-sm font-medium text-zinc-800 hover:bg-zinc-100 transition font-caveat"
        >
          modifica
        </button>
        <button
          onClick={onChiudiFascia}
          className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition font-caveat"
        >
          + chiudi fascia
        </button>
      </div>
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
  color?: "emerald" | "red" | "zinc" | "muted";
}) {
  const textColor: Record<string, string> = {
    emerald: "text-emerald-600",
    red:     "text-red-500",
    zinc:    "text-zinc-800",
    muted:   "text-ink-muted",
  };

  return (
    <div className="bg-white rounded-xl border border-carta-200 p-3 flex flex-col gap-0.5 min-h-[76px]">
      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest leading-none font-patrick-hand">
        {label}
      </span>
      <span className={`text-xl font-bold tabular-nums leading-snug font-caveat ${textColor[color]}`}>
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
    <div className="bg-white rounded-xl border border-carta-200 p-3 min-h-[76px] flex flex-col gap-2 animate-pulse">
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
  timbratura: Shift;
  onClick: () => void;
}) {
  const { tipo, fasce } = timbratura;
  const isLavoro = tipo === "lavoro" && fasce?.length;

  const orario = isLavoro
    ? `${fasce![0].entrata} → ${fasce![fasce!.length - 1].uscita}`
    : TIPO_LABELS[tipo].toLowerCase();

  const { saldo, saldoGiornoMin } = isLavoro
    ? (() => {
        const { saldoMin } = calcolaGiorno(fasce!);
        return { saldo: formatM(saldoMin), saldoGiornoMin: saldoMin };
      })()
    : { saldo: "—", saldoGiornoMin: null };

  return (
    <button
      onClick={onClick}
      className="grid grid-cols-[60px_1fr_auto] items-center gap-2 py-2.5 border-b border-dotted border-zinc-300 last:border-0 text-left w-full hover:bg-carta-100 rounded-lg px-1 transition"
    >
      <span className="text-[13px] font-medium text-zinc-700 tabular-nums">
        {etichettaGiorno(data)}
      </span>
      <span className="text-[13px] text-zinc-400 font-mono truncate">{orario}</span>
      <span
        className={[
          "text-[13px] font-semibold tabular-nums text-right w-[72px] shrink-0 font-caveat",
          saldoGiornoMin === null
            ? "text-zinc-400"
            : saldoGiornoMin > 0
            ? "text-emerald-600"
            : saldoGiornoMin < 0
            ? "text-red-500"
            : "text-ink-muted",
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

  const [timbrature, setTimbrature]               = useState<Record<string, Shift>>({});
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

  const { saldoTotaleMin, giorniLavorativi } = calcolaMese(timbrature);

  // Hero: banca ore complessiva per mese corrente, saldo mese per mese passato
  const heroMin = isCurrentMonth ? saldoComplessivoMin : saldoTotaleMin;
  const hero = splitBilancio(heroMin);
  const mesePill = splitBilancio(saldoTotaleMin);

  // Fascia in corso: ultima fascia di oggi senza uscita (solo mese corrente)
  const fasciaInCorso = isCurrentMonth
    ? (() => {
        const oggi = timbrature[dataOggi];
        if (oggi?.tipo !== "lavoro" || !oggi.fasce?.length) return null;
        const ultima = oggi.fasce[oggi.fasce.length - 1];
        return !ultima.uscita ? ultima : null;
      })()
    : null;

  const saldoSettimanaMin = isCurrentMonth ? calcolaSaldoSettimana(timbrature) : null;
  const straordinariMin   = !isCurrentMonth ? calcolaStraordinari(timbrature) : null;

  const ultimiGiorni = Object.entries(timbrature)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 5);

  // ── salva timbratura ──────────────────────────────────────────────────

  const handleSalva = async (data: string, t: Shift) => {
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

  const tornaAOggi = () => {
    setAnno(now.getFullYear());
    setMese(now.getMonth() + 1);
  };

  // ── render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-carta">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-carta/90 backdrop-blur border-b border-carta-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span
            className="text-xl font-bold text-zinc-900 font-caveat"
            style={{ transform: "rotate(-1deg)", display: "inline-block" }}
          >
            Timbratuu
          </span>
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

      <main className="max-w-lg mx-auto px-4 pb-28 flex flex-col gap-4">

        {/* ── Month picker ───────────────────────────────────────────── */}
        <div className="pt-5">
          <MonthBar
            anno={anno}
            mese={mese}
            nextDisabled={isCurrentMonth}
            onChange={(a, m) => { setAnno(a); setMese(m); }}
          />
        </div>

        {/* ── Badge mese chiuso (solo mese passato) ──────────────────── */}
        {!isCurrentMonth && (
          <div className="flex justify-center">
            <span className="text-sm px-3 py-1 rounded-full border-2 border-dashed border-stone-400 bg-stone-100 text-stone-600 font-patrick-hand">
              📁 mese chiuso · sola lettura
            </span>
          </div>
        )}

        {/* ── Hero saldo ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 py-2">
          {loading ? (
            <HeroSkeleton />
          ) : (
            <>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest font-patrick-hand">
                {isCurrentMonth
                  ? "La tua banca ore"
                  : `Saldo di ${nomeMese(mese).toLowerCase()}`}
              </span>

              <div
                className={`flex items-baseline gap-0.5 leading-none tabular-nums font-caveat font-bold ${
                  heroMin > 0
                    ? "text-emerald-600"
                    : heroMin < 0
                    ? "text-red-500"
                    : "text-ink-muted"
                }`}
              >
                <span className="text-6xl">{hero.segno}{hero.ore}</span>
                <span className="text-2xl">h {String(hero.minuti).padStart(2, "0")}m</span>
              </div>

              {isCurrentMonth ? (
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium tabular-nums font-patrick-hand border ${
                    saldoTotaleMin > 0
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : saldoTotaleMin < 0
                      ? "bg-red-100 text-red-600 border-red-200"
                      : "bg-stone-100 text-ink-muted border-stone-200"
                  }`}
                >
                  questo mese{" "}
                  <span className="font-bold font-caveat">
                    {mesePill.segno}{mesePill.ore}h {String(mesePill.minuti).padStart(2, "0")}m
                  </span>
                </span>
              ) : (
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 font-patrick-hand">
                  {giorniLavorativiTotali} giorni lavorativi
                </span>
              )}
            </>
          )}
        </div>

        {/* ── Card oggi in corso (fascia aperta) ─────────────────────── */}
        {!loading && fasciaInCorso && (
          <TodayInProgressCard
            data={dataOggi}
            entrata={fasciaInCorso.entrata}
            onModifica={() => setModaleData(dataOggi)}
            onChiudiFascia={() => setModaleData(dataOggi)}
          />
        )}

        {/* ── Mini grid 2 card ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : isCurrentMonth ? (
            <>
              <StatCard
                label="Settimana"
                value={formatM(saldoSettimanaMin ?? 0)}
                sub="vs contrattuale"
                color={
                  (saldoSettimanaMin ?? 0) > 0
                    ? "emerald"
                    : (saldoSettimanaMin ?? 0) < 0
                    ? "red"
                    : "muted"
                }
              />
              <StatCard
                label="Giorni"
                value={`${giorniLavorativi} / ${giorniLavorativiTotali}`}
                sub="lavorati"
                color="zinc"
              />
            </>
          ) : (
            <>
              <StatCard
                label="Straordinari"
                value={formatM(straordinariMin ?? 0)}
                sub="somma positivi"
                color="emerald"
              />
              <StatCard
                label="Giorni"
                value={`${giorniLavorativi} / ${giorniLavorativiTotali}`}
                sub="lavorati"
                color="zinc"
              />
            </>
          )}
        </div>

        {/* ── Ledger — ultimi giorni ──────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-carta-200 px-3 pb-1 pt-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-base font-semibold text-zinc-800 font-caveat">ultimi giorni</span>
            <Link
              href={`/mese/${anno}/${String(mese).padStart(2, "0")}`}
              className="text-xs text-zinc-500 hover:text-zinc-800 transition"
            >
              vai al mese →
            </Link>
          </div>
          <div className="border-t border-dashed border-zinc-400 mb-1" />

          {loading ? (
            <LedgerSkeleton />
          ) : ultimiGiorni.length === 0 ? (
            <p className="text-sm text-zinc-400 py-5 text-center">
              {isCurrentMonth
                ? "Nessuna timbratura questo mese."
                : "Nessuna timbratura registrata."}
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
      {isCurrentMonth ? (
        <button
          onClick={() => setModaleData(dataOggi)}
          aria-label="Timbra oggi"
          className="fixed bottom-6 right-4 flex items-center gap-2 bg-zinc-900 text-white px-5 py-3.5 rounded-full shadow-lg hover:bg-zinc-800 active:scale-95 transition-all z-10 font-caveat text-base"
        >
          <span className="text-base leading-none font-light">+</span>
          timbra oggi
        </button>
      ) : (
        <button
          onClick={tornaAOggi}
          aria-label="Torna al mese corrente"
          className="fixed bottom-6 right-4 flex items-center gap-2 bg-carta text-zinc-900 border-2 border-zinc-800 px-5 py-3 rounded-full shadow-md hover:bg-carta-200 active:scale-95 transition-all z-10 font-caveat text-base"
        >
          ↺ torna a oggi
        </button>
      )}

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
