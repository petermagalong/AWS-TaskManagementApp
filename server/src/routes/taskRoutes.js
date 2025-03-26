const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.post('/tasks', taskController.createTask);
router.get('/tasks/:id', taskController.getTaskById);
router.delete('/tasks/:id', taskController.deleteTaskById);
router.put('/tasks/:id', taskController.updateTask);
router.get('/tasks', taskController.getAllTasks);

module.exports = router;