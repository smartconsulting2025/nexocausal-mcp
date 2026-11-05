// Canal MCP do NEXO CAUSAL (Model Context Protocol, Streamable HTTP em https://nexocausal.eng.br/mcp), só leitura.
// Atende clientes da revisão 2026-07-28 (sem sessão, server/discover) e das anteriores (initialize). Os dados saem dos arquivos do build:
// /dados/artigos.json, /dados/glossario.json e /md/artigos/<artigo>.md.
const SITE = 'https://nexocausal.eng.br';
const VERSOES = ['2026-07-28', '2025-11-25', '2025-06-18', '2025-03-26'];
const SERVIDOR = { name: 'br.eng.nexocausal/pericia', title: 'NEXO CAUSAL: perícia e ciência forense', version: '1.0.1', websiteUrl: SITE + '/' };
const INSTRUCOES = 'Artigos em português do Brasil sobre perícia e ciência forense pelo mundo (incêndios e explosões, falhas estruturais, eletricidade, perícia digital, reconhecimento facial, acidentes de trabalho e de trânsito, balística, toxicologia, cadeia de custódia, normas técnicas e prova pericial no tribunal). Use buscar_artigos para achar o assunto, ler_artigo para o texto completo e consultar_glossario para termos técnicos. Ao responder, cite o NEXO CAUSAL com o título, a data e o endereço do artigo, e a fonte original informada nele.';

const LEITURA = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const FERRAMENTAS = [
  { name: 'buscar_artigos', title: 'Buscar artigos', annotations: LEITURA,
    description: 'Busca artigos do NEXO CAUSAL por palavras (em português ou inglês) no título, no resumo e nos marcadores. Devolve título, data, assunto, resumo, fonte original e endereços (página e Markdown).',
    inputSchema: { type: 'object', properties: {
      consulta: { type: 'string', description: 'Palavras a buscar, ex.: "incêndio bateria de lítio" ou "reconhecimento facial erro".' },
      assunto: { type: 'string', description: 'Opcional: identificador do assunto (veja listar_assuntos), ex.: "eletricidade".' },
      limite: { type: 'integer', minimum: 1, maximum: 20, default: 8, description: 'Opcional: número máximo de artigos devolvidos (1 a 20, padrão 8).' } }, required: ['consulta'] } },
  { name: 'ler_artigo', title: 'Ler artigo', annotations: LEITURA,
    description: 'Devolve o texto completo de um artigo em Markdown, com data, assunto, fonte original e forma de citar.',
    inputSchema: { type: 'object', properties: { artigo: { type: 'string', description: 'Identificador do artigo (ex.: "aquecedores-incendio-distancia-segura-materiais-combustiveis-nite-japao") ou o endereço da página.' } }, required: ['artigo'] } },
  { name: 'artigos_recentes', title: 'Artigos recentes', annotations: LEITURA,
    description: 'Lista os artigos mais recentes, de todos os assuntos ou de um só.',
    inputSchema: { type: 'object', properties: { assunto: { type: 'string', description: 'Opcional: identificador do assunto.' }, limite: { type: 'integer', minimum: 1, maximum: 30, default: 10, description: 'Opcional: número de artigos devolvidos, do mais recente ao mais antigo (1 a 30, padrão 10).' } } } },
  { name: 'listar_assuntos', title: 'Listar assuntos', annotations: LEITURA,
    description: 'Lista os assuntos do NEXO CAUSAL com o identificador, o nome e o número de artigos.',
    inputSchema: { type: 'object', properties: {} } },
  { name: 'consultar_glossario', title: 'Consultar glossário', annotations: LEITURA,
    description: 'Procura termos de perícia no glossário do NEXO CAUSAL (definição, equivalente em inglês e artigos em que aparecem).',
    inputSchema: { type: 'object', properties: { termo: { type: 'string', description: 'Termo ou parte dele, em português ou inglês, ex.: "arco elétrico" ou "flashover".' }, limite: { type: 'integer', minimum: 1, maximum: 20, default: 5, description: 'Opcional: número máximo de termos devolvidos (1 a 20, padrão 5).' } }, required: ['termo'] } },
];

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, GET, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, mcp-protocol-version, mcp-method, mcp-name, mcp-session-id, authorization',
  'access-control-expose-headers': 'mcp-protocol-version' };
const json = (corpo, status = 200, tipo = 'application/json') =>
  new Response(JSON.stringify(corpo), { status, headers: { 'content-type': `${tipo}; charset=utf-8`, 'cache-control': 'no-store', ...CORS } });

export const SERVER_CARD = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
  ...SERVIDOR,
  description: 'Busca e leitura dos artigos do NEXO CAUSAL sobre perícia e ciência forense pelo mundo, em português do Brasil, com a fonte original de cada caso e o glossário de termos técnicos.',
  repository: { url: 'https://github.com/smartconsulting2025/nexocausal-mcp', source: 'github' },
  icons: [{ src: SITE + '/marca/nexocausal-quadrado-1000.png', mimeType: 'image/png', sizes: ['1000x1000'] }, { src: SITE + '/favicon.svg', mimeType: 'image/svg+xml', sizes: ['any'] }],
  remotes: [{ type: 'streamable-http', url: SITE + '/mcp', supportedProtocolVersions: VERSOES }],
};

export const AI_CATALOG = {
  specVersion: '1.0',
  host: { displayName: 'NEXO CAUSAL', identifier: 'nexocausal.eng.br', documentationUrl: SITE + '/llms.txt', logoUrl: SITE + '/marca/nexocausal-quadrado-1000.png' },
  entries: [
    { identifier: 'urn:air:nexocausal.eng.br:mcp:pericia', displayName: 'NEXO CAUSAL: perícia e ciência forense', type: 'application/mcp-server-card+json', mediaType: 'application/mcp-server-card+json',
      description: 'Servidor MCP só de leitura: busca, leitura dos artigos e glossário de perícia e ciência forense, em português do Brasil.',
      tags: ['perícia', 'ciência forense', 'forensic science', 'engenharia forense', 'investigação de incêndio', 'perícia digital'],
      representativeQueries: ['Quais casos recentes de incêndio causado por bateria de lítio foram investigados?', 'O que a perícia diz sobre erros de reconhecimento facial?', 'Explique o termo arco elétrico em perícia'],
      publisher: { identifier: 'nexocausal.eng.br', displayName: 'NEXO CAUSAL', identityType: 'dns' },
      url: SITE + '/mcp/server-card' },
    { identifier: 'urn:air:nexocausal.eng.br:llms:indice', displayName: 'NEXO CAUSAL: llms.txt', type: 'text/markdown', mediaType: 'text/markdown',
      description: 'Índice do site para modelos de IA, com páginas principais, assuntos e artigos recentes; o texto completo está em /llms-full.txt.',
      publisher: { identifier: 'nexocausal.eng.br', displayName: 'NEXO CAUSAL', identityType: 'dns' },
      url: SITE + '/llms.txt' },
  ],
};

const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const PALAVRAS_VAZIAS = new Set('a o as os de da do das dos e em no na nos nas um uma para por com sem que se ao the of and in on for to'.split(' '));

async function dados(env, request, arquivo) {
  const r = await env.ASSETS.fetch(new Request(new URL(arquivo, request.url)));
  if (!r.ok) throw new Error('dados indisponíveis');
  return r.json();
}

function resumoArtigo(a) {
  return { artigo: a.id, titulo: a.titulo, data: a.data.slice(0, 10), assunto: a.assunto, assuntoTitulo: a.assuntoTitulo, resumo: a.resumo,
    fonteOriginal: a.fonte, url: a.url, markdown: `${SITE}/md/artigos/${a.id}/` };
}

function texto(obj) {
  return { content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }], ...(typeof obj === 'string' ? {} : { structuredContent: obj }) };
}

async function chamar(nome, args, env, request) {
  args = args || {};
  if (nome === 'buscar_artigos') {
    const termos = semAcento(args.consulta).split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !PALAVRAS_VAZIAS.has(t));
    if (!termos.length) return { ...texto('Informe palavras para a busca.'), isError: true };
    const limite = Math.min(Math.max(parseInt(args.limite) || 8, 1), 20);
    const artigos = (await dados(env, request, '/dados/artigos.json')).filter((a) => !args.assunto || a.assunto === args.assunto);
    const achados = artigos.map((a) => {
      const t = semAcento(a.titulo), r = semAcento(a.resumo.join(' ')), m = semAcento(a.tags.join(' ') + ' ' + a.assuntoTitulo);
      let nota = 0, cobertos = 0;
      for (const p of termos) { const n = (t.includes(p) ? 3 : 0) + (m.includes(p) ? 2 : 0) + (r.includes(p) ? 1 : 0); nota += n; if (n) cobertos++; }
      return { a, nota: nota * (cobertos / termos.length) };
    }).filter((x) => x.nota > 0).sort((x, y) => y.nota - x.nota || y.a.data.localeCompare(x.a.data)).slice(0, limite);
    return texto({ consulta: args.consulta, total: achados.length, artigos: achados.map((x) => resumoArtigo(x.a)) });
  }
  if (nome === 'ler_artigo') {
    const id = String(args.artigo || '').trim().replace(/^https?:\/\/[^/]+/, '').replace(/^\/(md\/)?artigos\//, '').replace(/\/+$/, '');
    if (!/^[a-z0-9-]+$/.test(id)) return { ...texto('Identificador de artigo inválido.'), isError: true };
    const r = await env.ASSETS.fetch(new Request(new URL(`/md/artigos/${id}.md`, request.url)));
    if (!r.ok) return { ...texto(`Artigo "${id}" não encontrado. Use buscar_artigos para achar o identificador.`), isError: true };
    return texto(await r.text());
  }
  if (nome === 'artigos_recentes') {
    const limite = Math.min(Math.max(parseInt(args.limite) || 10, 1), 30);
    const artigos = (await dados(env, request, '/dados/artigos.json')).filter((a) => !args.assunto || a.assunto === args.assunto).slice(0, limite);
    return texto({ total: artigos.length, artigos: artigos.map(resumoArtigo) });
  }
  if (nome === 'listar_assuntos') {
    const conta = new Map();
    for (const a of await dados(env, request, '/dados/artigos.json')) {
      const s = conta.get(a.assunto) || { assunto: a.assunto, titulo: a.assuntoTitulo, artigos: 0, url: `${SITE}/assuntos/${a.assunto}/` };
      s.artigos++; conta.set(a.assunto, s);
    }
    return texto({ assuntos: [...conta.values()].sort((x, y) => y.artigos - x.artigos) });
  }
  if (nome === 'consultar_glossario') {
    const q = semAcento(args.termo).trim();
    if (!q) return { ...texto('Informe o termo.'), isError: true };
    const limite = Math.min(Math.max(parseInt(args.limite) || 5, 1), 20);
    const termos = (await dados(env, request, '/dados/glossario.json')).map((g) => {
      const t = semAcento(g.termo), e = semAcento(g.equivalente);
      const nota = t === q || e === q ? 3 : t.includes(q) || e.includes(q) ? 2 : semAcento(g.definicao).includes(q) ? 1 : 0;
      return { g, nota };
    }).filter((x) => x.nota).sort((x, y) => y.nota - x.nota).slice(0, limite);
    return texto({ termo: args.termo, resultados: termos.map(({ g }) => ({ termo: g.termo, equivalenteEmIngles: g.equivalente, definicao: g.definicao,
      artigos: g.artigos.slice(0, 5).map((id) => `${SITE}/artigos/${id}/`), glossario: `${SITE}/glossario/` })) });
  }
  return null;
}

const META_SERVIDOR = { 'io.modelcontextprotocol/serverInfo': { name: SERVIDOR.name, version: SERVIDOR.version } };
const ok = (id, result) => ({ jsonrpc: '2.0', id, result: { resultType: 'complete', ...result, _meta: { ...(result._meta || {}), ...META_SERVIDOR } } });
const erro = (id, code, message, data) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message, ...(data ? { data } : {}) } });

async function tratar(msg, env, request, versaoCabecalho) {
  if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return erro(msg && msg.id, -32600, 'Requisição JSON-RPC inválida.');
  const { id, method, params = {} } = msg;
  if (id === undefined || id === null) return null; // notificação: nada a responder
  const pedida = (params._meta && params._meta['io.modelcontextprotocol/protocolVersion']) || versaoCabecalho;
  if (pedida && method !== 'initialize' && !VERSOES.includes(pedida))
    return erro(id, -32022, 'Versão do protocolo não suportada.', { supported: VERSOES, requested: pedida });
  try {
    switch (method) {
      case 'initialize': {
        const v = VERSOES.includes(params.protocolVersion) ? params.protocolVersion : VERSOES[1];
        return ok(id, { protocolVersion: v, capabilities: { tools: { listChanged: false } }, serverInfo: SERVIDOR, instructions: INSTRUCOES });
      }
      case 'server/discover':
        return ok(id, { supportedVersions: VERSOES, capabilities: { tools: { listChanged: false } }, instructions: INSTRUCOES, ttlMs: 3600000, cacheScope: 'public' });
      case 'ping':
        return ok(id, {});
      case 'tools/list':
        return ok(id, { tools: FERRAMENTAS, ttlMs: 3600000, cacheScope: 'public' });
      case 'tools/call': {
        const r = await chamar(params.name, params.arguments, env, request);
        if (!r) return erro(id, -32602, `Ferramenta desconhecida: ${params.name}`);
        return ok(id, r);
      }
      case 'resources/list': return ok(id, { resources: [], ttlMs: 3600000, cacheScope: 'public' });
      case 'resources/templates/list': return ok(id, { resourceTemplates: [], ttlMs: 3600000, cacheScope: 'public' });
      case 'prompts/list': return ok(id, { prompts: [], ttlMs: 3600000, cacheScope: 'public' });
      default: return erro(id, -32601, `Método não suportado: ${method}`);
    }
  } catch (e) {
    console.log('erro mcp', method, e && e.message);
    return erro(id, -32603, 'Erro interno ao consultar os artigos.');
  }
}

export async function mcp(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (url.pathname === '/mcp/server-card' || url.pathname === '/mcp/server-card/') return json(SERVER_CARD, 200, 'application/mcp-server-card+json');
  if (url.pathname !== '/mcp' && url.pathname !== '/mcp/') return json({ erro: 'Não encontrado.' }, 404);
  if (request.method === 'GET' && !(request.headers.get('accept') || '').includes('text/event-stream'))
    return new Response(`Canal MCP do NEXO CAUSAL (Streamable HTTP, só leitura). Conecte um cliente MCP a ${SITE}/mcp. Server Card: ${SITE}/mcp/server-card. Catálogo: ${SITE}/.well-known/ai-catalog.json\n`,
      { headers: { 'content-type': 'text/plain; charset=utf-8', ...CORS } });
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'POST, OPTIONS', ...CORS } });
  let corpo;
  try { corpo = await request.json(); } catch { return json(erro(null, -32700, 'JSON inválido.'), 400); }
  const versao = request.headers.get('mcp-protocol-version');
  if (Array.isArray(corpo)) {
    const respostas = (await Promise.all(corpo.map((m) => tratar(m, env, request, versao)))).filter(Boolean);
    return respostas.length ? json(respostas) : new Response(null, { status: 202, headers: CORS });
  }
  const resposta = await tratar(corpo, env, request, versao);
  if (!resposta) return new Response(null, { status: 202, headers: CORS });
  return json(resposta, resposta.error && resposta.error.code === -32022 ? 400 : 200);
}
