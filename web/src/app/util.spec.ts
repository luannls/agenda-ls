import { dataIso, mensagemNome, mensagemTelefone, normalizarTelefone, proximosDias, rotuloDia } from './util';

describe('util', () => {
  it('aceita telefone com DDD em vários formatos', () => {
    expect(normalizarTelefone('(11) 90000-0000')).toBe('11900000000');
    expect(normalizarTelefone('1130000000')).toBe('1130000000');
  });

  it('remove o código do país (+55) vindo do preenchimento automático', () => {
    expect(normalizarTelefone('+55 (11) 90000-0000')).toBe('11900000000');
    expect(normalizarTelefone('5511900000000')).toBe('11900000000');
    expect(normalizarTelefone('551130000000')).toBe('1130000000');
  });

  it('RNF02/Tela 2: telefone sem DDD gera a mensagem que ensina a corrigir', () => {
    expect(normalizarTelefone('99999')).toBeNull();
    expect(mensagemTelefone('99999')).toContain('DDD');
    expect(mensagemTelefone('(11) 90000-0000')).toBeNull();
  });

  it('valida o nome (tamanho e caracteres não permitidos)', () => {
    expect(mensagemNome('')).not.toBeNull();
    expect(mensagemNome('A')).not.toBeNull();
    expect(mensagemNome('<script>')).toContain('não permitidos');
    expect(mensagemNome('Cliente Teste')).toBeNull();
  });

  it('gera 7 dias seguidos a partir de uma data, com a data em formato ISO', () => {
    const dias = proximosDias(new Date(2026, 10, 20));
    expect(dias.length).toBe(7);
    expect(dias[0]).toEqual({ iso: '2026-11-20', semana: 'Sex', numero: 20 });
    expect(dias[6].iso).toBe('2026-11-26');
  });

  it('formata a data e o rótulo do dia', () => {
    expect(dataIso(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(rotuloDia('2026-11-21')).toBe('Sáb, 21/11');
  });
});
