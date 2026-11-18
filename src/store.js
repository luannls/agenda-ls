'use strict';
// Repositório em memória usado nos testes e no protótipo. Em produção, é trocado pelo PostgreSQL
// mantendo a mesma interface (camada de dados da arquitetura em camadas).
function createStore() {
  const state = { clientes: [], barbeiros: [], agendamentos: [], seq: { cliente: 1, barbeiro: 1, agendamento: 1 } };
  return {
    state,
    addBarbeiro(b) { const novo = { id: state.seq.barbeiro++, ativo: true, ...b }; state.barbeiros.push(novo); return novo; },
    findBarbeiroByEmail(email) { return state.barbeiros.find((b) => b.email === email); },
    findBarbeiro(id) { return state.barbeiros.find((b) => b.id === id); },
    listBarbeirosAtivos() { return state.barbeiros.filter((b) => b.ativo).map(({ id, nome }) => ({ id, nome })); },
    upsertCliente({ nome, whatsapp }) {
      let c = state.clientes.find((x) => x.whatsapp === whatsapp);
      if (!c) { c = { id: state.seq.cliente++, nome, whatsapp }; state.clientes.push(c); }
      return c;
    },
    addAgendamento(a) { const novo = { id: state.seq.agendamento++, status: 'confirmado', ...a }; state.agendamentos.push(novo); return novo; },
    findAgendamento(id) { return state.agendamentos.find((a) => a.id === id); },
    listAgendamentos() { return state.agendamentos; },
  };
}
module.exports = { createStore };
