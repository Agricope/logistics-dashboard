import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetDeliveryByIdQuery, useGetDeliveryRepairsQuery, useUpdateDeliveryMutation } from "../../store/deliveryApi";
import { useGetDriversQuery } from "../../store/driverApi";
import io from "socket.io-client";
import "./DeliveryDetails.css";

function DeliveryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetDeliveryByIdQuery(id);
  const { data: repairsData } = useGetDeliveryRepairsQuery(id);
  const { data: driversData } = useGetDriversQuery();
  const [updateDelivery] = useUpdateDeliveryMutation();
  
  const [socket, setSocket] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [techSearch, setTechSearch] = useState("");
  const [editingEstimate, setEditingEstimate] = useState(false);
  const [estimateValue, setEstimateValue] = useState("");
  const techDropdownRef = useRef(null);

  const job = data?.delivery;
  const repairs = repairsData?.repairs || [];
  const drivers = driversData?.drivers || [];
  const financials = data?.financials || { 
    currentEstimate: 0, 
    totalCost: 0, 
    currentProfit: 0, 
    suggestedTotal: 0,
    isPaid: false,
    finalAmount: null
  };

  // Connect to admin socket for cancel job functionality
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    const adminSocket = io(`${socketUrl}/admin`, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    adminSocket.on('connect', () => {
      console.log('DeliveryDetails: Admin socket connected');
    });

    adminSocket.on('jobCancelled', (data) => {
      console.log('Job cancelled confirmation:', data);
      if (data.delivery_id === id) {
        refetch(); // Refresh job data
      }
    });

    adminSocket.on('error', (data) => {
      console.error('Socket error:', data);
      alert(data.message || 'An error occurred');
      setCancelling(false);
    });

    setSocket(adminSocket);

    return () => {
      adminSocket.disconnect();
    };
  }, [id, refetch]);

  // Initialize selected driver from job data
  useEffect(() => {
    if (job?.assignedDriver) {
      setSelectedDriver(job.assignedDriver);
    }
    if (job?.estimate) {
      setEstimateValue(job.estimate);
    }
  }, [job]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) {
        setShowTechDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter drivers by search, expertise matching job type, online status, and vehicle assignment
  const filteredDrivers = drivers.filter(tech => {
    const fullName = `${tech.firstName} ${tech.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(techSearch.toLowerCase());
    const isApproved = tech.applicationStatus === 'Approved';
    const isOnline = tech.currentStatus === 'Online';
    const hasVehicle = !!tech.assignedVehicle;
    
    // Check if driver's expertise matches job type
    const matchesExpertise = job?.deliveryType ? 
      (tech.expertise || []).includes(job.deliveryType) : 
      true; // If no job type, show all drivers
    
    return matchesSearch && isApproved && isOnline && hasVehicle && matchesExpertise;
  });

  // Handle driver selection
  const handleDriverSelect = (tech) => {
    setSelectedDriver(tech);
    setShowTechDropdown(false);
    setTechSearch("");
  };

  // Handle save
  const handleSave = async () => {
    try {
      await updateDelivery({
        id: job._id,
        assignedDriver: selectedDriver?._id || null
      }).unwrap();
      alert('Job updated successfully');
      refetch();
    } catch (err) {
      console.error('Failed to update job:', err);
      alert('Failed to update job');
    }
  };

  // Handle update estimate
  const handleUpdateEstimate = async () => {
    try {
      const newEstimate = parseFloat(estimateValue);
      if (isNaN(newEstimate) || newEstimate < 0) {
        alert('Please enter a valid estimate amount');
        return;
      }
      
      await updateDelivery({
        id: job._id,
        estimate: newEstimate
      }).unwrap();
      
      setEditingEstimate(false);
      alert('Estimate updated successfully');
      refetch();
    } catch (err) {
      console.error('Failed to update estimate:', err);
      alert('Failed to update estimate');
    }
  };

  // Use financials from API response
  const currentEstimate = financials.currentEstimate || 0;
  const totalCost = financials.totalCost || 0;
  const currentProfit = financials.currentProfit || 0;
  const isPaid = financials.isPaid || false;

  // Handle cancel job
  const handleCancelJob = () => {
    if (!socket || !job) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to cancel this job?\n\nThis will notify both the customer and driver.`
    );
    
    if (!confirmed) return;

    setCancelling(true);
    
    socket.emit('adminCancelJob', {
      job_id: job._id,
      customer_id: job.customer_id?._id || job.customer_id,
      driver_id: job.assignedDriver?._id || job.assignedDriver,
      reason: 'Cancelled by admin'
    });
  };

  if (isLoading) {
    return <div className="delivery-details-loading">Loading...</div>;
  }

  if (error || !job) {
    return <div className="delivery-details-error">Job not found</div>;
  }

  // Format date and time
  const jobDate = new Date(job.dateTime);
  const formattedDate = jobDate.toLocaleDateString('en-US', { 
    month: 'numeric', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = jobDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  // Get job status label and class
  const getJobStatusInfo = (status) => {
    const statusMap = {
      "pending": { label: "Pending", class: "pending" },
      "assigned": { label: "Assigned", class: "assigned" },
      "en_route": { label: "En Route", class: "enroute" },
      "arrived": { label: "Arrived", class: "arrived" },
      "in_progress": { label: "In Progress", class: "inprogress" },
      "completed": { label: "Completed", class: "completed" },
      "paid": { label: "Paid", class: "paid" },
      "confirmed": { label: "Confirmed", class: "confirmed" },
      "cancelled": { label: "Cancelled", class: "cancelled" }
    };
    return statusMap[status] || { label: status, class: "default" };
  };

  const statusInfo = getJobStatusInfo(job.delivery_status);

  return (
    <div className="delivery-details-container">
      <h1 className="delivery-details-page-header">Job Management</h1>
      
      <div className="delivery-details-card">
        <div className="delivery-details-header">
          <h2 className="delivery-details-title">Delivery Details</h2>
        </div>

        <div className="delivery-details-content">
          {/* Job Information Section */}
          <div className="delivery-details-section">
            <div className="delivery-details-section-left">
              <h3 className="delivery-details-section-title">Job Information</h3>
              
              <div className="delivery-details-info-grid">
                <div className="delivery-details-info-column">
                  <div className="delivery-details-info-group">
                    <span className="delivery-details-label">Delivery ID</span>
                    <span className="delivery-details-value">{job._id?.slice(-8).toUpperCase() || 'N/A'}</span>
                  </div>
                  
                  <div className="delivery-details-info-group">
                    <span className="delivery-details-label">Job Location</span>
                    <div className="delivery-details-location">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 9.75C10.2426 9.75 11.25 8.74264 11.25 7.5C11.25 6.25736 10.2426 5.25 9 5.25C7.75736 5.25 6.75 6.25736 6.75 7.5C6.75 8.74264 7.75736 9.75 9 9.75Z" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 16.5C9 16.5 15 11.625 15 7.5C15 4.18629 12.3137 1.5 9 1.5C5.68629 1.5 3 4.18629 3 7.5C3 11.625 9 16.5 9 16.5Z" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="delivery-details-location-link">{job.location}</span>
                    </div>
                  </div>
                </div>

                <div className="delivery-details-info-column">
                  <div className="delivery-details-info-group">
                    <span className="delivery-details-label">Date & Time</span>
                    <span className="delivery-details-value">{formattedDate} - {formattedTime}</span>
                  </div>
                  
                  <div className="delivery-details-info-group">
                    <span className="delivery-details-label">Delivery Status</span>
                    <span className={`delivery-details-status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  {job.delivery_status === 'completed' && job.completed_at && (
                    <div className="delivery-details-info-group">
                      <span className="delivery-details-label">Completion Date</span>
                      <span className="delivery-details-value">
                        {new Date(job.completed_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })} - {new Date(job.completed_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="delivery-details-section-title">Client Details</h3>
              
              <div className="delivery-details-info-grid">
                <div className="delivery-details-info-column">
                  <div className="delivery-details-info-group">
                    <span className="delivery-details-label">Name</span>
                    <span className="delivery-details-value">{job.clientName}</span>
                  </div>
                  
                  <div className="delivery-details-info-group">
                    <span className="delivery-details-label">Email Address</span>
                    <span className="delivery-details-value">{job.customer_id?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="delivery-details-info-column">
                  <div className="delivery-details-info-group">
                    <span className="delivery-details-label">Contact Number</span>
                    <span className="delivery-details-value">{job.clientMobileNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="delivery-details-divider"></div>

            <div className="delivery-details-section-right">
              <h3 className="delivery-details-section-title">Customer Vehicle Information</h3>
              
              <div className="delivery-details-vehicle-box">
                <div className="delivery-details-info-grid">
                  <div className="delivery-details-info-column">
                    <div className="delivery-details-info-group">
                      <span className="delivery-details-label">Make</span>
                      <span className="delivery-details-value-dark">
                        {job.customer_vehicle_id?.vehicle_make?.name || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="delivery-details-info-group">
                      <span className="delivery-details-label">Type</span>
                      <span className="delivery-details-value-dark">
                        {job.customer_vehicle_id?.vehicle_type || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="delivery-details-info-column">
                    <div className="delivery-details-info-group">
                      <span className="delivery-details-label">Model</span>
                      <span className="delivery-details-value-dark">
                        {job.customer_vehicle_id?.vehicle_model?.name || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="delivery-details-info-group">
                      <span className="delivery-details-label">Plate Number</span>
                      <span className="delivery-details-value-dark">
                        {job.customer_vehicle_id?.plate_number || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="delivery-details-info-group">
                <span className="delivery-details-label">Issue</span>
                <span className="delivery-details-value">{job.issue}</span>
              </div>
            </div>
          </div>

          {/* Assigned Driver Section */}
          <div className="delivery-details-section-full">
            <h3 className="delivery-details-section-title">Assigned Driver</h3>
            
            <div className="delivery-details-form-group">
              <label className="delivery-details-form-label">Assigned Driver</label>
              <div className="delivery-details-select-wrapper" ref={techDropdownRef}>
                <div 
                  className={`delivery-details-select ${job.assignedDriver ? 'delivery-details-select-disabled' : ''}`}
                  onClick={() => !job.assignedDriver && setShowTechDropdown(!showTechDropdown)}
                  style={{ cursor: job.assignedDriver ? 'not-allowed' : 'pointer' }}
                >
                  {selectedDriver && (
                    <>
                      <img 
                        src={selectedDriver.profilePicture || "/icons/user.svg"} 
                        alt="Driver" 
                        className="delivery-details-tech-avatar"
                      />
                      <span className="delivery-details-select-text">
                        {selectedDriver.firstName} {selectedDriver.lastName}
                      </span>
                    </>
                  )}
                  {!selectedDriver && (
                    <span className="delivery-details-select-placeholder">Select a driver</span>
                  )}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="delivery-details-select-arrow">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#667085" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                {showTechDropdown && !job.assignedDriver && (
                  <div className="delivery-details-tech-dropdown">
                    <div className="delivery-details-tech-search">
                      <input
                        type="text"
                        placeholder="Search drivers..."
                        value={techSearch}
                        onChange={(e) => setTechSearch(e.target.value)}
                        className="delivery-details-tech-search-input"
                      />
                    </div>
                    <div className="delivery-details-tech-list">
                      {filteredDrivers.length === 0 && (
                        <div className="delivery-details-tech-item-empty">No drivers found</div>
                      )}
                      {filteredDrivers.map(tech => (
                        <div
                          key={tech._id}
                          className="delivery-details-tech-item"
                          onClick={() => handleDriverSelect(tech)}
                        >
                          <img 
                            src={tech.profilePicture || "/icons/user.svg"} 
                            alt={tech.firstName}
                            className="delivery-details-tech-item-avatar"
                          />
                          <div className="delivery-details-tech-item-info">
                            <div className="delivery-details-tech-item-name">
                              {tech.firstName} {tech.lastName}
                            </div>
                            <div className="delivery-details-tech-item-status">
                              {tech.currentStatus}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="delivery-details-form-group">
              <label className="delivery-details-form-label">Driver's Vehicle</label>
              <div className="delivery-details-input-disabled">
                {selectedDriver?.assignedVehicle && (
                  <>
                    <img 
                      src="/icons/car.png" 
                      alt="Vehicle" 
                      className="delivery-details-vehicle-icon"
                    />
                    <span className="delivery-details-input-text-disabled">
                      {selectedDriver.assignedVehicle.year} {selectedDriver.assignedVehicle.make?.name} {selectedDriver.assignedVehicle.model?.name} - {selectedDriver.assignedVehicle.plateNumber}
                    </span>
                  </>
                )}
                {!selectedDriver?.assignedVehicle && (
                  <span className="delivery-details-input-text-disabled">No vehicle assigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Job Pricing & Parts Section */}
          <div className="delivery-details-section-full">
            <h3 className="delivery-details-section-title">Job Pricing & Parts</h3>
            
            {!isPaid ? (
              /* Before Payment */
              <>
                <div className="delivery-details-pricing-row">
                  <div className="delivery-details-form-group">
                    <label className="delivery-details-form-label">Price</label>
                    <input 
                      type="text" 
                      className="delivery-details-input"
                      placeholder="0"
                      value={currentEstimate ? `QR ${currentEstimate.toFixed(2)}` : ''}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="delivery-details-form-group">
                    <label className="delivery-details-form-label">Cost</label>
                    <input 
                      type="text" 
                      className="delivery-details-input delivery-details-input-error"
                      placeholder="0"
                      value={totalCost ? `QR ${totalCost.toFixed(2)}` : ''}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="delivery-details-form-group">
                    <label className="delivery-details-form-label">Profit</label>
                    <input 
                      type="text" 
                      className="delivery-details-input delivery-details-input-success"
                      placeholder="0"
                      value={currentProfit ? `QR ${currentProfit.toFixed(2)}` : ''}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="delivery-details-pricing-row">
                  <div className="delivery-details-form-group">
                    <label className="delivery-details-form-label">Admin Estimate</label>
                    <input 
                      type="text" 
                      className="delivery-details-input"
                      placeholder="0"
                      value={`QR ${job?.price?.toFixed(2) || '0.00'}`}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="delivery-details-form-group">
                    <label className="delivery-details-form-label">Driver Estimate</label>
                    <input 
                      type="text" 
                      className="delivery-details-input"
                      placeholder="0"
                      value={currentEstimate ? `QR ${currentEstimate.toFixed(2)}` : ''}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </>
            ) : (
              /* After Payment */
              <>
                <div className="delivery-details-pricing-row" style={{ marginTop: '16px' }}>
                  <div className="delivery-details-form-group">
                    <label className="delivery-details-form-label">Price</label>
                    <input 
                      type="text" 
                      className="delivery-details-input"
                      placeholder="0"
                      value={currentEstimate ? `QR ${currentEstimate.toFixed(2)}` : ''}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="delivery-details-form-group">
                    <label className="delivery-details-form-label">Cost</label>
                    <input 
                      type="text" 
                      className="delivery-details-input delivery-details-input-error"
                      placeholder="0"
                      value={totalCost ? `QR ${totalCost.toFixed(2)}` : ''}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="delivery-details-form-group">
                    <label className="delivery-details-form-label">Profit</label>
                    <input 
                      type="text" 
                      className="delivery-details-input delivery-details-input-success"
                      placeholder="0"
                      value={currentProfit ? `QR ${currentProfit.toFixed(2)}` : ''}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Repair Procedures Section */}
          <div className="delivery-details-section-full">
            <div className="delivery-details-repair-section">
              <label className="delivery-details-form-label">Repair Procedures</label>
              {repairs.length === 0 ? (
                <div className="delivery-details-repairs-empty">
                  No repairs added yet. Repairs will appear here once the driver completes the job.
                </div>
              ) : (
                <div className="delivery-details-repairs-container">
                  {repairs.map((repair, index) => (
                    <div key={repair._id || index} className="delivery-details-repair-card">
                      <div className="delivery-details-repair-card-header">
                        <h3 className="delivery-details-repair-card-title">Repair {index + 1}</h3>
                      </div>
                      
                      <div className="delivery-details-repair-info-grid">
                        <div className="delivery-details-repair-info-column">
                          <div className="delivery-details-repair-info-item">
                            <span className="delivery-details-repair-info-label">Description</span>
                            <span className="delivery-details-repair-info-value">{repair.description}</span>
                          </div>
                          <div className="delivery-details-repair-info-item">
                            <span className="delivery-details-repair-info-label">Price</span>
                            <span className="delivery-details-repair-info-value">{repair.price?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                        
                        <div className="delivery-details-repair-info-column">
                          <div className="delivery-details-repair-info-item">
                            <span className="delivery-details-repair-info-label">Quantity</span>
                            <span className="delivery-details-repair-info-value">{repair.quantity || 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="delivery-details-actions">
          <button className="delivery-details-btn delivery-details-btn-secondary-disabled">
            Download Receipt
          </button>
          <button 
            className={`delivery-details-btn ${job.delivery_status === 'cancelled' ? 'delivery-details-btn-secondary-disabled' : 'delivery-details-btn-danger'}`}
            onClick={handleCancelJob}
            disabled={cancelling || job.delivery_status === 'cancelled'}
          >
            {cancelling ? 'Cancelling...' : job.delivery_status === 'cancelled' ? 'Job Cancelled' : 'Cancel Job'}
          </button>
          <button 
            className="delivery-details-btn delivery-details-btn-primary"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeliveryDetails;
