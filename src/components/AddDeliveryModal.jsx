import React, { useState, useEffect, useMemo } from "react";
import { useCreateDeliveryMutation } from "../store/deliveryApi";
import { useGetDriversQuery } from "../store/driverApi";
import { useGetSourcesQuery } from "../store/sourceApi";
import CustomSelect from "./CustomSelect.jsx";
import "./AddDeliveryModal.css";

function AddDeliveryModal({ open, onClose, onSuccess, sosData }) {
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_vehicle_id: "",
    clientName: "",
    clientMobileNumber: "",
    issue: "",
    location: "",
    dateTime: "",
    deliveryType: "",
    assignedDriver: "",
    price: "",
    source: "",
    sos_id: ""
  });

  const [createDelivery, { isLoading }] = useCreateDeliveryMutation();
  const { data: driversData } = useGetDriversQuery(undefined, { skip: !open });
  const { data: sourcesData } = useGetSourcesQuery(undefined, { skip: !open });
  
  const allDrivers = driversData?.drivers || [];
  const sources = sourcesData?.sources || [];

  // Filter drivers by online status, vehicle assignment, and expertise matching delivery type
  const availableDrivers = useMemo(() => {
    console.log('=== TECHNICIAN FILTERING DEBUG ===');
    console.log('All drivers raw:', allDrivers);
    console.log('Job type selected:', formData.deliveryType);
    
    const filtered = allDrivers.filter(tech => {
      console.log(`\nChecking driver: ${tech.firstName} ${tech.lastName}`);
      console.log('  - applicationStatus:', tech.applicationStatus, '(need: Approved)');
      console.log('  - currentStatus:', tech.currentStatus, '(need: Online or Available)');
      console.log('  - assignedVehicle:', tech.assignedVehicle);
      console.log('  - expertise:', tech.expertise);
      
      const isApproved = tech.applicationStatus === 'Approved';
      const isAvailable = tech.currentStatus === 'Online' || tech.currentStatus === 'Available';
      const hasVehicle = !!tech.assignedVehicle;
      
      console.log('  - isApproved:', isApproved);
      console.log('  - isAvailable:', isAvailable);
      console.log('  - hasVehicle:', hasVehicle);
      
      // If no delivery type selected, only filter by status and vehicle
      if (!formData.deliveryType) {
        const passes = isApproved && isAvailable && hasVehicle;
        console.log('  - No delivery type - PASSES:', passes);
        return passes;
      }
      
      // If delivery type is selected, also check expertise
      const techExpertise = tech.expertise || [];
      const matchesExpertise = techExpertise.includes(formData.deliveryType);
      
      console.log('  - matchesExpertise:', matchesExpertise);
      
      const passes = isApproved && isAvailable && hasVehicle && matchesExpertise;
      console.log('  - With delivery type - PASSES:', passes);
      return passes;
    });
    
    console.log('\n=== FILTERED RESULT ===');
    console.log('Available drivers:', filtered);
    console.log('Count:', filtered.length);
    
    return filtered;
  }, [allDrivers, formData.deliveryType]);

  // Populate form with SOS data if available
  useEffect(() => {
    if (sosData && open) {
      // Find the SOS source from sources list
      const sosSource = sources.find(s => s.mainSourceName?.toLowerCase() === 'sos');
      
      setFormData(prev => ({
        ...prev,
        customer_id: sosData.customer_id,
        customer_vehicle_id: sosData.customer_vehicle_id,
        clientName: sosData.customer.name,
        clientMobileNumber: sosData.customer.phone,
        issue: "", // Optional - admin fills this
        location: sosData.location.coordinates, // GPS coordinates as string
        source: sosSource?._id || "",
        sos_id: sosData.sos_id
      }));
    }
  }, [sosData, open, sources]);

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
      const jobData = {
        customer_id: formData.customer_id,
        customer_vehicle_id: formData.customer_vehicle_id,
        clientName: formData.clientName,
        clientMobileNumber: formData.clientMobileNumber,
        issue: formData.issue || "No issue description provided",
        location: formData.location,
        dateTime: formData.dateTime,
        deliveryType: formData.deliveryType,
        assignedDriver: formData.assignedDriver,
        price: formData.price,
        source: formData.source
        // Don't send job_status - let backend decide based on driver assignment
      };
      
      // Only include sos_request_id if it exists
      if (formData.sos_id) {
        jobData.sos_request_id = formData.sos_id;
      }
      
      await createDelivery(jobData).unwrap();
      handleCancel();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating delivery:", error);
      alert(error?.data?.message || "Failed to create delivery. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      customer_id: "",
      customer_vehicle_id: "",
      clientName: "",
      clientMobileNumber: "",
      issue: "",
      location: "",
      dateTime: "",
      deliveryType: "",
      assignedDriver: "",
      price: "",
      source: "",
      sos_id: ""
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="add-delivery-modal-backdrop">
      <div className="add-delivery-modal">
        <button className="add-delivery-modal-close" onClick={handleCancel} aria-label="Close">
          <span className="add-delivery-modal-close-x">&#10005;</span>
        </button>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="add-delivery-modal-header">
            <div className="add-delivery-modal-title">Add New Delivery</div>
            <div className="add-delivery-modal-subtitle">Add your delivery details</div>
          </div>
          <div className="add-delivery-modal-section">
            <div className="add-delivery-modal-section-title">Client Details</div>
            <div className="add-delivery-modal-fields">
              <div className="add-delivery-modal-row">
                <div className="add-delivery-modal-field">
                  <label>Client Name*</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    disabled={!!sosData}
                    required
                  />
                </div>
                <div className="add-delivery-modal-field">
                  <label>Client Mobile Number*</label>
                  <input
                    type="text"
                    name="clientMobileNumber"
                    value={formData.clientMobileNumber}
                    onChange={handleInputChange}
                    placeholder="+974"
                    disabled={!!sosData}
                    required
                  />
                </div>
              </div>
              {sosData && (
                <div className="add-delivery-modal-row">
                  <div className="add-delivery-modal-field" style={{ width: 612 }}>
                    <label>Vehicle</label>
                    <input
                      type="text"
                      value={`${sosData.vehicle.make} ${sosData.vehicle.model} - ${sosData.vehicle.plate}`}
                      disabled
                      style={{ background: '#F9FAFB', color: '#667085' }}
                    />
                  </div>
                </div>
              )}
              <div className="add-delivery-modal-row">
                <div className="add-delivery-modal-field" style={{ width: 612 }}>
                  <label>Issue{!sosData && '*'}</label>
                  <textarea
                    name="issue"
                    value={formData.issue}
                    onChange={handleInputChange}
                    className="add-delivery-modal-textarea"
                    placeholder="Describe the issue..."
                    required={!sosData}
                  />
                </div>
              </div>
              <div className="add-delivery-modal-row">
                <div className="add-delivery-modal-field">
                  <label>Location* {!sosData && <span style={{color: '#667085', fontWeight: 400, fontSize: '12px'}}>(Address only - no GPS)</span>}</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder={sosData ? "GPS coordinates from SOS" : "Enter full address (e.g., Al Rayyan, Doha)"}
                    required
                  />
                </div>
                <div className="add-delivery-modal-field">
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
              <div className="add-delivery-modal-row">
                <div className="add-delivery-modal-field">
                  <label>Delivery Type*</label>
                  <CustomSelect
                    value={formData.deliveryType}
                    onChange={(value) => setFormData(prev => ({ ...prev, deliveryType: value }))}
                    options={[
                      { value: "Tires", label: "Tires" },
                      { value: "Engines", label: "Engines" },
                      { value: "Gearbox", label: "Gearbox" }
                    ]}
                    placeholder="Select Delivery Type"
                  />
                </div>
                <div className="add-delivery-modal-field">
                  <label>Assigned Driver</label>
                  <CustomSelect
                    value={formData.assignedDriver}
                    onChange={(value) => setFormData(prev => ({ ...prev, assignedDriver: value }))}
                    options={availableDrivers.map(tech => ({
                      value: tech._id,
                      label: `${tech.firstName} ${tech.lastName}`
                    }))}
                    placeholder="Select Driver"
                  />
                </div>
              </div>
              <div className="add-delivery-modal-row">
                <div className="add-delivery-modal-field">
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
                <div className="add-delivery-modal-field">
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
            <button className="add-delivery-modal-submit" type="submit">
              Add Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDeliveryModal;
