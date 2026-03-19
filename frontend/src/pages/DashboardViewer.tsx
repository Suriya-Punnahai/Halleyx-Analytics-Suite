import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { renderChart } from '../components/ChartWidgets';

const WIDGET_ICONS: Record<string, string> = {
  'Bar Chart': '📊', 'Line Chart': '📈', 'Area Chart': '🌊',
  'Scatter Plot': '🔵', 'Pie Chart': '🥧', 'KPI Value': '💡', 'Table': '📋',
};

const DashboardViewer = () => {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);

    Promise.all([
      axios.get('http://localhost:8080/api/dashboard'),
      axios.get('http://localhost:8080/api/orders'),
    ])
      .then(([dashRes, ordersRes]) => {
        const data = dashRes.data;
        setWidgets(data?.widgets || []);
        setOrders(ordersRes.data || []);
      })
      .catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="empty-state" style={{ height: '70vh' }}>
        <div className="loading-pulse" />
        <p className="empty-state-body">Loading dashboard…</p>
      </div>
    );
  }

  // LOGIC: Maintain the 5 primary slots first, then show ALL others.
  const processedIds = new Set<number>();

  const kpiWidget = widgets.find(w => w.widgetType === 'KPI Value');
  if (kpiWidget) processedIds.add(kpiWidget.id);

  const countryChart = widgets.find(w => !processedIds.has(w.id) && (w.title?.toLowerCase().includes('country') || w.widgetType === 'Bar Chart'));
  if (countryChart) processedIds.add(countryChart.id);

  const productChart = widgets.find(w => !processedIds.has(w.id) && (w.title?.toLowerCase().includes('product') || w.widgetType === 'Line Chart' || w.widgetType === 'Area Chart'));
  if (productChart) processedIds.add(productChart.id);

  const statusChart = widgets.find(w => !processedIds.has(w.id) && (w.title?.toLowerCase().includes('status') || w.widgetType === 'Pie Chart'));
  if (statusChart) processedIds.add(statusChart.id);

  const tableWidget = widgets.find(w => w.widgetType === 'Table');
  if (tableWidget) processedIds.add(tableWidget.id);

  // Any widgets that weren't assigned to the top structural slots
  const remainingRemaining = widgets.filter(w => !processedIds.has(w.id));

  return (
    <div style={{ animation: 'fadeSlide 0.35s ease' }} className="pb-16 flex flex-col">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{widgets.length} components configured · {orders.length} total records</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={() => fetchData(true)} title="Refresh Data">
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1.2s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/configure')}>
            <Settings size={15} />
            Configure
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* ROW 1: KPI (4) & Main Chart (8) */}
        {kpiWidget && (
          <div className="col-span-4 h-440">
            <div className="widget-card h-full">
              <div className="widget-title">
                <span>{WIDGET_ICONS[kpiWidget.widgetType] || '💡'}</span>
                {kpiWidget.title || 'Overview'}
              </div>
              <div className="flex-1 min-h-0">
                {renderChart(kpiWidget, orders)}
              </div>
            </div>
          </div>
        )}
        {countryChart && (
          <div className="col-span-8 h-440">
            <div className="widget-card h-full">
              <div className="widget-title">
                <span>{WIDGET_ICONS[countryChart.widgetType] || '📊'}</span>
                {countryChart.title || 'Geographic Trends'}
              </div>
              <div className="flex-1 min-h-0">
                {renderChart(countryChart, orders)}
              </div>
            </div>
          </div>
        )}

        {/* ROW 2: Balanced 50/50 Pairs (6 each) */}
        {productChart && (
          <div className="col-span-6 h-460">
            <div className="widget-card h-full border-b border-indigo-500/20">
              <div className="widget-title">
                <span>{WIDGET_ICONS[productChart.widgetType] || '📈'}</span>
                {productChart.title || 'Market Dynamics'}
              </div>
              <div className="flex-1 min-h-0">
                {renderChart(productChart, orders)}
              </div>
            </div>
          </div>
        )}
        {statusChart && (
          <div className="col-span-6 h-460">
            <div className="widget-card h-full border-b border-cyan-500/20">
              <div className="widget-title">
                <span>{WIDGET_ICONS[statusChart.widgetType] || '🥧'}</span>
                {statusChart.title || 'Status Analysis'}
              </div>
              <div className="flex-1 min-h-0">
                {renderChart(statusChart, orders)}
              </div>
            </div>
          </div>
        )}

        {/* ROW 3 & Beyond: Overflow Widgets in 50/50 pairs */}
        {remainingRemaining.map((w, idx) => (
          <div key={w.id || idx} className="col-span-6 h-460">
            <div className="widget-card h-full">
              <div className="widget-title">
                <span>{WIDGET_ICONS[w.widgetType] || '⚙️'}</span>
                {w.title || w.widgetType}
              </div>
              <div className="flex-1 min-h-0">
                {renderChart(w, orders)}
              </div>
            </div>
          </div>
        ))}

        {/* Bottom Row: Full Width Table */}
        {tableWidget && (
          <div className="col-span-12">
            <div className="widget-card">
              <div className="widget-title">
                <span>{WIDGET_ICONS[tableWidget.widgetType] || '📋'}</span>
                {tableWidget.title || 'Master Data Table'}
              </div>
              <div className="flex-1">
                {renderChart(tableWidget, orders)}
              </div>
            </div>
          </div>
        )}
      </div>

      {widgets.length === 0 && (
        <div className="card empty-state mt-12">
          <div className="empty-state-icon text-indigo-500/50 text-6xl mb-4">📊</div>
          <p className="empty-state-title text-2xl font-bold mb-2">No Widgets Configured</p>
          <p className="empty-state-body max-w-sm mb-8">
            Your high-performance analytics dashboard is waiting for data. Configure your modules to begin visualizing.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/configure')}>
            Start Configuring
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardViewer;
