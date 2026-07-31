# Instruções para agentes de IA

## Graphify

Este projeto possui um mapa estrutural gerado pelo Graphify dentro da pasta `graphify-out/`.

Antes de alterar qualquer código:

1. Consulte `graphify-out/GRAPH_REPORT.md` para entender a arquitetura geral.
2. Use `graphify-out/graph.json` apenas quando precisar investigar relações específicas entre arquivos, componentes, funções ou dependências.
3. Não leia todo o projeto indiscriminadamente.
4. Abra somente os arquivos-fonte relacionados à solicitação.
5. Verifique possíveis impactos em imports, hooks, serviços, componentes e dependências antes de editar.
6. Não altere manualmente arquivos dentro de `graphify-out/`.

## Atualização do grafo

Caso o código tenha mudado e o grafo esteja desatualizado, execute na raiz do projeto:

```powershell
graphify . --update --code-only

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
