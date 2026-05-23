export type ShiftType = "lavoro" | "ferie" | "permesso" | "malattia" | "festivo";

export interface TimeRange {
  start: Date;
  end:  Date;
}

export interface Shift {
  timeRagnes?: TimeRange[];
  tipo:   ShiftType;
  comment:  string;
}