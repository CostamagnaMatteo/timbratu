"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { TabellaMessile } from "@/components/TabellaMessile";
import { ModaleTimbratura } from "@/components/ModaleTimbratura";
import { getTimbrattureMese, setTimbratura, deleteTimbratura } from "@/lib/firestore";
import { calcolaMese } from "@/lib/calcolo-ore";
import { giorniDelMese } from "@/lib/date-utils";
import { Timbratura } from "@/types/timbratura";

interface Props {
  anno: number;
  mese: number;
}

export function MesePageClient({ anno, mese }: Props) {
  const { user } = useAuth();
  const [timbrature, setTimbrature] = useState<Record<string, Timbratura>>({});
  const [loading, setLoading]       = useState(true);
  const [modaleData, setModaleData] = useState<string | null>(null);

  const giorni = giorniDelMese(anno, mese);

  const carica = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const dati = await getTimbrattureMese(user.uid, anno, mese);
    setTimbrature(dati);
    setLoading(false);
  }, [user, anno, mese]);

  useEffect(() => { carica(); }, [carica]);

  const handleEdit = (data: string) => {
    setModaleData(data);
  };

  const handleSalva = async (data: string, t: Timbratura) => {
    if (!user) return;
    await setTimbratura(user.uid, data, t);
    setTimbrature((prev) => ({ ...prev, [data]: t }));
    setModaleData(null);
  };

  const handleDelete = async (data: string) => {
    if (!user || !confirm(`Eliminare la timbratura del ${data}?`)) return;
    await deleteTimbratura(user.uid, data);
    setTimbrature((prev) => {
      const next = { ...prev };
      delete next[data];
      return next;
    });
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
        <Header anno={anno} mese={mese} saldoTotaleMin={saldoTotaleMin} />

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
