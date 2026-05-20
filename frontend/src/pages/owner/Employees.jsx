import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, Pencil, UserX, X, Check } from 'lucide-react';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'employee', hourly_rate: 0 };

export default function OwnerEmployees() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => api.get('/users').then(r => setUsers(r.data)).catch(() => {});

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', { ...form, hourly_rate: Number(form.hourly_rate) });
      toast.success('User created successfully');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${editUser.id}`, {
        name: editUser.name,
        hourly_rate: Number(editUser.hourly_rate),
      });
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Team Members</h1>
          <p>Manage HR staff and employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Member</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Hourly Rate ($)</label>
                  <input type="number" min="0" step="0.01" value={form.hourly_rate}
                    onChange={e => setForm({ ...form, hourly_rate: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Member</h2>
              <button className="icon-btn" onClick={() => setEditUser(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" min="0" step="0.01" value={editUser.hourly_rate}
                  onChange={e => setEditUser({ ...editUser, hourly_rate: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Hourly Rate</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                <td>${u.hourly_rate}/hr</td>
                <td><span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span></td>
                <td className="actions">
                  <button className="icon-btn" onClick={() => setEditUser(u)} title="Edit"><Pencil size={15} /></button>
                  {u.is_active && (
                    <button className="icon-btn danger" onClick={() => handleDeactivate(u.id)} title="Deactivate">
                      <UserX size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} className="empty">No team members yet</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
