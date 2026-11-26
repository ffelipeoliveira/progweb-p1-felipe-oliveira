import { db } from '../db.js';

export const vendaModel = {
  listar() {
    return db.prepare('SELECT id, preco, custo, lucro FROM vendas ORDER BY id').all();
  },

  buscarPorId(id) {
    return (
      db.prepare('SELECT id, preco, custo, lucro FROM vendas WHERE id = ?').get(id) ?? null
    );
  },

  inserir({ preco, custo, lucro }) {
    const resultado = db
      .prepare('INSERT INTO vendas (preco, custo, lucro) VALUES (?, ?, ?)')
      .run(preco, custo, lucro);
    return this.buscarPorId(Number(resultado.lastInsertRowid));
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const atualizado = { ...atual, ...dados, id };
    db.prepare('UPDATE vendas SET preco = ?, custo = ?, lucro = ? WHERE id = ?').run(
      atualizado.preco,
      atualizado.custo,
      atualizado.lucro,
      id,
    );
    return this.buscarPorId(id);
  },

  remover(id) {
    const resultado = db.prepare('DELETE FROM vendas WHERE id = ?').run(id);
    return resultado.changes > 0;
  },
};
