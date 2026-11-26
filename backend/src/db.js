import { DatabaseSync } from 'node:sqlite';

// O banco inteiro é um arquivo. Se não existir, o SQLite cria.
const arquivo = process.env.DB_FILE ?? 'banco.db';
export const db = new DatabaseSync(arquivo);

// No SQLite a checagem de chave estrangeira vem desligada.
// Tem de ligar a cada conexão.
db.exec('PRAGMA foreign_keys = ON;');

// O schema. IF NOT EXISTS: este arquivo roda toda vez que o servidor sobe.
db.exec(`
  CREATE TABLE IF NOT EXISTS impressoras (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo TEXT NOT NULL,
    marca TEXT NOT NULL,
    area_de_impressao TEXT NOT NULL
  );

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
    tempo_de_impressao REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS impressoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo_3d_id INTEGER NOT NULL REFERENCES modelos3d(id),
    custo REAL NOT NULL,
    tamanho TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS embalagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    custo REAL NOT NULL,
    tamanho TEXT NOT NULL,
    opcionais TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    preco REAL NOT NULL,
    custo REAL NOT NULL,
    lucro REAL NOT NULL
  );
`);
