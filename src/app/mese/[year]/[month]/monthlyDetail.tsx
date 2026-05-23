"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/MonthlyDetailHeader";
import { TabellaMessile } from "@/components/TabellaMessile";
import { ModaleTimbratura } from "@/components/ModaleTimbratura";
import { getTimbrattureMese, setTimbratura, deleteTimbratura } from "@/lib/firestore";
import { aggrega } from "@/lib/aggregazione";
import { calcolaMese } from "@/lib/calcolo-ore";
import { giorniDelMese } from "@/lib/date-utils";
import { Shift } from "@/types/shift";

interface PageProps {
  year: number;
  month: number;
}

export function MesePageClient({ year: year, month: month }: PageProps) {
  const { user } = useAuth();
  const [timbrature, setTimbrature] = useState<Record<string, Shift>>({});
  const [loading, setLoading]       = useState(true);
  const [modaleData, setModaleData] = useState<string | null>(null);

  const giorni = giorniDelMese(year, month);

  const carica = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const dati = await getTimbrattureMese(user.uid, year, month);
      setTimbrature(dati);
    } finally {
      setLoading(false);
    }
  }, [user, year, month]);

  useEffect(() => { carica(); }, [carica]);

  const handleEdit = (data: string) => {
    setModaleData(data);
  };

  const oggi = new Date().toISOString().slice(0, 10);

  const handleSalva = async (data: string, t: Shift) => {
    if (!user) return;
    await setTimbratura(user.uid, data, t);
    setTimbrature((prev) => ({ ...prev, [data]: t }));
    setModaleData(null);
    aggrega(user.uid, year, month, oggi);
  };

  const handleDelete = async (data: string) => {
    if (!user || !confirm(`Eliminare la timbratura del ${data}?`)) return;
    await deleteTimbratura(user.uid, data);
    setTimbrature((prev) => {
      const next = { ...prev };
      delete next[data];
      return next;
    });
    aggrega(user.uid, year, month, oggi);
  };

  const { saldoTotaleMin } = calcolaMese(timbrature);

  return (
    <AuthGuard>
      {modaleData && (
        <ModaleTimbratura
          data={modaleData}
          iniziale={timbrature[modaleData] ?? null}
          onSalva={(t) => handleSalva(modaleData, t)}
          onChiudi={() => setModaleData(null)}
        />
      )}
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header year={year} month={month} saldoTotaleMin={saldoTotaleMin} />

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Caricamento...
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <TabellaMessile
                giorni={giorni}
                timbrature={timbrature}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
