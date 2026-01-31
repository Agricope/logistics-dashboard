import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  useGetDriverByIdQuery,
  useGetDriverStatsQuery,
  useGetRecentDeliveriesQuery,
  useGetSettlementsQuery
} from "../../store/driverApi";
import EditDocumentModal from "../../components/EditDocumentModal.jsx";
import SettleBalanceModal from "../../components/SettleBalanceModal.jsx";
import ApproveApplicationModal from "../../components/ApproveApplicationModal.jsx";
import "./DriverDetails.css";

function StatusPill({ status }) {
  const color = "#FFFFFF";
  const bg = status === "Online" ? "#12B76A" : "#667085";
  return (
    <span
      className="driver-details-status-pill"
      style={{ background: bg, color }}
    >
      {status}
    </span>
  );
}

function ApplicationPill({ status }) {
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
      className="driver-details-app-status-pill"
      style={{ background: bg, color }}
    >
      {status}
    </span>
  );
}

// Cash balance half-circle progress bar matching Figma design
function CashBalanceHalfCircle({ value, max = 10000 }) {
  const percent = Math.min(100, (value / max) * 100);
  const radius = 129;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="driver-details-cash-progress-wrapper">
      <svg width="278" height="139" viewBox="0 0 278 139" fill="none">
        {/* Background gray arc */}
        <path
          d="M 10 139 A 129 129 0 0 1 268 139"
          stroke="#E4E7EC"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress red arc */}
        <path
          d="M 10 139 A 129 129 0 0 1 268 139"
          stroke="#EA4949"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="driver-details-cash-progress-text">
        <div className="driver-details-cash-balance-label">Current Balance</div>
        <div className="driver-details-cash-balance-amount">
          QR {value ? value.toLocaleString() : "0"}
        </div>
      </div>
    </div>
  );
}

function DeliveryStatusPill({ status }) {
  let className = "driver-details-job-status-pill ";
  if (status === "Ongoing") className += "driver-details-job-status-ongoing";
  else if (status === "Pending") className += "driver-details-job-status-pending";
  else className += "driver-details-job-status-completed";
  return <span className={className}>{status}</span>;
}

function ProfitPill({ profit }) {
  // Extract numeric value from "QR 200" format
  const numericProfit = typeof profit === 'string' 
    ? parseFloat(profit.replace('QR ', '').replace(/,/g, ''))
    : profit;
  
  let className = "driver-details-profit-pill ";
  if (numericProfit < 0) className += "driver-details-profit-loss";
  else className += "driver-details-profit-profit";
  
  return <span className={className}>{profit}</span>;
}

export default function DriverDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editDocModalOpen, setEditDocModalOpen] = useState(false);
  const [documentType, setDocumentType] = useState(null);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useGetDriverByIdQuery(id);
  const { data: statsData, refetch: refetchStats } = useGetDriverStatsQuery(id);
  const { data: deliveriesData, refetch: refetchJobs } = useGetRecentDeliveriesQuery({ id, limit: 10 });
  const { data: settlementsData, refetch: refetchSettlements } = useGetSettlementsQuery({ id, limit: 10 });

  if (isLoading) {
    return (
      <div className="driver-details-wrapper">
        <div className="driver-details-loading">Loading driver details...</div>
      </div>
    );
  }
  if (error || !data?.driver) {
    return (
      <div className="driver-details-wrapper">
        <div className="driver-details-error">Error loading driver details.</div>
      </div>
    );
  }
  const driver = data.driver;
  const stats = statsData?.stats || {};
  const recentDeliveries = deliveriesData?.jobs || [];
  const settlements = settlementsData?.settlements || [];

  // Job cards with real data
  const jobCards = [
    {
      icon: "/icons/job.svg",
      title: "Total Completed Deliveries",
      number: stats.totalCompletedJobs || 0
    },
    {
      icon: "/icons/car.png",
      title: "Ongoing Jobs",
      number: stats.ongoingJobs || 0
    },
    {
      icon: "/icons/vehicle.svg",
      title: "Assigned Vehicles",
      number: stats.assignedVehicles || 0
    },
    {
      icon: "/icons/performance.svg",
      title: "Total Cost",
      number: stats.totalCost || "QR 0"
    },
    {
      icon: "/icons/insurance.svg",
      title: "Total Price",
      number: stats.totalPrice || "QR 0"
    },
    {
      icon: "/icons/performance.svg",
      title: "Total Profit",
      number: stats.totalProfit || "QR 0"
    }
  ];

  const handleUpdateDocument = (type) => {
    setDocumentType(type);
    setEditDocModalOpen(true);
  };

  const handleDocumentSuccess = () => {
    refetch();
    setEditDocModalOpen(false);
  };

  const handleSettleSuccess = () => {
    refetchStats();
    refetchSettlements();
    setSettleModalOpen(false);
  };

  const handleApproveSuccess = () => {
    refetch();
    setApproveModalOpen(false);
  };

  return (
    <div className="driver-details-wrapper">
      {/* Page Header */}
      <div className="driver-details-header-row">
        <button 
          className="driver-details-back-btn"
          onClick={() => navigate('/drivers')}
        >
          <img src="/icons/long-arrow-left.svg" alt="Back" />
        </button>
        <h1 className="driver-details-page-title">Driver Management</h1>
      </div>

      <div className="driver-details-container">
        {/* Header with Title and Status */}
        <div className="driver-details-header">
          <h2 className="driver-details-title">Driver Details</h2>
          <StatusPill status={driver.currentStatus} />
        </div>

        {/* Section 1 */}
        <div className="driver-details-section">
        {/* Left: Image + Name + Email/Phone */}
        <div className="driver-details-profile">
          <img
            src={driver.profilePicture}
            alt="Driver"
            className="driver-details-profile-img"
          />
          <div className="driver-details-profile-info">
            <div className="driver-details-profile-name">{driver.firstName + " " + driver.lastName}</div>
            <div className="driver-details-profile-contact">
              <span className="driver-details-profile-email">{driver.email}</span>
              <div className="driver-details-profile-divider"></div>
              <span className="driver-details-profile-phone">{driver.phone}</span>
            </div>
            {driver.expertise && driver.expertise.length > 0 && (
              <div className="driver-details-profile-expertise">
                {driver.expertise.map((exp, index) => (
                  <React.Fragment key={exp}>
                    <span className="driver-details-profile-expertise-item">{exp}</span>
                    {index < driver.expertise.length - 1 && (
                      <div className="driver-details-profile-divider"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Right: Application Status */}
        <div className="driver-details-app-status">
          <div className="driver-details-app-status-label">Application Status</div>
          <div>
            <ApplicationPill status={driver.applicationStatus} />
          </div>
        </div>
      </div>

      {/* Section 2: Documents + Cash Balance in one container */}
      <div className="driver-details-docs-cash-section">
        {/* Documents (left) */}
        <div className="driver-details-docs">
          <div className="driver-details-docs-title">Documents</div>
          {/* Work Permit */}
          <div className="driver-details-docs-row">
            <div style={{ flex: 1 }}>
              <div className="driver-details-docs-label">Work Permit Front</div>
              <div className="driver-details-docs-input-wrapper">
                <input 
                  className="driver-details-docs-input" 
                  disabled 
                  value={driver.workPermitFront ? "Document uploaded" : "No document"} 
                />
                {driver.workPermitFront && (
                  <a 
                    href={driver.workPermitFront} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="driver-details-docs-view-link"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="driver-details-docs-label">Work Permit Back</div>
              <div className="driver-details-docs-input-wrapper">
                <input 
                  className="driver-details-docs-input" 
                  disabled 
                  value={driver.workPermitBack ? "Document uploaded" : "No document"} 
                />
                {driver.workPermitBack && (
                  <a 
                    href={driver.workPermitBack} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="driver-details-docs-view-link"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="driver-details-docs-valid-row">
            <div className="driver-details-docs-valid-label">
              Valid Until: {driver.workPermitExpiration ? new Date(driver.workPermitExpiration).toLocaleDateString() : 'N/A'}
            </div>
            <button 
              onClick={() => handleUpdateDocument('workPermit')} 
              className="driver-details-docs-update-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Update Document
            </button>
          </div>
          {/* Drivers License */}
          <div className="driver-details-docs-row">
            <div style={{ flex: 1 }}>
              <div className="driver-details-docs-label">Drivers License Front</div>
              <div className="driver-details-docs-input-wrapper">
                <input 
                  className="driver-details-docs-input" 
                  disabled 
                  value={driver.drivingLicenseFront ? "Document uploaded" : "No document"} 
                />
                {driver.drivingLicenseFront && (
                  <a 
                    href={driver.drivingLicenseFront} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="driver-details-docs-view-link"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="driver-details-docs-label">Drivers License Back</div>
              <div className="driver-details-docs-input-wrapper">
                <input 
                  className="driver-details-docs-input" 
                  disabled 
                  value={driver.drivingLicenseBack ? "Document uploaded" : "No document"} 
                />
                {driver.drivingLicenseBack && (
                  <a 
                    href={driver.drivingLicenseBack} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="driver-details-docs-view-link"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="driver-details-docs-valid-row">
            <div className="driver-details-docs-valid-label">
              Valid Until: {driver.drivingLicenseExpiration ? new Date(driver.drivingLicenseExpiration).toLocaleDateString() : 'N/A'}
            </div>
            <button 
              onClick={() => handleUpdateDocument('drivingLicense')} 
              className="driver-details-docs-update-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Update Document
            </button>
          </div>
          <button 
            className="driver-details-docs-approve-btn"
            onClick={() => setApproveModalOpen(true)}
            type="button"
          >
            Approve Application
          </button>
        </div>
        {/* Cash Balance (right) */}
        <div className="driver-details-cash-outer">
          <div className="driver-details-cash">
            <div className="driver-details-cash-title">Cash Balance</div>
            <CashBalanceHalfCircle value={stats.cashBalance || 0} max={10000} />
            <div className="driver-details-cash-divider" />
            <button 
              className="driver-details-cash-settle-btn"
              onClick={() => setSettleModalOpen(true)}
            >
              Settle Cash Balance
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Total Number of Jobs */}
      <div className="driver-details-section-main">
        <div className="driver-details-section-title">Total Number of Jobs</div>
        <div className="driver-details-job-cards-row">
          {jobCards.slice(0, 3).map((card, idx) => (
            <div className="driver-details-job-card" key={idx}>
              <div className="driver-details-job-card-header">
                <img src={card.icon} alt="icon" className="driver-details-job-card-icon" />
                <span className="driver-details-job-card-title">{card.title}</span>
              </div>
              <div className="driver-details-job-card-number">{card.number}</div>
            </div>
          ))}
        </div>
        <div className="driver-details-job-cards-row">
          {jobCards.slice(3, 6).map((card, idx) => (
            <div className="driver-details-job-card" key={idx}>
              <div className="driver-details-job-card-header">
                <img src={card.icon} alt="icon" className="driver-details-job-card-icon" />
                <span className="driver-details-job-card-title">{card.title}</span>
              </div>
              <div className="driver-details-job-card-number">{card.number}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Recent Deliveries */}
      <div className="driver-details-section-main">
        <div className="driver-details-section-title">Recent Deliveries</div>
        <table className="driver-details-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Date & Time</th>
              <th>Job Status</th>
              <th>Job Location</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {recentDeliveries.length > 0 ? (
              recentDeliveries.map((job, idx) => (
                <tr key={idx}>
                  <td>{job.id}</td>
                  <td>{new Date(job.date).toLocaleString()}</td>
                  <td><DeliveryStatusPill status={job.status} /></td>
                  <td>{job.location}</td>
                  <td>{job.price}</td>
                  <td>{job.cost}</td>
                  <td><ProfitPill profit={job.profit} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No recent jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Section 5: Balance Settlement */}
      <div className="driver-details-section-main">
        <div className="driver-details-section-title">Balance Settlement</div>
        <table className="driver-details-settlement-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Settled Amount</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {settlements.length > 0 ? (
              settlements.map((row, idx) => (
                <tr key={idx}>
                  <td>{new Date(row.date).toLocaleString()}</td>
                  <td>{row.amount}</td>
                  <td>
                    {row.receiptUrl ? (
                      <a 
                        href={row.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#0A5038', textDecoration: 'underline' }}
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>No receipt</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                  No settlements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Modals */}
      <EditDocumentModal
        open={editDocModalOpen}
        onClose={() => setEditDocModalOpen(false)}
        driverId={id}
        documentType={documentType}
        onSuccess={handleDocumentSuccess}
      />

      <SettleBalanceModal
        open={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        driverId={id}
        currentBalance={stats.cashBalance || 0}
        onSuccess={handleSettleSuccess}
      />

      <ApproveApplicationModal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        driver={driver}
        onSuccess={handleApproveSuccess}
      />
    </div>
  );
}
