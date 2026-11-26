// Uso:  node gerar-lista.js     → imprime o bloco  convidados: [...]  para colar no CONFIG.rsvp do convite
// Edite só a LISTA abaixo. "nomes" = tudo que a pessoa pode digitar para abrir o convite (nome completo, apelido…).
// "titular" e "acompanhantes" = como aparecem na tela de confirmação.
const SAL = "mv-xv-2027";   // precisa ser IGUAL ao rsvp.sal do convite

const LISTA = [   // ⚠️ LISTA FICTÍCIA DE TESTE
  { nomes: ["Ana Paula Souza", "Ana Paula", "Paulinha"], titular: "Ana Paula Souza", acompanhantes: ["Carlos Souza", "Lívia Souza"] },
  { nomes: ["João Pedro Almeida", "João Pedro"],          titular: "João Pedro Almeida", acompanhantes: ["Marina Almeida"] },
  { nomes: ["Tia Lúcia", "Lúcia Ferreira"],               titular: "Lúcia Ferreira", acompanhantes: [] },
  { nomes: ["Roberto Lima", "Beto Lima"],                 titular: "Roberto Lima", acompanhantes: ["Sandra Lima", "Pedro Lima", "Julia Lima"] }
];

const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const enc = new TextEncoder(), sub = crypto.subtle, b64 = u => Buffer.from(u).toString("base64");
async function idDe(n) { return Buffer.from(await sub.digest("SHA-256", enc.encode(SAL + "|" + n))).toString("hex").slice(0, 32); }
async function chave(n) {
  const base = await sub.importKey("raw", enc.encode(n), "PBKDF2", false, ["deriveKey"]);
  return sub.deriveKey({ name: "PBKDF2", salt: enc.encode(SAL), iterations: 150000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
(async () => {
  const saida = [], vistos = new Map();
  for (const c of LISTA) for (const nome of c.nomes) {
    const n = norm(nome);
    if (vistos.has(n) && vistos.get(n) !== c) { console.error(`⚠️ Nome repetido em dois convites: "${nome}". Use o sobrenome para diferenciar.`); process.exit(1); }
    vistos.set(n, c);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await sub.encrypt({ name: "AES-GCM", iv }, await chave(n), enc.encode(JSON.stringify({ t: c.titular, a: c.acompanhantes }))));
    const junto = new Uint8Array(12 + ct.length); junto.set(iv); junto.set(ct, 12);
    saida.push({ h: await idDe(n), d: b64(junto) });
  }
  console.log("convidados: " + JSON.stringify(saida, null, 1).replace(/\n\s*/g, " ") + ",");
})();
