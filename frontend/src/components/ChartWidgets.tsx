
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const CHART_STYLE = {
  cartesianGrid: { stroke: 'rgba(255,255,255,0.06)', strokeDasharray: '3 3' },
  axis: { tick: { fill: '#94a3b8', fontSize: 11 }, axisLine: { stroke: 'rgba(255,255,255,0.08)' }, tickLine: false as const },
  tooltip: {
    contentStyle: {
      background: '#1c2333',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      color: '#f1f5f9',
      fontSize: '0.82rem',
    },
    cursor: { fill: 'rgba(99,102,241,0.07)' },
  },
};

export const renderChart = (widget: any, data: any[]) => {
  if (!widget || !data) return null;

  const config = JSON.parse(widget.configuration || '{}');
  const type = widget.widgetType;
  const chartData = prepareChartData(data, config);

  if (type === 'KPI Value') {
    const value = calculateKPI(data, config);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem' }}>
          {config.aggregation} of {config.measure || '—'}
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem' }}>from {data.length} records</div>
      </div>
    );
  }

  if (type === 'Table') {
    const cols = config.columns
      ? config.columns.split(',').map((c: string) => c.trim())
      : ['id', 'product', 'status', 'totalAmount', 'country'];
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'auto', 
        borderRadius: '12px', 
        border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem', tableLayout: 'fixed' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr style={{ background: '#1e2536', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {cols.map((c: string) => {
                const isNumeric = c.toLowerCase().includes('amount') || c.toLowerCase().includes('price') || c.toLowerCase() === 'id';
                return (
                  <th key={c} style={{ 
                    padding: '16px 20px', 
                    textAlign: isNumeric ? 'right' : 'left', 
                    color: '#94a3b8', 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.08em',
                    fontWeight: 700
                  }}>
                    {c}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 50).map((row, i) => (
              <tr key={i} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s ease' }}>
                {cols.map((c: string) => {
                  const isNumeric = c.toLowerCase().includes('amount') || c.toLowerCase().includes('price') || c.toLowerCase() === 'id';
                  return (
                    <td key={c} style={{ 
                      padding: '14px 20px', 
                      color: i === 0 ? '#6366f1' : '#f1f5f9',
                      fontWeight: i === 0 ? 600 : 400,
                      textAlign: isNumeric ? 'right' : 'left',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {typeof row[c] === 'number' && (c.toLowerCase().includes('amount') || c.toLowerCase().includes('price')) 
                        ? `$${row[c]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                        : row[c]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
            No records found to display.
          </div>
        )}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: '6px' }}>
        <span style={{ fontSize: '1.5rem' }}>📊</span>
        <span style={{ fontSize: '0.8rem' }}>No data — configure dimension &amp; measure</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderRechartComponent(type, chartData, config)}
    </ResponsiveContainer>
  );
};

const renderRechartComponent = (type: string, data: any[], config: any) => {
  const dim = config.dimension || 'name';
  const mes = config.measure || 'value';
  const { cartesianGrid, axis, tooltip } = CHART_STYLE;

  switch (type) {
    case 'Bar Chart':
      return (
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid {...cartesianGrid} vertical={false} />
          <XAxis dataKey={dim} {...axis} />
          <YAxis {...axis} />
          <Tooltip {...tooltip} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
          <Bar dataKey={mes} fill={COLORS[0]} radius={[5, 5, 0, 0]} maxBarSize={48} />
        </BarChart>
      );
    case 'Line Chart':
      return (
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid {...cartesianGrid} vertical={false} />
          <XAxis dataKey={dim} {...axis} />
          <YAxis {...axis} />
          <Tooltip {...tooltip} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
          <Line type="monotone" dataKey={mes} stroke={COLORS[1]} strokeWidth={2.5} dot={{ fill: COLORS[1], r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      );
    case 'Area Chart':
      return (
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...cartesianGrid} vertical={false} />
          <XAxis dataKey={dim} {...axis} />
          <YAxis {...axis} />
          <Tooltip {...tooltip} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
          <Area type="monotone" dataKey={mes} stroke={COLORS[2]} strokeWidth={2.5} fill="url(#areaGrad)" />
        </AreaChart>
      );
    case 'Scatter Plot':
      return (
        <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid {...cartesianGrid} />
          <XAxis dataKey={dim} {...axis} />
          <YAxis dataKey={mes} {...axis} />
          <Tooltip {...tooltip} />
          <Scatter data={data} fill={COLORS[3]} />
        </ScatterChart>
      );
    case 'Pie Chart':
      const totalMes = data.reduce((acc, d) => acc + (d[mes] || 0), 0);
      const formattedTotal = mes.toLowerCase().includes('amount') || mes.toLowerCase().includes('price')
        ? `$${totalMes.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        : totalMes.toLocaleString();

      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <PieChart>
            <Tooltip {...tooltip} />
            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }} />
            <Pie
              data={data}
              dataKey={mes}
              nameKey={dim}
              cx="50%"
              cy="45%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={5}
              strokeWidth={0}
              cornerRadius={6}
              animationBegin={0}
              animationDuration={1200}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-10px',
            textAlign: 'right',
            pointerEvents: 'none',
            padding: '10px',
            zIndex: 10
          }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', fontWeight: 700, marginBottom: '2px' }}>
              Total
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px', lineHeight: 1 }}>
              {formattedTotal}
            </div>
          </div>
        </div>
      );
    default:
      return <g />;
  }
};

const prepareChartData = (data: any[], config: any) => {
  if (!config.dimension || !config.measure) return [];

  const dim = config.dimension;
  const mes = config.measure;
  const agg = config.aggregation || 'Sum';

  const grouped: Record<string, any[]> = data.reduce((acc, row) => {
    const key = row[dim] || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.keys(grouped).map(key => {
    const group = grouped[key];
    const vals = group.map((g: any) => parseFloat(g[mes]) || 0);
    let aggregatedValue = 0;
    switch (agg) {
      case 'Sum':     aggregatedValue = vals.reduce((a, b) => a + b, 0); break;
      case 'Count':   aggregatedValue = vals.length; break;
      case 'Average': aggregatedValue = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0; break;
      case 'Min':     aggregatedValue = Math.min(...vals); break;
      case 'Max':     aggregatedValue = Math.max(...vals); break;
    }
    return { [dim]: key, [mes]: Math.round(aggregatedValue * 100) / 100 };
  });
};

const calculateKPI = (data: any[], config: any) => {
  if (!config.measure) return '—';
  const mes = config.measure;
  const agg = config.aggregation || 'Sum';
  const vals = data.map(d => parseFloat(d[mes]) || 0);
  if (vals.length === 0) return '0';

  let res = 0;
  switch (agg) {
    case 'Sum':     res = vals.reduce((a, b) => a + b, 0); break;
    case 'Count':   res = vals.length; break;
    case 'Average': res = vals.reduce((a, b) => a + b, 0) / vals.length; break;
    case 'Min':     res = Math.min(...vals); break;
    case 'Max':     res = Math.max(...vals); break;
  }

  if (mes.toLowerCase().includes('amount') || mes.toLowerCase().includes('price')) {
    return `$${res.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return res.toLocaleString(undefined, { maximumFractionDigits: 1 });
};
