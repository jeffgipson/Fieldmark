import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-4 py-2 rounded-md ${isActive ? 'bg-gray-700' : ''}`
    }
  >
    {children}
  </NavLink>
);

export default function AdminShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="px-4 py-6 font-bold text-xl border-b border-gray-700">Fieldmark Admin</div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/users">Users</NavItem>
          <NavItem to="/farms">Farms</NavItem>
          <NavItem to="/vendors">Vendors</NavItem>
          <NavItem to="/benchmarks">Benchmarks</NavItem>
          <NavItem to="/payments">Stripe / Payments</NavItem>
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <p className="text-sm">{user?.email}</p>
          <button onClick={logout} className="w-full mt-2 text-left px-4 py-2 rounded-md bg-red-500 hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
