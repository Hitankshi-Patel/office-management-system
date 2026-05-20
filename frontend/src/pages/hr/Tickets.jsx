import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, X } from 'lucide-react';

export default function HRTickets() {
  const [tickets, setTickets] = useState([]);
  const [resolveTicket, setResolveTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTickets = () => api.get('/tickets').then(r => setTickets(r.data)).catch(() => {});
  useEffect(() => { fetchTickets(); }, []);

  const handleResolve = async () => {
    if (!response.trim()) { toast.error('Please enter a response'); return; }
    try {
      await api.patch(`/tickets/${resolveTicket.id}/resolve`, { hr_response: response });
      toast.success('Ticket resolved');
      setResolveTicket(null);
      setResponse('');
      fetchTickets();
    } catch { toast.error('Failed to resolve ticket'); }
  };

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Support Tickets</h1>
          <p>Manage employee support requests</p>
        </div>
        <div className="toggle-tabs">
          {['all', 'open', 'resolved'].map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {resolveTicket && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Resolve Ticket</h2>
              <button className="icon-btn" onClick={() => setResolveTicket(null)}><X size={20} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Ticket: {resolveTicket.title}</label>
                <p className="ticket-desc">{resolveTicket.description}</p>
              </div>
              <div className="form-group">
                <label>Your Response</label>
                <textarea value={response} onChange={e => setResponse(e.target.value)} rows={4} placeholder="Enter resolution..." />
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setResolveTicket(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleResolve}><CheckCircle size={16} /> Resolve</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Employee</th><th>Title</th><th>Status</th><th>Created</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>Emp #{t.employee_id}</td>
                <td>{t.title}</td>
                <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>
                  {t.status === 'open' && (
                    <button className="btn btn-sm btn-outline" onClick={() => { setResolveTicket(t); setResponse(''); }}>
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                  {t.status === 'resolved' && <span className="text-muted">Resolved</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="empty">No tickets</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
