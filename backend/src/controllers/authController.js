const { User, Store, Rating } = require('../models');
const {
  hashPassword,
  comparePassword,
  generateToken,
  sanitizeUser,
} = require('../utils/helpers');

const signup = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      address,
      password: await hashPassword(password),
      role: 'USER',
    });

    const token = generateToken(user);
    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!(await comparePassword(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await hashPassword(password);
    await user.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};

module.exports = { signup, login, getMe, updatePassword };
