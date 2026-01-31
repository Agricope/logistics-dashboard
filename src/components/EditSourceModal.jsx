import React, { useState, useEffect } from "react";
import { useGetSourceByIdQuery, useUpdateSourceMutation } from "../store/sourceApi";
import "./EditSourceModal.css";

function EditSourceModal({ open, onClose, sourceId, onSuccess }) {
  const { data: sourceData, isLoading: isFetching } = useGetSourceByIdQuery(sourceId, {
    skip: !sourceId || !open
  });
  const [updateSource, { isLoading }] = useUpdateSourceMutation();
  
  const [formData, setFormData] = useState({
    mainSource: "",
    subSources: []
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (sourceData?.source) {
      setFormData({
        mainSource: sourceData.source.mainSourceName,
        subSources: sourceData.source.subSources || []
      });
    }
  }, [sourceData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const payload = {
        id: sourceId,
        mainSourceName: formData.mainSource,
        subSources: formData.subSources
      };

      await updateSource(payload).unwrap();
      onSuccess?.();
    } catch (error) {
      console.error("Error updating source:", error);
      setError(error.data?.message || "Failed to update source");
    }
  };

  const handleCancel = () => {
    setFormData({
      mainSource: "",
      subSources: []
    });
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="edit-source-modal-backdrop">
      <div className="edit-source-modal">
        <button className="edit-source-modal-close" onClick={handleCancel} aria-label="Close">
          <span className="edit-source-modal-close-x">&#10005;</span>
        </button>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="edit-source-modal-header">
            <div className="edit-source-modal-title">Edit Source</div>
            <div className="edit-source-modal-subtitle">Update source details</div>
          </div>
          {error && (
            <div className="edit-source-modal-error">
              {error}
            </div>
          )}
          <div className="edit-source-modal-section">
            <div className="edit-source-modal-section-title">Source Information</div>
            <div className="edit-source-modal-fields">
              <div className="edit-source-modal-row">
                <div className="edit-source-modal-field">
                  <label>Main Source*</label>
                  <input
                    type="text"
                    name="mainSource"
                    value={formData.mainSource}
                    onChange={handleInputChange}
                    placeholder="e.g. Social Media"
                    required
                  />
                </div>
              </div>
              <div className="edit-source-modal-row">
                <div className="edit-source-modal-field" style={{ width: 612 }}>
                  <label>Sub Sources</label>
                  <div className="edit-source-subsources-list">
                    {formData.subSources.length === 0 ? (
                      <p className="edit-source-no-subsources">No sub-sources yet</p>
                    ) : (
                      formData.subSources.map((sub, index) => (
                        <div key={sub._id || index} className="edit-source-subsource-item">
                          {sub.name}
                        </div>
                      ))
                    )}
                  </div>
                  <p className="edit-source-helper-text">
                    Sub-sources can be managed from the main source list
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <button className="edit-source-modal-submit" type="submit" disabled={isLoading || isFetching}>
              {isLoading ? "Updating..." : "Update Source"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSourceModal;
