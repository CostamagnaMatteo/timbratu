import { AggregazioneMese } from "@/types/timbratura";
import { getTimbrattureMese, getAggregazioneMese, setAggregazioneMese } from "@/lib/firestore";
import { calcolaMese } from "@/lib/calcolo-ore";

export function deveAggregare(
  agg: AggregazioneMese | null,
  anno: number,
  mese: number,
  oggi: string
): boolean {
  const now = new Date();
  const meseCorrente = now.getFullYear() === anno && now.getMonth() + 1 === mese;

  if (!meseCorrente) return true;

  if (!agg) return true;

  const giorniPassati = Math.floor(
    (new Date(oggi).getTime() - new Date(agg.aggregatoIl).getTime()) / 86_400_000
  );
  return giorniPassati >= 7;
}

export async function aggrega(
  uid: string,
  anno: number,
  mese: number,
  oggi: string
): Promise<void> {
  const agg = await getAggregazioneMese(uid, anno, mese);
  if (!deveAggregare(agg, anno, mese, oggi)) return;

  const timbrature = await getTimbrattureMese(uid, anno, mese);
  const { saldoTotaleMin, giorniLavorativi } = calcolaMese(timbrature);

  await setAggregazioneMese(uid, anno, mese, { saldoTotaleMin, giorniLavorativi, aggregatoIl: oggi });
}
