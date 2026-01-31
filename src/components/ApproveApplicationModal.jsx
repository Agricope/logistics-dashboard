import React, { useState } from "react";
import { useUpdateDriverMutation } from "../store/driverApi";
import "./ApproveApplicationModal.css";

export default function ApproveApplicationModal({ open, onClose, driver, onSuccess }) {
  const [status, setStatus] = useState("Approved");
  const [updateDriver, { isLoading }] = useUpdateDriverMutation();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateDriver({ 
        id: driver._id, 
        applicationStatus: status 
      }).unwrap();
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to update application status:", err);
      alert("Failed to update application status. Please try again.");
    }
  };

  return (
    <div className="approve-app-modal-backdrop" onClick={onClose}>
      <div className="approve-app-modal" onClick={(e) => e.stopPropagation()}>
        <button className="approve-app-modal-close" onClick={onClose}>
          <div className="approve-app-modal-close-icon">✕</div>
        </button>
        
        <div className="approve-app-modal-header">
          <h2 className="approve-app-modal-title">Documents</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Work Permit Front */}
          <div className="approve-app-modal-section">
            <div className="approve-app-modal-doc-group">
              <h3 className="approve-app-modal-doc-title">Work Permit Front</h3>
              <div className="approve-app-modal-image-preview">
                {driver.workPermitFront ? (
                  <img src={driver.workPermitFront} alt="Work Permit Front" />
                ) : (
                  <div className="approve-app-modal-no-image">No document uploaded</div>
                )}
              </div>
            </div>
          </div>

          {/* Work Permit Back */}
          <div className="approve-app-modal-section">
            <div className="approve-app-modal-doc-group">
              <h3 className="approve-app-modal-doc-title">Work Permit Back</h3>
              <div className="approve-app-modal-image-preview">
                {driver.workPermitBack ? (
                  <img src={driver.workPermitBack} alt="Work Permit Back" />
                ) : (
                  <div className="approve-app-modal-no-image">No document uploaded</div>
                )}
              </div>
            </div>
          </div>

          {/* Driving License Front */}
          <div className="approve-app-modal-section">
            <div className="approve-app-modal-doc-group">
              <h3 className="approve-app-modal-doc-title">Driving License Front</h3>
              <div className="approve-app-modal-image-preview">
                {driver.drivingLicenseFront ? (
                  <img src={driver.drivingLicenseFront} alt="Driving License Front" />
                ) : (
                  <div className="approve-app-modal-no-image">No document uploaded</div>
                )}
              </div>
            </div>
          </div>

          {/* Driving License Back */}
          <div className="approve-app-modal-section">
            <div className="approve-app-modal-doc-group">
              <h3 className="approve-app-modal-doc-title">Driving License Back</h3>
              <div className="approve-app-modal-image-preview">
                {driver.drivingLicenseBack ? (
                  <img src={driver.drivingLicenseBack} alt="Driving License Back" />
                ) : (
                  <div className="approve-app-modal-no-image">No document uploaded</div>
                )}
              </div>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="approve-app-modal-expiry-row">
            <span className="approve-app-modal-expiry-label">Expiry Date*</span>
            <div className="approve-app-modal-date-display">
              <img src="/icons/configurator.svg" alt="Calendar" className="approve-app-modal-calendar-icon" />
              <span>{driver.workPermitExpiration || driver.drivingLicenseExpiration || "Not set"}</span>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="approve-app-modal-status-section">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="approve-app-modal-status-select"
            >
              <option value="Approved">Approve</option>
              <option value="Rejected">Reject</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="approve-app-modal-footer">
            <button 
              className={`approve-app-modal-submit${status === 'Approved' ? ' approve-app-modal-submit-approve' : ''}`}
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : status === 'Approved' ? "Approve Application" : "Reject Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
