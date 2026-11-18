# Agenda LS

MVP de agendamento online da **Barbearia LS** (Jardim Santo Afonso), do projeto de Projeto de Software (Experiências Práticas 1 a 3).

O problema: a barbearia atende por ordem de chegada e lota nas sextas, sábados e nos dias 24 e 31 de dezembro. O MVP permite agendar horário pelo celular e **limita as vagas por horário** nos picos.

## Arquitetura
Monolito em camadas: interface (Angular, em desenvolvimento), API REST (Node.js + Express) e dados (PostgreSQL em produção; repositório em memória nos testes).

## Estado atual
- API com regras de agendamento (RF01, RF02), agenda e cancelamento (RF03), login com bcrypt (RNF01) e validação no servidor (RNF02).
- 19 testes automatizados (unitários e de integração).
- Pipeline de CI (GitHub Actions) com `npm ci`, auditoria de dependências e testes.
- **Pendente:** interface Angular, repositório PostgreSQL e validação com usuários reais.

## Como rodar
```bash
npm ci
npm test
JWT_SECRET="defina-um-segredo" npm start   # o segredo nunca vai para o código
```

## Segurança
- Senhas só como hash bcrypt (nunca texto limpo, MD5 ou SHA-1).
- Segredos em variáveis de ambiente.
- Autorização por perfil em cada rota protegida; mensagens de erro genéricas.
