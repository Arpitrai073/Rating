const { fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');

const getOwnerDashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { owner_id: req.user.id } });

    if (!store) {
      return res.status(404).json({ message: 'No store is linked to this owner account' });
    }

    const avg = await Rating.findOne({
      where: { store_id: store.id },
      attributes: [[fn('AVG', col('rating')), 'averageRating'], [fn('COUNT', col('id')), 'totalRatings']],
      raw: true,
    });

    const { sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const allowed = ['name', 'email', 'address', 'rating', 'created_at'];
    const field = allowed.includes(sortBy) ? sortBy : 'name';

    const ratings = await Rating.findAll({
      where: { store_id: store.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'address'],
        },
      ],
    });

    let raters = ratings.map((r) => ({
      id: r.user.id,
      name: r.user.name,
      email: r.user.email,
      address: r.user.address,
      rating: r.rating,
      ratedAt: r.created_at || r.createdAt,
    }));

    raters.sort((a, b) => {
      const av = a[field] ?? '';
      const bv = b[field] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortOrder.toUpperCase() === 'DESC' ? bv - av : av - bv;
      }
      const cmp = String(av).localeCompare(String(bv));
      return sortOrder.toUpperCase() === 'DESC' ? -cmp : cmp;
    });

    return res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: avg?.averageRating
          ? Number(Number(avg.averageRating).toFixed(2))
          : null,
        totalRatings: Number(avg?.totalRatings || 0),
      },
      raters,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load owner dashboard', error: error.message });
  }
};

module.exports = { getOwnerDashboard };
