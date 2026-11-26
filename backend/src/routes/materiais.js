import { Router } from 'express';
import { materialController } from '../controllers/materialController.js';

const router = Router();

router.get('/', materialController.listar);
router.get('/:id', materialController.buscarPorId);
router.post('/', materialController.criar);
router.put('/:id', materialController.atualizar);
router.delete('/:id', materialController.remover);

export default router;
