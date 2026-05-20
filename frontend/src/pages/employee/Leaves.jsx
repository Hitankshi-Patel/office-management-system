import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const fetchLeaves = () => api.get('/leaves').then(r => setLeaves(r.data)).catch(() => {});
  useEffect(() => { fetchLeaves(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/leaves', form);
      toast.success('Leave request submitted');
      setForm({ start_date: '', end_date: '', reason: '' });
      setShowForm(false);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit leave');
    } finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this leave request?')) return;
    try {
      await api.delete(`/leaves/${id}`);
      toast.success('Leave request cancelled');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot cancel reviewed leave');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>My Leaves</h1>
          <p>Apply for and track leave requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Apply for Leave</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Reason for leave..." required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tickets-list">
        {leaves.map(l => (
          <div key={l.id} className={`ticket-card ${l.status}`}>
            <div className="ticket-header">
              <h3>{l.start_date} → {l.end_date}</h3>
              <div className="ticket-meta">
                <span className={`badge badge-${l.status}`}>{l.status}</span>
                {l.status === 'pending' && (
                  <button className="icon-btn danger" onClick={() => handleCancel(l.id)}><X size={14} /></button>
                )}
              </div>
            </div>
            <p className="ticket-body">{l.reason}</p>
            {l.hr_response && (
              <div className="hr-response">
                <strong>HR Note:</strong>
                <p>{l.hr_response}</p>
              </div>
            )}
            <p className="ticket-date">{new Date(l.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {leaves.length === 0 && <p className="empty">No leave requests yet</p>}
      </div>
    </Layout>
  );
}
