import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, BarChart3, LineChart, AreaChart, CircleDot, PieChart, Hash, Table2, LayoutGrid } from 'lucide-react';
import axios from 'axios';
import WidgetConfigSidePanel from '../components/WidgetConfigSidePanel';
import { renderChart } from '../components/ChartWidgets';

const WIDGET_TYPES = [
  { label: 'Bar Chart',    icon: <BarChart3 size={15}/> },
  { label: 'Line Chart',   icon: <LineChart size={15}/> },
  { label: 'Area Chart',   icon: <AreaChart size={15}/> },
  { label: 'Scatter Plot', icon: <CircleDot size={15}/> },
  { label: 'Pie Chart',    icon: <PieChart  size={15}/> },
  { label: 'KPI Value',    icon: <Hash      size={15}/> },
  { label: 'Table',        icon: <Table2    size={15}/> },
];

const DashboardConfigurator = () => {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [configuringWidget, setConfiguringWidget] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    Promise.all([
      axios.get(`${API_BASE}/api/dashboard`).catch(() => ({ data: {} })),
      axios.get(`${API_BASE}/api/orders`).catch(() => ({ data: [] })),
    ]).then(([dashRes, ordersRes]) => {
      const data = dashRes.data;
      setWidgets(data?.widgets || []);
      setOrders(ordersRes.data || []);
      setLoading(false);
    });
  }, []);

  const handleSave = () => {
    setSaving(true);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    axios.post(`${API_BASE}/api/dashboard`, { layoutConfig: '[]', widgets })
      .then(() => navigate('/'))
      .catch(() => alert('Failed to save configuration'))
      .finally(() => setSaving(false));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const widgetType = e.dataTransfer.getData('text/plain');
    if (!widgetType) return;
    setWidgets(prev => [...prev, {
      id: null, widgetType,
      title: widgetType,
      configuration: '{}',
    }]);
  };

  const removeWidget = (idx: number) => {
    setWidgets(prev => prev.filter((_, i) => i !== idx));
    if (configuringWidget?._idx === idx) setConfiguringWidget(null);
  };

  if (loading) {
    return (
      <div className="empty-state" style={{ height: '70vh' }}>
        <div className="loading-pulse" />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeSlide 0.35s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Configuration</h1>
          <p className="page-subtitle">Drag widgets to build your dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')}><X size={15}/>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15}/>{saving ? 'Saving…' : 'Save Dashboard'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Palette */}
        <div className="card" style={{ width: '200px', flexShrink: 0, padding: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Widgets
          </p>
          {WIDGET_TYPES.map(({ label, icon }) => (
            <div
              key={label}
              className="palette-item"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', label)}
            >
              {icon} {label}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div
          className={`drop-zone ${dragOver ? 'active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {widgets.length === 0 && (
            <div className="drop-zone-hint">
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}><LayoutGrid size={40} opacity={0.3}/></div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Drop widgets here</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.7, marginTop: '4px' }}>Drag from the palette on the left</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {widgets.map((widget, idx) => (
              <div
                key={idx}
                className="widget-card"
                style={{ minHeight: '240px', animationDelay: `${idx * 0.05}s` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="widget-title" style={{ margin: 0 }}>{widget.title}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => setConfiguringWidget({ ...widget, _idx: idx })}
                    >⚙️</button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => removeWidget(idx)}
                    >✕</button>
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: '160px' }}>
                  {renderChart(widget, orders)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {configuringWidget && (
        <WidgetConfigSidePanel
          widget={configuringWidget}
          onClose={() => setConfiguringWidget(null)}
          onSave={(updated) => {
            const newWidgets = [...widgets];
            const idx = updated._idx ?? -1;
            if (idx !== -1) {
              const { _idx, ...rest } = updated;
              newWidgets[idx] = rest;
              setWidgets(newWidgets);
            }
            setConfiguringWidget(null);
          }}
        />
      )}
    </div>
  );
};

export default DashboardConfigurator;
