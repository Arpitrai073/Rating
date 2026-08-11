require('dotenv').config();
const sequelize = require('./config/database');
const { User, Store, Rating } = require('./models');
const { hashPassword } = require('./utils/helpers');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('Database reset. Seeding...');

    const password = await hashPassword('Admin@123');

    const admin = await User.create({
      name: 'System Administrator User',
      email: 'admin@roxiler.com',
      address: '1 Admin Plaza, Headquarters City, Country',
      password,
      role: 'ADMIN',
    });

    const owner1 = await User.create({
      name: 'Green Valley Store Owner One',
      email: 'owner1@roxiler.com',
      address: '22 Market Street, Downtown District, City',
      password: await hashPassword('Owner@123'),
      role: 'STORE_OWNER',
    });

    const owner2 = await User.create({
      name: 'Sunrise Mart Store Owner Two',
      email: 'owner2@roxiler.com',
      address: '88 Commerce Avenue, Business Park, City',
      password: await hashPassword('Owner@123'),
      role: 'STORE_OWNER',
    });

    const user1 = await User.create({
      name: 'Normal Platform User Account One',
      email: 'user1@roxiler.com',
      address: '45 Residential Lane, Suburb Area, City',
      password: await hashPassword('User@1234'),
      role: 'USER',
    });

    const user2 = await User.create({
      name: 'Normal Platform User Account Two',
      email: 'user2@roxiler.com',
      address: '67 Garden Road, Green Hills, City',
      password: await hashPassword('User@1234'),
      role: 'USER',
    });

    const store1 = await Store.create({
      name: 'Green Valley Fresh Grocery Store',
      email: 'greenvalley@stores.com',
      address: '22 Market Street, Downtown District, City',
      owner_id: owner1.id,
    });

    const store2 = await Store.create({
      name: 'Sunrise Mart Everyday Essentials',
      email: 'sunrisemart@stores.com',
      address: '88 Commerce Avenue, Business Park, City',
      owner_id: owner2.id,
    });

    const store3 = await Store.create({
      name: 'City Center Electronics Hub Store',
      email: 'cityelectronics@stores.com',
      address: '15 Tech Boulevard, Innovation Zone, City',
      owner_id: null,
    });

    await Rating.bulkCreate([
      { user_id: user1.id, store_id: store1.id, rating: 5 },
      { user_id: user2.id, store_id: store1.id, rating: 4 },
      { user_id: user1.id, store_id: store2.id, rating: 3 },
      { user_id: user2.id, store_id: store3.id, rating: 5 },
    ]);

    console.log('Seed completed successfully');
    console.log('--- Demo accounts ---');
    console.log('Admin:  admin@roxiler.com / Admin@123');
    console.log('Owner:  owner1@roxiler.com / Owner@123');
    console.log('User:   user1@roxiler.com / User@1234');
    console.log(`Admin id: ${admin.id}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
