import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateDeliveryMutation, useGetDeliveryTypesQuery } from "../../store/deliveryApi";
import { useGetDriversQuery } from "../../store/driverApi";
import { useGetSourcesQuery } from "../../store/sourceApi";
import CustomSelect from "../../components/CustomSelect.jsx";
import "./AddNewDelivery.css";

function AddNewDelivery() {
  const navigate = useNavigate();
  const location = useLocation();
  const sosData = location.state?.sosData;

  const [formData, setFormData] = useState({
    customer_id: "",
    customer_vehicle_id: "",
    clientName: "",
    clientMobileNumber: "",
    clientEmail: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleType: "",
    licensePlate: "",
    vinNumber: "",
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
  const { data: driversData } = useGetDriversQuery();
  const { data: sourcesData } = useGetSourcesQuery();
  const { data: deliveryTypesData } = useGetDeliveryTypesQuery();
  
  const allDrivers = driversData?.technicians || [];
  const sources = sourcesData?.sources || [];
  const deliveryTypesByExpertise = deliveryTypesData?.deliveryTypesByExpertise || {};
  const deliveryTypeMapping = deliveryTypesData?.deliveryTypeMapping || {};

  // Filter technicians by online status, vehicle assignment, and expertise matching delivery type
  const availableDrivers = useMemo(() => {
    const filtered = allDrivers.filter(tech => {
      const isApproved = tech.applicationStatus === 'Approved';
      const isAvailable = tech.currentStatus === 'Online';
      const hasVehicle = !!tech.assignedVehicle;
      
      if (!formData.deliveryType) {
        return isApproved && isAvailable && hasVehicle;
      }
      
      // Get required expertise for the selected delivery type
      const requiredExpertise = deliveryTypeMapping[formData.deliveryType];
      const techExpertise = tech.expertise || [];
      const matchesExpertise = techExpertise.includes(requiredExpertise);
      
      return isApproved && isAvailable && hasVehicle && matchesExpertise;
    });
    
    return filtered;
  }, [allDrivers, formData.deliveryType, deliveryTypeMapping]);

  // Populate form with SOS data if available
  useEffect(() => {
    if (sosData) {
      const sosSource = sources.find(s => s.mainSourceName?.toLowerCase() === 'sos');
      
      setFormData(prev => ({
        ...prev,
        customer_id: sosData.customer_id,
        customer_vehicle_id: sosData.customer_vehicle_id,
        clientName: sosData.customer.name,
        clientMobileNumber: sosData.customer.phone,
        issue: "",
        location: sosData.location.coordinates,
        source: sosSource?._id || "",
        sos_id: sosData.sos_id
      }));
    }
  }, [sosData, sources]);

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
        clientEmail: formData.clientEmail,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleType: formData.vehicleType,
        licensePlate: formData.licensePlate,
        vinNumber: formData.vinNumber,
        issue: formData.issue || "No issue description provided",
        location: formData.location,
        dateTime: formData.dateTime,
        deliveryType: formData.deliveryType,
        assignedDriver: formData.assignedDriver,
        price: formData.price,
        source: formData.source
      };
      
      if (formData.sos_id) {
        jobData.sos_request_id = formData.sos_id;
      }
      
      await createDelivery(jobData).unwrap();
      navigate("/deliveries", { state: { successMessage: "Job created successfully" } });
    } catch (error) {
      console.error("Error creating delivery:", error);
      alert(error?.data?.message || "Failed to create delivery. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/deliveries");
  };

  return (
    <div className="add-new-job-container">
      <div className="add-new-job-header">
        <button className="add-new-job-back" onClick={handleCancel}>
          <img src="/icons/long-arrow-left.svg" alt="Back" />
        </button>
        <h1 className="add-new-job-title">Add New Delivery</h1>
      </div>

      <form onSubmit={handleSubmit} className="add-new-job-form">
        <div className="add-new-job-card">
          {/* Section 1: Client Details */}
          <div className="add-new-job-section">
            <h2 className="add-new-job-section-title">Client Details</h2>
            
            <div className="add-new-job-row">
              <div className="add-new-job-field">
                <label>Client Name*</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  disabled={!!sosData}
                  required
                  placeholder="Enter client name"
                />
              </div>

              <div className="add-new-job-field">
                <label>Client Phone Number*</label>
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

              <div className="add-new-job-field">
                <label>Client Email Address</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="client@example.com"
                  disabled={!!sosData}
                />
              </div>
            </div>

            <div className="add-new-job-row">
              <div className="add-new-job-field">
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
            </div>

            <div className="add-new-job-row">
              <div className="add-new-job-field">
                <label>Vehicle Make*</label>
                <input
                  type="text"
                  name="vehicleMake"
                  value={formData.vehicleMake || ''}
                  onChange={handleInputChange}
                  placeholder="Enter vehicle make"
                  required
                />
              </div>

              <div className="add-new-job-field">
                <label>Vehicle Model*</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel || ''}
                  onChange={handleInputChange}
                  placeholder="Enter vehicle model"
                  required
                />
              </div>

              <div className="add-new-job-field">
                <label>Vehicle Type*</label>
                <input
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType || ''}
                  onChange={handleInputChange}
                  placeholder="Enter vehicle type"
                  required
                />
              </div>
            </div>

            <div className="add-new-job-row">
              <div className="add-new-job-field">
                <label>License Plate*</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate || ''}
                  onChange={handleInputChange}
                  placeholder="Enter license plate"
                  required
                />
              </div>

              <div className="add-new-job-field">
                <label>VIN Number*</label>
                <input
                  type="text"
                  name="vinNumber"
                  value={formData.vinNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Enter VIN number"
                  required
                />
              </div>

              <div className="add-new-job-field"></div>
            </div>
          </div>

          {/* Section 2: Job Details */}
          <div className="add-new-job-section">
            <h2 className="add-new-job-section-title">Job Details</h2>
            
            <div className="add-new-job-row">
              <div className="add-new-job-field">
                <label>Location*</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter full address (e.g., Al Rayyan, Doha)"
                  required
                />
              </div>

              <div className="add-new-job-field">
                <label>Date & Time*</label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="add-new-job-field"></div>
            </div>

            <div className="add-new-job-row">
              <div className="add-new-job-field">
                <label>Type of Job*</label>
                <CustomSelect
                  value={formData.deliveryType}
                  onChange={(value) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      deliveryType: value,
                      assignedDriver: "" // Reset technician when delivery type changes
                    }));
                  }}
                  options={Object.entries(deliveryTypeMapping).map(([deliveryType, expertise]) => ({
                    value: deliveryType,
                    label: `${deliveryType} (${expertise})`
                  }))}
                  placeholder="Select Delivery Type"
                />
              </div>

              <div className="add-new-job-field">
                <label>Assigned Driver</label>
                <CustomSelect
                  value={formData.assignedDriver}
                  onChange={(value) => setFormData(prev => ({ ...prev, assignedDriver: value }))}
                  options={availableDrivers.map(tech => ({
                    value: tech._id,
                    label: `${tech.firstName} ${tech.lastName}${tech.expertise?.length ? ` (${tech.expertise.join(', ')})` : ''}`
                  }))}
                  placeholder={formData.deliveryType ? "Select Driver" : "Select Delivery Type First"}
                  disabled={!formData.deliveryType}
                />
              </div>

              <div className="add-new-job-field">
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

            <div className="add-new-job-row">
              <div className="add-new-job-field full-width">
                <label>Issue</label>
                <textarea
                  name="issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  placeholder="Describe the issue..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="add-new-job-actions">
          <button type="button" className="add-new-job-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="add-new-job-submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Add Job"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddNewDelivery;
