import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function HRAttendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [view, setView] = useState('records'); // 'records' | 'summary'
  const [filterEmployee, setFilterEmployee] = useState('');
  const [employees, setEmployees] = useState([]);

  const fetchData = () => {
    api.get('/attendance', { params: filterEmployee ? { employee_id: filterEmployee } : {} })
      .then(r => setRecords(r.data)).catch(() => {});
    api.get('/attendance/summary').then(r => setSummary(r.data)).catch(() => {});
    api.get('/users').then(r => setEmployees(r.data.filter(u => u.role === 'employee'))).catch(() => {});
  };

  useEffect(() => { fetchData(); }, [filterEmployee]);

  const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>View all employee clock-in/out records</p>
        </div>
        <div className="toggle-tabs">
          <button className={`tab-btn ${view === 'records' ? 'active' : ''}`} onClick={() => setView('records')}>Records</button>
          <button className={`tab-btn ${view === 'summary' ? 'active' : ''}`} onClick={() => setView('summary')}>Summary</button>
        </div>
      </div>

      {view === 'records' && (
        <div className="section-card">
          <div className="filter-row">
            <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Employee ID</th><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th></tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>#{r.employee_id}</td>
                  <td>{fmtDate(r.date)}</td>
                  <td>{fmt(r.clock_in)}</td>
                  <td>{fmt(r.clock_out)}</td>
                  <td>{r.hours_worked != null ? `${r.hours_worked}h` : <span className="badge badge-pending">In Progress</span>}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={5} className="empty">No records found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === 'summary' && (
        <div className="section-card">
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Total Hours</th><th>Estimated Pay</th></tr>
            </thead>
            <tbody>
              {summary.map(s => (
                <tr key={s.employee_id}>
                  <td>{s.employee_name}</td>
                  <td>{s.total_hours}h</td>
                  <td>${s.estimated_pay}</td>
                </tr>
              ))}
              {summary.length === 0 && <tr><td colSpan={3} className="empty">No data</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
