"use client";

import { useState, useEffect } from "react";
import { Timbratura, TipoGiornata, Fascia } from "@/types/timbratura";

interface Props {
  data:        string;
  iniziale:    Timbratura | null;
  onSalva:     (t: Timbratura) => void;
  onChiudi:    () => void;
}

const TIPI: { valore: TipoGiornata; label: string }[] = [
  { valore: "lavoro",   label: "Lavoro"   },
  { valore: "ferie",    label: "Ferie"    },
  { valore: "permesso", label: "Permesso" },
  { valore: "malattia", label: "Malattia" },
  { valore: "festivo",  label: "Festivo"  },
];

function fasciaVuota(): Fascia {
  return { entrata: "", uscita: "" };
}

export function ModaleTimbratura({ data, iniziale, onSalva, onChiudi }: Props) {
  const [tipo,   setTipo]   = useState<TipoGiornata>(iniziale?.tipo ?? "lavoro");
  const [fasce,  setFasce]  = useState<Fascia[]>(iniziale?.fasce?.length ? iniziale.fasce : [fasciaVuota()]);
  const [note,   setNote]   = useState(iniziale?.note ?? "");
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onChiudi(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onChiudi]);

  const aggiorniFascia = (i: number, campo: keyof Fascia, valore: string) => {
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
    const t: Timbratura = tipo === "lavoro"
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
          <h2 className="text-base font-semibold text-gray-800">
            Timbratura — {labelData}
          </h2>
          <button onClick={onChiudi} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Tipo giornata */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo giornata</label>
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
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fasce orarie</label>
            {fasce.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="time"
                  value={f.entrata}
                  onChange={(e) => aggiorniFascia(i, "entrata", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-sm">→</span>
                <input
                  type="time"
                  value={f.uscita}
                  onChange={(e) => aggiorniFascia(i, "uscita", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
            ))}
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
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Note (opzionale)</label>
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
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Salva
          </button>
        </div>

      </div>
    </div>
  );
}
