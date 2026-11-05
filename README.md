# NEXO CAUSAL — servidor MCP

Servidor [MCP (Model Context Protocol)](https://modelcontextprotocol.io) do [NEXO CAUSAL](https://nexocausal.eng.br), site de perícia e ciência forense pelo mundo, em português do Brasil.

Só leitura, sem autenticação, publicado no [registro oficial de MCP](https://registry.modelcontextprotocol.io) como `br.eng.nexocausal/pericia`.

- **Endpoint (Streamable HTTP):** `https://nexocausal.eng.br/mcp`
- **Server Card:** `https://nexocausal.eng.br/mcp/server-card`
- **Catálogo para agentes (AI Catalog):** `https://nexocausal.eng.br/.well-known/ai-catalog.json`
- **Revisões do protocolo:** 2026-07-28 (sem sessão, `server/discover`), 2025-11-25, 2025-06-18 e 2025-03-26 (`initialize`)

## Ferramentas

| Ferramenta | O que faz |
| --- | --- |
| `buscar_artigos` | Busca artigos por palavras (português ou inglês) no título, no resumo e nos marcadores |
| `ler_artigo` | Devolve o texto completo de um artigo em Markdown, com data, assunto, fonte original e forma de citar |
| `artigos_recentes` | Lista os artigos mais recentes, de todos os assuntos ou de um só |
| `listar_assuntos` | Lista os assuntos com o número de artigos |
| `consultar_glossario` | Procura termos de perícia no glossário (definição, equivalente em inglês e artigos) |

## Como conectar

Em qualquer cliente MCP que aceite servidor remoto, use o endereço `https://nexocausal.eng.br/mcp`. Exemplo de configuração:

```json
{
  "mcpServers": {
    "nexo-causal": { "type": "http", "url": "https://nexocausal.eng.br/mcp" }
  }
}
```

Teste rápido com `curl`:

```bash
curl -s https://nexocausal.eng.br/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"buscar_artigos","arguments":{"consulta":"incêndio bateria de lítio","limite":3}}}'
```

## Código

`mcp.js` é o módulo usado pelo Worker da Cloudflare que serve o site. Ele lê os arquivos gerados no build do site (`/dados/artigos.json`, `/dados/glossario.json` e `/md/artigos/<artigo>.md`) pelo binding `ASSETS` e responde JSON-RPC sem estado. O Worker chama `mcp(request, env)` para os caminhos `/mcp` e `/mcp/*`.

## Citação

Ao usar o conteúdo, cite o NEXO CAUSAL com o título, a data e o endereço do artigo, e a fonte original informada nele. Correções: pistas@nexocausal.eng.br.

---

*English:* read-only MCP server for NEXO CAUSAL, a Brazilian Portuguese site on forensic science and expert evidence worldwide. Remote endpoint `https://nexocausal.eng.br/mcp` (Streamable HTTP, no auth). Registry name `br.eng.nexocausal/pericia`.
