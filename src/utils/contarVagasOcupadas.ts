import { PacoteDate } from "types";

export function contarVagasOcupadas(dates: PacoteDate[]): number {
  return dates.reduce((total, d) => {
    return total + (d.vagas_total - d.vagas_disponiveis);
  }, 0);
}
