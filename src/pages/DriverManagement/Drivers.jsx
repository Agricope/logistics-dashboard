import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable/DataTable.jsx";
import { useGetDriversQuery, useGetDriverByIdQuery, useAssignVehicleMutation } from "../../store/driverApi";
import { useGetVehiclesQuery } from "../../store/vehicleApi";
import SuccessModal from "../../components/SuccessModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal.jsx";
import DriverFilterDropdown from "../../components/DriverFilterDropdown.jsx";
import "./Drivers.css";
import AddDriverModal from "../../components/AddDriverModal.jsx";
import EditDriverModal from "../../components/EditDriverModal.jsx";

function DriverVehicleDropdown({ assignedVehicle, onAssign }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  
  const { data: vehiclesData } = useGetVehiclesQuery({ page: 1, limit: 100, search: "" });
  const { data: driversData } = useGetDriversQuery();
  const allVehicles = vehiclesData?.vehicles || [];
  const allDrivers = driversData?.drivers || [];
  
  // Create a map of vehicle IDs to assigned driver info
  const vehicleAssignments = {};
  allDrivers.forEach(driver => {
    if (driver.assignedVehicle) {
      vehicleAssignments[driver.assignedVehicle._id || driver.assignedVehicle] = {
        name: `${driver.firstName} ${driver.lastName}`,
        id: driver._id
      };
    }
  });
  
  const filteredVehicles = allVehicles.filter(
    v => {
      const make = v.make?.makeName || "";
      const model = v.model?.modelName || "";
      const plate = v.plateNumber || "";
      const searchLower = search.toLowerCase();
      return make.toLowerCase().includes(searchLower) ||
             model.toLowerCase().includes(searchLower) ||
             plate.toLowerCase().includes(searchLower);
    }
  );

  const displayVehicle = assignedVehicle
    ? `${assignedVehicle.model?.modelName || ""} - ${assignedVehicle.plateNumber || ""}`
    : "No Vehicle";

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 260;
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left - dropdownWidth + rect.width // Align right edge of dropdown with button
      });
    }
    setOpen(o => !o);
  };

  return (
    <div className="driver-vehicle-dropdown">
      <img
        src="/icons/car.png"
        alt="Vehicle"
        className="driver-vehicle-img"
      />
      <span className="driver-vehicle-model">
        {displayVehicle}
      </span>
      <button
        ref={buttonRef}
        className="driver-vehicle-dropdown-btn"
        onClick={handleToggle}
      >
        <img src="/icons/arrow-down.svg" alt="Assign Vehicle" />
      </button>
      {open && (
        <>
          <div className="driver-vehicle-dropdown-overlay" onClick={() => setOpen(false)} />
          <div 
            className="driver-vehicle-dropdown-menu"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            <div className="driver-vehicle-dropdown-title">
              Assign vehicle
            </div>
            <div className="driver-vehicle-dropdown-search-row">
              <img
                src="/icons/Search.svg"
                alt="Search"
                className="driver-vehicle-dropdown-search-icon"
              />
              <input
                className="driver-vehicle-dropdown-search-input"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="driver-vehicle-dropdown-list">
              {assignedVehicle && (
                <div
                  className="driver-vehicle-dropdown-list-item"
                  onClick={() => {
                    onAssign(null);
                    setOpen(false);
                  }}
                  style={{ borderBottom: '1px solid #E4E7EC', marginBottom: '4px', paddingBottom: '8px' }}
                >
                  <span className="driver-vehicle-dropdown-list-text">
                    Unassign Vehicle
                  </span>
                </div>
              )}
              {filteredVehicles.length === 0 ? (
                <div className="driver-vehicle-dropdown-no-results">No vehicles found</div>
              ) : (
                filteredVehicles.map(v => {
                  const assignedDriver = vehicleAssignments[v._id];
                  const isAssigned = assignedDriver && assignedDriver.id !== assignedVehicle?._id;
                  
                  return (
                    <div
                      key={v._id}
                      className="driver-vehicle-dropdown-list-item"
                      onClick={() => {
                        onAssign(v);
                        setOpen(false);
                      }}
                      style={{ opacity: isAssigned ? 0.6 : 1 }}
                    >
                      <img src="/icons/car.png" alt="Car" className="driver-vehicle-dropdown-list-img" />
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span className="driver-vehicle-dropdown-list-text">
                          {v.model?.modelName || ""} - {v.plateNumber}
                        </span>
                        {isAssigned && (
                          <span style={{ fontSize: '11px', color: '#F79009', marginTop: '2px' }}>
                            Assigned to {assignedDriver.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DriverStatusPill({ status }) {
  const color = "#FFFFFF";
  const bg = status === "Online" ? "#12B76A" : "#667085";
  return (
    <span
      className="driver-pill"
      style={{ background: bg, color }}
    >
      {status}
    </span>
  );
}

function DriverApplicationPill({ status }) {
  let color, bg;
  if (status === "Approved") {
    color = "#fff";
    bg = "#12B76A";
  } else if (status === "Pending") {
    color = "#fff";
    bg = "#F79009";
  } else {
    color = "#fff";
    bg = "#F04438";
  }
  return (
    <span
      className="driver-pill"
      style={{ background: bg, color }}
    >
      {status}
    </span>
  );
}

function DriverActivationToggle({ active, onToggle }) {
  return (
    <button
      className={`driver-activation-toggle${active ? " active" : ""}`}
      onClick={onToggle}
    >
      <span
        className="driver-activation-toggle-dot"
        style={{ left: active ? 18 : 2 }}
      />
    </button>
  );
}

function DriverActions({ onEdit, onView }) {
  return (
    <div className="driver-actions-cell">
      <button
        className="driver-action-btn"
        onClick={onEdit}
        title="Edit"
      >
        <img src="/icons/pencil.svg" alt="Edit" className="driver-action-icon" />
      </button>
      <button
        className="driver-action-btn"
        onClick={onView}
        title="View"
      >
        <img src="/icons/eye.svg" alt="View" className="driver-action-icon" />
      </button>
    </div>
  );
}

function Drivers() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: "", application: "" });
  const { data, isLoading, refetch } = useGetDriversQuery({ 
    page, 
    limit: 5,
    currentStatus: filters.status,
    applicationStatus: filters.application
  });
  const [assignVehicle] = useAssignVehicleMutation();
  const [drivers, setDrivers] = useState([]);
  const [assignedVehicles, setAssignedVehicles] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState({ driverId: null, vehicle: null, assignedTo: "" });
  const filterButtonRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (data?.drivers) {
      setDrivers(data.drivers);
      // Initialize assigned vehicles from API data
      const vehicleMap = {};
      data.drivers.forEach(driver => {
        if (driver.assignedVehicle) {
          vehicleMap[driver._id] = driver.assignedVehicle;
        }
      });
      setAssignedVehicles(vehicleMap);
    }
  }, [data]);

  const handleAssignVehicle = async (driverId, vehicle) => {
    try {
      // Handle unassignment
      if (!vehicle) {
        await assignVehicle({ id: driverId, vehicleId: null }).unwrap();
        setAssignedVehicles((prev) => {
          const updated = { ...prev };
          delete updated[driverId];
          return updated;
        });
        setSuccessMessage("Vehicle unassigned successfully");
        setShowSuccess(true);
        refetch();
        return;
      }

      // Try to assign the vehicle
      await assignVehicle({ id: driverId, vehicleId: vehicle._id }).unwrap();
      setAssignedVehicles((prev) => ({ ...prev, [driverId]: vehicle }));
      setSuccessMessage("Vehicle assigned successfully");
      setShowSuccess(true);
      refetch();
    } catch (error) {
      console.error("Error assigning vehicle:", error);
      if (error.status === 409) {
        // Vehicle is already assigned to another driver
        const assignedTo = error.data?.assignedTo || "another driver";
        setConfirmationData({
          driverId,
          vehicle,
          assignedTo,
          otherTechId: error.data?.technicianId
        });
        setShowConfirmation(true);
      } else {
        alert("Failed to assign vehicle. Please try again.");
      }
    }
  };

  const handleConfirmReassignment = async () => {
    const { driverId, vehicle, otherTechId } = confirmationData;
    try {
      if (otherTechId) {
        await assignVehicle({ id: otherTechId, vehicleId: null }).unwrap();
      }
      // Now assign to the new technician
      await assignVehicle({ id: driverId, vehicleId: vehicle._id }).unwrap();
      setAssignedVehicles((prev) => ({ ...prev, [driverId]: vehicle }));
      setSuccessMessage("Vehicle reassigned successfully");
      setShowSuccess(true);
      refetch();
    } catch (retryError) {
      console.error("Error during reassignment:", retryError);
      alert("Failed to reassign vehicle. Please try again.");
    }
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDriverId, setEditDriverId] = useState(null);

  const handleToggleActive = async (driverId) => {
    // PATCH /api/technicians/:id/toggle-active
    try {
      await fetch(`/api/technicians/${driverId}/toggle-active`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      refetch();
    } catch (err) {
      // Handle error
    }
  };

  const handleEdit = (tech) => {
    setEditDriverId(tech._id);
    setEditModalOpen(true);
  };

  const {
    data: editDriverData,
    isLoading: editDriverLoading,
    error: editDriverError
  } = useGetDriverByIdQuery(editDriverId, { skip: !editModalOpen || !editDriverId });

  const columns = [
    {
      title: "Profile Photo",
      key: "profilePhoto",
      dataIndex: "profilePhoto",
      width: "127px",
      render: (row) => (
        <div className="driver-profile-photo-cell">
          <img
            src={row.profileImage || "/icons/user.svg"}
            alt="Driver"
            className="driver-name-img"
          />
        </div>
      )
    },
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      width: "flex",
      render: (row) => (
        <span className="driver-name-text">
          {row.firstName + " " + row.lastName}
        </span>
      )
    },
    {
      title: "Phone Number",
      key: "phone",
      dataIndex: "phone",
      width: "flex",
      render: (row) => (
        <span className="driver-phone-cell">
          {row.phone}
        </span>
      )
    },
    {
      title: "Application",
      key: "applicationStatus",
      dataIndex: "applicationStatus",
      width: "flex",
      render: (row) => (
        <DriverApplicationPill status={row.applicationStatus} />
      )
    },
    {
      title: "Current Status",
      key: "currentStatus",
      dataIndex: "currentStatus",
      width: "flex",
      render: (row) => (
        <DriverStatusPill status={row.currentStatus} />
      )
    },
    {
      title: "Activation",
      key: "isActive",
      dataIndex: "isActive",
      width: "flex",
      render: (row) => (
        <DriverActivationToggle
          active={row.isActive}
          onToggle={() => handleToggleActive(row._id)}
        />
      )
    },
    {
      title: "Assigned Vehicle",
      key: "assignedVehicle",
      dataIndex: "assignedVehicle",
      width: "250px",
      render: (row) => (
        <DriverVehicleDropdown
          assignedVehicle={assignedVehicles[row._id]}
          onAssign={(vehicle) => handleAssignVehicle(row._id, vehicle)}
        />
      )
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: "120px",
      render: (row) => (
        <DriverActions
          onEdit={() => handleEdit(row)}
          onView={() => navigate(`/drivers/${row._id}`)}
        />
      )
    }
  ];

  const [modalOpen, setModalOpen] = useState(false);

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
    setFilterOpen(false);
  };

  return (
    <div className="drivers-container">
      <div className="drivers-header-row">
        <span className="drivers-title">
          Driver Management
        </span>
        <button className="drivers-add-btn" onClick={() => setModalOpen(true)}>
          + Add New Driver
        </button>
      </div>
      <DataTable
        columns={columns}
        data={drivers}
        loading={isLoading}
        onFilter={() => setFilterOpen(!filterOpen)}
        filterButtonRef={filterButtonRef}
        filterDropdown={
          <DriverFilterDropdown
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            onApply={handleFilterApply}
            anchorEl={filterButtonRef.current}
          />
        }
        pagination={{
          current: page,
          total: data?.total || 0,
          pageSize: 5,
          onChange: (newPage) => setPage(newPage)
        }}
        title="Drivers"
      />
      <AddDriverModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setSuccessMessage("Driver added successfully");
          setShowSuccess(true);
          refetch();
        }}
      />
      <EditDriverModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        driver={editDriverData?.driver}
        loading={editDriverLoading}
        error={editDriverError}
        onSuccess={() => {
          setSuccessMessage("Driver updated successfully");
          setShowSuccess(true);
          setEditModalOpen(false);
          refetch();
        }}
      />
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Success"
        subtitle={successMessage}
      />
      <ConfirmationModal
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmReassignment}
        title="Reassign Vehicle"
        message={`This vehicle is currently assigned to ${confirmationData.assignedTo}. Are you sure you want to reassign it to this driver?`}
      />
    </div>
  );
}

export default Drivers;
