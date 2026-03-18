import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });

  const options = {
    expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    await ActivityLog.create({
      user: user._id,
      action: 'USER_REGISTER',
      details: `User registered with email: ${email}`
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    await ActivityLog.create({
      user: user._id,
      action: 'USER_LOGIN',
      details: `User logged in: ${email}`
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, data: {} });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ 
    success: true, 
    user: {
      ...user.toObject(),
      id: user._id,
      password: undefined
    }
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, profileImage } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, profileImage },
      { new: true, runValidators: true }
    );

    await ActivityLog.create({
      user: req.user.id,
      action: 'PROFILE_UPDATED',
      details: `Profile updated: ${name} (${email})`
    });

    res.status(200).json({ 
      success: true, 
      user: {
        ...user.toObject(),
        id: user._id,
        password: undefined
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'PASSWORD_CHANGED',
      details: 'User changed their password'
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings: req.body },
      { new: true, runValidators: true }
    );

    await ActivityLog.create({
      user: req.user.id,
      action: 'SETTINGS_UPDATED',
      details: 'User updated their account settings'
    });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        id: user._id,
        password: undefined
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
