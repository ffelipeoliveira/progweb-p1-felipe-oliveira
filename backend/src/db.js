import { DatabaseSync } from 'node:sqlite';

// O banco inteiro é um arquivo. Se não existir, o SQLite cria.
const arquivo = process.env.DB_FILE ?? 'banco.db';
export const db = new DatabaseSync(arquivo);

// No SQLite a checagem de chave estrangeira vem desligada.
// Tem de ligar a cada conexão.
db.exec('PRAGMA foreign_keys = ON;');

// O schema. IF NOT EXISTS: este arquivo roda toda vez que o servidor sobe.
db.exec(`
  CREATE TABLE IF NOT EXISTS materiais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    marca TEXT NOT NULL,
    preco REAL NOT NULL,
    qtd_em_gramas REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS modelos3d (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    peso REAL NOT NULL,
    tamanho TEXT NOT NULL,
    url TEXT
  );

  CREATE TABLE IF NOT EXISTS impressoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo_3d_id INTEGER NOT NULL REFERENCES modelos3d(id),
    material_id INTEGER NOT NULL REFERENCES materiais(id),
    custo REAL NOT NULL,
    tamanho TEXT NOT NULL
  );
`);

const colunasModelos3d = db.prepare('PRAGMA table_info(modelos3d)').all();
if (!colunasModelos3d.some((coluna) => coluna.name === 'url')) {
  db.exec('ALTER TABLE modelos3d ADD COLUMN url TEXT');
}

// Migra bancos criados antes da remoção das entidades antigas.
db.exec('DROP TABLE IF EXISTS impressoras');
db.exec('DROP TABLE IF EXISTS embalagens');
db.exec('DROP TABLE IF EXISTS vendas');

const colunasModelos = db.prepare('PRAGMA table_info(modelos3d)').all();
if (colunasModelos.some((coluna) => coluna.name === 'tempo_de_impressao')) {
  db.exec('ALTER TABLE modelos3d DROP COLUMN tempo_de_impressao');
}

const colunasImpressoes = db.prepare('PRAGMA table_info(impressoes)').all();
if (!colunasImpressoes.some((coluna) => coluna.name === 'material_id')) {
  db.exec('ALTER TABLE impressoes ADD COLUMN material_id INTEGER');
}

// Dados de exemplo: só entram se o banco estiver vazio.
// No Render grátis o arquivo some a cada reinício; assim a demo nunca abre vazia.
const { total } = db.prepare('SELECT COUNT(*) AS total FROM modelos3d').get();
if (total === 0) {
  const r = db
    .prepare('INSERT INTO modelos3d (peso, tamanho) VALUES (?, ?)')
    .run('4', '40x90x5 cm');
  const material = db.prepare('SELECT id FROM materiais ORDER BY id LIMIT 1').get();
  let materialId = material?.id;
  if (!materialId) {
    const novoMaterial = db
      .prepare('INSERT INTO materiais (tipo, marca, preco, qtd_em_gramas) VALUES (?, ?, ?, ?)')
      .run('PLA', 'Exemplo', 120, 1000);
    materialId = Number(novoMaterial.lastInsertRowid);
  }
  db.prepare(`INSERT INTO impressoes (modelo_3d_id, material_id, custo, tamanho)
              VALUES (?, ?, ?, ?)`)
    .run(r.lastInsertRowid, materialId, 0.48, "40x90x5 cm");
}

