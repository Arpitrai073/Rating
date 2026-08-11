import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/client';
import { getErrorMessage } from '../utils/validation';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/admin/users/${id}`);
        setUser(data.user);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, [id]);

  return (
    <Layout title="User details">
      <Link to="/admin/users" className="back-link">
        ← Back to users
      </Link>
      {error && <div className="alert alert-error">{error}</div>}
      {user && (
        <div className="panel detail-panel">
          <dl className="detail-list">
            <div>
              <dt>Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{user.address}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>
                <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
              </dd>
            </div>
            {user.role === 'STORE_OWNER' && (
              <>
                <div>
                  <dt>Store</dt>
                  <dd>{user.store?.name || 'No store linked'}</dd>
                </div>
                <div>
                  <dt>Store rating</dt>
                  <dd>{user.rating ?? 'No ratings yet'}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      )}
    </Layout>
  );
}
