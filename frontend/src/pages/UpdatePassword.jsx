import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { validatePassword, getErrorMessage } from '../utils/validation';

export default function UpdatePassword() {
  const [form, setForm] = useState({ currentPassword: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const pwdErr = validatePassword(form.password);
    if (!form.currentPassword) {
      setError('Current password is required');
      return;
    }
    if (pwdErr) {
      setError(pwdErr);
      return;
    }
    if (form.password !== form.confirm) {
      setError('New passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        password: form.password,
      });
      setSuccess('Password updated successfully');
      setForm({ currentPassword: '', password: '', confirm: '' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Update password">
      <div className="panel narrow">
        <form className="form" onSubmit={onSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <label>
            Current password
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
