import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';
import api from '../api/client';
import { getErrorMessage } from '../utils/validation';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await api.get('/owner/dashboard', { params: { sortBy, sortOrder } });
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    load();
  }, [load]);

  const onSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  return (
    <Layout title="Store owner dashboard">
      {error && <div className="alert alert-error">{error}</div>}

      {data?.store && (
        <div className="stat-grid">
          <div className="stat-card wide">
            <span>Your store</span>
            <strong>{data.store.name}</strong>
            <p className="muted">{data.store.address}</p>
          </div>
          <div className="stat-card">
            <span>Average rating</span>
            <strong>{data.store.averageRating ?? '—'}</strong>
            <StarRating value={Math.round(data.store.averageRating || 0)} />
          </div>
          <div className="stat-card">
            <span>Total ratings</span>
            <strong>{data.store.totalRatings}</strong>
          </div>
        </div>
      )}

      <h2 className="section-title">Users who rated your store</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <SortableHeader label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <SortableHeader label="Email" field="email" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <SortableHeader label="Address" field="address" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <SortableHeader label="Rating" field="rating" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            </tr>
          </thead>
          <tbody>
            {!data?.raters?.length ? (
              <tr>
                <td colSpan={4} className="empty">
                  No ratings yet
                </td>
              </tr>
            ) : (
              data.raters.map((r) => (
                <tr key={`${r.id}-${r.rating}`}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td className="muted">{r.address}</td>
                  <td>
                    <div className="rating-cell">
                      <StarRating value={r.rating} />
                      <span>{r.rating}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
