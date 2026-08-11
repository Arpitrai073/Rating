const { Op, fn, col } = require('sequelize');
const { User, Store, Rating } = require('../models');
const { hashPassword, sanitizeUser, buildOrder } = require('../utils/helpers');

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);

    return res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load dashboard', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      address,
      password: await hashPassword(password),
      role,
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const where = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role) where.role = role;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: buildOrder(sortBy, sortOrder, ['name', 'email', 'address', 'role', 'created_at']),
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name'],
          required: false,
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: [],
              required: false,
            },
          ],
        },
      ],
    });

    const result = await Promise.all(
      users.map(async (user) => {
        const data = sanitizeUser(user);
        if (user.role === 'STORE_OWNER' && user.store) {
          const avg = await Rating.findOne({
            where: { store_id: user.store.id },
            attributes: [[fn('AVG', col('rating')), 'averageRating']],
            raw: true,
          });
          data.rating = avg?.averageRating
            ? Number(Number(avg.averageRating).toFixed(2))
            : null;
          data.storeName = user.store.name;
        }
        return data;
      })
    );

    return res.json({ users: result });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list users', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'email', 'address'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const data = sanitizeUser(user);
    if (user.role === 'STORE_OWNER' && user.store) {
      const avg = await Rating.findOne({
        where: { store_id: user.store.id },
        attributes: [[fn('AVG', col('rating')), 'averageRating']],
        raw: true,
      });
      data.rating = avg?.averageRating
        ? Number(Number(avg.averageRating).toFixed(2))
        : null;
    }

    return res.json({ user: data });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const existing = await Store.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Store email is already registered' });
    }

    if (owner_id) {
      const owner = await User.findByPk(owner_id);
      if (!owner) {
        return res.status(404).json({ message: 'Store owner not found' });
      }
      if (owner.role !== 'STORE_OWNER') {
        return res.status(400).json({ message: 'Selected user must have STORE_OWNER role' });
      }
      const owned = await Store.findOne({ where: { owner_id } });
      if (owned) {
        return res.status(400).json({ message: 'This owner already has a store' });
      }
    }

    const store = await Store.create({ name, email, address, owner_id: owner_id || null });
    return res.status(201).json({ message: 'Store created successfully', store });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create store', error: error.message });
  }
};

const listStoresAdmin = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const where = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const direction = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const allowed = ['name', 'email', 'address', 'created_at'];
    const orderField = allowed.includes(sortBy) ? sortBy : 'name';

    const stores = await Store.findAll({
      where,
      attributes: {
        include: [[fn('AVG', col('ratings.rating')), 'averageRating']],
      },
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: [],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
      group: ['Store.id', 'owner.id'],
      order:
        sortBy === 'rating'
          ? [[fn('AVG', col('ratings.rating')), direction]]
          : [[orderField, direction]],
      subQuery: false,
    });

    const result = stores.map((store) => {
      const data = store.toJSON();
      data.rating = data.averageRating
        ? Number(Number(data.averageRating).toFixed(2))
        : null;
      delete data.averageRating;
      return data;
    });

    return res.json({ stores: result });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list stores', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  listUsers,
  getUserById,
  createStore,
  listStoresAdmin,
};
