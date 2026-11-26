import { embalagemService } from '../services/embalagemService.js';

export const embalagemController = {
  listar(req, res) {
    res.json(embalagemService.listar());
  },

  buscarPorId(req, res) {
    res.json(embalagemService.buscarPorId(Number(req.params.id)));
  },

  criar(req, res) {
    const novaEmbalagem = embalagemService.criar(req.body);
    res.status(201).json(novaEmbalagem);
  },

  atualizar(req, res) {
    res.json(embalagemService.atualizar(Number(req.params.id), req.body));
  },

  remover(req, res) {
    embalagemService.remover(Number(req.params.id));
    res.status(204).end();
  },
};
