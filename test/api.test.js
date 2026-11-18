'use strict';
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../src/app');
const { createStore } = require('../src/store');

const NOW = new Date('2026-12-01T08:00:00');
const DIA = '2026-12-04';

function setup(limite = 1) {
  const store = createStore();
  // Senhas apenas de teste, geradas na hora e guardadas só como hash.
  const joao = store.addBarbeiro({ nome: 'João', email: 'joao@teste.local', papel: 'proprietario', senhaHash: bcrypt.hashSync('senha-de-teste-1', 4) });
  const carlos = store.addBarbeiro({ nome: 'Carlos', email: 'carlos@teste.local', papel: 'barbeiro', senhaHash: bcrypt.hashSync('senha-de-teste-2', 4) });
  const app = createApp({ store, jwtSecret: 'segredo-somente-de-teste', limitePorHorario: limite, now: () => NOW });
  return { store, app, joao, carlos };
}
const corpo = (extra = {}) => ({ nome: 'Cliente Teste', whatsapp: '(11) 90000-0000', barbeiroId: 1, data: DIA, hora: '09:30', ...extra });
async function login(app, email, senha) { const r = await request(app).post('/api/login').send({ email, senha }); return r.body.token; }

test('RF01: agenda um horário livre e devolve 201', async () => {
  const { app } = setup();
  const r = await request(app).post('/api/agendamentos').send(corpo());
  assert.strictEqual(r.status, 201);
  assert.strictEqual(r.body.status, 'confirmado');
});

test('RF02: duas solicitações para a última vaga, só uma é confirmada', async () => {
  const { app } = setup(1);
  const [a, b] = await Promise.all([
    request(app).post('/api/agendamentos').send(corpo({ nome: 'Cliente A', whatsapp: '11911111111' })),
    request(app).post('/api/agendamentos').send(corpo({ nome: 'Cliente B', whatsapp: '11922222222' })),
  ]);
  assert.deepStrictEqual([a.status, b.status].sort(), [201, 409]);
});

test('RF02: horário lotado aparece como lotado na listagem', async () => {
  const { app } = setup(1);
  await request(app).post('/api/agendamentos').send(corpo());
  const r = await request(app).get('/api/horarios').query({ barbeiroId: 1, data: DIA });
  assert.strictEqual(r.body.find((s) => s.hora === '09:30').lotado, true);
});

test('RNF02: telefone com +55 do preenchimento automático é aceito', async () => {
  const { app } = setup();
  const r = await request(app).post('/api/agendamentos').send(corpo({ whatsapp: '+55 (11) 90000-0000' }));
  assert.strictEqual(r.status, 201);
});

test('RNF02: telefone sem DDD é recusado com mensagem que ensina a corrigir', async () => {
  const { app } = setup();
  const r = await request(app).post('/api/agendamentos').send(corpo({ whatsapp: '99999' }));
  assert.strictEqual(r.status, 400);
  assert.match(r.body.erro, /DDD/);
});

test('RNF02: nome com marca de script é rejeitado no servidor (XSS)', async () => {
  const { app, store } = setup();
  const r = await request(app).post('/api/agendamentos').send(corpo({ nome: '<script>alert(1)</script>' }));
  assert.strictEqual(r.status, 400);
  assert.strictEqual(store.listAgendamentos().length, 0);
});

test('RNF02: entrada com aspas e comando SQL é tratada como texto, sem alterar dados', async () => {
  const { app, store } = setup();
  const r = await request(app).post('/api/agendamentos').send(corpo({ nome: "Robert'); DROP TABLE clientes;--" }));
  assert.strictEqual(r.status, 201);
  assert.strictEqual(store.state.clientes[0].nome, "Robert'); DROP TABLE clientes;--");
  assert.strictEqual(store.listAgendamentos().length, 1);
});

test('RNF01: login válido devolve token e login inválido recebe mensagem genérica', async () => {
  const { app } = setup();
  const ok = await request(app).post('/api/login').send({ email: 'joao@teste.local', senha: 'senha-de-teste-1' });
  assert.strictEqual(ok.status, 200);
  assert.ok(ok.body.token);
  const ruim = await request(app).post('/api/login').send({ email: 'joao@teste.local', senha: 'errada' });
  assert.strictEqual(ruim.status, 401);
  assert.strictEqual(ruim.body.erro, 'E-mail ou senha inválidos.');
});

test('RNF01: senha não fica legível no armazenamento (só hash bcrypt)', () => {
  const { store } = setup();
  for (const b of store.state.barbeiros) {
    assert.match(b.senhaHash, /^\$2[aby]\$/);
    assert.ok(!b.senhaHash.includes('senha-de-teste'));
  }
});

test('RNF01: bloqueia o login após 5 tentativas inválidas', async () => {
  const { app } = setup();
  for (let i = 0; i < 5; i++) await request(app).post('/api/login').send({ email: 'joao@teste.local', senha: 'x' });
  const r = await request(app).post('/api/login').send({ email: 'joao@teste.local', senha: 'senha-de-teste-1' });
  assert.strictEqual(r.status, 429);
});

test('A01: agenda sem token retorna 401', async () => {
  const { app } = setup();
  const r = await request(app).get('/api/agenda').query({ data: DIA });
  assert.strictEqual(r.status, 401);
});

test('RF03: barbeiro vê só a sua agenda e proprietário vê todas', async () => {
  const { app } = setup(2);
  await request(app).post('/api/agendamentos').send(corpo({ barbeiroId: 1, hora: '09:00' }));
  await request(app).post('/api/agendamentos').send(corpo({ barbeiroId: 2, hora: '09:30', nome: 'Outro Cliente', whatsapp: '11933333333' }));
  const tCarlos = await login(app, 'carlos@teste.local', 'senha-de-teste-2');
  const tJoao = await login(app, 'joao@teste.local', 'senha-de-teste-1');
  const c = await request(app).get('/api/agenda').query({ data: DIA }).set('Authorization', `Bearer ${tCarlos}`);
  const j = await request(app).get('/api/agenda').query({ data: DIA }).set('Authorization', `Bearer ${tJoao}`);
  assert.strictEqual(c.body.length, 1);
  assert.strictEqual(j.body.length, 2);
});

test('A01: barbeiro não consegue cancelar agendamento de outro barbeiro (403)', async () => {
  const { app } = setup();
  const ag = await request(app).post('/api/agendamentos').send(corpo({ barbeiroId: 1 }));
  const tCarlos = await login(app, 'carlos@teste.local', 'senha-de-teste-2');
  const r = await request(app).post(`/api/agendamentos/${ag.body.id}/cancelar`).set('Authorization', `Bearer ${tCarlos}`);
  assert.strictEqual(r.status, 403);
});

test('RF03: cancelar muda o status e libera o horário para novo agendamento', async () => {
  const { app } = setup(1);
  const ag = await request(app).post('/api/agendamentos').send(corpo({ barbeiroId: 1 }));
  const tJoao = await login(app, 'joao@teste.local', 'senha-de-teste-1');
  const c = await request(app).post(`/api/agendamentos/${ag.body.id}/cancelar`).set('Authorization', `Bearer ${tJoao}`);
  assert.strictEqual(c.body.status, 'cancelado');
  const novo = await request(app).post('/api/agendamentos').send(corpo({ barbeiroId: 1, nome: 'Novo Cliente', whatsapp: '11944444444' }));
  assert.strictEqual(novo.status, 201);
});
