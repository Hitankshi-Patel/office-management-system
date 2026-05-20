import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Clock, Ticket, CalendarOff, FolderKanban } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ attendance: [], tickets: [], leaves: [], projects: [] });
  const [todayRecord, setTodayRecord] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/attendance/me'),
      api.get('/tickets'),
      api.get('/leaves'),
      api.get('/projects'),
    ]).then(([aRes, tRes, lRes, pRes]) => {
      setData({ attendance: aRes.data, tickets: tRes.data, leaves: lRes.data, projects: pRes.data });
      const today = new Date().toISOString().split('T')[0];
      setTodayRecord(aRes.data.find(r => r.date === today) || null);
    }).catch(() => {});
  }, []);

  const totalHours = data.attendance.reduce((s, r) => s + (r.hours_worked || 0), 0);
  const estimatedPay = totalHours * (user?.hourly_rate || 0);

  return (
    <Layout>
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p>Hello, {user?.name} 👋</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Clock size={24} /></div>
          <div>
            <p className="stat-label">Total Hours</p>
            <p className="stat-value">{totalHours.toFixed(1)}h</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Clock size={24} /></div>
          <div>
            <p className="stat-label">Estimated Pay</p>
            <p className="stat-value">${estimatedPay.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Ticket size={24} /></div>
          <div>
            <p className="stat-label">Open Tickets</p>
            <p className="stat-value">{data.tickets.filter(t => t.status === 'open').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><CalendarOff size={24} /></div>
          <div>
            <p className="stat-label">Pending Leaves</p>
            <p className="stat-value">{data.leaves.filter(l => l.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      <div className="today-status">
        <h2>Today's Status</h2>
        {!todayRecord && <p className="status-text">You have not clocked in today. Go to <strong>My Attendance</strong> to clock in.</p>}
        {todayRecord && !todayRecord.clock_out && (
          <p className="status-text clocked-in">🟢 You are clocked in since {new Date(todayRecord.clock_in).toLocaleTimeString()}</p>
        )}
        {todayRecord?.clock_out && (
          <p className="status-text clocked-out">✅ Completed {todayRecord.hours_worked}h today</p>
        )}
      </div>

      <div className="section-card">
        <h2><FolderKanban size={18} /> My Projects</h2>
        <div className="projects-grid-sm">
          {data.projects.map(p => (
            <div key={p.id} className="project-chip">{p.name}</div>
          ))}
          {data.projects.length === 0 && <p className="empty">No projects assigned yet</p>}
        </div>
      </div>
    </Layout>
  );
}
