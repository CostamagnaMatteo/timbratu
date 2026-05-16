import { TipoGiornata } from "@/types/timbratura";

const CONFIG: Record<TipoGiornata, { label: string; className: string }> = {
  lavoro:    { label: "Lavoro",    className: "bg-blue-100 text-blue-700" },
  ferie:     { label: "Ferie",     className: "bg-green-100 text-green-700" },
  permesso:  { label: "Permesso",  className: "bg-orange-100 text-orange-700" },
  malattia:  { label: "Malattia",  className: "bg-red-100 text-red-700" },
  festivo:   { label: "Festivo",   className: "bg-gray-100 text-gray-500" },
};

export function BadgeTipo({ tipo }: { tipo: TipoGiornata }) {
  const { label, className } = CONFIG[tipo];
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
