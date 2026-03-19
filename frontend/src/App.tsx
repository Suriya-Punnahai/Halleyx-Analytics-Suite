import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, BarChart3 } from 'lucide-react';
import DashboardViewer from './pages/DashboardViewer';
import CustomerOrderPage from './pages/CustomerOrderPage';
import DashboardConfigurator from './pages/DashboardConfigurator';
import './index.css';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar">
          <div>
            <div className="sidebar-logo">Halleyx</div>
            <div className="sidebar-sub">Analytics Suite</div>
          </div>

          <div className="nav-section-label">Menu</div>
          <nav>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={17} />
              Dashboard
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <ShoppingCart size={17} />
              Customer Orders
            </NavLink>
            <NavLink
              to="/configure"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={17} />
              Configure
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardViewer />} />
            <Route path="/configure" element={<DashboardConfigurator />} />
            <Route path="/orders" element={<CustomerOrderPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
