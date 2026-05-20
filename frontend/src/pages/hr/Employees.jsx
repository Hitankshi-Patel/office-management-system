import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, X } from 'lucide-react';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'employee', hourly_rate: 0 };

export default function HREmployees() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => api.get('/users').then(r => setUsers(r.data)).catch(() => {});
  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', { ...form, hourly_rate: Number(form.hourly_rate) });
      toast.success('Employee added');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add employee');
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>View and add employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <UserPlus size={16} /> Add Employee
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Employee</h2>
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
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" min="0" step="0.01" value={form.hourly_rate}
                  onChange={e => setForm({ ...form, hourly_rate: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Hourly Rate</th><th>Status</th></tr>
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
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5} className="empty">No employees yet</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
