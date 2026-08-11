import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';
import api from '../api/client';
import {
  validateName,
  validateEmail,
  validateAddress,
  getErrorMessage,
} from '../utils/validation';

const emptyForm = { name: '', email: '', address: '', owner_id: '' };

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const { data } = await api.get('/admin/stores', {
        params: { ...filters, sortBy, sortOrder },
      });
      setStores(data.stores);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const loadOwners = async () => {
      try {
        const { data } = await api.get('/admin/users', { params: { role: 'STORE_OWNER' } });
        setOwners(data.users.filter((u) => !u.store));
      } catch {
        /* ignore */
      }
    };
    loadOwners();
  }, [success]);

  const onSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSuccess('');
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
    };
    setFormErrors(next);
    if (Object.values(next).some(Boolean)) return;

    try {
      await api.post('/admin/stores', {
        name: form.name,
        email: form.email,
        address: form.address,
        owner_id: form.owner_id ? Number(form.owner_id) : null,
      });
      setSuccess('Store created successfully');
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Layout title="Stores">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="toolbar">
        <div className="filters">
          <input
            placeholder="Filter name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            placeholder="Filter email"
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          />
          <input
            placeholder="Filter address"
            value={filters.address}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close form' : 'Add store'}
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <h2 className="section-title">Add store</h2>
          <form className="form form-grid" onSubmit={onCreate}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {formErrors.name && <span className="field-error">{formErrors.name}</span>}
            </label>
            <label>
              Email
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {formErrors.email && <span className="field-error">{formErrors.email}</span>}
            </label>
            <label>
              Address
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              {formErrors.address && <span className="field-error">{formErrors.address}</span>}
            </label>
            <label>
              Store owner (optional)
              <select
                value={form.owner_id}
                onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.email})
                  </option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                Create store
              </button>
            </div>
          </form>
        </div>
      )}

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
            {stores.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty">
                  No stores found
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td className="muted">{s.address}</td>
                  <td>
                    <div className="rating-cell">
                      <StarRating value={Math.round(s.rating || 0)} />
                      <span>{s.rating ?? '—'}</span>
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
