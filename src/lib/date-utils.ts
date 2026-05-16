const GIORNI = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MESI   = [
  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"
];

export function nomeMese(mese: number): string {
  return MESI[mese - 1];
}

export function nomeGiorno(data: string): string {
  return GIORNI[new Date(data + "T00:00:00").getDay()];
}

export function isWeekend(data: string): boolean {
  const g = new Date(data + "T00:00:00").getDay();
  return g === 0 || g === 6;
}

export function isFuturo(data: string): boolean {
  return data > new Date().toISOString().slice(0, 10);
}

export function giorniDelMese(anno: number, mese: number): string[] {
  const giorni: string[] = [];
  const totale = new Date(anno, mese, 0).getDate();
  for (let g = 1; g <= totale; g++) {
    giorni.push(`${anno}-${String(mese).padStart(2, "0")}-${String(g).padStart(2, "0")}`);
  }
  return giorni;
}

export function mesePrecedente(anno: number, mese: number): { anno: number; mese: number } {
  return mese === 1 ? { anno: anno - 1, mese: 12 } : { anno, mese: mese - 1 };
}

export function meseSuccessivo(anno: number, mese: number): { anno: number; mese: number } {
  return mese === 12 ? { anno: anno + 1, mese: 1 } : { anno, mese: mese + 1 };
}
