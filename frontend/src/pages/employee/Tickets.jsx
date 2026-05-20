import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

export default function EmployeeTickets() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);

  const fetchTickets = () => api.get('/tickets').then(r => setTickets(r.data)).catch(() => {});
  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tickets', form);
      toast.success('Ticket submitted');
      setForm({ title: '', description: '' });
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create ticket');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ticket?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      toast.success('Ticket deleted');
      fetchTickets();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>My Tickets</h1>
          <p>Raise and track support requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>New Support Ticket</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Subject</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief description of the issue" required />
              </div>
              <div className="form-group">
                <label>Details</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Explain the issue in detail..." required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tickets-list">
        {tickets.map(t => (
          <div key={t.id} className={`ticket-card ${t.status}`}>
            <div className="ticket-header">
              <h3>{t.title}</h3>
              <div className="ticket-meta">
                <span className={`badge badge-${t.status}`}>{t.status}</span>
                {t.status === 'open' && (
                  <button className="icon-btn danger" onClick={() => handleDelete(t.id)}><X size={14} /></button>
                )}
              </div>
            </div>
            <p className="ticket-body">{t.description}</p>
            {t.hr_response && (
              <div className="hr-response">
                <strong>HR Response:</strong>
                <p>{t.hr_response}</p>
              </div>
            )}
            <p className="ticket-date">{new Date(t.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {tickets.length === 0 && <p className="empty">No tickets yet. Create one if you have an issue!</p>}
      </div>
    </Layout>
  );
}
