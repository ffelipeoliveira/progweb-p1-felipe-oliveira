import { materialService } from '../services/materialService.js';

export const materialController = {
  listar(req, res) {
    res.json(materialService.listar());
  },

  buscarPorId(req, res) {
    res.json(materialService.buscarPorId(Number(req.params.id)));
  },

  criar(req, res) {
    const novoMaterial = materialService.criar(req.body);
    res.status(201).json(novoMaterial);
  },

  atualizar(req, res) {
    res.json(materialService.atualizar(Number(req.params.id), req.body));
  },

  remover(req, res) {
    materialService.remover(Number(req.params.id));
    res.status(204).end();
  },
};
