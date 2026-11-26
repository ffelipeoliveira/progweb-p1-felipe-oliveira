import { Router } from 'express';
import { impressoraController } from '../controllers/impressoraController.js';

const router = Router();

router.get('/', impressoraController.listar);
router.get('/:id', impressoraController.buscarPorId);
router.post('/', impressoraController.criar);
router.put('/:id', impressoraController.atualizar);
router.delete('/:id', impressoraController.remover);

export default router;
