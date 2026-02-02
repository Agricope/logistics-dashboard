import React from 'react';
import './Receipt.css';

const Receipt = ({ job, onClose }) => {
  const produceItems = job?.produce_items || [];
  const totalAmount = job?.price || 0;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReceiptId = (id) => {
    if (!id) return 'N/A';
    return `#${id.substring(id.length - 8)}`;
  };

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-container" onClick={(e) => e.stopPropagation()}>
        <button className="receipt-close" onClick={onClose}>×</button>
        
        {/* Header with Agricope Branding */}
        <div className="receipt-header">
          <h1 className="receipt-company">AGRICOPE</h1>
          <p className="receipt-subtitle">Delivery Receipt</p>
        </div>

        {/* Receipt Details */}
        <div className="receipt-body">
          {/* Receipt Info */}
          <div className="receipt-section">
            <div className="receipt-info-row">
              <span className="receipt-label">Receipt ID</span>
              <span className="receipt-value">{getReceiptId(job?._id)}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Date</span>
              <span className="receipt-value">
                {formatDate(job?.completed_at || job?.updatedAt)}
              </span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Customer Information */}
          <div className="receipt-section">
            <h3 className="receipt-section-title">Customer Information</h3>
            <div className="receipt-info-row">
              <span className="receipt-label">Name</span>
              <span className="receipt-value">{job?.clientName || 'N/A'}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Phone</span>
              <span className="receipt-value">{job?.clientMobileNumber || 'N/A'}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Delivery Address</span>
              <span className="receipt-value receipt-value-address">
                {job?.delivery_address || job?.location || 'N/A'}
              </span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Produce Items */}
          <div className="receipt-section">
            <h3 className="receipt-section-title">Items Delivered</h3>
            
            {produceItems.length === 0 ? (
              <p className="receipt-no-items">No items listed</p>
            ) : (
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th className="receipt-table-header">Item</th>
                    <th className="receipt-table-header receipt-table-center">Qty</th>
                    <th className="receipt-table-header receipt-table-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {produceItems.map((item, index) => (
                    <tr key={index} className="receipt-table-row">
                      <td className="receipt-table-cell">{item.name || 'N/A'}</td>
                      <td className="receipt-table-cell receipt-table-center">
                        {item.quantity || 0} {item.unit || 'kg'}
                      </td>
                      <td className="receipt-table-cell receipt-table-right">
                        QAR {(item.price_per_unit || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Total */}
          <div className="receipt-total-section">
            <div className="receipt-total-row">
              <span className="receipt-total-label">Total Amount</span>
              <span className="receipt-total-value">QAR {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Status */}
          {job?.payment_status && (
            <div className={`receipt-payment-badge ${job.payment_status === 'paid' ? 'receipt-payment-paid' : 'receipt-payment-pending'}`}>
              <svg 
                className="receipt-payment-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                {job.payment_status === 'paid' ? (
                  <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm5.707 7.707l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8 12.586l6.293-6.293a1 1 0 111.414 1.414z"/>
                ) : (
                  <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm0 18a8 8 0 110-16 8 8 0 010 16zm1-13H9v6h2V5zm0 8H9v2h2v-2z"/>
                )}
              </svg>
              <span>Payment {job.payment_status === 'paid' ? 'Completed' : 'Pending'}</span>
            </div>
          )}

          {/* Footer */}
          <div className="receipt-footer">
            <p>Thank you for choosing Agricope!</p>
          </div>
        </div>

        {/* Print Button */}
        <div className="receipt-actions">
          <button className="receipt-btn receipt-btn-print" onClick={() => window.print()}>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
