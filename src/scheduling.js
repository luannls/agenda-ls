'use strict';

// Regras de agendamento da Barbearia LS (RF01 e RF02).
const DEFAULT_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

function isFuture(data, hora, now = new Date()) {
  const dt = new Date(`${data}T${hora}:00`);
  return !Number.isNaN(dt.getTime()) && dt.getTime() > now.getTime();
}

function countConfirmed(agendamentos, barbeiroId, data, hora) {
  return agendamentos.filter(
    (a) => a.barbeiroId === barbeiroId && a.data === data && a.hora === hora && a.status === 'confirmado'
  ).length;
}

// Lista os horários de um barbeiro em uma data, indicando se ainda há vaga.
function listSlots({ agendamentos, barbeiroId, data, limite = 1, slots = DEFAULT_SLOTS, now = new Date() }) {
  return slots.map((hora) => {
    const ocupadas = countConfirmed(agendamentos, barbeiroId, data, hora);
    const futuro = isFuture(data, hora, now);
    return { hora, livre: futuro && ocupadas < limite, lotado: futuro && ocupadas >= limite, passado: !futuro };
  });
}

// Decide se um novo agendamento pode ser confirmado (RF02).
function canBook({ agendamentos, barbeiroId, data, hora, limite = 1, slots = DEFAULT_SLOTS, now = new Date() }) {
  if (!slots.includes(hora)) return { ok: false, motivo: 'horario_invalido' };
  if (!isFuture(data, hora, now)) return { ok: false, motivo: 'horario_passado' };
  if (countConfirmed(agendamentos, barbeiroId, data, hora) >= limite) return { ok: false, motivo: 'sem_vaga' };
  return { ok: true };
}

module.exports = { DEFAULT_SLOTS, isFuture, countConfirmed, listSlots, canBook };
