/* ============================================================================
   gerar-lista.js — gera a lista criptografada de convidados do convite.

   COMO USAR (precisa do Node.js instalado):
     1. Edite os GRUPOS abaixo. Cada grupo = um convite.
        O PRIMEIRO nome do grupo é o TITULAR: é o nome que a pessoa digita no convite.
        Os demais aparecem como acompanhantes na tela de confirmação.
     2. Coloque este arquivo na mesma pasta do index.html e rode:
          node gerar-lista.js
        Ele atualiza a lista dentro do index.html sozinho.
        (Sem index.html na pasta, ele grava lista-criptografada.txt para você colar no CONFIG.)

   O SAL precisa ser IGUAL ao rsvp.sal do index.html.
   ============================================================================ */
const fs = require('fs');
const crypto = require('crypto');

const SAL = 'mv-xv-2027';

const GRUPOS = [
  ['Antônio José Veloso'],
  ['Kacilene Veloso', 'José Vinicius Suzart', 'Marcus Veloso Suzart', 'Aressa Dias Adelar', 'Maurício Veloso Suzart', 'Millena Dias Adelar'],
  ['Mateus Veloso Suzart', 'Tamara Lopes', 'Maria Tereza'],
  ['Mariana Veloso', 'Lucas Gonçalves', 'Eduarda'],
  ['Lucilene Veloso', 'Francisco José Vieira'],
  ['Samuel Veloso Vieira', 'Madson'],
  ['Vitor Vieira', 'Ana Flavia', 'Laura'],
  ['Valdilene Veloso', 'Luis Fabio Almeida Magalhaes'],
  ['Luis Fernando Veloso', 'Keller Souane'],
  ['Maria Fernanda Veloso', 'Abraão'],
  ['Bárbara Veloso', 'Igor Matheus', 'Arthur Veloso Souza Rocha', 'Heitor Veloso Sousa Rocha', 'Melissa'],
  ['Antonio José Veloso Filho', 'Celine Almeida'],
  ['João Pedro Veloso', 'Valentina Veloso'],
  ['Marcelo Veloso', 'Bianca Veloso', 'Heitor Veloso', 'Luiza Veloso'],
  ['João Paulo Mendes Veloso', 'Terezinha Gonçalves Pereira Nunes'],
  ['José Alberto Veloso Neto', 'Alice'],
  ['Kamila Veloso', 'Diego Fonseca'],
  ['Silvio Ribeiro', 'Iracema Guedes Ribeiro', 'Vanusa Ribeiro'],
  ['Felipe Bezuska Ribeiro', 'Júlia Colla'],
  ['Sílvio Ribeiro Neto'],
  ['Ana Veloso'],
  ['Elane Veloso', 'Tales Veloso'],
  ['Élen Veloso', 'Charles', 'Felipe'],
  ['James Veloso', 'Edvania', 'Júlia Veloso'],
  ['Maria Nice Veloso', 'Joaquim Moura Ramos'],
  ['José Mendes Veloso Junior', 'Karina Ribeiro Caetano', 'Anne Caroline Ribeiro Veloso', 'Ana Lívia Ribeiro Caetano Veloso', 'Anna Laura Ribeiro Caetano Veloso', 'Carolina Mendes Magalhães'],
  ['Alisson Veloso', 'Carla Ribeiro Fonseca', 'Maria Soares'],
  ['Antônio Paulo Veloso', 'Marilda'],
  ['Elisangela', 'Gilberto Veloso'],
  ['Dey', 'Múcio Fiel Carvalho'],
  ['Angela Marileide', 'Johnny', 'Savio', 'Gustavo'],
  ['Angela Merícia', 'Salvador Ramos Júnior'],
  ['Aparecida Veloso', 'Hermes Veloso'],
  ['Greice Ione Mendes', 'Serginho', 'Emyle Mendes'],
  ['Liliany Mendes', 'Marcos Parreiras dos Santos', 'Letícia'],
  ['Lilia Mendes', 'Marcelo', 'Mariana'],
  ['Teodorica Mendes', 'Mauro Mendes', 'Maria Helena Mendes Ribeiro', 'Antonio Ribeiro Filho'],
  ['Carol Mendes', 'Datan Sousa Silva'],
  ['Zirlete Mendes', 'Hugo Rodrigues de Aquino'],
  ['Zirlene Mendes', 'Celso Ramiro Almeida Neto', 'Mariana Almeida'],
  ['Zuleide Mendes', 'Aluisio Mesquita'],
  ['Ley Mendes', 'José Carlos Ferreira Soares'],
  ['Nalva Mendes', 'José Gedeon Vieira', 'Guilherme Vieira'],
  ['Edna Mendes', 'João Batista Mendes', 'Anita Mendes', 'Lucas Mendes Ribeiro Filho'],
  ['Sarah Mendes Costa Lauton', 'Waldete Lauton', 'Lara Mendes Lauton', 'Maria Violeta Costa Mendes'],
  ['Kênia Mendes Medeiros', 'Ademir Medeiros', 'Ana Lívia Mendes Costa Medeiros'],
  ['Márcia Mendes', 'João Paulo Mendes'],
  ['Eduardo Leal', 'Arlete Sales'],
  ['Nádia Marques', 'Emanoel'],
  ['Sinara'],
  ['Celma Costa', 'José Vicente Gomes da Silva'],
  ['Eomar Alves da Silva', 'Helenice Ribeiro da Silva'],
  ['Ivanete França', 'Manoel França', 'Ana Vitória'],
  ['Adelza Rodrigues Vieira Liberato', 'Euclides Liberato Neto', 'Maria Fernanda Vieira Liberato', 'Marina Liberato Oliveira'],
  ['Quênia Almeida', 'Leandro Almeida', 'Júlia Almeida', 'Isabel Almeida'],
  ['Carluce Saraiva'],
  ['Elza Nascimento', 'Luis Fernando Nascimento'],
  ['Clécio', 'Agda', 'Maria Clara'],
  ['Daiane', 'Nilton', 'Júlia Lopes', 'Pedro'],
  ['Arthur Brito Rocha'],
  ['Laura Albuquerque'],
  ['Luiz Eduardo'],
  ['Luiza'],
  ['Cecília Braga', 'Analu'],
  ['Melissa Fiori', 'Fabiano', 'Melina Fiori', 'Marlon Fiori'],
  ['Raul Roger']
];

/* ---------------------------- NÃO PRECISA MEXER ---------------------------- */
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const idNome = n => crypto.createHash('sha256').update(SAL + '|' + n).digest('hex').slice(0, 32);

function cifrar(titularNorm, obj) {
  const key = crypto.pbkdf2Sync(titularNorm, SAL, 150000, 32, 'sha256');
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final(), c.getAuthTag()]);
  return Buffer.concat([iv, ct]).toString('base64');   // mesmo formato que o navegador lê
}

/* confere se há titulares repetidos */
const vistos = new Map();
let erro = false;
GRUPOS.forEach(g => {
  const n = norm(g[0]);
  if (vistos.has(n)) { console.error('ERRO: titular repetido: "' + g[0] + '" (igual a "' + vistos.get(n) + '")'); erro = true; }
  vistos.set(n, g[0]);
});
if (erro) process.exit(1);

const lista = GRUPOS.map(g => ({ h: idNome(norm(g[0])), d: cifrar(norm(g[0]), { t: g[0], a: g.slice(1) }) }));
const texto = 'convidados: [ ' + lista.map(x => JSON.stringify(x)).join(', ') + ' ],';

if (fs.existsSync('index.html')) {
  const html = fs.readFileSync('index.html', 'utf8');
  const re = /convidados:\s*\[[\s\S]*?\]\s*,(\s*\n\s*iconeImagem)/;
  if (!re.test(html)) { console.error('Não achei o campo "convidados" no index.html.'); process.exit(1); }
  fs.writeFileSync('index.html', html.replace(re, (m, resto) => texto + resto));
  console.log('index.html atualizado: ' + GRUPOS.length + ' convites, ' + GRUPOS.reduce((s, g) => s + g.length, 0) + ' pessoas.');
} else {
  fs.writeFileSync('lista-criptografada.txt', texto);
  console.log('Gravei lista-criptografada.txt (' + GRUPOS.length + ' convites). Cole no campo "convidados" do CONFIG.');
}
