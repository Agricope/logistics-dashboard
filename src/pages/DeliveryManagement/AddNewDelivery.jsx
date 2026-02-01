import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateDeliveryMutation } from "../../store/deliveryApi";
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
    clientName: "",
    clientMobileNumber: "",
    clientEmail: "",
    location: "",
    delivery_address: "",
    dateTime: "",
    assignedDriver: "",
    source: "",
    delivery_notes: "",
    sos_id: ""
  });

  // Produce items state
  const [produceItems, setProduceItems] = useState([
    { name: "", quantity: 1, unit: "kg", price_per_unit: 0 }
  ]);

  const [createDelivery, { isLoading }] = useCreateDeliveryMutation();
  const { data: driversData } = useGetDriversQuery({ page: 1, limit: 100 });
  const { data: sourcesData } = useGetSourcesQuery();
  
  const allDrivers = driversData?.drivers || [];
  const sources = sourcesData?.sources || [];

  // Filter drivers: must be Approved, Online, have a vehicle, and NOT currently on a job
  const availableDrivers = useMemo(() => {
    return allDrivers.filter(tech => {
      const isApproved = tech.applicationStatus === 'Approved';
      const isOnline = tech.currentStatus === 'Online';
      const hasVehicle = !!tech.assignedVehicle;
      // Driver should NOT be in progress on another job
      const isNotBusy = tech.currentStatus !== 'On Job';
      
      return isApproved && isOnline && hasVehicle && isNotBusy;
    });
  }, [allDrivers]);

  // Calculate total price from produce items
  const totalPrice = useMemo(() => {
    return produceItems.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.price_per_unit || 0);
      return sum + itemTotal;
    }, 0);
  }, [produceItems]);

  // Populate form with SOS data if available
  useEffect(() => {
    if (sosData) {
      const sosSource = sources.find(s => s.mainSourceName?.toLowerCase() === 'sos');
      
      setFormData(prev => ({
        ...prev,
        customer_id: sosData.customer_id,
        clientName: sosData.customer.name,
        clientMobileNumber: sosData.customer.phone,
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

  // Handle produce item changes
  const handleProduceItemChange = (index, field, value) => {
    setProduceItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'quantity' || field === 'price_per_unit' ? parseFloat(value) || 0 : value
      };
      return updated;
    });
  };

  // Add new produce item row
  const addProduceItem = () => {
    setProduceItems(prev => [...prev, { name: "", quantity: 1, unit: "kg", price_per_unit: 0 }]);
  };

  // Remove produce item row
  const removeProduceItem = (index) => {
    if (produceItems.length > 1) {
      setProduceItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate produce items
    const validProduceItems = produceItems.filter(item => 
      item.name.trim() !== "" && item.quantity > 0 && item.price_per_unit >= 0
    );

    if (validProduceItems.length === 0) {
      alert("Please add at least one produce item with a name and quantity.");
      return;
    }

    try {
      const jobData = {
        customer_id: formData.customer_id,
        clientName: formData.clientName,
        clientMobileNumber: formData.clientMobileNumber,
        location: formData.location,
        delivery_address: formData.delivery_address || formData.location,
        dateTime: formData.dateTime,
        assignedTechnician: formData.assignedDriver,
        produce_items: validProduceItems,
        source: formData.source,
        delivery_notes: formData.delivery_notes
      };
      
      if (formData.sos_id) {
        jobData.sos_request_id = formData.sos_id;
      }
      
      await createDelivery(jobData).unwrap();
      navigate("/deliveries", { state: { successMessage: "Delivery created successfully" } });
    } catch (error) {
      console.error("Error creating delivery:", error);
      alert(error?.data?.message || "Failed to create delivery. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/deliveries");
  };

  const unitOptions = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "pieces", label: "Pieces" },
    { value: "boxes", label: "Boxes" },
    { value: "crates", label: "Crates" },
    { value: "bundles", label: "Bundles" },
    { value: "bags", label: "Bags" },
    { value: "liters", label: "Liters" }
  ];

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
          </div>

          {/* Section 2: Produce Items */}
          <div className="add-new-job-section">
            <div className="produce-section-header">
              <h2 className="add-new-job-section-title">Produce Items</h2>
              <button 
                type="button" 
                className="add-produce-btn"
                onClick={addProduceItem}
              >
                + Add Item
              </button>
            </div>

            {produceItems.map((item, index) => (
              <div key={index} className="produce-item-row">
                <div className="add-new-job-row">
                  <div className="add-new-job-field">
                    <label>Produce Name*</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleProduceItemChange(index, 'name', e.target.value)}
                      placeholder="e.g., Tomatoes, Potatoes, Onions"
                      required
                    />
                  </div>

                  <div className="add-new-job-field">
                    <label>Quantity*</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleProduceItemChange(index, 'quantity', e.target.value)}
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>

                  <div className="add-new-job-field">
                    <label>Unit</label>
                    <CustomSelect
                      value={item.unit}
                      onChange={(value) => handleProduceItemChange(index, 'unit', value)}
                      options={unitOptions}
                      placeholder="Select Unit"
                    />
                  </div>
                </div>

                <div className="add-new-job-row produce-price-row">
                  <div className="add-new-job-field">
                    <label>Price per Unit (QAR)*</label>
                    <input
                      type="number"
                      value={item.price_per_unit}
                      onChange={(e) => handleProduceItemChange(index, 'price_per_unit', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="add-new-job-field">
                    <label>Item Total</label>
                    <input
                      type="text"
                      value={`QAR ${((item.quantity || 0) * (item.price_per_unit || 0)).toFixed(2)}`}
                      disabled
                      className="item-total-input"
                    />
                  </div>

                  <div className="add-new-job-field remove-btn-container">
                    {produceItems.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-produce-btn"
                        onClick={() => removeProduceItem(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {index < produceItems.length - 1 && <hr className="produce-divider" />}
              </div>
            ))}

            <div className="total-price-display">
              <span className="total-label">Total Order Value:</span>
              <span className="total-value">QAR {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Section 3: Delivery Details */}
          <div className="add-new-job-section">
            <h2 className="add-new-job-section-title">Delivery Details</h2>
            
            <div className="add-new-job-row">
              <div className="add-new-job-field">
                <label>Pickup Location*</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter pickup address"
                  required
                />
              </div>

              <div className="add-new-job-field">
                <label>Delivery Address*</label>
                <input
                  type="text"
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  placeholder="Enter delivery address"
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
            </div>

            <div className="add-new-job-row">
              <div className="add-new-job-field">
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

              <div className="add-new-job-field"></div>
              <div className="add-new-job-field"></div>
            </div>

            <div className="add-new-job-row">
              <div className="add-new-job-field full-width">
                <label>Delivery Notes</label>
                <textarea
                  name="delivery_notes"
                  value={formData.delivery_notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for delivery..."
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
            {isLoading ? "Creating..." : "Create Delivery"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddNewDelivery;
