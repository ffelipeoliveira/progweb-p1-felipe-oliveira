import { impressaoService } from '../services/impressaoService.js';

export const impressaoController = {
  listar(req, res) {
    res.json(impressaoService.listar());
  },

  buscarPorId(req, res) {
    res.json(impressaoService.buscarPorId(Number(req.params.id)));
  },

  criar(req, res) {
    const novaImpressao = impressaoService.criar(req.body);
    res.status(201).json(novaImpressao);
  },

  atualizar(req, res) {
    res.json(impressaoService.atualizar(Number(req.params.id), req.body));
  },

  remover(req, res) {
    impressaoService.remover(Number(req.params.id));
    res.status(204).end();
  },
};
