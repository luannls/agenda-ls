# Agenda LS

MVP de agendamento online da **Barbearia LS** (Jardim Santo Afonso), do projeto de Projeto de Software (Experiências Práticas 1 a 3).

O problema: a barbearia atende por ordem de chegada e lota nas sextas, sábados e nos dias 24 e 31 de dezembro. O MVP permite agendar horário pelo celular e **limita as vagas por horário** nos picos.

## Arquitetura
Monolito em camadas: interface (Angular em `web/`), API REST (Node.js + Express em `src/`) e dados (repositório em memória hoje; PostgreSQL planejado, com a mesma interface).

## Estado atual
- **API:** regras de agendamento (RF01, RF02), agenda e cancelamento (RF03), login com bcrypt (RNF01) e validação no servidor (RNF02).
- **Interface Angular:** escolha de barbeiro, dia e horário, com horários lotados desabilitados (Tela 1); confirmação de dados com mensagens de erro claras (Tela 2); área da equipe com login, agenda do dia e cancelamento (Tela 3).
- **Testes:** 19 na API (unitários e de integração) e 6 na interface. Cobertura da API: ~98% das linhas e ~83% dos ramos (`npm run test:coverage`).
- **CI (GitHub Actions):** API (`npm ci`, auditoria e testes com cobertura) e interface (testes e build de produção).
- **Pendente:** repositório PostgreSQL, lembrete por WhatsApp (RF04, desejável) e validação com usuários reais.

## Como rodar
API (a senha de demonstração e o segredo vêm do ambiente, nunca do código):
```bash
npm ci
JWT_SECRET="defina-um-segredo" DEMO_SEED=1 DEMO_SENHA="defina-uma-senha" npm start
```
Interface (em outro terminal; o proxy encaminha `/api` para a porta 3000):
```bash
cd web
npm ci
npm start
```
Abra http://localhost:4200. Contas de demonstração: `joao@demo.local` (proprietário) e `carlos@demo.local` (barbeiro), com a senha definida em `DEMO_SENHA`.

## Testes
```bash
npm test                 # API
npm run test:coverage    # API com cobertura
cd web && npx ng test --watch=false   # interface
```

## Segurança
- Senhas só como hash bcrypt (nunca texto limpo, MD5 ou SHA-1); token mantido só em memória no navegador.
- Segredos em variáveis de ambiente.
- Autorização por perfil em cada rota protegida; mensagens de erro genéricas; validação no servidor.

## Limitações conhecidas
- O repositório em memória é sequencial; com PostgreSQL será necessária uma transação para garantir o limite de vagas sob concorrência real.
- Dados e sessões são perdidos ao reiniciar a API enquanto não houver banco.
