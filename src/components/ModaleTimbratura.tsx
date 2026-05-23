"use client";

import { useState, useEffect } from "react";
import { Shift, ShiftType, TimeRange, ModaleTimbraturaProps } from "@/types/timbratura";
import { formatOre } from "@/lib/calcolo-ore";

const TIPI: { valore: ShiftType; label: string }[] = [
  { valore: "lavoro",   label: "Lavoro"   },
  { valore: "ferie",    label: "Ferie"    },
  { valore: "permesso", label: "Permesso" },
  { valore: "malattia", label: "Malattia" },
  { valore: "festivo",  label: "Festivo"  },
];

function fasciaVuota(): TimeRange {
  return { entrata: "", uscita: "" };
}

function arrotondaQuarto(ora: string): string {
  const [h, m] = ora.split(":").map(Number);
  const tot = Math.ceil((h * 60 + m) / 15) * 15;
  return `${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
}

function durataFascia(f: TimeRange): number | null {
  if (f.entrata.length !== 5 || f.uscita.length !== 5) return null;
  const [hE, mE] = arrotondaQuarto(f.entrata).split(":").map(Number);
  const [hU, mU] = f.uscita.split(":").map(Number);
  const min = (hU * 60 + mU) - (hE * 60 + mE);
  return min > 0 ? min : null;
}

function InputOra({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/[^\d:]/g, "");

    // auto-inserisce ":" dopo le prime 2 cifre
    if (/^\d{3}/.test(v.replace(":", ""))) {
      const digits = v.replace(":", "");
      v = digits.slice(0, 2) + ":" + digits.slice(2, 4);
    }

    // limita a 5 caratteri (HH:MM)
    if (v.length > 5) return;

    // valida ore e minuti se la stringa è completa
    if (v.length === 5) {
      const [hh, mm] = v.split(":").map(Number);
      if (hh > 23 || mm > 59) return;
    }

    onChange(v);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="HH:MM"
      value={value}
      onChange={handleChange}
      maxLength={5}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
    />
  );
}

export function ModaleTimbratura({ data, iniziale, onSalva, onChiudi }: ModaleTimbraturaProps) {
  const [tipo,   setTipo]   = useState<ShiftType>(iniziale?.tipo ?? "lavoro");
  const [fasce,  setFasce]  = useState<TimeRange[]>(iniziale?.fasce?.length ? iniziale.fasce : [fasciaVuota()]);
  const [note,   setNote]   = useState(iniziale?.note ?? "");
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onChiudi(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onChiudi]);

  const aggiorniFascia = (i: number, campo: keyof TimeRange, valore: string) => {
    setFasce((prev) => prev.map((f, idx) => idx === i ? { ...f, [campo]: valore } : f));
  };

  const aggiungiFascia = () => setFasce((prev) => [...prev, fasciaVuota()]);

  const rimuoviFascia = (i: number) => setFasce((prev) => prev.filter((_, idx) => idx !== i));

  const valida = (): boolean => {
    if (tipo !== "lavoro") return true;
    for (const f of fasce) {
      if (!f.entrata || !f.uscita) { setErrore("Compila entrata e uscita per ogni fascia."); return false; }
      if (f.uscita <= f.entrata)   { setErrore("L'uscita deve essere successiva all'entrata."); return false; }
    }
    for (let i = 1; i < fasce.length; i++) {
      if (fasce[i].entrata <= fasce[i - 1].uscita) {
        setErrore("Le fasce non devono sovrapporsi.");
        return false;
      }
    }
    return true;
  };

  const handleSalva = () => {
    setErrore(null);
    if (!valida()) return;
    const t: Shift = tipo === "lavoro"
      ? { tipo, fasce, ...(note.trim() ? { note: note.trim() } : {}) }
      : { tipo,        ...(note.trim() ? { note: note.trim() } : {}) };
    onSalva(t);
  };

  const [gg, mm, aa] = [data.slice(8), data.slice(5, 7), data.slice(0, 4)];
  const labelData = `${gg}/${mm}/${aa}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onChiudi(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">

        {/* Intestazione */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 font-caveat">
            Timbratura — {labelData}
          </h2>
          <button onClick={onChiudi} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Tipo giornata */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide font-patrick-hand">Tipo giornata</label>
          <div className="flex flex-wrap gap-2">
            {TIPI.map(({ valore, label }) => (
              <button
                key={valore}
                onClick={() => setTipo(valore)}
                className={[
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition",
                  tipo === valore
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Fasce orarie (solo per lavoro) */}
        {tipo === "lavoro" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide font-patrick-hand">Fasce orarie</label>
            {fasce.map((f, i) => {
              const durata = durataFascia(f);
              const entrataArr = f.entrata.length === 5 ? arrotondaQuarto(f.entrata) : null;
              const entrataArrotondata = entrataArr && entrataArr !== f.entrata;
              return (
                <div key={i} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <InputOra value={f.entrata} onChange={(v) => aggiorniFascia(i, "entrata", v)} />
                    {entrataArrotondata && (
                      <span className="text-[10px] text-orange-500 font-mono mt-0.5">→ {entrataArr}</span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">→</span>
                  <InputOra value={f.uscita} onChange={(v) => aggiorniFascia(i, "uscita", v)} />
                  <span className="w-20 text-sm text-right font-caveat">
                    {durata !== null
                      ? <span className="text-blue-600 font-medium">{formatOre(durata)}</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </span>
                  {fasce.length > 1 && (
                    <button
                      onClick={() => rimuoviFascia(i)}
                      className="text-gray-300 hover:text-red-400 transition text-lg leading-none"
                      aria-label="Rimuovi fascia"
                    >
                      ×
                    </button>
                  )}
                </div>
                </div>
              );
            })}
            <button
              onClick={aggiungiFascia}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium self-start transition"
            >
              + Aggiungi fascia
            </button>
          </div>
        )}

        {/* Note */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide font-patrick-hand">Note (opzionale)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Es. smart working, visita medica…"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Errore */}
        {errore && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{errore}</p>
        )}

        {/* Azioni */}
        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={onChiudi}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            Annulla
          </button>
          <button
            onClick={handleSalva}
            className="px-4 py-2 rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition font-caveat"
          >
            Salva
          </button>
        </div>

      </div>
    </div>
  );
}
