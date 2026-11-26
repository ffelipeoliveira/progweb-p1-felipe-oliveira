import { vendaService } from '../services/vendaService.js';

export const vendaController = {
  listar(req, res) {
    res.json(vendaService.listar());
  },

  buscarPorId(req, res) {
    res.json(vendaService.buscarPorId(Number(req.params.id)));
  },

  criar(req, res) {
    const novaVenda = vendaService.criar(req.body);
    res.status(201).json(novaVenda);
  },

  atualizar(req, res) {
    res.json(vendaService.atualizar(Number(req.params.id), req.body));
  },

  remover(req, res) {
    vendaService.remover(Number(req.params.id));
    res.status(204).end();
  },
};
