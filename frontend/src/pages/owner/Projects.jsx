import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, UserPlus, UserMinus } from 'lucide-react';

export default function OwnerProjects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editProject, setEditProject] = useState(null);
  const [assignProject, setAssignProject] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAll = () => Promise.all([
    api.get('/projects'),
    api.get('/users'),
  ]).then(([pRes, uRes]) => {
    setProjects(pRes.data);
    setEmployees(uRes.data.filter(u => u.role === 'employee' && u.is_active));
  }).catch(() => {});

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created');
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create project');
    } finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/projects/${editProject.id}`, { name: editProject.name, description: editProject.description });
      toast.success('Project updated');
      setEditProject(null);
      fetchAll();
    } catch (err) {
      toast.error('Failed to update project');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  const handleAssign = async () => {
    if (!selectedEmployee) return;
    try {
      await api.post(`/projects/${assignProject.id}/assign`, { employee_id: Number(selectedEmployee) });
      toast.success('Employee assigned');
      setSelectedEmployee('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign');
    }
  };

  const handleUnassign = async (projectId, empId) => {
    try {
      await api.delete(`/projects/${projectId}/assign/${empId}`);
      toast.success('Employee removed');
      fetchAll();
    } catch { toast.error('Failed to unassign'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Create and assign projects to employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>New Project</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Project Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProject && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Project</h2>
              <button className="icon-btn" onClick={() => setEditProject(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-group">
                <label>Project Name</label>
                <input value={editProject.name} onChange={e => setEditProject({ ...editProject, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={editProject.description || ''} onChange={e => setEditProject({ ...editProject, description: e.target.value })} rows={3} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditProject(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignProject && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Assign Employees — {assignProject.name}</h2>
              <button className="icon-btn" onClick={() => setAssignProject(null)}><X size={20} /></button>
            </div>
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Select Employee</label>
                  <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
                    <option value="">-- Choose --</option>
                    {employees
                      .filter(emp => !assignProject.assignments?.some(a => a.employee_id === emp.id))
                      .map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={handleAssign}>
                  <UserPlus size={16} /> Assign
                </button>
              </div>
              <div className="assigned-list">
                <p className="label">Currently Assigned:</p>
                {assignProject.assignments?.length === 0
                  ? <p className="empty">No employees assigned</p>
                  : assignProject.assignments?.map(a => (
                    <div key={a.id} className="assigned-item">
                      <span>{a.employee?.name}</span>
                      <button className="icon-btn danger" onClick={() => handleUnassign(assignProject.id, a.employee_id)}>
                        <UserMinus size={14} />
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="projects-grid">
        {projects.map(p => (
          <div key={p.id} className="project-card">
            <div className="project-card-header">
              <h3>{p.name}</h3>
              <div className="actions">
                <button className="icon-btn" onClick={() => setEditProject(p)}><Pencil size={15} /></button>
                <button className="icon-btn danger" onClick={() => handleDelete(p.id)}><Trash2 size={15} /></button>
              </div>
            </div>
            {p.description && <p className="project-desc">{p.description}</p>}
            <div className="project-footer">
              <span className="assigned-count">{p.assignments?.length || 0} assigned</span>
              <button className="btn btn-sm btn-outline" onClick={() => setAssignProject(p)}>
                <UserPlus size={14} /> Manage Team
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="empty">No projects yet. Create one!</p>}
      </div>
    </Layout>
  );
}
