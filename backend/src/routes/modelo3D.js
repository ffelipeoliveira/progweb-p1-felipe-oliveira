import { Router } from 'express';
import { modelo3DController } from '../controllers/modelo3DController.js';

const router = Router();

router.get('/', modelo3DController.listar);
router.get('/:id', modelo3DController.buscarPorId);
router.post('/', modelo3DController.criar);
router.put('/:id', modelo3DController.atualizar);
router.delete('/:id', modelo3DController.remover);

export default router;
