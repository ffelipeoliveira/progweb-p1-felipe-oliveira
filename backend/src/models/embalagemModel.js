import { db } from '../db.js';

function mapearEmbalagem(linha) {
  if (!linha) return null;
  return { ...linha, opcionais: JSON.parse(linha.opcionais) };
}

export const embalagemModel = {
  listar() {
    return db
      .prepare('SELECT id, custo, tamanho, opcionais FROM embalagens ORDER BY id')
      .all()
      .map(mapearEmbalagem);
  },

  buscarPorId(id) {
    const linha = db
      .prepare('SELECT id, custo, tamanho, opcionais FROM embalagens WHERE id = ?')
      .get(id);
    return mapearEmbalagem(linha);
  },

  inserir({ custo, tamanho, opcionais = [] }) {
    const resultado = db
      .prepare('INSERT INTO embalagens (custo, tamanho, opcionais) VALUES (?, ?, ?)')
      .run(custo, tamanho, JSON.stringify(opcionais));
    return this.buscarPorId(Number(resultado.lastInsertRowid));
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const atualizado = { ...atual, ...dados, id };
    db.prepare('UPDATE embalagens SET custo = ?, tamanho = ?, opcionais = ? WHERE id = ?').run(
      atualizado.custo,
      atualizado.tamanho,
      JSON.stringify(atualizado.opcionais),
      id,
    );
    return this.buscarPorId(id);
  },

  remover(id) {
    const resultado = db.prepare('DELETE FROM embalagens WHERE id = ?').run(id);
    return resultado.changes > 0;
  },
};
