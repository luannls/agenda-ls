import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface Barbeiro { id: number; nome: string; }
export interface Horario { hora: string; livre: boolean; lotado: boolean; passado: boolean; }
export interface NovoAgendamento { nome: string; whatsapp: string; barbeiroId: number; data: string; hora: string; servico?: string; }
export interface Confirmacao { id: number; data: string; hora: string; barbeiroId: number; status: string; }
export interface ItemAgenda { id: number; hora: string; servico: string; status: 'confirmado' | 'cancelado'; barbeiroId: number; cliente: string; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  // O token fica só em memória (RNF01): fechar a aba encerra o acesso.
  readonly token = signal<string | null>(null);

  barbeiros(): Observable<Barbeiro[]> { return this.http.get<Barbeiro[]>('/api/barbeiros'); }

  horarios(barbeiroId: number, data: string): Observable<Horario[]> {
    return this.http.get<Horario[]>('/api/horarios', { params: { barbeiroId, data } });
  }

  agendar(corpo: NovoAgendamento): Observable<Confirmacao> { return this.http.post<Confirmacao>('/api/agendamentos', corpo); }

  login(email: string, senha: string): Observable<{ token: string }> { return this.http.post<{ token: string }>('/api/login', { email, senha }); }

  agenda(data: string): Observable<ItemAgenda[]> {
    return this.http.get<ItemAgenda[]>('/api/agenda', { params: { data }, headers: this.cabecalho() });
  }

  cancelar(id: number): Observable<{ id: number; status: string }> {
    return this.http.post<{ id: number; status: string }>(`/api/agendamentos/${id}/cancelar`, {}, { headers: this.cabecalho() });
  }

  sair(): void { this.token.set(null); }

  private cabecalho(): { Authorization: string } { return { Authorization: `Bearer ${this.token() ?? ''}` }; }
}
