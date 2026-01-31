import React, { useState, useEffect } from 'react';
import './SOSNotification.css';

function SOSNotification({ sosData, onCreateDelivery, onDismiss }) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    // If no expires_at, default to 60 seconds from now
    const expiresAt = sosData.expires_at 
      ? new Date(sosData.expires_at) 
      : new Date(Date.now() + 60000);
      
    const interval = setInterval(() => {
      const now = new Date();
      const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(secondsLeft);

      if (secondsLeft === 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sosData.expires_at, onDismiss]);

  // Safe access to nested properties
  const customer = sosData.customer || {};
  const vehicle = sosData.vehicle || {};
  const location = sosData.location || {};

  return (
    <div className="sos-notification-overlay">
      <div className="sos-notification-modal">
        {/* Header */}
        <div className="sos-header">
          <h2 className="sos-header-title">Emergency SOS Request</h2>
          <button className="sos-close-btn" onClick={onDismiss}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 1L1 11M1 1L11 11" stroke="#98A2B3" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="sos-content">
          {/* Timer */}
          <div className="sos-timer">
            <span className="sos-timer-label">Time Remaining:</span>
            <span className="sos-timer-value">{timeLeft}S</span>
          </div>

          {/* Customer Information */}
          <div className="sos-section">
            <h3 className="sos-section-title">Customer Information</h3>
            <div className="sos-info-row">
              <div className="sos-info-group">
                <span className="sos-info-label">Name</span>
                <span className="sos-info-value">{customer.name || 'Unknown'}</span>
              </div>
              <div className="sos-info-group">
                <span className="sos-info-label">Contact Number</span>
                <span className="sos-info-value">{customer.phone || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="sos-section">
            <h3 className="sos-section-title">Vehicle Details</h3>
            <div className="sos-info-row">
              <div className="sos-info-column">
                <div className="sos-info-group">
                  <span className="sos-info-label">Make</span>
                  <span className="sos-info-value">{vehicle.make || 'Unknown'}</span>
                </div>
                <div className="sos-info-group">
                  <span className="sos-info-label">Year</span>
                  <span className="sos-info-value">{vehicle.year || 'Unknown'}</span>
                </div>
                <div className="sos-info-group">
                  <span className="sos-info-label">License Plate</span>
                  <span className="sos-info-value">{vehicle.plate || vehicle.licensePlate || 'Unknown'}</span>
                </div>
              </div>
              <div className="sos-info-column">
                <div className="sos-info-group">
                  <span className="sos-info-label">Model</span>
                  <span className="sos-info-value">{vehicle.model || 'Unknown'}</span>
                </div>
                <div className="sos-info-group">
                  <span className="sos-info-label">Color</span>
                  <span className="sos-info-value">{vehicle.color || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="sos-section">
            <h3 className="sos-section-title">Location</h3>
            <div className="sos-location-row">
              <div className="sos-location-item">
                <span className="sos-info-label">Lat</span>
                <span className="sos-info-value">{location.latitude?.toFixed?.(7) || location.latitude || 'Unknown'}</span>
              </div>
              <div className="sos-location-item">
                <span className="sos-info-label">Long</span>
                <span className="sos-info-value">{location.longitude?.toFixed?.(8) || location.longitude || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sos-actions">
            <button className="sos-btn-create-delivery" onClick={() => onCreateDelivery(sosData)}>
              Create delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SOSNotification;
