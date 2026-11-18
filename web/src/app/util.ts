// Funções puras usadas pelas telas (validação no cliente é só retorno rápido: o servidor valida de novo, RNF02).

export function normalizarTelefone(v: string): string | null {
  const d = (v ?? '').replace(/\D/g, '');
  return d.length === 10 || d.length === 11 ? d : null;
}

export function mensagemNome(nome: string): string | null {
  const n = (nome ?? '').trim();
  if (n.length < 2) return 'Informe seu nome (mínimo de 2 letras).';
  if (n.length > 80) return 'O nome pode ter no máximo 80 caracteres.';
  if (/[<>]/.test(n)) return 'O nome contém caracteres não permitidos.';
  return null;
}

export function mensagemTelefone(v: string): string | null {
  return normalizarTelefone(v) ? null : 'Informe o telefone com DDD. Exemplo: (11) 90000-0000';
}

export function dataIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

export interface Dia {
  iso: string;
  semana: string;
  numero: number;
}

const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function proximosDias(inicio: Date, quantidade = 7): Dia[] {
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
    return { iso: dataIso(d), semana: SEMANA[d.getDay()], numero: d.getDate() };
  });
}

export function rotuloDia(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  const data = new Date(a, m - 1, d);
  return `${SEMANA[data.getDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}
