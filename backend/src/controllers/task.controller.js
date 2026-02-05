const { validationResult } = require('express-validator');
const { Task } = require('../models/Task');

async function createTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      owner: req.user.id,
    });

    return res.status(201).json({ task });
  } catch (err) {
    return next(err);
  }
}

async function getMyTasks(req, res, next) {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json({ tasks });
  } catch (err) {
    return next(err);
  }
}

async function getTaskById(req, res, next) {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, owner: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { title, description, status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, owner: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function getAllTasksAdmin(req, res, next) {
  try {
    const tasks = await Task.find()
      .populate('owner', 'email role')
      .sort({ createdAt: -1 });
    return res.json({ tasks });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasksAdmin,
};


