// Uso:  npm install qrcode   (só na primeira vez)
//       node gerar-qr.js
// Gera 1 QR code por convidado (PNG + SVG) na pasta ./qr-convidados e um links.csv
// Lê a LISTA direto do gerar-lista.js (que fica na mesma pasta), então só há uma lista para manter.

const fs = require("fs"), path = require("path"), QRCode = require("qrcode");

const URL_CONVITE = "https://deyvisonmarlondf-hash.github.io/convite-teste/";
const COR_QR = "#59000b";      // cor dos quadradinhos (escura, para o celular ler fácil)
const COR_FUNDO = "#FFFFFF";
const PASTA = path.join(__dirname, "qr-convidados");

// --- lê a LISTA do gerar-lista.js ---
const src = fs.readFileSync(path.join(__dirname, "gerar-lista.js"), "utf8");
const ini = src.indexOf("const LISTA = [");
const fim = src.indexOf("\n];", ini);
if (ini < 0 || fim < 0) { console.error("Não achei a LISTA no gerar-lista.js"); process.exit(1); }
const LISTA = eval("(" + src.slice(ini + "const LISTA = ".length, fim + 2) + ")");

const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const slug = s => norm(s).replace(/ /g, "-");

(async () => {
  fs.mkdirSync(PASTA, { recursive: true });
  const linhas = ["titular;link;arquivo"];
  for (const c of LISTA) {
    // nome usado no link: o titular (se ele for um dos nomes aceitos), senão o primeiro da lista
    const nome = c.nomes.some(n => norm(n) === norm(c.titular)) ? c.titular : c.nomes[0];
    // vai depois do # : não é enviado ao servidor e o convite lê no navegador
    const link = URL_CONVITE + "#c=" + encodeURIComponent(nome);
    const base = path.join(PASTA, slug(c.titular));
    const opc = { errorCorrectionLevel: "M", margin: 4, color: { dark: COR_QR, light: COR_FUNDO } };
    await QRCode.toFile(base + ".png", link, { ...opc, width: 1000 });
    fs.writeFileSync(base + ".svg", await QRCode.toString(link, { ...opc, type: "svg" }));
    linhas.push([c.titular, link, slug(c.titular)].join(";"));
    console.log("✔", c.titular);
  }
  fs.writeFileSync(path.join(PASTA, "links.csv"), "\ufeff" + linhas.join("\n"));
  console.log("\nPronto! Arquivos em:", PASTA);
})();
