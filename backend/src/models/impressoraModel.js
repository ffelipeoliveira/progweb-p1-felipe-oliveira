import { db } from '../db.js';

const campos = 'id, modelo, marca, area_de_impressao AS areaDeImpressao';

export const impressoraModel = {
  listar() {
    return db.prepare(`SELECT ${campos} FROM impressoras ORDER BY id`).all();
  },

  buscarPorId(id) {
    return db.prepare(`SELECT ${campos} FROM impressoras WHERE id = ?`).get(id) ?? null;
  },

  inserir({ modelo, marca, areaDeImpressao }) {
    const resultado = db
      .prepare(
        'INSERT INTO impressoras (modelo, marca, area_de_impressao) VALUES (?, ?, ?)',
      )
      .run(modelo, marca, areaDeImpressao);
    return this.buscarPorId(Number(resultado.lastInsertRowid));
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const atualizado = { ...atual, ...dados, id };
    db.prepare(
      'UPDATE impressoras SET modelo = ?, marca = ?, area_de_impressao = ? WHERE id = ?',
    ).run(atualizado.modelo, atualizado.marca, atualizado.areaDeImpressao, id);
    return this.buscarPorId(id);
  },

  remover(id) {
    const resultado = db.prepare('DELETE FROM impressoras WHERE id = ?').run(id);
    return resultado.changes > 0;
  },
};
