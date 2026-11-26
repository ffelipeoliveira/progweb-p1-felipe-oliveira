import { Router } from 'express';
import { vendaController } from '../controllers/vendaController.js';

const router = Router();

router.get('/', vendaController.listar);
router.get('/:id', vendaController.buscarPorId);
router.post('/', vendaController.criar);
router.put('/:id', vendaController.atualizar);
router.delete('/:id', vendaController.remover);

export default router;
