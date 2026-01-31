import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Sector,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useGetDeliveriesQuery } from "../../store/deliveryApi";
import { useGetDriversQuery } from "../../store/driverApi";
import { useGetVehiclesQuery } from "../../store/vehicleApi";
import { useGetCustomersQuery } from "../../store/customerApi";
import { useGetVehicleInsurancesQuery } from "../../store/vehicleInsuranceApi";
import { 
  useGetEarningsDataQuery, 
  useGetJobCompletionDataQuery,
  useGetAllDriversPerformanceQuery,
  useGetEarningsByDateQuery
} from "../../store/dashboardApi";
import DatePicker from "../../components/DatePicker";
import "./Dashboard.css";

// Custom Active Shape for Pie Chart
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

function Dashboard() {
  const [earningsTimeframe, setEarningsTimeframe] = useState("12months");
  const [jobsTimeframe, setJobsTimeframe] = useState("12months");
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Initialize with today's date - use useMemo or lazy initialization
  const [selectedEarningsDate, setSelectedEarningsDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
  });
  
  const { data: jobsData } = useGetDeliveriesQuery({ limit: 1000 });
  const { data: techsData } = useGetDriversQuery({ limit: 1000 });
  const { data: vehiclesData } = useGetVehiclesQuery({ limit: 1000 });
  const { data: customersData } = useGetCustomersQuery({ limit: 1000 });
  const { data: insuranceData } = useGetVehicleInsurancesQuery({ limit: 1000 });
  
  // Dashboard analytics queries
  const { data: earningsData } = useGetEarningsDataQuery(earningsTimeframe);
  const { data: jobCompletionData } = useGetJobCompletionDataQuery(jobsTimeframe);
  const { data: techPerformanceData } = useGetAllDriversPerformanceQuery();
  const shouldFetchEarningsByDate = !!selectedEarningsDate;
  const { data: earningsByDateData, isLoading: earningsByDateLoading, error: earningsByDateError } = useGetEarningsByDateQuery(
    shouldFetchEarningsByDate ? selectedEarningsDate : null, 
    { skip: !shouldFetchEarningsByDate }
  );

  // Log whenever selectedEarningsDate changes
  useEffect(() => {
    // Effect hook for dependency tracking
  }, [selectedEarningsDate]);

  const jobs = jobsData?.jobs || [];
  const technicians = techsData?.technicians || [];
  const vehicles = vehiclesData?.vehicles || [];
  const customers = customersData?.customers || [];

  // Calculate stats
  const submittedJobs = jobs.length;
  const completedJobs = jobs.filter(j => j.job_status === "completed" || j.job_status === "paid" || j.job_status === "confirmed").length;
  const ongoingJobs = jobs.filter(j => ["assigned", "accepted", "en_route", "arrived", "in_progress"].includes(j.job_status)).length;
  const pendingJobs = jobs.filter(j => j.job_status === "pending").length;
  const activeTechs = technicians.filter(t => t.isActive).length;
  const totalVehicles = vehicles.length;
  const totalClients = customers.length;
  const insuredVehicles = insuranceData?.total || 0;

  // Calculate earnings - Total is all-time, Overall is based on selected date
  const totalEarnings = jobs
    .filter(j => j.job_status === "completed" || j.job_status === "paid" || j.job_status === "confirmed")
    .reduce((sum, j) => sum + (parseFloat(j.price) || 0), 0);

  let overallEarnings = totalEarnings; // Default to total
  
  // If we have a selected date and data for it, use that for overall
  if (selectedEarningsDate && earningsByDateData?.totalEarnings !== undefined) {
    overallEarnings = earningsByDateData.totalEarnings;
  }

  /* Traffic sources - Commented out
  const trafficSources = [
    { name: "Google", count: 100, icon: "/icons/google.svg" },
    { name: "Instagram", count: 55, icon: "/icons/instagram.svg" },
    { name: "Facebook", count: 45, icon: "/icons/facebook.svg" },
    { name: "App", count: 500, icon: "/icons/app_store.svg" },
    { name: "Google Ads", count: 450, icon: "/icons/google_ads.svg" }
  ];
  */

  // Job status distribution
  const cancelledJobs = jobs.filter(j => j.job_status === "cancelled").length;
  const jobStatusData = [
    { label: "Completed", value: completedJobs, percentage: Math.round((completedJobs / submittedJobs) * 100) || 0, color: "#039855" },
    { label: "Pending", value: pendingJobs, percentage: Math.round((pendingJobs / submittedJobs) * 100) || 0, color: "#F79009" },
    { label: "InProgress", value: ongoingJobs, percentage: Math.round((ongoingJobs / submittedJobs) * 100) || 0, color: "#1570EF" },
    { label: "Cancelled", value: cancelledJobs, percentage: Math.round((cancelledJobs / submittedJobs) * 100) || 0, color: "#DC6803" }
  ];

  // Get pending jobs sorted by date
  const pendingJobsList = jobs
    .filter(j => j.job_status === "pending")
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, 3);

  // Top technicians by job acceptance rate
  const topTechnicians = technicians
    .map(tech => {
      const techJobs = jobs.filter(j => j.assignedTechnician?._id === tech._id || j.assignedTechnician === tech._id);
      const acceptedJobs = techJobs.filter(j => j.job_status !== "cancelled").length;
      const acceptanceRate = techJobs.length > 0 ? Math.round((acceptedJobs / techJobs.length) * 100) : 0;
      
      return {
        ...tech,
        acceptanceRate
      };
    })
    .sort((a, b) => b.acceptanceRate - a.acceptanceRate)
    .slice(0, 5);

  // Technician performance data from API
  const performanceChartData = techPerformanceData?.data || [];
  const maxPerformanceValue = Math.max(
    30,
    ...performanceChartData.map(d => d.completed + d.inProgress + d.cancelled)
  );

  const handleEarningsDateSelect = (date) => {
    // Convert Date object to string to avoid Redux serialization issues
    const dateString = date instanceof Date ? date.toISOString() : date;
    setSelectedEarningsDate(dateString);
  };

  const handleClearEarningsDate = () => {
    // Just close the modal, don't reset the date!
    setDatePickerOpen(false);
  };

  const formatDateForButton = (dateString) => {
    if (!dateString) return "Today";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateObj = new Date(dateString);
    dateObj.setHours(0, 0, 0, 0);
    
    if (dateObj.getTime() === today.getTime()) return "Today";
    if (dateObj.getTime() === yesterday.getTime()) return "Yesterday";
    
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Metrics Grid */}
      <div className="dashboard-metrics-section">
        <div className="dashboard-metrics-grid">
          {/* Left Metrics */}
          <div className="dashboard-metrics-left">
            <div className="dashboard-metric-card">
              <div className="dashboard-metric-icon">
                <img src="/icons/li-newspaper.svg" alt="" />
              </div>
              <span className="dashboard-metric-label">Submitted Deliveries</span>
              <span className="dashboard-metric-value">{submittedJobs}</span>
            </div>

            <div className="dashboard-metric-card">
              <div className="dashboard-metric-icon">
                <img src="/icons/li-check-check.svg" alt="" />
              </div>
              <span className="dashboard-metric-label">Completed Deliveries</span>
              <span className="dashboard-metric-value">{completedJobs}</span>
            </div>

            <div className="dashboard-metric-card">
              <div className="dashboard-metric-icon">
                <img src="/icons/li-indent-increase.svg" alt="" />
              </div>
              <span className="dashboard-metric-label">Ongoing Deliveries</span>
              <span className="dashboard-metric-value">{ongoingJobs}</span>
            </div>

            <div className="dashboard-metric-card dashboard-metric-card-warning">
              <div className="dashboard-metric-icon">
                <img src="/icons/info.svg" alt="" />
              </div>
              <span className="dashboard-metric-label">Pending Deliveries</span>
              <span className="dashboard-metric-value">{pendingJobs}</span>
            </div>

            <div className="dashboard-metric-card">
              <div className="dashboard-metric-icon">
                <img src="/icons/user.svg" alt="" />
              </div>
              <span className="dashboard-metric-label">Total Active Drivers</span>
              <span className="dashboard-metric-value">{activeTechs}</span>
            </div>

            <div className="dashboard-metric-card">
              <div className="dashboard-metric-icon">
                <img src="/icons/car.png" alt="" />
              </div>
              <span className="dashboard-metric-label">Total Vehicles</span>
              <span className="dashboard-metric-value">{totalVehicles}</span>
            </div>

            <div className="dashboard-metric-card">
              <div className="dashboard-metric-icon">
                <img src="/icons/users.svg" alt="" />
              </div>
              <span className="dashboard-metric-label">Total Clients</span>
              <span className="dashboard-metric-value">{totalClients}</span>
            </div>

            <div className="dashboard-metric-card">
              <div className="dashboard-metric-icon">
                <img src="/icons/li-heart-handshake.svg" alt="" />
              </div>
              <span className="dashboard-metric-label">Total Insured Vehicles</span>
              <span className="dashboard-metric-value">{insuredVehicles}</span>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="dashboard-earnings-card">
            <div className="dashboard-earnings-content">
              <div className="dashboard-earnings-main">
                <h3 className="dashboard-earnings-title">Total Earnings</h3>
                <p className="dashboard-earnings-amount">{totalEarnings.toLocaleString()}</p>
              </div>
              <div className="dashboard-earnings-chart">
                <img src="/icons/earnings-chart.png" alt="Earnings trend" />
              </div>
            </div>
            <div className="dashboard-earnings-overall">
              <h3 className="dashboard-earnings-title">Overall Earnings</h3>
              <p className="dashboard-earnings-amount">{overallEarnings.toLocaleString()}</p>
            </div>
            <button 
              className="dashboard-earnings-button"
              onClick={() => setDatePickerOpen(!datePickerOpen)}
            >
              <img src="/icons/calendar.svg" alt="" />
              {formatDateForButton(selectedEarningsDate)}
            </button>
            
            {/* DatePicker Modal */}
            {datePickerOpen && (
              <div className="dashboard-datepicker-modal">
                <DatePicker
                  key={selectedEarningsDate}
                  value={selectedEarningsDate}
                  onChange={handleEarningsDateSelect}
                  onClose={handleClearEarningsDate}
                />
              </div>
            )}
          </div>
        </div>

        {/* Traffic Sources - Commented out
        <div className="dashboard-card dashboard-traffic-card">
          <h3 className="dashboard-card-title">Top Traffic Source</h3>
          <div className="dashboard-traffic-list">
            {trafficSources.map((source, index) => (
              <div key={index} className="dashboard-traffic-item">
                <div className="dashboard-traffic-source">
                  <img src={source.icon} alt={source.name} className="dashboard-traffic-icon" />
                  <span className="dashboard-traffic-name">{source.name}</span>
                </div>
                <span className="dashboard-traffic-count">{source.count}</span>
              </div>
            ))}
          </div>
        </div>
        */}
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts-section">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Earnings</h3>
            <div className="dashboard-tabs">
              {[
                { label: "12 months", value: "12months" },
                { label: "30 days", value: "30days" },
                { label: "7 days", value: "7days" },
                { label: "24 hours", value: "24hours" }
              ].map(tab => (
                <button
                  key={tab.value}
                  className={`dashboard-tab ${earningsTimeframe === tab.value ? 'dashboard-tab-active' : ''}`}
                  onClick={() => setEarningsTimeframe(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="dashboard-chart-container">
            {earningsData && earningsData.data && earningsData.data.length > 0 ? (
              <div className="dashboard-recharts-wrapper">
                <p className="dashboard-chart-subtitle">Earnings of last {earningsTimeframe === "12months" ? "12 months" : earningsTimeframe === "30days" ? "30 days" : earningsTimeframe === "7days" ? "7 days" : "24 hours"}</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData.data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#667085"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#667085"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E4E7EC',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`QR ${value.toFixed(2)}`, 'Earnings']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#DC6803" 
                      strokeWidth={2}
                      dot={{ fill: '#DC6803', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="dashboard-chart-placeholder">
                <p>No earnings data for this period</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Delivery Completion Trends</h3>
            <div className="dashboard-tabs">
              {[
                { label: "12 months", value: "12months" },
                { label: "30 days", value: "30days" },
                { label: "7 days", value: "7days" },
                { label: "24 hours", value: "24hours" }
              ].map(tab => (
                <button
                  key={tab.value}
                  className={`dashboard-tab ${jobsTimeframe === tab.value ? 'dashboard-tab-active' : ''}`}
                  onClick={() => setJobsTimeframe(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="dashboard-chart-container">
            {jobCompletionData && jobCompletionData.data && jobCompletionData.data.length > 0 ? (
              <div className="dashboard-recharts-wrapper">
                <p className="dashboard-chart-subtitle">Analytics of last {jobsTimeframe === "12months" ? "12 months" : jobsTimeframe === "30days" ? "30 days" : jobsTimeframe === "7days" ? "7 days" : "24 hours"}</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobCompletionData.data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#667085"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#667085"
                      style={{ fontSize: '12px' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E4E7EC',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [value, 'Total No. of jobs']}
                    />
                    <Bar 
                      dataKey="jobs" 
                      fill="#F04438" 
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="dashboard-chart-placeholder">
                <p>No job data for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Driver Performance */}
        <div className="dashboard-card dashboard-performance-card">
          <h3 className="dashboard-card-title">Driver Performance</h3>
          
          <div className="dashboard-performance-legend">
            <div className="dashboard-performance-legend-item">
              <span className="dashboard-performance-legend-dot" style={{ backgroundColor: '#FDCBCB' }}></span>
              <span className="dashboard-performance-legend-label">Completed</span>
            </div>
            <div className="dashboard-performance-legend-item">
              <span className="dashboard-performance-legend-dot" style={{ backgroundColor: '#EA4949' }}></span>
              <span className="dashboard-performance-legend-label">InProgress</span>
            </div>
            <div className="dashboard-performance-legend-item">
              <span className="dashboard-performance-legend-dot" style={{ backgroundColor: '#B52020' }}></span>
              <span className="dashboard-performance-legend-label">Cancelled</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceChartData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
              <XAxis 
                dataKey="name" 
                stroke="#667085"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#667085"
                style={{ fontSize: '12px' }}
                allowDecimals={false}
                domain={[0, 'dataMax + 10']}
                ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E4E7EC',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="completed" stackId="a" fill="#FDCBCB" radius={[0, 0, 0, 0]} />
              <Bar dataKey="inProgress" stackId="a" fill="#EA4949" radius={[0, 0, 0, 0]} />
              <Bar dataKey="cancelled" stackId="a" fill="#B52020" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom-section">
        <div className="dashboard-bottom-row">
          {/* Delivery Status Distribution */}
          <div className="dashboard-card dashboard-job-status-card">
          <h3 className="dashboard-card-title">Delivery Status Distribution</h3>
          <div className="dashboard-pie-chart">
            <div className="dashboard-pie-chart-container">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={jobStatusData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                  >
                    {jobStatusData.filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <p className="dashboard-pie-center-text">{submittedJobs} Deliveries</p>
            </div>
            <div className="dashboard-pie-legend">
              {jobStatusData.map((item, index) => (
                <div key={index} className="dashboard-legend-item">
                  <div className="dashboard-legend-label">
                    <span className="dashboard-legend-dot" style={{ backgroundColor: item.color }}></span>
                    <span>{item.label}</span>
                  </div>
                  <span className="dashboard-legend-value">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>          {/* Pending Deliveries */}
          <div className="dashboard-card dashboard-pending-jobs-card">
            <h3 className="dashboard-card-title">Pending Deliveries → {pendingJobs}</h3>
            <div className="dashboard-pending-jobs-list">
              {pendingJobsList.length > 0 ? (
                pendingJobsList.map((job, index) => {
                  const jobDate = new Date(job.dateTime);
                  const dateStr = jobDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
                  const timeStr = jobDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={job._id} className={`dashboard-pending-job-item ${index === 0 ? 'active' : ''}`}>
                      <div className="dashboard-pending-job-time">
                        <span className="dashboard-pending-job-date">{dateStr}</span>
                        <span className="dashboard-pending-job-hour">{timeStr}</span>
                      </div>
                      <div className="dashboard-pending-job-details">
                        <span className="dashboard-pending-job-title">New Job Request</span>
                        <span className="dashboard-pending-job-client">{job.clientName}, {job.clientMobileNumber}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="dashboard-no-pending">No pending jobs</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Drivers - Full Width */}
        <div className="dashboard-card dashboard-drivers-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Driver Rankings</h3>
            <button className="dashboard-filter-btn">Filter</button>
          </div>
          <div className="dashboard-drivers-table">
            <div className="dashboard-table-header">
              <span className="dashboard-table-col-number">Number</span>
              <span className="dashboard-table-col-name">Name</span>
              <span className="dashboard-table-col-rate">Acceptance Rate</span>
            </div>
            {topTechnicians.map((tech, index) => (
              <div key={tech._id} className="dashboard-table-row">
                <span className="dashboard-table-number">{index + 1}.</span>
                <div className="dashboard-table-tech">
                  <img src={tech.profilePicture || "/icons/user.svg"} alt="" className="dashboard-tech-avatar" />
                  <span className="dashboard-tech-name">{tech.firstName} {tech.lastName}</span>
                </div>
                <span className="dashboard-table-rate">{tech.acceptanceRate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
