const mongoose = require('mongoose');

// --- USER SCHEMA (For Auth) ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// --- FIELD SCHEMA ---
const FieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['text', 'date', 'signature', 'checkbox'], required: true },
  label: { type: String, required: true },
  position: { x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
  value: { type: mongoose.Schema.Types.Mixed, default: "" }
});

// --- BLUEPRINT SCHEMA ---
const BlueprintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fields: [FieldSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// --- CONTRACT SCHEMA ---
const ContractSchema = new mongoose.Schema({
  name: { type: String, required: true },
  blueprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blueprint' },
  status: { 
    type: String, 
    enum: ['CREATED', 'APPROVED', 'SENT', 'SIGNED', 'LOCKED', 'REVOKED'],
    default: 'CREATED' 
  },
  fields: [FieldSchema],
  statusHistory: [{ 
    from: String, 
    to: String, 
    at: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Blueprint: mongoose.model('Blueprint', BlueprintSchema),
  Contract: mongoose.model('Contract', ContractSchema)
};