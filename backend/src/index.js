const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== MongoDB Connection =====
mongoose
  .connect(
    process.env.MONGO_URI || 'mongodb://mongodb:27017/employee_management',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// ===== Employee Model =====
const employeeSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name:  { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    gender:     { type: String, required: true },
    salary:     { type: Number, required: true },
  },
  { timestamps: true }
);

const Employee = mongoose.model('Employee', employeeSchema);

// ===== Basic API health route =====
app.get('/api', (req, res) => {
  res.json({ message: 'Employee Management API is working!' });
});

// Health check (used by frontend Home page)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ===== CRUD ROUTES =====

// CREATE employee
app.post('/api/employees', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const saved = await employee.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating employee:', err);
    res
      .status(400)
      .json({ error: 'Failed to create employee', details: err.message });
  }
});

// READ all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// SEARCH employees by name or email
// (Important: this MUST be BEFORE the :id routes)
app.get('/api/employees/search', async (req, res) => {
  try {
    const { q } = req.query; // single query param
    const regex = new RegExp(q || '', 'i');
    const employees = await Employee.find({
      $or: [
        { first_name: regex },
        { last_name: regex },
        { email: regex },
      ],
    });
    res.json(employees);
  } catch (err) {
    console.error('Error searching employees:', err);
    res.status(500).json({ error: 'Failed to search employees' });
  }
});

// READ one employee by ID
app.get('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// UPDATE employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Error updating employee:', err);
    res
      .status(400)
      .json({ error: 'Failed to update employee', details: err.message });
  }
});

// DELETE employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res
      .status(400)
      .json({ error: 'Failed to delete employee', details: err.message });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
