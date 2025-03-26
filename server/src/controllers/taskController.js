const TaskModel = require('../models/taskModel');

exports.createTask = async (req, res) => {
    try {
        const result = await TaskModel.createTask(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const result = await TaskModel.getTaskById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTaskById = async (req, res) => {
    try {
        const result = await TaskModel.deleteTaskById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const result = await TaskModel.updateTask(req.params.id, req.body);
        console.log('updateTask');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        console.log('getAllTasks');
        const result = await TaskModel.getAllTasks();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};