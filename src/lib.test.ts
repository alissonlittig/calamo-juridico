import { describe, expect, it } from 'vitest';
import { addDays, diasAte, statusHon, totaisHon, urgencia, brl } from './lib';

const hoje = '2026-11-07';
describe('prazos', () => {
  it('calcula dias', () => {
    expect(diasAte('2026-11-10', hoje)).toBe(3);
    expect(diasAte('2026-11-01', hoje)).toBe(-6);
    expect(addDays(hoje, 30)).toBe('2026-12-07');
  });
  it('classifica urgência', () => {
    expect(urgencia({ data: '2026-11-06', feito: false }, hoje)).toBe('vencido');
    expect(urgencia({ data: hoje, feito: false }, hoje)).toBe('hoje');
    expect(urgencia({ data: '2026-11-14', feito: false }, hoje)).toBe('semana');
    expect(urgencia({ data: '2026-11-15', feito: false }, hoje)).toBe('folga');
    expect(urgencia({ data: '2020-01-01', feito: true }, hoje)).toBe('feito');
  });
});
describe('honorários', () => {
  const hs = [
    { id: '1', processoId: 'a', descricao: '', valor: 1000, venc: '2026-11-01', pago: false, tipo: 'Contratual' as const },
    { id: '2', processoId: 'a', descricao: '', valor: 500, venc: '2026-11-20', pago: false, tipo: 'Êxito' as const },
    { id: '3', processoId: 'a', descricao: '', valor: 200, venc: '2026-10-01', pago: true, tipo: 'Contratual' as const },
  ];
  it('status e totais', () => {
    expect(statusHon(hs[0], hoje)).toBe('atrasado');
    expect(totaisHon(hs, hoje)).toEqual({ pago: 200, atrasado: 1000, 'a vencer': 500 });
    expect(brl(1500)).toContain('1.500');
  });
});
