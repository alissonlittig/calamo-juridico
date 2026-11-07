export type Cliente = { id: string; nome: string; tipo: 'PF' | 'PJ'; doc: string; email: string; tel: string; cidade: string };
export type Fase = 'Conhecimento' | 'Instrução' | 'Sentença' | 'Recurso' | 'Execução' | 'Arquivado';
export const FASES: Fase[] = ['Conhecimento', 'Instrução', 'Sentença', 'Recurso', 'Execução', 'Arquivado'];
export const AREAS = ['Cível', 'Trabalhista', 'Família', 'Tributário', 'Empresarial', 'Consumidor'] as const;
export type Processo = { id: string; numero: string; clienteId: string; area: string; vara: string; fase: Fase; valor: number; contraria: string; resp: string; abertura: string };
export type Prazo = { id: string; processoId: string; titulo: string; data: string; tipo: 'Fatal' | 'Audiência' | 'Diligência'; feito: boolean };
export type Honorario = { id: string; processoId: string; descricao: string; valor: number; venc: string; pago: boolean; tipo: 'Contratual' | 'Êxito' };

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (base: string, n: number) => {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return iso(d);
};
/** dias entre hoje e a data (negativo = vencido) */
export const diasAte = (data: string, hoje: string) =>
  Math.round((new Date(data + 'T12:00:00').getTime() - new Date(hoje + 'T12:00:00').getTime()) / 864e5);

export type Urgencia = 'feito' | 'vencido' | 'hoje' | 'semana' | 'folga';
export function urgencia(p: Pick<Prazo, 'data' | 'feito'>, hoje: string): Urgencia {
  if (p.feito) return 'feito';
  const d = diasAte(p.data, hoje);
  return d < 0 ? 'vencido' : d === 0 ? 'hoje' : d <= 7 ? 'semana' : 'folga';
}
export type StatusHon = 'pago' | 'atrasado' | 'a vencer';
export const statusHon = (h: Pick<Honorario, 'pago' | 'venc'>, hoje: string): StatusHon =>
  h.pago ? 'pago' : diasAte(h.venc, hoje) < 0 ? 'atrasado' : 'a vencer';

export function totaisHon(hs: Honorario[], hoje: string) {
  const t = { pago: 0, atrasado: 0, 'a vencer': 0 };
  for (const h of hs) t[statusHon(h, hoje)] += h.valor;
  return t;
}
export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const dataBR = (s: string) => s.split('-').reverse().join('/');
export const uid = () => Math.random().toString(36).slice(2, 9);
