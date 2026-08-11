import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SortableHeader from '../components/SortableHeader';
import api from '../api/client';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  getErrorMessage,
} from '../utils/validation';

const emptyForm = {
  name: '',
  email: '',
  address: '',
  password: '',
  role: 'USER',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
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
      const { data } = await api.get('/admin/users', {
        params: { ...filters, sortBy, sortOrder },
      });
      setUsers(data.users);
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

  const onCreate = async (e) => {
    e.preventDefault();
    setSuccess('');
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setFormErrors(next);
    if (Object.values(next).some(Boolean)) return;

    try {
      await api.post('/admin/users', form);
      setSuccess('User created successfully');
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Layout title="Users">
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
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Close form' : 'Add user'}
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <h2 className="section-title">Add user</h2>
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
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {formErrors.password && <span className="field-error">{formErrors.password}</span>}
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="USER">Normal User</option>
                <option value="ADMIN">Admin</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                Create user
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
              <SortableHeader label="Role" field="role" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
              <th>Rating</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="muted">{u.address}</td>
                  <td>
                    <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
                  </td>
                  <td>{u.role === 'STORE_OWNER' ? u.rating ?? '—' : '—'}</td>
                  <td>
                    <Link to={`/admin/users/${u.id}`}>View</Link>
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
