import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, ItemAgenda } from './api.service';
import { dataIso, rotuloDia } from './util';

@Component({
  selector: 'app-equipe',
  imports: [FormsModule],
  templateUrl: './equipe.html',
  styleUrl: './agendar.css',
})
export class Equipe {
  protected readonly api = inject(ApiService);

  email = '';
  senha = '';
  readonly data = signal(dataIso(new Date()));
  readonly itens = signal<ItemAgenda[]>([]);
  readonly erro = signal<string | null>(null);
  readonly sucesso = signal<string | null>(null);
  readonly confirmando = signal<number | null>(null);

  rotulo(): string { return rotuloDia(this.data()); }

  entrar(): void {
    this.erro.set(null);
    // Mensagem genérica em qualquer falha de login (RNF01).
    this.api.login(this.email, this.senha).subscribe({
      next: (r) => { this.api.token.set(r.token); this.senha = ''; this.carregar(); },
      error: (e: HttpErrorResponse) => this.erro.set(e.status === 429 ? 'Muitas tentativas. Tente novamente mais tarde.' : 'E-mail ou senha inválidos.'),
    });
  }

  carregar(): void {
    this.api.agenda(this.data()).subscribe({
      next: (l) => this.itens.set(l),
      error: (e: HttpErrorResponse) => {
        if (e.status === 401 || e.status === 403) this.sair();
        this.erro.set('Não foi possível carregar a agenda.');
      },
    });
  }

  mudarData(iso: string): void { this.data.set(iso); this.sucesso.set(null); this.carregar(); }

  pedirCancelamento(id: number): void { this.confirmando.set(id); this.sucesso.set(null); }
  desistir(): void { this.confirmando.set(null); }

  confirmarCancelamento(item: ItemAgenda): void {
    this.api.cancelar(item.id).subscribe({
      next: () => {
        this.confirmando.set(null);
        this.sucesso.set(`Agendamento cancelado. O horário ${item.hora} está livre novamente.`);
        this.carregar();
      },
      error: () => { this.confirmando.set(null); this.erro.set('Não foi possível cancelar. Tente novamente.'); },
    });
  }

  sair(): void { this.api.sair(); this.itens.set([]); this.sucesso.set(null); }
}
