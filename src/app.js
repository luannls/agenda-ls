'use strict';
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { listSlots, canBook } = require('./scheduling');
const { validarNome, normalizarWhatsapp, validarData } = require('./validation');

function createApp({ store, jwtSecret, limitePorHorario = 1, now = () => new Date() }) {
  if (!jwtSecret) throw new Error('jwtSecret é obrigatório (variável de ambiente).');
  const app = express();
  app.use(express.json({ limit: '10kb' }));
  const falhas = new Map(); // tentativas de login por e-mail (RNF01)

  // Autenticação e perfil verificados em cada rota protegida (RNF01, OWASP A01).
  const auth = (perfis) => (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ erro: 'Acesso não autorizado.' });
    try {
      const p = jwt.verify(token, jwtSecret);
      if (perfis && !perfis.includes(p.papel)) return res.status(403).json({ erro: 'Sem permissão.' });
      req.usuario = p;
      return next();
    } catch {
      return res.status(401).json({ erro: 'Acesso não autorizado.' });
    }
  };

  app.get('/api/barbeiros', (req, res) => res.json(store.listBarbeirosAtivos()));

  // RF01: horários do barbeiro em uma data, com os lotados desabilitados.
  app.get('/api/horarios', (req, res) => {
    const barbeiroId = Number(req.query.barbeiroId);
    const data = req.query.data;
    if (!Number.isInteger(barbeiroId) || !validarData(data)) return res.status(400).json({ erro: 'Informe barbeiro e data válidos.' });
    return res.json(listSlots({ agendamentos: store.listAgendamentos(), barbeiroId, data, limite: limitePorHorario, now: now() }));
  });

  // RF01 + RF02 + RNF02: cria o agendamento validando no servidor.
  app.post('/api/agendamentos', (req, res) => {
    const { nome, whatsapp, barbeiroId, data, hora, servico = 'corte' } = req.body || {};
    const e1 = validarNome(nome);
    if (e1) return res.status(400).json({ erro: e1 });
    const tel = normalizarWhatsapp(whatsapp);
    if (!tel) return res.status(400).json({ erro: 'Informe o telefone com DDD. Exemplo: (11) 90000-0000' });
    if (!Number.isInteger(barbeiroId) || !store.findBarbeiro(barbeiroId) || !validarData(data) || typeof hora !== 'string') {
      return res.status(400).json({ erro: 'Dados do agendamento inválidos.' });
    }
    const r = canBook({ agendamentos: store.listAgendamentos(), barbeiroId, data, hora, limite: limitePorHorario, now: now() });
    if (!r.ok) {
      return res.status(409).json({ erro: r.motivo === 'sem_vaga' ? 'Este horário acabou de ser ocupado, escolha outro.' : 'Horário indisponível.', motivo: r.motivo });
    }
    const cliente = store.upsertCliente({ nome: nome.trim(), whatsapp: tel });
    const ag = store.addAgendamento({ clienteId: cliente.id, barbeiroId, data, hora, servico: String(servico).slice(0, 30) });
    return res.status(201).json({ id: ag.id, data, hora, barbeiroId, status: ag.status });
  });

  // RNF01: login com bcrypt, mensagem genérica e bloqueio após 5 falhas.
  app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body || {};
    if (typeof email !== 'string' || typeof senha !== 'string') return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    const f = falhas.get(email) || 0;
    if (f >= 5) return res.status(429).json({ erro: 'Muitas tentativas. Tente novamente mais tarde.' });
    const b = store.findBarbeiroByEmail(email);
    const ok = b && b.ativo && (await bcrypt.compare(senha, b.senhaHash));
    if (!ok) {
      falhas.set(email, f + 1);
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }
    falhas.delete(email);
    return res.json({ token: jwt.sign({ id: b.id, papel: b.papel }, jwtSecret, { expiresIn: '8h' }) });
  });

  // RF03: agenda do dia. Barbeiro vê só a sua; proprietário vê todas.
  app.get('/api/agenda', auth(['barbeiro', 'proprietario']), (req, res) => {
    const data = req.query.data;
    if (!validarData(data)) return res.status(400).json({ erro: 'Informe uma data válida.' });
    let lista = store.listAgendamentos().filter((a) => a.data === data);
    if (req.usuario.papel === 'barbeiro') lista = lista.filter((a) => a.barbeiroId === req.usuario.id);
    lista = lista
      .sort((a, b) => a.hora.localeCompare(b.hora))
      .map((a) => ({
        id: a.id, hora: a.hora, servico: a.servico, status: a.status, barbeiroId: a.barbeiroId,
        cliente: (store.state.clientes.find((c) => c.id === a.clienteId) || {}).nome,
      }));
    return res.json(lista);
  });

  // RF03: cancelar libera a vaga e mantém o registro.
  app.post('/api/agendamentos/:id/cancelar', auth(['barbeiro', 'proprietario']), (req, res) => {
    const ag = store.findAgendamento(Number(req.params.id));
    if (!ag) return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    if (req.usuario.papel === 'barbeiro' && ag.barbeiroId !== req.usuario.id) return res.status(403).json({ erro: 'Sem permissão.' });
    ag.status = 'cancelado';
    return res.json({ id: ag.id, status: ag.status });
  });

  // Erros genéricos, sem detalhes técnicos (RNF02).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => res.status(err.status === 400 ? 400 : 500).json({ erro: 'Não foi possível concluir a operação.' }));
  return app;
}
module.exports = { createApp };
