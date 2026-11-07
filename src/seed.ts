import { addDays, type Cliente, type Honorario, type Prazo, type Processo } from './lib';

export type Dados = { clientes: Cliente[]; processos: Processo[]; prazos: Prazo[]; honorarios: Honorario[] };

/** Dados 100% fictícios, datas relativas a "hoje" para a demo nunca ficar velha. */
export function seed(hoje: string): Dados {
  const clientes: Cliente[] = [
    { id: 'c1', nome: 'Helena Prado Cavalcanti', tipo: 'PF', doc: '000.000.001-00', email: 'helena@exemplo.test', tel: '(41) 90000-0001', cidade: 'Curitiba' },
    { id: 'c2', nome: 'Moinho Aurora Alimentos Ltda.', tipo: 'PJ', doc: '00.000.000/0001-01', email: 'juridico@moinho.test', tel: '(41) 90000-0002', cidade: 'Ponta Grossa' },
    { id: 'c3', nome: 'Tiago Benevides Rocha', tipo: 'PF', doc: '000.000.003-00', email: 'tiago@exemplo.test', tel: '(41) 90000-0003', cidade: 'São José dos Pinhais' },
    { id: 'c4', nome: 'Oficina Rota 277 ME', tipo: 'PJ', doc: '00.000.000/0001-04', email: 'contato@rota277.test', tel: '(41) 90000-0004', cidade: 'Cascavel' },
    { id: 'c5', nome: 'Dionísio Meireles Neto', tipo: 'PF', doc: '000.000.005-00', email: 'dionisio@exemplo.test', tel: '(41) 90000-0005', cidade: 'Londrina' },
    { id: 'c6', nome: 'Cooperativa Vale Verde', tipo: 'PJ', doc: '00.000.000/0001-06', email: 'adm@valeverde.test', tel: '(41) 90000-0006', cidade: 'Maringá' },
  ];
  const processos: Processo[] = [
    { id: 'p1', numero: '0001234-56.2026.8.16.0001', clienteId: 'c1', area: 'Família', vara: '3ª Vara de Família', fase: 'Instrução', valor: 180000, contraria: 'R. A. Cavalcanti', resp: 'Dra. Marta Leal', abertura: addDays(hoje, -210) },
    { id: 'p2', numero: '0004410-12.2025.5.09.0013', clienteId: 'c2', area: 'Trabalhista', vara: '13ª Vara do Trabalho', fase: 'Recurso', valor: 96000, contraria: 'Reclamante A. S.', resp: 'Dr. Caio Ferraz', abertura: addDays(hoje, -400) },
    { id: 'p3', numero: '0007788-90.2026.8.16.0004', clienteId: 'c3', area: 'Consumidor', vara: '2º Juizado Especial', fase: 'Sentença', valor: 18500, contraria: 'Banco Prisma S.A.', resp: 'Dra. Marta Leal', abertura: addDays(hoje, -120) },
    { id: 'p4', numero: '0002051-33.2026.4.04.7000', clienteId: 'c4', area: 'Tributário', vara: '1ª Vara Federal', fase: 'Conhecimento', valor: 420000, contraria: 'Fazenda Nacional', resp: 'Dr. Caio Ferraz', abertura: addDays(hoje, -45) },
    { id: 'p5', numero: '0009912-08.2024.8.16.0014', clienteId: 'c5', area: 'Cível', vara: '5ª Vara Cível', fase: 'Execução', valor: 74000, contraria: 'Construtora Pedra Viva', resp: 'Dra. Beatriz Nogueira', abertura: addDays(hoje, -640) },
    { id: 'p6', numero: '0003377-71.2026.8.16.0017', clienteId: 'c6', area: 'Empresarial', vara: '2ª Vara Empresarial', fase: 'Conhecimento', valor: 650000, contraria: 'Agro Sul Insumos', resp: 'Dra. Beatriz Nogueira', abertura: addDays(hoje, -20) },
    { id: 'p7', numero: '0005520-45.2023.8.16.0001', clienteId: 'c1', area: 'Cível', vara: '8ª Vara Cível', fase: 'Arquivado', valor: 32000, contraria: 'Seguradora Norte', resp: 'Dra. Marta Leal', abertura: addDays(hoje, -900) },
  ];
  const pz = (id: string, processoId: string, titulo: string, d: number, tipo: Prazo['tipo'], feito = false): Prazo =>
    ({ id, processoId, titulo, data: addDays(hoje, d), tipo, feito });
  const prazos: Prazo[] = [
    pz('z1', 'p2', 'Contrarrazões ao recurso ordinário', -1, 'Fatal'),
    pz('z2', 'p3', 'Manifestação sobre cálculo', 0, 'Fatal'),
    pz('z3', 'p1', 'Audiência de instrução', 3, 'Audiência'),
    pz('z4', 'p4', 'Réplica à contestação', 5, 'Fatal'),
    pz('z5', 'p6', 'Juntar documentos societários', 9, 'Diligência'),
    pz('z6', 'p5', 'Pedido de penhora online', 12, 'Diligência'),
    pz('z7', 'p2', 'Sustentação oral', 21, 'Audiência'),
    pz('z8', 'p1', 'Laudo psicossocial — entrega', 28, 'Diligência'),
    pz('z9', 'p3', 'Embargos de declaração', -8, 'Fatal', true),
  ];
  const hn = (id: string, processoId: string, descricao: string, valor: number, d: number, pago: boolean, tipo: Honorario['tipo'] = 'Contratual'): Honorario =>
    ({ id, processoId, descricao, valor, venc: addDays(hoje, d), pago, tipo });
  const honorarios: Honorario[] = [
    hn('h1', 'p1', 'Entrada contratual', 6000, -60, true),
    hn('h2', 'p1', 'Parcela 2/6', 2500, -12, false),
    hn('h3', 'p1', 'Parcela 3/6', 2500, 18, false),
    hn('h4', 'p2', 'Mensalidade consultiva', 4200, -3, true),
    hn('h5', 'p2', 'Mensalidade consultiva', 4200, 27, false),
    hn('h6', 'p3', 'Honorário de êxito (15%)', 2775, 40, false, 'Êxito'),
    hn('h7', 'p4', 'Entrada contratual', 15000, -30, true),
    hn('h8', 'p4', 'Parcela 2/4', 7500, 2, false),
    hn('h9', 'p5', 'Parcela final', 3800, -20, false),
    hn('h10', 'p6', 'Entrada contratual', 22000, -15, true),
    hn('h11', 'p6', 'Parcela 2/3', 11000, 15, false),
  ];
  return { clientes, processos, prazos, honorarios };
}
