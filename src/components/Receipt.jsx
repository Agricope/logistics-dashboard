import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './Receipt.css';

const Receipt = ({ job, onClose }) => {
  const [generating, setGenerating] = useState(false);
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
    return id.substring(id.length - 8).toUpperCase();
  };

  const generatePDF = () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Colors
      const primaryColor = [10, 80, 56]; // #0a5038
      const textColor = [51, 51, 51];
      const lightGray = [150, 150, 150];

      // Header Background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 50, 'F');

      // Company Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('AGRICOPE', pageWidth / 2, 25, { align: 'center' });

      // Subtitle
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Delivery Receipt', pageWidth / 2, 38, { align: 'center' });

      yPos = 65;

      // Receipt Details Section
      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Receipt ID and Date Row
      doc.setTextColor(...lightGray);
      doc.text('Receipt ID:', margin, yPos);
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`#${getReceiptId(job?._id)}`, margin + 40, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightGray);
      doc.text('Date:', pageWidth - margin - 80, yPos);
      doc.setTextColor(...textColor);
      doc.text(formatDate(job?.completed_at || job?.updatedAt), pageWidth - margin - 60, yPos);

      yPos += 15;

      // Divider
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Customer Information Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Customer Information', margin, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Name
      doc.setTextColor(...lightGray);
      doc.text('Name:', margin, yPos);
      doc.setTextColor(...textColor);
      doc.text(job?.clientName || 'N/A', margin + 50, yPos);
      yPos += 8;

      // Phone
      doc.setTextColor(...lightGray);
      doc.text('Phone:', margin, yPos);
      doc.setTextColor(...textColor);
      doc.text(job?.clientMobileNumber || 'N/A', margin + 50, yPos);
      yPos += 8;

      // Address
      doc.setTextColor(...lightGray);
      doc.text('Delivery Address:', margin, yPos);
      doc.setTextColor(...textColor);
      const address = job?.delivery_address || job?.location || 'N/A';
      const addressLines = doc.splitTextToSize(address, pageWidth - margin - 80);
      doc.text(addressLines, margin + 50, yPos);
      yPos += (addressLines.length * 6) + 10;

      // Divider
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Items Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Items Delivered', margin, yPos);
      yPos += 12;

      if (produceItems.length === 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...lightGray);
        doc.text('No items listed', margin, yPos);
        yPos += 15;
      } else {
        // Table Header
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 10, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textColor);
        doc.text('Item', margin + 5, yPos);
        doc.text('Qty', pageWidth / 2, yPos, { align: 'center' });
        doc.text('Price', pageWidth - margin - 5, yPos, { align: 'right' });
        yPos += 10;

        // Table Rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        produceItems.forEach((item, index) => {
          const itemName = item.name || 'N/A';
          const qty = `${item.quantity || 0} ${item.unit || 'kg'}`;
          const price = `QAR ${(item.price_per_unit || 0).toFixed(2)}`;

          // Alternate row background
          if (index % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
          }

          doc.setTextColor(...textColor);
          doc.text(itemName, margin + 5, yPos);
          doc.text(qty, pageWidth / 2, yPos, { align: 'center' });
          doc.text(price, pageWidth - margin - 5, yPos, { align: 'right' });
          yPos += 10;
        });

        yPos += 5;
      }

      // Divider
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Total Section
      doc.setFillColor(240, 247, 244); // Light green background
      doc.rect(margin, yPos - 8, pageWidth - (margin * 2), 20, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textColor);
      doc.text('Total Amount', margin + 10, yPos + 3);
      
      doc.setFontSize(18);
      doc.setTextColor(...primaryColor);
      doc.text(`QAR ${totalAmount.toFixed(2)}`, pageWidth - margin - 10, yPos + 3, { align: 'right' });
      
      yPos += 25;

      // Payment Status
      if (job?.payment_status) {
        const isPaid = job.payment_status === 'paid';
        const statusColor = isPaid ? [46, 125, 50] : [230, 81, 0]; // Green or Orange
        const statusBg = isPaid ? [232, 245, 233] : [255, 243, 224];
        const statusText = isPaid ? 'Payment Completed' : 'Payment Pending';

        doc.setFillColor(...statusBg);
        doc.roundedRect(margin, yPos, 60, 12, 2, 2, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...statusColor);
        doc.text(statusText, margin + 30, yPos + 8, { align: 'center' });
        
        yPos += 25;
      }

      // Footer
      doc.setTextColor(...lightGray);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Thank you for choosing Agricope!', pageWidth / 2, yPos, { align: 'center' });

      // Footer line
      yPos += 15;
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(2);
      doc.line(margin, yPos, pageWidth - margin, yPos);

      // Save PDF
      const fileName = `Agricope-Receipt-${getReceiptId(job?._id)}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="receipt-close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Preview Header */}
        <div className="receipt-preview-header">
          <div className="receipt-preview-brand">
            <h1>AGRICOPE</h1>
            <span>Delivery Receipt</span>
          </div>
        </div>

        {/* Receipt Preview Content */}
        <div className="receipt-preview-content">
          {/* Receipt Info */}
          <div className="receipt-preview-row receipt-preview-meta">
            <div>
              <span className="receipt-preview-label">Receipt ID</span>
              <span className="receipt-preview-value">#{getReceiptId(job?._id)}</span>
            </div>
            <div>
              <span className="receipt-preview-label">Date</span>
              <span className="receipt-preview-value">{formatDate(job?.completed_at || job?.updatedAt)}</span>
            </div>
          </div>

          <div className="receipt-preview-divider" />

          {/* Customer Info */}
          <div className="receipt-preview-section">
            <h3>Customer Information</h3>
            <div className="receipt-preview-info">
              <div className="receipt-preview-info-row">
                <span>Name</span>
                <span>{job?.clientName || 'N/A'}</span>
              </div>
              <div className="receipt-preview-info-row">
                <span>Phone</span>
                <span>{job?.clientMobileNumber || 'N/A'}</span>
              </div>
              <div className="receipt-preview-info-row">
                <span>Address</span>
                <span>{job?.delivery_address || job?.location || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="receipt-preview-divider" />

          {/* Items */}
          <div className="receipt-preview-section">
            <h3>Items Delivered</h3>
            {produceItems.length === 0 ? (
              <p className="receipt-preview-empty">No items listed</p>
            ) : (
              <table className="receipt-preview-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {produceItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name || 'N/A'}</td>
                      <td>{item.quantity || 0} {item.unit || 'kg'}</td>
                      <td>QAR {(item.price_per_unit || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Total */}
          <div className="receipt-preview-total">
            <span>Total Amount</span>
            <span>QAR {totalAmount.toFixed(2)}</span>
          </div>

          {/* Payment Status */}
          {job?.payment_status && (
            <div className={`receipt-preview-status ${job.payment_status === 'paid' ? 'paid' : 'pending'}`}>
              {job.payment_status === 'paid' ? '✓ Payment Completed' : '⏳ Payment Pending'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="receipt-preview-actions">
          <button className="receipt-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button 
            className="receipt-btn-primary" 
            onClick={generatePDF}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="receipt-spinner"></span>
                Generating...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
