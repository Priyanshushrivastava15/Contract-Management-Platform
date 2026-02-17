const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { Blueprint, Contract, User } = require('./models');

const app = express();

// --- UPDATED CORS CONFIGURATION ---
app.use(cors({
  origin: ["https://contract-management-platform-flax.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

// --- AUTH MIDDLEWARE ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) { res.status(401).json({ error: "Invalid Session" }); }
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.json({ message: "Registered Successfully" });
  } catch (err) { res.status(400).json({ error: "User already exists" }); }
});

app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !await bcrypt.compare(req.body.password, user.password)) 
    return res.status(401).json({ error: "Invalid Credentials" });
  
  const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET);
  res.json({ token, user: { name: user.name, email: user.email } });
});

// --- BLUEPRINT ROUTES ---
app.post('/api/blueprints', authenticate, async (req, res) => {
  try {
    const blueprint = new Blueprint({ ...req.body, createdBy: req.user.id });
    await blueprint.save();
    res.status(201).json(blueprint);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/blueprints', authenticate, async (req, res) => {
  try {
    const bps = await Blueprint.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(bps);
  } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.delete('/api/blueprints/:id', authenticate, async (req, res) => {
  try {
    const bp = await Blueprint.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!bp) return res.status(404).json({ error: "Blueprint not found" });
    res.json({ message: "Blueprint deleted" });
  } catch (err) { res.status(500).json({ error: "Deletion failed" }); }
});

// --- CONTRACT ROUTES ---
app.post('/api/contracts', authenticate, async (req, res) => {
  try {
    const bp = await Blueprint.findById(req.body.blueprintId);
    if (!bp) return res.status(404).json({ error: "Blueprint not found" });

    const contract = new Contract({
      name: req.body.name,
      blueprintId: bp._id,
      createdBy: req.user.id,
      fields: bp.fields.map(f => ({ ...f.toObject(), value: f.value || "" })),
      status: 'CREATED'
    });
    await contract.save();
    res.status(201).json(contract);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/contracts', authenticate, async (req, res) => {
  try {
    const contracts = await Contract.find({ createdBy: req.user.id })
      .populate('blueprintId', 'name')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.patch('/api/contracts/:id/status', authenticate, async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!contract) return res.status(404).json({ error: "Not found" });
    
    contract.statusHistory.push({ from: contract.status, to: req.body.nextStatus, updatedBy: req.user.id });
    contract.status = req.body.nextStatus;
    await contract.save();
    res.json(contract);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/contracts/:id', authenticate, async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (['LOCKED', 'REVOKED'].includes(contract.status)) 
        return res.status(403).json({ error: "Immutable" });
    contract.fields = req.body.fields;
    await contract.save();
    res.json(contract);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 Production Server on ${PORT}`)))
  .catch(err => console.error("DB Connection Error:", err));