import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetDeliveriesQuery } from "../../store/deliveryApi";
import DataTable from "../../components/DataTable/DataTable.jsx";
import SuccessModal from "../../components/SuccessModal.jsx";
import DeliveryFilterDropdown from "../../components/DeliveryFilterDropdown.jsx";
import EditDeliveryModal from "../../components/EditDeliveryModal.jsx";
import "./Deliveries.css";

function PaymentStatusPill({ status }) {
  return (
    <span className={`delivery-payment-pill ${status}`}>
      {status === "paid" ? "Paid" : "Unpaid"}
    </span>
  );
}

function DeliveryStatusPill({ status }) {
  const statusLabels = {
    "pending": "Pending",
    "assigned": "Driver assigned",
    "accepted": "Accepted",
    "en_route": "Enroute",
    "arrived": "Arrived",
    "in_progress": "In progress",
    "completed": "Completed",
    "paid": "Paid",
    "confirmed": "Confirmed",
    "cancelled": "Cancelled"
  };

  return (
    <span className={`delivery-status-pill ${status}`}>
      {statusLabels[status] || status}
    </span>
  );
}

function ClientInfoCell({ job }) {
  return (
    <div className="delivery-client-cell">
      <div className="delivery-client-name">{job.clientName}</div>
      <div className="delivery-client-mobile">{job.clientMobileNumber}</div>
    </div>
  );
}

function AssignedDriverCell({ technician, navigate }) {
  if (!technician) {
    return <span className="delivery-no-driver">No Driver</span>;
  }

  return (
    <div 
      className="delivery-driver-cell"
      onClick={() => navigate(`/drivers/${technician._id}`)}
    >
      <img
        src={technician.profileImage || "/icons/user.svg"}
        alt="Driver"
        className="delivery-driver-img"
      />
      <span className="delivery-driver-name">
        {technician.firstName} {technician.lastName}
      </span>
    </div>
  );
}

function DeliveryActions({ onView }) {
  return (
    <div className="delivery-actions">
      <button className="delivery-action-btn" onClick={onView}>
        <img src="/icons/eye.svg" alt="View" />
      </button>
    </div>
  );
}

function Deliveries() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const filterButtonRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDeliveryId, setEditDeliveryId] = useState(null);

  const { data, isLoading, refetch } = useGetDeliveriesQuery({ page, limit: 5, search, status: filters.status || undefined });
  const deliveries = data?.jobs || [];
  const total = data?.total || 0;

  // Check if success message from navigation
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleEdit = (job) => {
    setEditDeliveryId(job._id);
    setEditModalOpen(true);
  };

  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    refetch();
  };

  const columns = [
    {
      title: "Delivery ID",
      key: "jobId", 
      dataIndex: "jobId",
      width: "10%",
      render: (row) => (
        <span className="job-id-cell">
          {row._id?.slice(-8).toUpperCase() || 'N/A'}
        </span>
      )
    },
    {
      title: "Client Info",
      key: "clientInfo",
      dataIndex: "clientInfo",
      width: "15%",
      render: (row) => (
        <ClientInfoCell job={row} />
      )
    },
    {
      title: "Date & Time",
      key: "dateTime",
      dataIndex: "dateTime",
      width: "12%",
      render: (row) => (
        <div className="job-datetime-cell">
          <div className="job-date">{new Date(row.dateTime).toLocaleDateString()}</div>
          <div className="job-time">{new Date(row.dateTime).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      title: "Delivery Location",
      key: "location",
      dataIndex: "location",
      width: "13%",
      render: (row) => (
        <span className="job-location-cell">
          {row.delivery_address || row.location}
        </span>
      )
    },
    {
      title: "Assigned Driver",
      key: "assignedTechnician",
      dataIndex: "assignedTechnician",
      width: "15%",
      render: (row) => (
        <AssignedDriverCell 
          technician={row.assignedTechnician}
          navigate={navigate}
        />
      )
    },
    {
      title: "Price",
      key: "price",
      dataIndex: "price",
      width: "10%",
      render: (row) => (
        <span className="job-price-cell">
          QR {row.price || 0}
        </span>
      )
    },
    {
      title: "Job Status",
      key: "status",
      dataIndex: "status",
      width: "12%",
      render: (row) => (
        <DeliveryStatusPill status={row.job_status || row.status} />
      )
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: "13%",
      render: (row) => (
        <DeliveryActions
          onView={() => navigate(`/deliveries/${row._id}`)}
        />
      )
    }
  ];

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setFilterOpen(false);
  };

  return (
    <div className="jobs-container">
      <div className="jobs-header-row">
        <span className="jobs-title">
          Delivery Management
        </span>
        <button className="jobs-add-btn" onClick={() => navigate("/deliveries/new")}>
          + Add New Delivery
        </button>
      </div>
      <DataTable
        columns={columns}
        data={deliveries}
        loading={isLoading}
        onFilter={() => setFilterOpen(!filterOpen)}
        filterButtonRef={filterButtonRef}
        filterDropdown={
          <DeliveryFilterDropdown
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            onApply={handleFilterApply}
            anchorEl={filterButtonRef.current}
          />
        }
        pagination={{
          current: page,
          total: total,
          pageSize: 5,
          onChange: (newPage) => setPage(newPage)
        }}
        title="Deliveries"
      />

      <EditDeliveryModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        jobId={editDeliveryId}
        onSuccess={() => handleSuccess("Job updated successfully")}
      />
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Success"
        subtitle={successMessage}
      />
    </div>
  );
}

export default Deliveries;
