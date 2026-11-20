import { modelo3DService } from '../services/modelo3DService.js';

export const modelo3DController = {
  listar(req, res) {
    res.json(modelo3DService.listar());
  },

  buscarPorId(req, res) {
    res.json(modelo3DService.buscarPorId(Number(req.params.id)));
  },

  criar(req, res) {
    const novoModelo3D = modelo3DService.criar(req.body);
    res.status(201).json(novoModelo3D);
  },

  atualizar(req, res) {
    res.json(modelo3DService.atualizar(Number(req.params.id), req.body));
  },

  remover(req, res) {
    modelo3DService.remover(Number(req.params.id));
    res.status(204).end();
  },
};
