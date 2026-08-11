import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';
import api from '../api/client';
import { getErrorMessage } from '../utils/validation';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [drafts, setDrafts] = useState({});

  const load = useCallback(async () => {
    try {
      setError('');
      const { data } = await api.get('/user/stores', {
        params: { ...filters, sortBy, sortOrder },
      });
      setStores(data.stores);
      const initial = {};
      data.stores.forEach((s) => {
        initial[s.id] = s.userRating || 0;
      });
      setDrafts(initial);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [filters, sortBy, sortOrder]);

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

  const submitRating = async (store) => {
    const rating = drafts[store.id];
    if (!rating || rating < 1 || rating > 5) {
      setError('Select a rating between 1 and 5');
      return;
    }
    setMessage('');
    setError('');
    try {
      if (store.userRating) {
        await api.put(`/user/stores/${store.id}/ratings`, { rating });
        setMessage('Rating updated');
      } else {
        await api.post(`/user/stores/${store.id}/ratings`, { rating });
        setMessage('Rating submitted');
      }
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Layout title="Stores">
      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="toolbar">
        <div className="filters">
          <input
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            placeholder="Search by address"
            value={filters.address}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <SortableHeader label="Store name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <SortableHeader label="Address" field="address" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <SortableHeader
                label="Overall rating"
                field="overallRating"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <th>Your rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  No stores found
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="muted">{s.address}</td>
                  <td>
                    <div className="rating-cell">
                      <StarRating value={Math.round(s.overallRating || 0)} />
                      <span>{s.overallRating ?? '—'}</span>
                    </div>
                  </td>
                  <td>
                    <StarRating
                      editable
                      value={drafts[s.id] || 0}
                      onChange={(n) => setDrafts((d) => ({ ...d, [s.id]: n }))}
                    />
                    {s.userRating ? (
                      <span className="hint">Current: {s.userRating}</span>
                    ) : (
                      <span className="hint">Not rated yet</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => submitRating(s)}
                    >
                      {s.userRating ? 'Update' : 'Submit'}
                    </button>
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
