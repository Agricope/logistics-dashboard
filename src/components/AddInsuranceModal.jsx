import React, { useState, useEffect } from "react";
import { useGetVehicleMakesQuery, useGetVehicleModelsByMakeQuery } from "../store/vehicleConfigApi";
import "./AddInsuranceModal.css";

export default function AddInsuranceModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    plateNumber: "",
    vinNumber: "",
    clientName: "",
    phoneNumber: "",
    subscriptionType: "",
    startDate: "",
    endDate: ""
  });

  const { data: makesData } = useGetVehicleMakesQuery();
  const { data: modelsData, isLoading: isLoadingModels } = useGetVehicleModelsByMakeQuery(formData.make, {
    skip: !formData.make
  });

  const makes = makesData?.makes || [];
  const models = modelsData?.models || [];

  const subscriptionTypes = ["Full Coverage", "Liability Only"];

  useEffect(() => {
    if (!open) {
      setFormData({
        make: "",
        model: "",
        year: "",
        color: "",
        plateNumber: "",
        vinNumber: "",
        clientName: "",
        phoneNumber: "",
        subscriptionType: "",
        startDate: "",
        endDate: ""
      });
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSuccess(formData);
  };

  const handleClose = () => {
    setFormData({
      make: "",
      model: "",
      year: "",
      color: "",
      plateNumber: "",
      vinNumber: "",
      clientName: "",
      phoneNumber: "",
      subscriptionType: "",
      startDate: "",
      endDate: ""
    });
    onClose();
  };

  return (
    <div className="add-insurance-modal-backdrop" onClick={handleClose}>
      <div className="add-insurance-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="add-insurance-modal-close" onClick={handleClose}>
          <div className="add-insurance-modal-close-icon">✕</div>
        </button>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="add-insurance-modal-header">
            <h2 className="add-insurance-modal-title">Add New Insurance Form</h2>
          </div>

          {/* Inputs */}
          <div className="add-insurance-modal-inputs">
            <p className="add-insurance-modal-subtitle">Enter new vehicle insurance.</p>

            {/* Make and Model Row */}
            <div className="add-insurance-modal-row">
              <div className="add-insurance-modal-field">
                <label>Make*</label>
                <select
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value, model: "" })}
                  required
                >
                  <option value="">Select make</option>
                  {makes.map(make => (
                    <option key={make._id} value={make._id}>
                      {make.makeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="add-insurance-modal-field">
                <label>Model*</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  disabled={!formData.make || isLoadingModels}
                >
                  <option value="">
                    {!formData.make ? "Select make first" : isLoadingModels ? "Loading models..." : "Select model"}
                  </option>
                  {models.map(model => (
                    <option key={model._id} value={model._id}>
                      {model.modelName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year and Color Row */}
            <div className="add-insurance-modal-row">
              <div className="add-insurance-modal-field">
                <label>Year*</label>
                <input
                  type="number"
                  placeholder="Enter year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                  min="1900"
                  max="2100"
                />
              </div>

              <div className="add-insurance-modal-field">
                <label>Color*</label>
                <input
                  type="text"
                  placeholder="Enter color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Plate Number and VIN Number Row */}
            <div className="add-insurance-modal-row">
              <div className="add-insurance-modal-field">
                <label>Plate Number*</label>
                <input
                  type="text"
                  placeholder="Enter plate number"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  required
                />
              </div>

              <div className="add-insurance-modal-field">
                <label>VIN Number*</label>
                <input
                  type="text"
                  placeholder="Enter VIN number"
                  value={formData.vinNumber}
                  onChange={(e) => setFormData({ ...formData, vinNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Client Name and Phone Number Row */}
            <div className="add-insurance-modal-row">
              <div className="add-insurance-modal-field">
                <label>Client Name*</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                />
              </div>

              <div className="add-insurance-modal-field">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="+974 "
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Subscription Type Row */}
            <div className="add-insurance-modal-row">
              <div className="add-insurance-modal-field add-insurance-modal-field-full">
                <label>Subscription Type*</label>
                <select
                  value={formData.subscriptionType}
                  onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                  required
                >
                  <option value="">Select type</option>
                  {subscriptionTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Date and End Date Row */}
            <div className="add-insurance-modal-row">
              <div className="add-insurance-modal-field">
                <label>Start Date*</label>
                <input
                  type="date"
                  placeholder="Select start date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="add-insurance-modal-field">
                <label>End Date*</label>
                <input
                  type="date"
                  placeholder="Select end date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="add-insurance-modal-footer">
              <button type="submit" className="add-insurance-modal-submit">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
