# Validação com a comunidade (Experiência Prática 3)

Material para testar o MVP com pessoas reais. **Os resultados devem ser preenchidos somente depois de aplicar o teste de verdade.**

## Antes de começar
- Suba a API e a interface com dados fictícios (veja o README). Use o celular do participante, ou um celular de entrada, com a interface aberta pelo link na rede local ou pela hospedagem.
- Use apenas dados fictícios no teste (nome "Cliente Teste", telefone de exemplo). Não peça dados reais.
- Participantes sugeridos: o João (proprietário, perfil de equipe) e pelo menos 2 ou 3 clientes frequentes (perfil de cliente). Quanto mais pessoas diferentes, mais confiável o resultado.

## Consentimento (ler em voz alta e registrar por escrito, por exemplo em mensagem)
"Estou testando um aplicativo de agendamento da Barbearia LS para um trabalho da faculdade. Vou pedir que você faça 3 tarefas no celular. O objetivo é avaliar o aplicativo, e não você: se algo for difícil, o problema é do aplicativo. Não vou pedir dados pessoais reais, e o que você disser será usado só para melhorar o aplicativo. Você pode parar a qualquer momento. Você concorda em participar?"

## Condução (cerca de 20 minutos)
1. Apresente o contexto: "Você quer marcar um horário na barbearia sem ficar na fila."
2. Leia **uma tarefa por vez**, sem dizer onde tocar. Peça para a pessoa falar em voz alta o que pensa.
3. Só ajude se a pessoa ficar parada mais de 1 minuto (uma dica genérica) e **registre cada ajuda**.
4. Cronometre do fim da leitura da tarefa até o resultado esperado aparecer.
5. Ao final, faça a pergunta de satisfação e deixe comentários livres.

## Tarefas (para participantes do perfil cliente)
- **Tarefa 1 - Encontrar um horário livre.** "Você quer marcar um corte com o barbeiro João para amanhã de manhã. Descubra quais horários estão livres." Resultado esperado: seleciona barbeiro e dia, identifica um horário livre e entende que "Lotado" não pode ser escolhido.
- **Tarefa 2 - Confirmar um agendamento.** "Reserve o horário das 09:30 no seu nome e WhatsApp." Resultado esperado: preenche os campos (teste primeiro um telefone sem DDD), corrige o erro e vê a confirmação.
- **Tarefa 3 (perfil equipe) - Cancelar na agenda.** "Como barbeiro, cancele o atendimento das 10:00 porque o cliente avisou que não vem." Resultado esperado: entra, localiza, cancela e explica como diferencia confirmado de cancelado sem depender só da cor.

## Pergunta de satisfação (neutra)
"De 1 a 5, sendo 1 muito difícil e 5 muito fácil, como você avalia a facilidade de usar este fluxo?" Peça também um comentário curto, sem induzir a resposta.

## Critérios de aceitação (definidos na Experiência 2)
- Usabilidade: 3 de 3 tarefas concluídas sem ajuda direta.
- Eficiência: Tarefa 2 em até 90 segundos e no máximo 4 passos.
- Satisfação: nota 4 ou 5.
- Decisão: aceito, aceito com ajustes ou não aceito, conforme a regra integrada registrada na plataforma.

## Registro
Use o arquivo `validacao-registro.csv` (uma linha por participante e tarefa). Preencha **somente com o que foi observado**. Anote também os problemas encontrados e quais ajustes foram feitos no código, com o hash do commit de cada ajuste.

## Ajustes a partir do feedback
Para cada problema observado, abra uma issue ou anote: o que foi visto, qual melhoria foi feita e o commit correspondente. A plataforma pede feedbacks documentados e a implementação das melhorias.
