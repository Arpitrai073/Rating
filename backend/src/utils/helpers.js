const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => bcrypt.hash(password, 10);

const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

const sanitizeUser = (user) => {
  const data = user.toJSON ? user.toJSON() : { ...user };
  delete data.password;
  return data;
};

const buildOrder = (sortBy, sortOrder, allowedFields, defaultField = 'name') => {
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const direction = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  return [[field, direction]];
};

const likeFilter = (value) => (value ? { [require('sequelize').Op.like]: `%${value}%` } : undefined);

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  sanitizeUser,
  buildOrder,
  likeFilter,
};
