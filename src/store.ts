import { createEffect, createRoot, createSignal } from 'solid-js';
import { iso, uid, type Cliente, type Honorario, type Prazo, type Processo } from './lib';
import { seed, type Dados } from './seed';

const KEY = 'calamo-juridico:v1';
export const hoje = iso(new Date());

function carregar(): Dados {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Dados;
  } catch {
    localStorage.removeItem(KEY); // JSON corrompido: recomeça da semente
  }
  return seed(hoje);
}

export const store = createRoot(() => {
  const [dados, setDados] = createSignal<Dados>(carregar());
  createEffect(() => localStorage.setItem(KEY, JSON.stringify(dados())));
  const mut = (f: (d: Dados) => Dados) => setDados((d) => f(d));
  return {
    dados,
    resetar: () => setDados(seed(hoje)),
    addCliente: (c: Omit<Cliente, 'id'>) => mut((d) => ({ ...d, clientes: [{ ...c, id: uid() }, ...d.clientes] })),
    addProcesso: (p: Omit<Processo, 'id'>) => mut((d) => ({ ...d, processos: [{ ...p, id: uid() }, ...d.processos] })),
    addPrazo: (p: Omit<Prazo, 'id' | 'feito'>) => mut((d) => ({ ...d, prazos: [{ ...p, id: uid(), feito: false }, ...d.prazos] })),
    addHon: (h: Omit<Honorario, 'id' | 'pago'>) => mut((d) => ({ ...d, honorarios: [{ ...h, id: uid(), pago: false }, ...d.honorarios] })),
    togglePrazo: (id: string) => mut((d) => ({ ...d, prazos: d.prazos.map((p) => (p.id === id ? { ...p, feito: !p.feito } : p)) })),
    togglePago: (id: string) => mut((d) => ({ ...d, honorarios: d.honorarios.map((h) => (h.id === id ? { ...h, pago: !h.pago } : h)) })),
    setFase: (id: string, fase: Processo['fase']) => mut((d) => ({ ...d, processos: d.processos.map((p) => (p.id === id ? { ...p, fase } : p)) })),
  };
});
