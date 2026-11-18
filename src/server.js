'use strict';
const bcrypt = require('bcryptjs');
const { createApp } = require('./app');
const { createStore } = require('./store');

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('Defina JWT_SECRET no ambiente (não fica no código).');
  process.exit(1);
}
const store = createStore();

// Modo demonstração: cria barbeiros fictícios. A senha vem do ambiente, nunca do código.
if (process.env.DEMO_SEED === '1') {
  const senha = process.env.DEMO_SENHA;
  if (!senha) {
    console.error('Defina DEMO_SENHA para usar DEMO_SEED=1.');
    process.exit(1);
  }
  const senhaHash = bcrypt.hashSync(senha, 10);
  store.addBarbeiro({ nome: 'João', email: 'joao@demo.local', papel: 'proprietario', senhaHash });
  store.addBarbeiro({ nome: 'Carlos', email: 'carlos@demo.local', papel: 'barbeiro', senhaHash });
}

createApp({ store, jwtSecret: secret, limitePorHorario: Number(process.env.LIMITE_VAGAS || 1) })
  .listen(process.env.PORT || 3000, () => console.log('Agenda LS no ar'));
