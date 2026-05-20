import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Users, Clock, Ticket, CalendarOff } from 'lucide-react';

export default function HRDashboard() {
  const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, openTickets: 0, summary: [] });

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/leaves'),
      api.get('/tickets'),
      api.get('/attendance/summary'),
    ]).then(([uRes, lRes, tRes, sRes]) => {
      setStats({
        employees: uRes.data.filter(u => u.role === 'employee').length,
        pendingLeaves: lRes.data.filter(l => l.status === 'pending').length,
        openTickets: tRes.data.filter(t => t.status === 'open').length,
        summary: sRes.data,
      });
    }).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1>HR Dashboard</h1>
        <p>Overview of your team</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div><p className="stat-label">Employees</p><p className="stat-value">{stats.employees}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><CalendarOff size={24} /></div>
          <div><p className="stat-label">Pending Leaves</p><p className="stat-value">{stats.pendingLeaves}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Ticket size={24} /></div>
          <div><p className="stat-label">Open Tickets</p><p className="stat-value">{stats.openTickets}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Clock size={24} /></div>
          <div>
            <p className="stat-label">Total Hours Logged</p>
            <p className="stat-value">{stats.summary.reduce((s, e) => s + e.total_hours, 0).toFixed(1)}h</p>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h2><Clock size={18} /> Employee Attendance Summary</h2>
        <table className="data-table">
          <thead>
            <tr><th>Employee</th><th>Total Hours</th><th>Estimated Pay</th></tr>
          </thead>
          <tbody>
            {stats.summary.map(emp => (
              <tr key={emp.employee_id}>
                <td>{emp.employee_name}</td>
                <td>{emp.total_hours}h</td>
                <td>${emp.estimated_pay}</td>
              </tr>
            ))}
            {stats.summary.length === 0 && (
              <tr><td colSpan={3} className="empty">No attendance records yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
