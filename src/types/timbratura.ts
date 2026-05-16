export type TipoGiornata = "lavoro" | "ferie" | "permesso" | "malattia" | "festivo";

export interface Fascia {
  entrata: string;
  uscita:  string;
}

export interface Timbratura {
  fasce?: Fascia[];
  tipo:   TipoGiornata;
  note?:  string;
}

export interface CalcoloGiorno {
  oreTotaliMin:   number;
  oreNetteMin:    number;
  pausaApplicata: boolean;
  saldoMin:       number;
}

export interface CalcoloMese {
  saldoTotaleMin:   number;
  giorniLavorativi: number;
}
