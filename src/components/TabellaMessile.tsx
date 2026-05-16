"use client";

import { Timbratura } from "@/types/timbratura";
import { calcolaGiorno, formatMinuti, formatOre } from "@/lib/calcolo-ore";
import { nomeGiorno, isWeekend, isFuturo } from "@/lib/date-utils";
import { BadgeTipo } from "@/components/BadgeTipo";

interface Props {
  giorni:      string[];
  timbrature:  Record<string, Timbratura>;
  onEdit:      (data: string) => void;
  onDelete:    (data: string) => void;
}

export function TabellaMessile({ giorni, timbrature, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-gray-500 uppercase border-b border-gray-200">
            <th className="py-3 px-4 text-left font-medium">Giorno</th>
            <th className="py-3 px-4 text-left font-medium">Tipo</th>
            <th className="py-3 px-4 text-left font-medium">Entrata</th>
            <th className="py-3 px-4 text-left font-medium">Uscita</th>
            <th className="py-3 px-4 text-left font-medium">Ore nette</th>
            <th className="py-3 px-4 text-left font-medium">Pausa</th>
            <th className="py-3 px-4 text-left font-medium">Saldo</th>
            <th className="py-3 px-4 text-left font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {giorni.map((data) => {
            const t       = timbrature[data];
            const weekend = isWeekend(data);
            const futuro  = isFuturo(data);
            const giorno  = nomeGiorno(data);
            const numero  = data.slice(8);

            let oreNette:  string | null = null;
            let saldoMin:  number | null = null;
            let pausa      = false;
            let primaEntrata: string | undefined;
            let ultimaUscita: string | undefined;

            if (t?.tipo === "lavoro" && t.fasce?.length) {
              const calc = calcolaGiorno(t.fasce);
              oreNette   = formatOre(calc.oreNetteMin);
              saldoMin   = calc.saldoMin;
              pausa      = calc.pausaApplicata;
              primaEntrata = t.fasce[0].entrata;
              ultimaUscita = t.fasce[t.fasce.length - 1].uscita;
            }

            return (
              <tr
                key={data}
                className={[
                  "border-b border-gray-100 transition-colors",
                  weekend ? "bg-gray-50" : "bg-white",
                  !futuro && !t ? "hover:bg-gray-50 cursor-pointer" : "",
                ].join(" ")}
                onClick={() => { if (!futuro) onEdit(data); }}
              >
                <td className="py-3 px-4 font-medium text-gray-700">
                  <span className={weekend ? "text-gray-400" : ""}>{giorno} {numero}</span>
                </td>
                <td className="py-3 px-4">
                  {t ? <BadgeTipo tipo={t.tipo} /> : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-3 px-4 text-gray-600 font-mono">
                  {primaEntrata ?? <span className="text-gray-300">—</span>}
                  {t?.fasce && t.fasce.length > 1 && (
                    <span className="ml-1 text-xs text-gray-400">+{t.fasce.length - 1}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600 font-mono">
                  {ultimaUscita ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {oreNette ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  {pausa ? (
                    <span className="text-orange-400 text-xs" title="-30min pausa applicata">−30</span>
                  ) : (
                    <span className="text-gray-200">—</span>
                  )}
                </td>
                <td className="py-3 px-4 font-medium">
                  {saldoMin !== null ? (
                    <span className={saldoMin >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatMinuti(saldoMin)}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2 justify-end">
                    {t && !futuro && (
                      <>
                        <button
                          onClick={() => onEdit(data)}
                          className="text-gray-400 hover:text-blue-600 transition text-xs"
                          aria-label="Modifica"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDelete(data)}
                          className="text-gray-400 hover:text-red-500 transition text-xs"
                          aria-label="Elimina"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
