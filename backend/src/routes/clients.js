const router = require('express').Router();
const ctrl = require('../controllers/clientController');
const { authMiddleware } = require('../middleware/auth');

router.get('/',       authMiddleware, ctrl.getAll);
router.get('/:id',    authMiddleware, ctrl.getById);
router.post('/',      authMiddleware, ctrl.create);
router.put('/:id',    authMiddleware, ctrl.update);
router.delete('/:id', authMiddleware, ctrl.remove);

module.exports = router;
