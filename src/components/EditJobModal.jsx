import React, { useState, useEffect } from "react";
import { useGetJobByIdQuery, useUpdateJobMutation } from "../store/jobApi";
import { useGetOnlineTechniciansQuery } from "../store/technicianApi";
import { useGetSourcesQuery } from "../store/sourceApi";
import CustomSelect from "./CustomSelect.jsx";
import "./EditJobModal.css";

function EditJobModal({ open, onClose, jobId, onSuccess }) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientMobileNumber: "",
    issue: "",
    location: "",
    dateTime: "",
    assignedTechnician: "",
    price: "",
    source: ""
  });

  const { data: jobData } = useGetJobByIdQuery(jobId, { skip: !jobId || !open });
  const [updateJob, { isLoading }] = useUpdateJobMutation();
  const { data: techniciansData } = useGetOnlineTechniciansQuery(undefined, { skip: !open });
  const { data: sourcesData } = useGetSourcesQuery(undefined, { skip: !open });
  
  const onlineTechnicians = techniciansData?.technicians || [];
  const sources = sourcesData?.sources || [];

  useEffect(() => {
    if (jobData?.job) {
      const job = jobData.job;
      setFormData({
        clientName: job.clientName || "",
        clientMobileNumber: job.clientMobileNumber || "",
        issue: job.issue || "",
        location: job.location || "",
        dateTime: job.dateTime ? new Date(job.dateTime).toISOString().slice(0, 16) : "",
        assignedTechnician: job.assignedTechnician?._id || job.assignedTechnician || "",
        price: job.price || "",
        source: job.source?._id || job.source || ""
      });
    }
  }, [jobData]);

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
      console.error("Error updating job:", error);
      alert("Failed to update job. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      clientName: "",
      clientMobileNumber: "",
      issue: "",
      location: "",
      dateTime: "",
      assignedTechnician: "",
      price: "",
      source: ""
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="edit-job-modal-backdrop">
      <div className="edit-job-modal">
        <button className="edit-job-modal-close" onClick={handleCancel} aria-label="Close">
          <span className="edit-job-modal-close-x">&#10005;</span>
        </button>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="edit-job-modal-header">
            <div className="edit-job-modal-title">Edit Job</div>
            <div className="edit-job-modal-subtitle">Update job details</div>
          </div>
          <div className="edit-job-modal-section">
            <div className="edit-job-modal-section-title">Client Details</div>
            <div className="edit-job-modal-fields">
              <div className="edit-job-modal-row">
                <div className="edit-job-modal-field">
                  <label>Client Name*</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="edit-job-modal-field">
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
              <div className="edit-job-modal-row">
                <div className="edit-job-modal-field" style={{ width: 612 }}>
                  <label>Issue*</label>
                  <textarea
                    name="issue"
                    value={formData.issue}
                    onChange={handleInputChange}
                    className="edit-job-modal-textarea"
                    placeholder="Describe the issue..."
                    required
                  />
                </div>
              </div>
              <div className="edit-job-modal-row">
                <div className="edit-job-modal-field">
                  <label>Location*</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Job location"
                    required
                  />
                </div>
                <div className="edit-job-modal-field">
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
              <div className="edit-job-modal-row">
                <div className="edit-job-modal-field">
                  <label>Assigned Technician</label>
                  <CustomSelect
                    value={formData.assignedTechnician}
                    onChange={(value) => setFormData(prev => ({ ...prev, assignedTechnician: value }))}
                    options={onlineTechnicians.map(tech => ({
                      value: tech._id,
                      label: `${tech.firstName} ${tech.lastName}`
                    }))}
                    placeholder="Select Technician"
                  />
                </div>
              </div>
              <div className="edit-job-modal-row">
                <div className="edit-job-modal-field">
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
                <div className="edit-job-modal-field">
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
            <button className="edit-job-modal-submit" type="submit">
              Update Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditJobModal;
