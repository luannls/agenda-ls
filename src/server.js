'use strict';
const { createApp } = require('./app');
const { createStore } = require('./store');

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('Defina JWT_SECRET no ambiente (não fica no código).');
  process.exit(1);
}
const store = createStore();
createApp({ store, jwtSecret: secret, limitePorHorario: Number(process.env.LIMITE_VAGAS || 1) })
  .listen(process.env.PORT || 3000, () => console.log('Agenda LS no ar'));
