const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/',    authMiddleware, ctrl.getAll);
router.get('/:id', authMiddleware, ctrl.getById);
router.post('/',   authMiddleware, requireRole(['admin']), upload.single('imagen'), ctrl.create);
router.put('/:id', authMiddleware, requireRole(['admin']), upload.single('imagen'), ctrl.update);
router.delete('/:id', authMiddleware, requireRole(['admin']), ctrl.remove);

module.exports = router;
