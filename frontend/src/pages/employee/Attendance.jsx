import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { LogIn, LogOut } from 'lucide-react';

export default function EmployeeAttendance() {
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecords = () => {
    api.get('/attendance/me').then(r => {
      setRecords(r.data);
      const today = new Date().toISOString().split('T')[0];
      setTodayRecord(r.data.find(rec => rec.date === today) || null);
    }).catch(() => {});
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/clock-in');
      toast.success('Clocked in successfully!');
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to clock in');
    } finally { setLoading(false); }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/clock-out');
      toast.success('Clocked out! Great work today.');
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to clock out');
    } finally { setLoading(false); }
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleTimeString() : '—';

  return (
    <Layout>
      <div className="page-header">
        <h1>My Attendance</h1>
        <p>Clock in and out to track your hours</p>
      </div>

      <div className="clock-card">
        <div className="clock-display">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        {!todayRecord && (
          <div className="clock-status not-clocked">
            <p>You haven't clocked in yet today</p>
            <button className="btn btn-primary btn-lg" onClick={handleClockIn} disabled={loading}>
              <LogIn size={20} /> Clock In
            </button>
          </div>
        )}

        {todayRecord && !todayRecord.clock_out && (
          <div className="clock-status clocked-in-card">
            <p>🟢 Clocked in at <strong>{fmt(todayRecord.clock_in)}</strong></p>
            <button className="btn btn-danger btn-lg" onClick={handleClockOut} disabled={loading}>
              <LogOut size={20} /> Clock Out
            </button>
          </div>
        )}

        {todayRecord?.clock_out && (
          <div className="clock-status clocked-out-card">
            <p>✅ Day complete! You worked <strong>{todayRecord.hours_worked}h</strong> today</p>
            <p>In: {fmt(todayRecord.clock_in)} → Out: {fmt(todayRecord.clock_out)}</p>
          </div>
        )}
      </div>

      <div className="section-card">
        <h2>Attendance History</h2>
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours Worked</th></tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{fmt(r.clock_in)}</td>
                <td>{fmt(r.clock_out)}</td>
                <td>{r.hours_worked != null ? `${r.hours_worked}h` : <span className="badge badge-pending">Active</span>}</td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={4} className="empty">No records yet</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
