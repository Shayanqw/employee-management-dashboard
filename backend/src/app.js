const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== Health =====
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ===== Employee Model =====
const employeeSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name:  { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    position:   { type: String, required: true },
    salary:     { type: Number, required: true },
  },
  { timestamps: true }
);

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

// ===== Routes =====

// Get all employees
app.get('/api/employees', async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Search employees
app.get('/api/employees/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');
    const employees = await Employee.find({
      $or: [
        { first_name: regex },
        { last_name: regex },
        { email: regex },
        { position: regex },
      ],
    }).limit(25);

    res.json(employees);
  } catch (err) {
    console.error('Error searching employees:', err);
    res.status(500).json({ error: 'Failed to search employees' });
  }
});

// Create employee
app.post('/api/employees', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(400).json({ error: 'Failed to create employee', details: err.message });
  }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(400).json({ error: 'Failed to update employee', details: err.message });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(400).json({ error: 'Failed to delete employee', details: err.message });
  }
});

module.exports = { app, Employee };
