import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/client';
import { getErrorMessage } from '../utils/validation';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, []);

  return (
    <Layout title="Admin dashboard">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="stat-grid">
        <div className="stat-card">
          <span>Total users</span>
          <strong>{stats?.totalUsers ?? '—'}</strong>
        </div>
        <div className="stat-card">
          <span>Total stores</span>
          <strong>{stats?.totalStores ?? '—'}</strong>
        </div>
        <div className="stat-card">
          <span>Total ratings</span>
          <strong>{stats?.totalRatings ?? '—'}</strong>
        </div>
      </div>

      <div className="action-row">
        <Link className="btn btn-primary" to="/admin/users">
          Manage users
        </Link>
        <Link className="btn btn-secondary" to="/admin/stores">
          Manage stores
        </Link>
      </div>
    </Layout>
  );
}
