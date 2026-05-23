export type ShiftType = "lavoro" | "ferie" | "permesso" | "malattia" | "festivo";

export interface TimeRange {
  entrata: string;
  uscita:  string;
}

export interface Shift {
  tipo:   ShiftType;
  fasce?: TimeRange[];
  note?:  string;
}