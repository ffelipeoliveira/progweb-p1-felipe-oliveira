import { Router } from 'express';
import { impressaoController } from '../controllers/impressaoController.js';

const router = Router();

router.get('/', impressaoController.listar);
router.get('/:id', impressaoController.buscarPorId);
router.post('/', impressaoController.criar);
router.put('/:id', impressaoController.atualizar);
router.delete('/:id', impressaoController.remover);

export default router;
