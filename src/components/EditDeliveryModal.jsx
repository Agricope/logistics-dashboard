import React, { useState, useEffect } from "react";
import { useGetDeliveryByIdQuery, useUpdateDeliveryMutation } from "../store/deliveryApi";
import { useGetOnlineDriversQuery } from "../store/driverApi";
import { useGetSourcesQuery } from "../store/sourceApi";
import CustomSelect from "./CustomSelect.jsx";
import "./EditDeliveryModal.css";

function EditDeliveryModal({ open, onClose, jobId, onSuccess }) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientMobileNumber: "",
    issue: "",
    location: "",
    dateTime: "",
    assignedDriver: "",
    price: "",
    source: ""
  });

  const { data: deliveryData } = useGetDeliveryByIdQuery(jobId, { skip: !jobId || !open });
  const [updateJob, { isLoading }] = useUpdateDeliveryMutation();
  const { data: driversData } = useGetOnlineDriversQuery(undefined, { skip: !open });
  const { data: sourcesData } = useGetSourcesQuery(undefined, { skip: !open });
  
  const onlineDrivers = driversData?.drivers || [];
  const sources = sourcesData?.sources || [];

  useEffect(() => {
    if (deliveryData?.job) {
      const job = deliveryData.job;
      setFormData({
        clientName: delivery.clientName || "",
        clientMobileNumber: delivery.clientMobileNumber || "",
        issue: delivery.issue || "",
        location: delivery.location || "",
        dateTime: delivery.dateTime ? new Date(delivery.dateTime).toISOString().slice(0, 16) : "",
        assignedDriver: delivery.assignedDriver?._id || delivery.assignedDriver || "",
        price: delivery.price || "",
        source: delivery.source?._id || delivery.source || ""
      });
    }
  }, [deliveryData]);

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
      await updateJob({ id: jobId, ...formData }).unwrap();
      handleCancel();
      onSuccess?.();
    } catch (error) {
      console.error("Error updating delivery:", error);
      alert("Failed to update delivery. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      clientName: "",
      clientMobileNumber: "",
      issue: "",
      location: "",
      dateTime: "",
      assignedDriver: "",
      price: "",
      source: ""
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="edit-delivery-modal-backdrop">
      <div className="edit-delivery-modal">
        <button className="edit-delivery-modal-close" onClick={handleCancel} aria-label="Close">
          <span className="edit-delivery-modal-close-x">&#10005;</span>
        </button>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="edit-delivery-modal-header">
            <div className="edit-delivery-modal-title">Edit Delivery</div>
            <div className="edit-delivery-modal-subtitle">Update delivery details</div>
          </div>
          <div className="edit-delivery-modal-section">
            <div className="edit-delivery-modal-section-title">Client Details</div>
            <div className="edit-delivery-modal-fields">
              <div className="edit-delivery-modal-row">
                <div className="edit-delivery-modal-field">
                  <label>Client Name*</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="edit-delivery-modal-field">
                  <label>Client Mobile Number*</label>
                  <input
                    type="text"
                    name="clientMobileNumber"
                    value={formData.clientMobileNumber}
                    onChange={handleInputChange}
                    placeholder="+974"
                    required
                  />
                </div>
              </div>
              <div className="edit-delivery-modal-row">
                <div className="edit-delivery-modal-field" style={{ width: 612 }}>
                  <label>Issue*</label>
                  <textarea
                    name="issue"
                    value={formData.issue}
                    onChange={handleInputChange}
                    className="edit-delivery-modal-textarea"
                    placeholder="Describe the issue..."
                    required
                  />
                </div>
              </div>
              <div className="edit-delivery-modal-row">
                <div className="edit-delivery-modal-field">
                  <label>Location*</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Delivery location"
                    required
                  />
                </div>
                <div className="edit-delivery-modal-field">
                  <label>Date & Time*</label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="edit-delivery-modal-row">
                <div className="edit-delivery-modal-field">
                  <label>Assigned Driver</label>
                  <CustomSelect
                    value={formData.assignedDriver}
                    onChange={(value) => setFormData(prev => ({ ...prev, assignedDriver: value }))}
                    options={onlineDrivers.map(tech => ({
                      value: tech._id,
                      label: `${tech.firstName} ${tech.lastName}`
                    }))}
                    placeholder="Select Driver"
                  />
                </div>
              </div>
              <div className="edit-delivery-modal-row">
                <div className="edit-delivery-modal-field">
                  <label>Source*</label>
                  <CustomSelect
                    value={formData.source}
                    onChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                    options={sources.filter(source => source.mainSourceName).map(source => ({
                      value: source._id,
                      label: source.mainSourceName
                    }))}
                    placeholder="Select Source"
                  />
                </div>
                <div className="edit-delivery-modal-field">
                  <label>Price*</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <button className="edit-delivery-modal-submit" type="submit">
              Update Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditDeliveryModal;
