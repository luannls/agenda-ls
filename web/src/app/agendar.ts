import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Barbeiro, Confirmacao, Horario } from './api.service';
import { Dia, mensagemNome, mensagemTelefone, normalizarTelefone, proximosDias, rotuloDia } from './util';

type Passo = 'horario' | 'dados' | 'pronto';

@Component({
  selector: 'app-agendar',
  imports: [FormsModule],
  templateUrl: './agendar.html',
  styleUrl: './agendar.css',
})
export class Agendar {
  private readonly api = inject(ApiService);

  readonly passo = signal<Passo>('horario');
  readonly dias: Dia[] = proximosDias(new Date(), 7);
  readonly barbeiros = signal<Barbeiro[]>([]);
  readonly horarios = signal<Horario[]>([]);
  readonly barbeiroId = signal<number | null>(null);
  readonly data = signal<string>(this.dias[0].iso);
  readonly hora = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly carregando = signal(false);
  readonly confirmacao = signal<Confirmacao | null>(null);

  nome = '';
  whatsapp = '';
  readonly erroNome = signal<string | null>(null);
  readonly erroTelefone = signal<string | null>(null);

  readonly barbeiroAtual = computed(() => this.barbeiros().find((b) => b.id === this.barbeiroId()));
  readonly resumo = computed(() => `${rotuloDia(this.data())} · ${this.hora()} · Barbeiro: ${this.barbeiroAtual()?.nome ?? ''}`);

  constructor() {
    this.api.barbeiros().subscribe({
      next: (lista) => {
        this.barbeiros.set(lista);
        if (lista.length) this.escolherBarbeiro(lista[0].id);
      },
      error: () => this.aviso.set('Não foi possível carregar os barbeiros. Tente novamente.'),
    });
  }

  escolherBarbeiro(id: number): void { this.barbeiroId.set(id); this.hora.set(null); this.carregarHorarios(); }
  escolherDia(iso: string): void { this.data.set(iso); this.hora.set(null); this.carregarHorarios(); }
  escolherHora(h: Horario): void { if (h.livre) this.hora.set(h.hora); }

  private carregarHorarios(): void {
    const id = this.barbeiroId();
    if (id === null) return;
    this.carregando.set(true);
    this.api.horarios(id, this.data()).subscribe({
      next: (h) => { this.horarios.set(h); this.carregando.set(false); },
      error: () => { this.aviso.set('Não foi possível carregar os horários.'); this.carregando.set(false); },
    });
  }

  continuar(): void { if (this.hora()) { this.aviso.set(null); this.passo.set('dados'); } }
  voltar(): void { this.passo.set('horario'); }

  confirmar(): void {
    this.erroNome.set(mensagemNome(this.nome));
    this.erroTelefone.set(mensagemTelefone(this.whatsapp));
    if (this.erroNome() || this.erroTelefone()) return;
    this.api.agendar({ nome: this.nome.trim(), whatsapp: normalizarTelefone(this.whatsapp) as string, barbeiroId: this.barbeiroId() as number, data: this.data(), hora: this.hora() as string }).subscribe({
      next: (c) => { this.confirmacao.set(c); this.passo.set('pronto'); },
      error: (e: HttpErrorResponse) => {
        if (e.status === 409) {
          // Alguém ocupou a vaga: volta à Tela 1 com aviso e horários atualizados (RF02).
          this.aviso.set(e.error?.erro ?? 'Este horário acabou de ser ocupado, escolha outro.');
          this.hora.set(null);
          this.passo.set('horario');
          this.carregarHorarios();
        } else {
          this.aviso.set(e.error?.erro ?? 'Não foi possível concluir o agendamento.');
        }
      },
    });
  }

  novo(): void {
    this.nome = ''; this.whatsapp = ''; this.hora.set(null); this.confirmacao.set(null); this.aviso.set(null);
    this.passo.set('horario'); this.carregarHorarios();
  }
}
