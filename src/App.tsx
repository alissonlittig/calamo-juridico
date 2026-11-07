import { createMemo, createSignal, For, JSX, Show } from 'solid-js';
import { AREAS, brl, dataBR, diasAte, FASES, statusHon, totaisHon, urgencia, type Fase, type Prazo } from './lib';
import { hoje, store } from './store';

type Aba = 'painel' | 'processos' | 'prazos' | 'clientes' | 'honorarios';
const ABAS: { id: Aba; nome: string; d: string }[] = [
  { id: 'painel', nome: 'Painel', d: 'M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z' },
  { id: 'processos', nome: 'Processos', d: 'M6 2h9l5 5v15H6zm8 1.5V8h4.5M9 13h8M9 17h8' },
  { id: 'prazos', nome: 'Prazos', d: 'M5 4h14v17H5zM5 9h14M9 2v4m6-4v4' },
  { id: 'clientes', nome: 'Clientes', d: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0' },
  { id: 'honorarios', nome: 'Honorários', d: 'M12 2v20M17 6.5c-1-1.5-3-2-5-2-2.5 0-4.500 1.200-4.500 3.300 0 4.700 9.500 2.300 9.500 7 0 2.100-2 3.200-5 3.200-2.200 0-4.200-.7-5.300-2.200' },
];
const Icone = (p: { d: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={p.d} /></svg>
);

const rotuloUrg = { feito: 'Cumprido', vencido: 'Vencido', hoje: 'Vence hoje', semana: 'Esta semana', folga: 'Com folga' } as const;
const Chip = (p: { k: string; children: JSX.Element }) => <span class={`chip chip-${p.k.replace(' ', '-')}`}>{p.children}</span>;

export default function App() {
  const [aba, setAba] = createSignal<Aba>('painel');
  const [busca, setBusca] = createSignal('');
  const [modal, setModal] = createSignal<null | 'processo' | 'prazo' | 'cliente' | 'honorario'>(null);
  const [sel, setSel] = createSignal<string | null>(null);
  const d = store.dados;
  const cliente = (id: string) => d().clientes.find((c) => c.id === id);
  const processo = (id: string) => d().processos.find((p) => p.id === id);
  const q = () => busca().trim().toLowerCase();

  const prazosAbertos = createMemo(() => d().prazos.filter((p) => !p.feito).sort((a, b) => a.data.localeCompare(b.data)));
  const tot = createMemo(() => totaisHon(d().honorarios, hoje));
  const ativos = createMemo(() => d().processos.filter((p) => p.fase !== 'Arquivado'));
  const porFase = createMemo(() => FASES.map((f) => ({ f, n: d().processos.filter((p) => p.fase === f).length })));

  const filtrados = createMemo(() =>
    d().processos.filter((p) => !q() || [p.numero, p.vara, p.area, p.contraria, cliente(p.clienteId)?.nome ?? ''].join(' ').toLowerCase().includes(q())));

  return (
    <div class="app">
      <a class="skip" href="#main">Pular para o conteúdo</a>
      <aside class="side">
        <div class="brand"><span class="logo" aria-hidden="true"><svg viewBox="0 0 32 32" width="18" height="18"><path d="M9 23 21 9l2 2-12 14z" fill="currentColor" /></svg></span><span>Cálamo</span></div>
        <nav aria-label="Seções">
          <For each={ABAS}>{(a) => (
            <button class="nav" classList={{ on: aba() === a.id }} aria-current={aba() === a.id ? 'page' : undefined} onClick={() => { setAba(a.id); setSel(null); }}>
              <Icone d={a.d} /><span>{a.nome}</span>
            </button>
          )}</For>
        </nav>
        <p class="side-foot">Demo com dados fictícios, salvos só neste navegador.</p>
      </aside>

      <div class="col">
        <header class="top">
          <div class="search">
            <label class="sr" for="busca">Buscar</label>
            <input id="busca" type="search" placeholder="Buscar processo, cliente, vara…" value={busca()} onInput={(e) => { setBusca(e.currentTarget.value); if (aba() !== 'processos') setAba('processos'); }} />
          </div>
          <span class="demo" title="Nenhum dado real">Dados fictícios</span>
        </header>

        <main id="main" tabindex="-1">
          <Show when={aba() === 'painel'}>
            <Titulo t="Painel" s={new Date(hoje + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} />
            <section class="kpis" aria-label="Indicadores">
              <Kpi t="Processos ativos" v={String(ativos().length)} s={`${d().processos.length} no total`} />
              <Kpi t="Prazos vencidos" v={String(prazosAbertos().filter((p) => urgencia(p, hoje) === 'vencido').length)} s="exigem ação agora" alerta />
              <Kpi t="Próximos 7 dias" v={String(prazosAbertos().filter((p) => ['hoje', 'semana'].includes(urgencia(p, hoje))).length)} s="prazos e audiências" />
              <Kpi t="A receber" v={brl(tot()['a vencer'] + tot().atrasado)} s={`${brl(tot().atrasado)} em atraso`} />
            </section>
            <div class="grid2">
              <section class="card">
                <h2>Agenda crítica</h2>
                <ListaPrazos itens={prazosAbertos().slice(0, 6)} />
              </section>
              <section class="card">
                <h2>Carteira por fase</h2>
                <Funil dados={porFase()} />
                <h2 class="sp">Honorários</h2>
                <Barra pago={tot().pago} aberto={tot()['a vencer']} atraso={tot().atrasado} />
              </section>
            </div>
          </Show>

          <Show when={aba() === 'processos'}>
            <Titulo t="Processos" s={`${filtrados().length} resultado(s)`} acao={<button class="btn" onClick={() => setModal('processo')}>Novo processo</button>} />
            <Show when={filtrados().length} fallback={<p class="vazio">Nada encontrado para “{busca()}”.</p>}>
              <ul class="lista">
                <For each={filtrados()}>{(p) => (
                  <li class="linha" classList={{ aberta: sel() === p.id }}>
                    <button class="linha-btn" aria-expanded={sel() === p.id} onClick={() => setSel(sel() === p.id ? null : p.id)}>
                      <span class="l-main"><strong>{cliente(p.clienteId)?.nome}</strong><small class="mono">{p.numero}</small></span>
                      <span class="l-meta"><span>{p.area}</span><span>{p.vara}</span></span>
                      <span class="l-end"><Chip k={p.fase === 'Arquivado' ? 'feito' : 'fase'}>{p.fase}</Chip><b>{brl(p.valor)}</b></span>
                    </button>
                    <Show when={sel() === p.id}>
                      <div class="detalhe">
                        <dl>
                          <div><dt>Parte contrária</dt><dd>{p.contraria}</dd></div>
                          <div><dt>Responsável</dt><dd>{p.resp}</dd></div>
                          <div><dt>Distribuição</dt><dd>{dataBR(p.abertura)}</dd></div>
                        </dl>
                        <label class="fase-sel">Fase
                          <select value={p.fase} onChange={(e) => store.setFase(p.id, e.currentTarget.value as Fase)}>
                            <For each={FASES}>{(f) => <option value={f}>{f}</option>}</For>
                          </select>
                        </label>
                        <h3>Prazos</h3>
                        <ListaPrazos itens={d().prazos.filter((z) => z.processoId === p.id).sort((a, b) => a.data.localeCompare(b.data))} sem />
                      </div>
                    </Show>
                  </li>
                )}</For>
              </ul>
            </Show>
          </Show>

          <Show when={aba() === 'prazos'}>
            <Titulo t="Prazos e audiências" s={`${prazosAbertos().length} em aberto`} acao={<button class="btn" onClick={() => setModal('prazo')}>Novo prazo</button>} />
            <section class="card"><ListaPrazos itens={[...d().prazos].sort((a, b) => Number(a.feito) - Number(b.feito) || a.data.localeCompare(b.data))} /></section>
          </Show>

          <Show when={aba() === 'clientes'}>
            <Titulo t="Clientes" s={`${d().clientes.length} cadastrados`} acao={<button class="btn" onClick={() => setModal('cliente')}>Novo cliente</button>} />
            <ul class="cards">
              <For each={d().clientes}>{(c) => {
                const ps = () => d().processos.filter((p) => p.clienteId === c.id);
                const aberto = () => d().honorarios.filter((h) => ps().some((p) => p.id === h.processoId) && !h.pago).reduce((s, h) => s + h.valor, 0);
                return (
                  <li class="card cli">
                    <div class="avatar" aria-hidden="true">{c.nome.split(' ').filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('')}</div>
                    <div>
                      <h3>{c.nome}</h3>
                      <p class="mut">{c.tipo === 'PF' ? 'Pessoa física' : 'Pessoa jurídica'} · {c.cidade}</p>
                      <p class="mono mut">{c.doc}</p>
                      <p class="mut">{c.email} · {c.tel}</p>
                      <p class="cli-n"><b>{ps().length}</b> processo(s) · <b>{brl(aberto())}</b> em aberto</p>
                    </div>
                  </li>
                );
              }}</For>
            </ul>
          </Show>

          <Show when={aba() === 'honorarios'}>
            <Titulo t="Honorários" s="Contratuais e de êxito" acao={<button class="btn" onClick={() => setModal('honorario')}>Novo lançamento</button>} />
            <section class="kpis">
              <Kpi t="Recebido" v={brl(tot().pago)} s="liquidado" />
              <Kpi t="A vencer" v={brl(tot()['a vencer'])} s="no prazo" />
              <Kpi t="Em atraso" v={brl(tot().atrasado)} s="cobrar" alerta />
            </section>
            <section class="card">
              <ul class="lista plana">
                <For each={[...d().honorarios].sort((a, b) => Number(a.pago) - Number(b.pago) || a.venc.localeCompare(b.venc))}>{(h) => {
                  const st = () => statusHon(h, hoje);
                  return (
                    <li class="hon">
                      <span class="l-main"><strong>{h.descricao}</strong><small>{cliente(processo(h.processoId)?.clienteId ?? '')?.nome} · {h.tipo}</small></span>
                      <span class="hon-v"><b>{brl(h.valor)}</b><small>vence {dataBR(h.venc)}</small></span>
                      <Chip k={st()}>{st() === 'pago' ? 'Pago' : st() === 'atrasado' ? 'Em atraso' : 'A vencer'}</Chip>
                      <button class="ghost" onClick={() => store.togglePago(h.id)}>{h.pago ? 'Reabrir' : 'Marcar pago'}</button>
                    </li>
                  );
                }}</For>
              </ul>
            </section>
          </Show>
          <footer class="rodape">Cálamo é um projeto de demonstração. <button class="link" onClick={() => confirm('Restaurar os dados de exemplo?') && store.resetar()}>Restaurar dados de exemplo</button></footer>
        </main>
      </div>

      <nav class="tabbar" aria-label="Seções (celular)">
        <For each={ABAS}>{(a) => (
          <button classList={{ on: aba() === a.id }} aria-current={aba() === a.id ? 'page' : undefined} onClick={() => { setAba(a.id); setSel(null); }}>
            <Icone d={a.d} /><span>{a.nome}</span>
          </button>
        )}</For>
      </nav>

      <Show when={modal()}>{(m) => <Formulario tipo={m()} fechar={() => setModal(null)} />}</Show>
    </div>
  );

  function ListaPrazos(p: { itens: Prazo[]; sem?: boolean }) {
    return (
      <Show when={p.itens.length} fallback={<p class="vazio">Nenhum prazo.</p>}>
        <ul class="lista plana">
          <For each={p.itens}>{(z) => {
            const u = () => urgencia(z, hoje);
            const dd = () => diasAte(z.data, hoje);
            return (
              <li class="prazo" classList={{ feito: z.feito }}>
                <input type="checkbox" checked={z.feito} aria-label={`Cumprido: ${z.titulo}`} onChange={() => store.togglePrazo(z.id)} />
                <span class="l-main"><strong>{z.titulo}</strong><small>{p.sem ? z.tipo : `${cliente(processo(z.processoId)?.clienteId ?? '')?.nome} · ${z.tipo}`}</small></span>
                <span class="p-data"><b>{dataBR(z.data)}</b><small>{z.feito ? '' : dd() < 0 ? `${-dd()} d atrás` : dd() === 0 ? 'hoje' : `em ${dd()} d`}</small></span>
                <Chip k={u()}>{rotuloUrg[u()]}</Chip>
              </li>
            );
          }}</For>
        </ul>
      </Show>
    );
  }
}

const Titulo = (p: { t: string; s: string; acao?: JSX.Element }) => (
  <div class="titulo"><div><h1>{p.t}</h1><p class="mut cap">{p.s}</p></div>{p.acao}</div>
);
const Kpi = (p: { t: string; v: string; s: string; alerta?: boolean }) => (
  <div class="kpi" classList={{ alerta: p.alerta }}><span class="mut">{p.t}</span><strong>{p.v}</strong><small>{p.s}</small></div>
);
const Funil = (p: { dados: { f: string; n: number }[] }) => {
  const max = () => Math.max(1, ...p.dados.map((x) => x.n));
  return (
    <ul class="funil">
      <For each={p.dados}>{(x) => (
        <li><span>{x.f}</span><div class="trilho"><i style={{ width: `${(x.n / max()) * 100}%` }} /></div><b>{x.n}</b></li>
      )}</For>
    </ul>
  );
};
const Barra = (p: { pago: number; aberto: number; atraso: number }) => {
  const t = () => Math.max(1, p.pago + p.aberto + p.atraso);
  return (
    <>
      <div class="barra" role="img" aria-label={`Recebido ${brl(p.pago)}, a vencer ${brl(p.aberto)}, em atraso ${brl(p.atraso)}`}>
        <i class="b-ok" style={{ width: `${(p.pago / t()) * 100}%` }} /><i class="b-av" style={{ width: `${(p.aberto / t()) * 100}%` }} /><i class="b-at" style={{ width: `${(p.atraso / t()) * 100}%` }} />
      </div>
      <p class="legenda"><span><i class="b-ok" />Recebido {brl(p.pago)}</span><span><i class="b-av" />A vencer {brl(p.aberto)}</span><span><i class="b-at" />Atraso {brl(p.atraso)}</span></p>
    </>
  );
};

function Formulario(p: { tipo: 'processo' | 'prazo' | 'cliente' | 'honorario'; fechar: () => void }) {
  const d = store.dados;
  const clienteNome = (id: string) => d().clientes.find((c) => c.id === id)?.nome ?? '';
  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement)) as Record<string, string>;
    if (p.tipo === 'cliente') store.addCliente({ nome: f.nome, tipo: f.tipo as 'PF' | 'PJ', doc: f.doc, email: f.email, tel: f.tel, cidade: f.cidade });
    if (p.tipo === 'processo') store.addProcesso({ numero: f.numero, clienteId: f.clienteId, area: f.area, vara: f.vara, fase: 'Conhecimento', valor: Number(f.valor) || 0, contraria: f.contraria, resp: f.resp, abertura: hoje });
    if (p.tipo === 'prazo') store.addPrazo({ processoId: f.processoId, titulo: f.titulo, data: f.data, tipo: f.ptipo as Prazo['tipo'] });
    if (p.tipo === 'honorario') store.addHon({ processoId: f.processoId, descricao: f.descricao, valor: Number(f.valor) || 0, venc: f.venc, tipo: f.htipo as 'Contratual' | 'Êxito' });
    p.fechar();
  };
  const F = (x: { n: string; l: string; t?: string; req?: boolean; ph?: string }) => (
    <label>{x.l}<input name={x.n} type={x.t ?? 'text'} required={x.req ?? true} placeholder={x.ph} /></label>
  );
  const SelProc = () => (
    <label>Processo<select name="processoId" required><For each={d().processos}>{(x) => <option value={x.id}>{clienteNome(x.clienteId)} — {x.numero}</option>}</For></select></label>
  );
  return (
    <div class="veu" onClick={(e) => e.target === e.currentTarget && p.fechar()} onKeyDown={(e) => e.key === 'Escape' && p.fechar()}>
      <form class="modal" role="dialog" aria-modal="true" aria-label={`Novo ${p.tipo}`} onSubmit={submit}>
        <h2>{{ processo: 'Novo processo', prazo: 'Novo prazo', cliente: 'Novo cliente', honorario: 'Novo lançamento' }[p.tipo]}</h2>
        <Show when={p.tipo === 'cliente'}>
          {F({ n: 'nome', l: 'Nome' })}
          <label>Tipo<select name="tipo"><option>PF</option><option>PJ</option></select></label>
          {F({ n: 'doc', l: 'CPF/CNPJ (fictício)' })}{F({ n: 'email', l: 'E-mail', t: 'email' })}{F({ n: 'tel', l: 'Telefone' })}{F({ n: 'cidade', l: 'Cidade' })}
        </Show>
        <Show when={p.tipo === 'processo'}>
          <label>Cliente<select name="clienteId" required><For each={d().clientes}>{(c) => <option value={c.id}>{c.nome}</option>}</For></select></label>
          {F({ n: 'numero', l: 'Número (CNJ)', ph: '0000000-00.2026.8.16.0001' })}
          <label>Área<select name="area"><For each={AREAS}>{(a) => <option>{a}</option>}</For></select></label>
          {F({ n: 'vara', l: 'Vara / órgão' })}{F({ n: 'contraria', l: 'Parte contrária' })}{F({ n: 'resp', l: 'Advogado(a) responsável' })}{F({ n: 'valor', l: 'Valor da causa (R$)', t: 'number' })}
        </Show>
        <Show when={p.tipo === 'prazo'}>
          <SelProc />{F({ n: 'titulo', l: 'Descrição' })}{F({ n: 'data', l: 'Data', t: 'date' })}
          <label>Tipo<select name="ptipo"><option>Fatal</option><option>Audiência</option><option>Diligência</option></select></label>
        </Show>
        <Show when={p.tipo === 'honorario'}>
          <SelProc />{F({ n: 'descricao', l: 'Descrição' })}{F({ n: 'valor', l: 'Valor (R$)', t: 'number' })}{F({ n: 'venc', l: 'Vencimento', t: 'date' })}
          <label>Tipo<select name="htipo"><option>Contratual</option><option>Êxito</option></select></label>
        </Show>
        <div class="acoes"><button type="button" class="ghost" onClick={p.fechar}>Cancelar</button><button class="btn" type="submit">Salvar</button></div>
      </form>
    </div>
  );
}
