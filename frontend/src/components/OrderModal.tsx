import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type OrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
};

const EMPTY: any = {
  streetAddress: '', city: '', stateProvince: '', postalCode: '', country: '',
  product: '', quantity: 1, unitPrice: '', status: 'Pending', createdBy: '',
};

// ── Helpers defined OUTSIDE the modal to avoid re-mount on every render ──────
type FieldProps = {
  label: string; name: string; type?: string; placeholder?: string;
  value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
const Field = ({ label, name, type = 'text', placeholder, value, onChange }: FieldProps) => (
  <div>
    <label className="form-label">{label}</label>
    <input
      className="form-input"
      type={type}
      name={name}
      placeholder={placeholder || label}
      value={value ?? ''}
      onChange={onChange}
    />
  </div>
);

type SelectProps = {
  label: string; name: string; value: string;
  options: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};
const SelectField = ({ label, name, value, options, onChange }: SelectProps) => (
  <div>
    <label className="form-label">{label}</label>
    <select className="form-select" name={name} value={value ?? ''} onChange={onChange}>
      <option value="">Select {label}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
// ─────────────────────────────────────────────────────────────────────────────

const OrderModal = ({ isOpen, onClose, onSubmit, initialData = null }: OrderModalProps) => {
  const [formData, setFormData] = useState<any>(initialData || EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialData || EMPTY);
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const q = parseInt(formData.quantity) || 0;
    const p = parseFloat(formData.unitPrice) || 0;
    return (q * p).toFixed(2);
  };

  const handleSubmit = async () => {
    const required = ['streetAddress', 'city', 'stateProvince', 'postalCode', 'country', 'product', 'quantity', 'unitPrice', 'status', 'createdBy'];
    const missing = required.find(f => !formData[f]);
    if (missing) {
      setError(`Please fill in: ${missing.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      return;
    }
    setError('');
    setSubmitting(true);
    try { 
      await onSubmit({ ...formData, totalAmount: parseFloat(calculateTotal()) });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="modal-title" style={{ margin: 0 }}>{initialData ? 'Edit Order' : 'Create Order'}</h2>
          <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}><X size={16}/></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <p className="modal-section-title">Shipping Information</p>
        <div style={{ display: 'grid', gap: '12px' }}>
          <Field label="Street Address" name="streetAddress" value={formData.streetAddress} onChange={handleChange} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="City"             name="city"          value={formData.city}          onChange={handleChange} />
            <Field label="State / Province" name="stateProvince" value={formData.stateProvince} onChange={handleChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} />
            <SelectField label="Country" name="country" value={formData.country} onChange={handleChange} options={[
              { value: 'United States', label: '🇺🇸 United States' },
              { value: 'Canada',        label: '🇨🇦 Canada' },
              { value: 'Australia',     label: '🇦🇺 Australia' },
              { value: 'Singapore',     label: '🇸🇬 Singapore' },
              { value: 'Hong Kong',     label: '🇭🇰 Hong Kong' },
            ]} />
          </div>
        </div>

        <p className="modal-section-title">Sales Information</p>
        <div style={{ display: 'grid', gap: '12px' }}>
          <SelectField label="Product" name="product" value={formData.product} onChange={handleChange} options={[
            { value: 'Fiber Internet 300 Mbps',    label: 'Fiber Internet 300 Mbps' },
            { value: '5G Unlimited Mobile Plan',   label: '5G Unlimited Mobile Plan' },
            { value: 'Fiber Internet 1 Gbps',      label: 'Fiber Internet 1 Gbps' },
            { value: 'Business Internet 500 Mbps', label: 'Business Internet 500 Mbps' },
            { value: 'VoIP Corporate Package',     label: 'VoIP Corporate Package' },
          ]} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Quantity"       name="quantity"  type="number" value={formData.quantity}  onChange={handleChange} />
            <Field label="Unit Price ($)" name="unitPrice" type="number" value={formData.unitPrice} onChange={handleChange} placeholder="0.00" />
          </div>

          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>${calculateTotal()}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={[
              { value: 'Pending',     label: '🟡 Pending' },
              { value: 'In progress', label: '🔵 In Progress' },
              { value: 'Completed',   label: '🟢 Completed' },
            ]} />
            <SelectField label="Created By" name="createdBy" value={formData.createdBy} onChange={handleChange} options={[
              { value: 'Mr. Michael Harris', label: 'Mr. Michael Harris' },
              { value: 'Mr. Ryan Cooper',    label: 'Mr. Ryan Cooper' },
              { value: 'Ms. Olivia Carter',  label: 'Ms. Olivia Carter' },
              { value: 'Mr. Lucas Martin',   label: 'Mr. Lucas Martin' },
            ]} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : initialData ? 'Update Order' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
