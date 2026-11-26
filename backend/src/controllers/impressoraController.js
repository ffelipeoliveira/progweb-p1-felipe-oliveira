import { impressoraService } from '../services/impressoraService.js';

export const impressoraController = {
  listar(req, res) {
    res.json(impressoraService.listar());
  },

  buscarPorId(req, res) {
    res.json(impressoraService.buscarPorId(Number(req.params.id)));
  },

  criar(req, res) {
    const novaImpressora = impressoraService.criar(req.body);
    res.status(201).json(novaImpressora);
  },

  atualizar(req, res) {
    res.json(impressoraService.atualizar(Number(req.params.id), req.body));
  },

  remover(req, res) {
    impressoraService.remover(Number(req.params.id));
    res.status(204).end();
  },
};
