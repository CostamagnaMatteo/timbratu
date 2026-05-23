import { Shift } from "./shift";

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

export interface AggregazioneMese {
  saldoTotaleMin:   number;
  giorniLavorativi: number;
  aggregatoIl:      string; // YYYY-MM-DD
}

export interface MonthlyDetailHeaderProps {
  year:           number;
  month:           number;
  saldoTotaleMin: number;
}

export interface TabellaMessileProps {
  giorni:     string[];
  timbrature: Record<string, Shift>;
  onEdit:     (data: string) => void;
  onDelete:   (data: string) => void;
}

export interface ModaleTimbraturaProps {
  data:     string;
  iniziale: Shift | null;
  onSalva:  (t: Shift) => void;
  onChiudi: () => void;
}
