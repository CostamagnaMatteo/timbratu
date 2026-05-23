"use client";

import { TabellaMessileProps } from "@/types/timbratura";
import { calcolaGiorno, formatMinuti, formatOre } from "@/lib/calcolo-ore";
import { nomeGiorno, isWeekend, isFuturo } from "@/lib/date-utils";
import { BadgeTipo } from "@/components/BadgeTipo";

export function TabellaMessile({ giorni, timbrature, onEdit, onDelete }: TabellaMessileProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs text-gray-500 uppercase border-b border-gray-200 font-patrick-hand">
            <th className="py-3 px-4 text-left font-medium">Giorno</th>
            <th className="py-3 px-4 text-left font-medium">Tipo</th>
            <th className="py-3 px-4 text-left font-medium">Entrata</th>
            <th className="py-3 px-4 text-left font-medium">Uscita</th>
            <th className="py-3 px-4 text-center font-medium">Fasce</th>
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

            const fasce = t?.tipo === "lavoro" && t.fasce?.length ? t.fasce : null;
            const calc  = fasce ? calcolaGiorno(fasce) : null;

            return (
              <tr
                key={data}
                className={[
                  "border-b border-gray-100 transition-colors",
                  weekend ? "bg-gray-50" : "bg-white",
                ].join(" ")}
              >
                <td className="py-3 px-4 font-medium text-gray-700">
                  <span className={weekend ? "text-gray-400" : ""}>{giorno} {numero}</span>
                </td>
                <td className="py-3 px-4">
                  {t ? <BadgeTipo tipo={t.tipo} /> : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-3 px-4 text-gray-600 font-mono">
                  {fasce ? fasce[0].entrata : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-3 px-4 text-gray-600 font-mono">
                  {fasce ? fasce[fasce.length - 1].uscita : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  {fasce ? (
                    <span className={[
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                      fasce.length > 1 ? "bg-blue-100 text-blue-700" : "text-gray-400",
                    ].join(" ")}>
                      {fasce.length}
                    </span>
                  ) : (
                    <span className="text-gray-200">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700 font-caveat">
                  {calc ? formatOre(calc.oreNetteMin) : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  {calc?.pausaApplicata ? (
                    <span className="text-orange-400 text-xs" title="-30min pausa applicata">−30</span>
                  ) : (
                    <span className="text-gray-200">—</span>
                  )}
                </td>
                <td className="py-3 px-4 font-medium font-caveat">
                  {calc ? (
                    <span className={calc.saldoMin >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatMinuti(calc.saldoMin)}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 justify-end">
                    {!futuro && (
                      t ? (
                        <>
                          <button
                            onClick={() => onEdit(data)}
                            className="text-gray-400 hover:text-blue-500 transition font-medium text-base leading-none"
                            aria-label="Aggiungi fascia"
                            title="Aggiungi fascia oraria"
                          >
                            +
                          </button>
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
                      ) : (
                        <button
                          onClick={() => onEdit(data)}
                          className="text-gray-300 hover:text-blue-500 transition font-medium text-base leading-none"
                          aria-label="Aggiungi timbratura"
                        >
                          +
                        </button>
                      )
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
