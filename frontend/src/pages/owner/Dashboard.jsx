import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Users, FolderKanban, TrendingUp, Clock } from 'lucide-react';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ employees: 0, hrs: 0, projects: 0, summary: [] });

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/projects'), api.get('/attendance/summary')])
      .then(([usersRes, projectsRes, summaryRes]) => {
        const employees = usersRes.data.filter(u => u.role === 'employee');
        const hrs = usersRes.data.filter(u => u.role === 'hr');
        setStats({
          employees: employees.length,
          hrs: hrs.length,
          projects: projectsRes.data.length,
          summary: summaryRes.data.slice(0, 5),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1>Owner Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div>
            <p className="stat-label">Employees</p>
            <p className="stat-value">{stats.employees}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Users size={24} /></div>
          <div>
            <p className="stat-label">HR Staff</p>
            <p className="stat-value">{stats.hrs}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FolderKanban size={24} /></div>
          <div>
            <p className="stat-label">Projects</p>
            <p className="stat-value">{stats.projects}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><TrendingUp size={24} /></div>
          <div>
            <p className="stat-label">Total Pay</p>
            <p className="stat-value">
              ${stats.summary.reduce((s, e) => s + e.estimated_pay, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h2><Clock size={18} /> Top Employees by Hours</h2>
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
              <tr><td colSpan={3} className="empty">No attendance data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
