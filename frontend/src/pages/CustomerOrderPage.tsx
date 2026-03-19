import { useState, useEffect } from 'react';
import axios from 'axios';
import OrderModal from '../components/OrderModal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const statusBadge = (status: string) => {
  if (!status) return null;
  const s = status.toLowerCase();
  let cls = 'badge ';
  if (s.includes('pending'))    cls += 'badge-pending';
  else if (s.includes('progress')) cls += 'badge-progress';
  else if (s.includes('complete')) cls += 'badge-completed';
  else cls += 'badge-pending';
  return <span className={cls}>{status}</span>;
};

const CustomerOrderPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/orders')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    setDeleting(id);
    axios.delete(`http://localhost:8080/api/orders/${id}`)
      .then(fetchOrders)
      .finally(() => setDeleting(null));
  };

  return (
    <div style={{ animation: 'fadeSlide 0.35s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Orders</h1>
          <p className="page-subtitle">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditingOrder(null); setIsModalOpen(true); }}
        >
          <Plus size={16} /> Create Order
        </button>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingOrder}
        onSubmit={(data: any) => {
          const req = editingOrder
            ? axios.put(`http://localhost:8080/api/orders/${editingOrder.id}`, data)
            : axios.post('http://localhost:8080/api/orders', data);
          return req.then(() => { setIsModalOpen(false); fetchOrders(); });
        }}
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state" style={{ padding: '4rem' }}>
            <div className="loading-pulse" />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-title">No orders yet</p>
            <p className="empty-state-body">Click "Create Order" to add your first one.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Country</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    #{o.id}
                  </td>
                  <td style={{ fontWeight: 500 }}>{o.product}</td>
                  <td>{o.quantity}</td>
                  <td>${o.unitPrice?.toFixed(2)}</td>
                  <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                    ${o.totalAmount?.toFixed(2)}
                  </td>
                  <td>{statusBadge(o.status)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{o.createdBy}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{o.country}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '5px 10px' }}
                        onClick={() => { setEditingOrder(o); setIsModalOpen(true); }}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px' }}
                        onClick={() => handleDelete(o.id)}
                        disabled={deleting === o.id}
                      >
                        <Trash2 size={13} /> {deleting === o.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerOrderPage;
