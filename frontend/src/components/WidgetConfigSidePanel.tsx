import { useState } from 'react';
import { X, Save } from 'lucide-react';

type WidgetConfigSidePanelProps = {
  widget: any;
  onClose: () => void;
  onSave: (updatedWidget: any) => void;
};

const DIMENSIONS = [
  { value: 'createdBy', label: 'Created By' },
  { value: 'status', label: 'Status' },
  { value: 'country', label: 'Country' },
  { value: 'product', label: 'Product' },
];

const MEASURES = [
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'unitPrice', label: 'Unit Price' },
];

const AGGREGATIONS = ['Sum', 'Count', 'Average', 'Min', 'Max'];

const WidgetConfigSidePanel = ({ widget, onClose, onSave }: WidgetConfigSidePanelProps) => {
  const [title, setTitle] = useState(widget.title || 'Untitled');
  const [config, setConfig] = useState(JSON.parse(widget.configuration || '{}'));

  const update = (key: string, value: string) => setConfig((c: any) => ({ ...c, [key]: value }));

  const isChart = ['Bar Chart', 'Line Chart', 'Area Chart', 'Scatter Plot'].includes(widget.widgetType);
  const isPie   = widget.widgetType === 'Pie Chart';
  const isKpi   = widget.widgetType === 'KPI Value';
  const isTable = widget.widgetType === 'Table';
  const needsDimension = isChart || isPie;

  const FormGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '14px' }}>
      <label className="form-label">{label} <span style={{ color: '#f87171' }}>*</span></label>
      {children}
    </div>
  );

  return (
    <div className="side-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>Configure Widget</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{widget.widgetType}</p>
        </div>
        <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}><X size={15}/></button>
      </div>

      <hr />

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '1rem' }}>
        <FormGroup label="Widget Title">
          <input
            className="form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="My Widget"
          />
        </FormGroup>

        <FormGroup label="Data Model">
          <select className="form-select" value={config.model || ''} onChange={e => update('model', e.target.value)}>
            <option value="">Select model</option>
            <option value="Customer Order">Customer Order</option>
          </select>
        </FormGroup>

        {needsDimension && (
          <>
            <FormGroup label={isPie ? 'Dimension (Slice label)' : 'Dimension (X-axis)'}>
              <select className="form-select" value={config.dimension || ''} onChange={e => update('dimension', e.target.value)}>
                <option value="">Select field…</option>
                {DIMENSIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </FormGroup>

            <FormGroup label={isPie ? 'Measure (Slice size)' : 'Measure (Y-axis)'}>
              <select className="form-select" value={config.measure || ''} onChange={e => update('measure', e.target.value)}>
                <option value="">Select field…</option>
                {MEASURES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="Aggregation">
              <select className="form-select" value={config.aggregation || ''} onChange={e => update('aggregation', e.target.value)}>
                <option value="">Select…</option>
                {AGGREGATIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </FormGroup>
          </>
        )}

        {isKpi && (
          <>
            <FormGroup label="KPI Field">
              <select className="form-select" value={config.measure || ''} onChange={e => update('measure', e.target.value)}>
                <option value="">Select field…</option>
                {[...MEASURES, { value: 'status', label: 'Status' }, { value: 'createdBy', label: 'Created By' }]
                  .map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Aggregation">
              <select className="form-select" value={config.aggregation || ''} onChange={e => update('aggregation', e.target.value)}>
                <option value="">Select…</option>
                {AGGREGATIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </FormGroup>
          </>
        )}

        {isTable && (
          <FormGroup label="Columns (comma-separated)">
            <input
              className="form-input"
              value={config.columns || ''}
              onChange={e => update('columns', e.target.value)}
              placeholder="product, status, totalAmount"
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '5px' }}>
              Available: id, product, quantity, unitPrice, totalAmount, status, createdBy, country
            </p>
          </FormGroup>
        )}
      </div>

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onSave({ ...widget, title, configuration: JSON.stringify(config) })}>
          <Save size={15} /> Save Widget
        </button>
      </div>
    </div>
  );
};

export default WidgetConfigSidePanel;
