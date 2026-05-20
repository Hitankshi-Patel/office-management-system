import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

export default function HRLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [reviewLeave, setReviewLeave] = useState(null);
  const [hrResponse, setHrResponse] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchLeaves = () => api.get('/leaves').then(r => setLeaves(r.data)).catch(() => {});
  useEffect(() => { fetchLeaves(); }, []);

  const handleReview = async (status) => {
    try {
      await api.patch(`/leaves/${reviewLeave.id}/review`, { status, hr_response: hrResponse });
      toast.success(`Leave ${status}`);
      setReviewLeave(null);
      setHrResponse('');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to review');
    }
  };

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Leave Requests</h1>
          <p>Approve or reject employee leave applications</p>
        </div>
        <div className="toggle-tabs">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {reviewLeave && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Review Leave Request</h2>
              <button className="icon-btn" onClick={() => setReviewLeave(null)}><X size={20} /></button>
            </div>
            <div className="modal-form">
              <p><strong>Employee:</strong> #{reviewLeave.employee_id}</p>
              <p><strong>Duration:</strong> {reviewLeave.start_date} → {reviewLeave.end_date}</p>
              <p><strong>Reason:</strong> {reviewLeave.reason}</p>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Response (optional)</label>
                <textarea value={hrResponse} onChange={e => setHrResponse(e.target.value)} rows={3} placeholder="Add a note..." />
              </div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setReviewLeave(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleReview('rejected')}><X size={16} /> Reject</button>
                <button className="btn btn-success" onClick={() => handleReview('approved')}><Check size={16} /> Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr><th>ID</th><th>Employee</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id}>
                <td>#{l.id}</td>
                <td>Emp #{l.employee_id}</td>
                <td>{l.start_date}</td>
                <td>{l.end_date}</td>
                <td className="truncate">{l.reason}</td>
                <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                <td>
                  {l.status === 'pending' && (
                    <button className="btn btn-sm btn-outline" onClick={() => { setReviewLeave(l); setHrResponse(''); }}>
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="empty">No leave requests</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
