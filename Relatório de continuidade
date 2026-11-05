# Relatório de continuidade — Investigação da falha no Playwright

**Projeto:** Clínica Psi  
**Pasta:** `C:\Users\WDAGUtilityAccount\Desktop\Sandbox`  
**Branch:** `react-refactor`  
**Status:** Investigação em andamento  
**Modo de trabalho:** Somente leitura — nenhum arquivo foi alterado.

---

## 1. Qual é o problema?

Estamos investigando uma falha que acontece ocasionalmente em um teste automático do sistema.

O teste verifica se um profissional consegue visualizar somente os pacientes que têm permissão para acessar.

O trecho que apresenta problema é:

```typescript
await trocarPara(page, MARCOS);
expect(await totalPainel(page)).toBe('1');
```

Em palavras simples:

1. O teste troca o usuário para Marcos.
2. Abre o painel dele.
3. Confere quantos pacientes aparecem.
4. O esperado é encontrar exatamente 1 paciente.

**O problema:** algumas vezes o sistema mostra 0 pacientes, mesmo quando deveria mostrar 1. Quando o Playwright tenta novamente, o teste geralmente passa.

Isso indica que pode existir algum problema de tempo: o teste verifica o resultado antes de o sistema terminar de carregar as informações.

## 2. O que já descobrimos?

### A. Painel principal (DashboardPage.tsx)

Encontramos que:

- O painel começa com os dados zerados.
- Ele precisa consultar sete fontes de informação para montar as estatísticas.
- Essas consultas acontecem simultaneamente.
- O total de pacientes só é atualizado quando todas terminam.
- O indicador de carregamento está associado à lista de pacientes recentes, e não diretamente ao número exibido no card de estatísticas.

**O que isso significa?**

O painel pode mostrar zero temporariamente, mesmo quando existem pacientes cadastrados.

Essa é uma das principais suspeitas para a falha.

### B. Autenticação (App.tsx e AuthService.ts)

Descobrimos que:

- A verificação de login acontece em mais de um lugar.
- O sistema utiliza React StrictMode.
- O logout remove a sessão armazenada.
- Não existe um controle global que impeça uma verificação antiga de login de terminar depois de uma troca de usuário.

**O que isso significa?**

Existe a possibilidade de uma verificação antiga terminar fora de ordem e interferir na identificação do usuário atual.

Ainda não comprovamos que isso esteja acontecendo.

### C. Armazenamento (LocalStorageAdapter.ts)

Verificamos que:

- Os dados são lidos diretamente do armazenamento do navegador.
- As operações internas são síncronas.
- Não encontramos cache ou fila de operações.
- Os métodos são declarados como assíncronos, mas isso não significa que a leitura física seja necessariamente demorada.

**O que isso significa?**

Não encontramos evidência de que o armazenamento esteja demorando para responder ou criando uma disputa durante a leitura física.

### D. Repositórios (PatientRepository.ts e BaseRepository.ts)

Os repositórios são responsáveis por buscar e organizar os dados do sistema.

Descobrimos que:

- O repositório de pacientes utiliza a implementação geral do BaseRepository.
- O método `findAll()` busca os dados e depois aplica filtros.
- Se o armazenamento não retornar uma lista válida, o método devolve uma lista vazia.
- Não existe mecanismo de sincronização entre operações simultâneas.
- Não existe proteção contra leituras antigas ou respostas fora de ordem.

**O que isso significa?**

Ainda existe a possibilidade de operações simultâneas interferirem no resultado, mas não encontramos uma prova de que essa seja a causa da falha.

### E. Adaptadores de armazenamento (adapters/index.ts)

Verificamos como o sistema escolhe onde armazenar os dados.

Descobrimos que:

- Na versão web, utilizada pelo Playwright, o sistema escolhe o LocalStorage.
- Na versão Tauri, utiliza SQLite.
- Existe uma referência compartilhada de armazenamento chamada `storage`.
- Todos os repositórios principais utilizam essa mesma referência.

Também verificamos se os testes trocam o adaptador durante a execução.

Não encontramos chamadas diretas de `setStorage()` ou `resetStorage()` dentro das pastas `src` e `tests`.

**Conclusão:** não encontramos evidência de que cada repositório esteja utilizando um armazenamento diferente.

### F. Instâncias dos repositórios

Identificamos sete repositórios principais:

- Pacientes.
- Profissionais.
- Serviços.
- Agendamentos.
- Evoluções.
- Consentimentos.
- Configurações.

Eles são exportados como instâncias reutilizáveis.

Também verificamos o `ConfigRepository.ts`. Ele importa a mesma referência de armazenamento, mas utiliza uma implementação própria, sem herdar do BaseRepository.

Essa diferença não representa, por si só, um problema.

---

## 3. Quais são as principais suspeitas?

Até agora, temos três possibilidades principais:

| Suspeita | Explicação | Situação |
|---|---|---|
| Teste verifica cedo demais | O teste consulta o número antes de o painel terminar de atualizar. | Forte |
| Carregamentos simultâneos | Uma consulta antiga pode terminar depois de uma consulta mais recente. | Em investigação |
| Troca de usuário | Uma verificação antiga de login pode interferir no novo usuário. | Em investigação |

**Importante:** nenhuma dessas possibilidades foi confirmada como causa definitiva.

## 4. O que já foi feito?

Durante esta etapa:

- Foram examinados os arquivos responsáveis pelo painel.
- Foi analisado o processo de autenticação.
- Foi verificado o armazenamento local.
- Foram examinados os métodos de leitura dos repositórios.
- Foi verificada a criação das instâncias dos repositórios.
- Foi pesquisado o uso de funções que trocam ou reinicializam o armazenamento.

**Nenhum arquivo foi editado. Nenhuma correção foi aplicada. Nenhum teste foi executado nesta etapa.**

## 5. Onde paramos?

O último arquivo analisado foi:

`src/repositories/ConfigRepository.ts`

Foi verificado seu início, incluindo os imports e a implementação de algumas funções auxiliares.

O próximo passo deve ser retomar a investigação na camada de inicialização dos dados e no carregamento do Dashboard.

Precisamos entender principalmente:

1. Em que momento os dados iniciais são preparados.
2. Se o Dashboard pode começar a carregar antes da inicialização terminar.
3. Se existem chamadas simultâneas de carregamento.
4. Se uma resposta antiga pode substituir os dados de um carregamento mais recente.

## 6. Instruções para quem vai continuar

Antes de começar, respeite estas regras:

- Não modificar nenhum arquivo.
- Não corrigir código ainda.
- Não executar testes sem autorização.
- Não alterar configurações.
- Enviar apenas um comando PowerShell por vez.
- Aguardar a saída do usuário antes de enviar o próximo comando.
- A cada dez comandos, produzir um novo resumo de continuidade.

O objetivo continua sendo descobrir a verdadeira causa da falha antes de propor qualquer correção.

---

**Resumo final:** encontramos evidências de que o painel pode exibir temporariamente zero pacientes enquanto ainda está carregando os dados. Também identificamos possíveis problemas de concorrência no carregamento e na autenticação. A investigação deve continuar até que a causa seja comprovada, sem fazer alterações prematuras no projeto.
