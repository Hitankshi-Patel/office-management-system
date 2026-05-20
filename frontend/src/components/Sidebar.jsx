import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FolderKanban, Clock, Ticket,
  CalendarOff, LogOut, Building2
} from 'lucide-react';

const navConfig = {
  owner: [
    { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/owner/employees', label: 'Employees', icon: Users },
    { to: '/owner/projects', label: 'Projects', icon: FolderKanban },
  ],
  hr: [
    { to: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hr/employees', label: 'Employees', icon: Users },
    { to: '/hr/attendance', label: 'Attendance', icon: Clock },
    { to: '/hr/tickets', label: 'Support Tickets', icon: Ticket },
    { to: '/hr/leaves', label: 'Leave Requests', icon: CalendarOff },
  ],
  employee: [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/attendance', label: 'My Attendance', icon: Clock },
    { to: '/employee/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/employee/leaves', label: 'My Leaves', icon: CalendarOff },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Building2 size={28} />
        <span>OfficeMS</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <p className="user-name">{user?.name}</p>
          <p className="user-role">{user?.role}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
