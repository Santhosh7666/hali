import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: null
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  settings: {
    theme: { type: String, default: 'Light Mode' },
    language: { type: String, default: 'English (US)' },
    currency: { type: String, default: 'USD ($)' },
    autoSave: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
