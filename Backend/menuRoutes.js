const express = require('express');
const menuController = require('./menuController');
const auth = require('./auth');

const router = express.Router();

router.post('/', auth, menuController.createMenuItem);
router.get('/', menuController.getMenuItems);
router.get('/:id', menuController.getMenuItemById);
router.put('/:id', auth, menuController.updateMenuItem);
router.delete('/:id', auth, menuController.deleteMenuItem);
router.patch('/:id/toggle-availability', auth, menuController.toggleAvailability);

module.exports = router;
