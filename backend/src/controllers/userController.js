const { Op, fn, col } = require('sequelize');
const { Store, Rating } = require('../models');

const listStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const where = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

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
      ],
      group: ['Store.id'],
      order: [[sortBy === 'rating' ? fn('AVG', col('ratings.rating')) : sortBy, sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
      subQuery: false,
    });

    const userRatings = await Rating.findAll({
      where: { user_id: req.user.id },
      attributes: ['store_id', 'rating'],
    });
    const ratingMap = Object.fromEntries(userRatings.map((r) => [r.store_id, r.rating]));

    const result = stores.map((store) => {
      const data = store.toJSON();
      return {
        id: data.id,
        name: data.name,
        address: data.address,
        email: data.email,
        overallRating: data.averageRating
          ? Number(Number(data.averageRating).toFixed(2))
          : null,
        userRating: ratingMap[data.id] ?? null,
      };
    });

    if (sortBy === 'name' || sortBy === 'address') {
      // already sorted by SQL
    } else if (sortBy === 'overallRating') {
      result.sort((a, b) => {
        const av = a.overallRating ?? -1;
        const bv = b.overallRating ?? -1;
        return sortOrder.toUpperCase() === 'DESC' ? bv - av : av - bv;
      });
    }

    return res.json({ stores: result });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list stores', error: error.message });
  }
};

const submitRating = async (req, res) => {
  try {
    const storeId = Number(req.params.storeId);
    const { rating } = req.body;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const existing = await Rating.findOne({
      where: { user_id: req.user.id, store_id: storeId },
    });

    if (existing) {
      return res.status(409).json({
        message: 'You already rated this store. Use update instead.',
        rating: existing,
      });
    }

    const created = await Rating.create({
      user_id: req.user.id,
      store_id: storeId,
      rating,
    });

    return res.status(201).json({ message: 'Rating submitted', rating: created });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};

const updateRating = async (req, res) => {
  try {
    const storeId = Number(req.params.storeId);
    const { rating } = req.body;

    const existing = await Rating.findOne({
      where: { user_id: req.user.id, store_id: storeId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'No rating found to update' });
    }

    existing.rating = rating;
    await existing.save();

    return res.json({ message: 'Rating updated', rating: existing });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update rating', error: error.message });
  }
};

module.exports = { listStores, submitRating, updateRating };
