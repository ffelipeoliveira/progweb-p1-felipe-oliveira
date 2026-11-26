import { Router } from 'express';
import { embalagemController } from '../controllers/embalagemController.js';

const router = Router();

router.get('/', embalagemController.listar);
router.get('/:id', embalagemController.buscarPorId);
router.post('/', embalagemController.criar);
router.put('/:id', embalagemController.atualizar);
router.delete('/:id', embalagemController.remover);

export default router;
