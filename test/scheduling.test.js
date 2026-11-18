'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { listSlots, canBook, isFuture } = require('../src/scheduling');

const now = new Date('2026-12-01T08:00:00');
const base = [{ barbeiroId: 1, data: '2026-12-04', hora: '10:00', status: 'confirmado' }];

test('horário no passado não é futuro', () => {
  assert.strictEqual(isFuture('2026-11-30', '09:00', now), false);
  assert.strictEqual(isFuture('2026-12-04', '09:00', now), true);
});

test('RF01: lista horários livres e marca o lotado quando o limite é atingido', () => {
  const r = listSlots({ agendamentos: base, barbeiroId: 1, data: '2026-12-04', limite: 1, now });
  assert.strictEqual(r.find((s) => s.hora === '09:00').livre, true);
  const lotado = r.find((s) => s.hora === '10:00');
  assert.strictEqual(lotado.lotado, true);
  assert.strictEqual(lotado.livre, false);
});

test('RF02: limite maior que 1 permite mais de um agendamento no horário', () => {
  const r = listSlots({ agendamentos: base, barbeiroId: 1, data: '2026-12-04', limite: 2, now });
  assert.strictEqual(r.find((s) => s.hora === '10:00').livre, true);
});

test('RF02: agendamento cancelado libera a vaga', () => {
  const ag = [{ ...base[0], status: 'cancelado' }];
  assert.deepStrictEqual(canBook({ agendamentos: ag, barbeiroId: 1, data: '2026-12-04', hora: '10:00', now }), { ok: true });
});

test('canBook recusa horário lotado, passado e inexistente', () => {
  assert.deepStrictEqual(canBook({ agendamentos: base, barbeiroId: 1, data: '2026-12-04', hora: '10:00', now }), { ok: false, motivo: 'sem_vaga' });
  assert.deepStrictEqual(canBook({ agendamentos: [], barbeiroId: 1, data: '2026-11-30', hora: '09:00', now }), { ok: false, motivo: 'horario_passado' });
  assert.deepStrictEqual(canBook({ agendamentos: [], barbeiroId: 1, data: '2026-12-04', hora: '03:00', now }), { ok: false, motivo: 'horario_invalido' });
});

test('limite é por barbeiro: outro barbeiro continua com vaga', () => {
  assert.deepStrictEqual(canBook({ agendamentos: base, barbeiroId: 2, data: '2026-12-04', hora: '10:00', now }), { ok: true });
});
