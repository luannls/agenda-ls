'use strict';
// Validação no servidor (RNF02): tipo, tamanho e formato. Rejeita conteúdo que pareça marcação.
function validarNome(nome) {
  if (typeof nome !== 'string') return 'Informe o nome.';
  const n = nome.trim();
  if (n.length < 2 || n.length > 80) return 'O nome deve ter entre 2 e 80 caracteres.';
  if (/[<>]/.test(n)) return 'O nome contém caracteres não permitidos.';
  return null;
}
function normalizarWhatsapp(v) {
  if (typeof v !== 'string') return null;
  const d = v.replace(/\D/g, '');
  return d.length === 10 || d.length === 11 ? d : null;
}
function validarData(d) {
  return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(new Date(`${d}T00:00:00`).getTime());
}
module.exports = { validarNome, normalizarWhatsapp, validarData };
