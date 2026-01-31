import React, { useState, useEffect } from "react";
import "./EditInsuranceModal.css";

function EditInsuranceModal({ open, onClose, insuranceId, onSuccess }) {
  const [formData, setFormData] = useState({
    vehicle: "",
    vinNumber: "",
    clientName: "",
    subscriptionPlan: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    if (open && insuranceId) {
      // Load insurance data for editing
      // This would be an API call in a real app
      const mockInsuranceData = {
        vehicle: "vehicle1",
        vinNumber: "1HGBH41JXMN109186",
        clientName: "John Smith",
        subscriptionPlan: "premium",
        startDate: "2024-01-15",
        endDate: "2025-01-15"
      };
      setFormData(mockInsuranceData);
    }
  }, [open, insuranceId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to update insurance subscription
      console.log("Updating insurance subscription:", insuranceId, formData);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating insurance subscription:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      vehicle: "",
      vinNumber: "",
      clientName: "",
      subscriptionPlan: "",
      startDate: "",
      endDate: ""
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="edit-insurance-modal-backdrop">
      <div className="edit-insurance-modal">
        <button className="edit-insurance-modal-close" onClick={handleCancel} aria-label="Close">
          <span className="edit-insurance-modal-close-x">&#10005;</span>
        </button>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="edit-insurance-modal-header">
            <div className="edit-insurance-modal-title">Edit Subscription</div>
            <div className="edit-insurance-modal-subtitle">Update vehicle insurance subscription details</div>
          </div>
          <div className="edit-insurance-modal-section">
            <div className="edit-insurance-modal-section-title">Subscription Details</div>
            <div className="edit-insurance-modal-fields">
              <div className="edit-insurance-modal-row">
                <div className="edit-insurance-modal-field">
                  <label>Vehicle*</label>
                  <select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Vehicle</option>
                    <option value="vehicle1">Toyota Camry - ABC-123</option>
                    <option value="vehicle2">Honda Civic - XYZ-789</option>
                    <option value="vehicle3">Nissan Altima - DEF-456</option>
                  </select>
                </div>
                <div className="edit-insurance-modal-field">
                  <label>VIN Number*</label>
                  <input
                    type="text"
                    name="vinNumber"
                    value={formData.vinNumber}
                    onChange={handleInputChange}
                    placeholder="1HGBH41JXMN109186"
                    required
                  />
                </div>
              </div>
              <div className="edit-insurance-modal-row">
                <div className="edit-insurance-modal-field">
                  <label>Client Name*</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Client name"
                    required
                  />
                </div>
                <div className="edit-insurance-modal-field">
                  <label>Subscription Plan*</label>
                  <select
                    name="subscriptionPlan"
                    value={formData.subscriptionPlan}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Plan</option>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
              <div className="edit-insurance-modal-row">
                <div className="edit-insurance-modal-field">
                  <label>Start Date*</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="edit-insurance-modal-field">
                  <label>End Date*</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <button className="edit-insurance-modal-submit" type="submit">
              Update Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditInsuranceModal;
