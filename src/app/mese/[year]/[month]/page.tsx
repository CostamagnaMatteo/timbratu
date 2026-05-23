import { MesePageClient } from "./monthlyDetail";

export function generateStaticParams() {
  const params = [];
  const annoCorrente = new Date().getFullYear();
  for (let a = annoCorrente - 2; a <= annoCorrente + 2; a++) {
    for (let m = 1; m <= 12; m++) {
      params.push({ anno: String(a), mese: String(m).padStart(2, "0") });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ anno: string; mese: string }>;
}

export default async function MesePage({ params }: Props) {
  const { anno, mese } = await params;
  return <MesePageClient year={Number(anno)} month={Number(mese)} />;
}
