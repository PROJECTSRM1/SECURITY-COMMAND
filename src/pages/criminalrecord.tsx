import React, { useState } from 'react';
import { Search, Upload, User, FileText, MapPin, Clock, AlertTriangle, Camera, Shield, Car, X, CheckCircle } from 'lucide-react';
import './CriminalRecord.css';

const CriminalRecord = () => {
  const [searchData, setSearchData] = useState({
    aadhaar: '',
    name: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [imageType, setImageType] = useState(null); // 'person' or 'vehicle'

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSearchData({ ...searchData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // Simulate image type detection (in real app, use ML model)
        const randomType = Math.random() > 0.5 ? 'vehicle' : 'person';
        setImageType(randomType);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    if (!searchData.aadhaar || !searchData.name) {
      alert('Please enter Aadhaar number and Name');
      return;
    }

    setIsScanning(true);
    // Simulate face scanning and API call
    setTimeout(() => {
      setIsScanning(false);
      // Mock data - replace with actual API call
      setSearchResults({
        personal: {
          name: searchData.name,
          aadhaar: searchData.aadhaar,
          dob: '15/03/1985',
          address: '6-3-1109/1, Raj Bhavan Road, Somajiguda, Hyderabad, Telangana - 500082',
          phone: '+91 9876543210',
          faceMatch: 98.5,
          gender: 'Male',
          bloodGroup: 'O+'
        },
        vehicleInfo: imageType === 'vehicle' ? {
          vehicleNumber: 'TS-09-EA-5678',
          vehicleType: 'Honda City',
          ownerName: searchData.name,
          registrationDate: '15/08/2020',
          insurance: 'Active - Valid till 15/08/2026',
          lastService: '10/12/2025'
        } : {
          vehicleNumber: 'TS-09-EA-5678',
          vehicleType: 'Honda City',
          ownerName: searchData.name,
          registrationDate: '15/08/2020',
          insurance: 'Active - Valid till 15/08/2026',
          lastService: '10/12/2025'
        },
        criminalHistory: [
          {
            id: 1,
            caseNumber: 'FIR-2023-002156',
            crime: 'Theft',
            date: '18/04/2023',
            status: 'Closed',
            location: 'Banjara Hills Police Station, Hyderabad',
            severity: 'Medium',
            description: 'Theft of electronic items from residential complex'
          },
          {
            id: 2,
            caseNumber: 'FIR-2024-001089',
            crime: 'Vehicle Registration Fraud',
            date: '12/01/2024',
            status: 'Ongoing',
            location: 'Cyber Crime Police Station, Hyderabad',
            severity: 'High',
            description: 'Fraudulent vehicle registration documents and fake number plates'
          }
        ],
        tollGateHistory: [
          {
            id: 1,
            gateName: 'Outer Ring Road Toll Plaza',
            location: 'ORR, Shamshabad, Hyderabad',
            date: '20/01/2026',
            time: '15:45',
            vehicleNumber: 'TS-09-EA-5678',
            direction: 'Outbound'
          },
          {
            id: 2,
            gateName: 'Keesara Toll Gate',
            location: 'NH-163, Keesara',
            date: '18/01/2026',
            time: '10:30',
            vehicleNumber: 'TS-09-EA-5678',
            direction: 'Inbound'
          },
          {
            id: 3,
            gateName: 'Ghatkesar Toll Plaza',
            location: 'NH-202, Ghatkesar',
            date: '15/01/2026',
            time: '19:20',
            vehicleNumber: 'TS-09-EA-5678',
            direction: 'Outbound'
          }
        ],
        riskLevel: 'High',
        totalCases: 2,
        activeCases: 1,
        imageType: imageType
      });
    }, 2000);
  };

  const handleCloseResults = () => {
    setSearchResults(null);
  };

  return (
    <div className="criminal-record-container">
      <div className="page-header">
        <div className="header-content">
          <Shield className="header-icon" size={32} />
          <h1>Criminal Record Search</h1>
        </div>
        <p className="header-subtitle">Search and verify criminal records with facial recognition</p>
      </div>

      {/* Search Form */}
      <div className="search-section">
        <div className="search-card">
          <h2 className="section-title">Search Parameters</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="aadhaar">
                <FileText size={18} />
                Aadhaar Number
              </label>
              <input
                id="aadhaar"
                type="text"
                placeholder="XXXX-XXXX-XXXX"
                value={searchData.aadhaar}
                onChange={(e) => setSearchData({ ...searchData, aadhaar: e.target.value })}
                maxLength={14}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">
                <User size={18} />
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter suspect name"
                value={searchData.name}
                onChange={(e) => setSearchData({ ...searchData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="upload-section">
            <label className="upload-label">
              <Camera size={18} />
              Upload Image (Criminal/Vehicle Photo)
            </label>
            <div className="upload-area">
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
              <label htmlFor="imageUpload" className="upload-placeholder">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <>
                    <Upload size={48} />
                    <p>Click to upload or drag and drop</p>
                    <span>PNG, JPG up to 10MB</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <button 
            className="search-button"
            onClick={handleSearch}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <div className="spinner"></div>
                Scanning  & Searching Records...
              </>
            ) : (
              <>
                <Search size={20} />
                Search Criminal Records
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Results Card */}
      {searchResults && (
        <div className="modal-overlay" onClick={handleCloseResults}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>Criminal Record Details</h2>
                <div className={`risk-indicator risk-${searchResults.riskLevel.toLowerCase()}`}>
                  <AlertTriangle size={18} />
                  {searchResults.riskLevel} Risk
                </div>
              </div>
              <button className="close-button" onClick={handleCloseResults}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-content">
              {/* Personal Information Section */}
              <div className="info-section">
                <div className="section-header">
                  <User size={20} />
                  <h3>Personal Information</h3>
                  {imagePreview && searchResults.imageType === 'person' && (
                    <div className="face-match-badge">
                      <CheckCircle size={16} />
                      {searchResults.personal.faceMatch}% Match
                    </div>
                  )}
                </div>
                <div className="info-content compact">
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">{searchResults.personal.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Aadhaar:</span>
                    <span className="value">{searchResults.personal.aadhaar}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">DOB:</span>
                    <span className="value">{searchResults.personal.dob}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Gender:</span>
                    <span className="value">{searchResults.personal.gender}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{searchResults.personal.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Blood:</span>
                    <span className="value">{searchResults.personal.bloodGroup}</span>
                  </div>
                  <div className="info-row full-width">
                    <span className="label">Address:</span>
                    <span className="value">{searchResults.personal.address}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information Section */}
              <div className="info-section">
                <div className="section-header">
                  <Car size={20} />
                  <h3>Vehicle Information</h3>
                  {imagePreview && searchResults.imageType === 'vehicle' && (
                    <div className="vehicle-match-badge">
                      <CheckCircle size={16} />
                      Vehicle Detected
                    </div>
                  )}
                </div>
                <div className="info-content compact">
                  <div className="info-row">
                    <span className="label">Vehicle No:</span>
                    <span className="value vehicle-plate-text">{searchResults.vehicleInfo.vehicleNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Type:</span>
                    <span className="value">{searchResults.vehicleInfo.vehicleType}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Owner:</span>
                    <span className="value">{searchResults.vehicleInfo.ownerName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Registered:</span>
                    <span className="value">{searchResults.vehicleInfo.registrationDate}</span>
                  </div>
                  <div className="info-row full-width">
                    <span className="label">Insurance:</span>
                    <span className="value">{searchResults.vehicleInfo.insurance}</span>
                  </div>
                  <div className="info-row full-width">
                    <span className="label">Last Service:</span>
                    <span className="value">{searchResults.vehicleInfo.lastService}</span>
                  </div>
                </div>
              </div>

              {/* Criminal History Section */}
              <div className="info-section">
                <div className="section-header">
                  <AlertTriangle size={20} />
                  <h3>Criminal History</h3>
                  <div className="case-badges">
                    <span className="badge">Total: {searchResults.totalCases}</span>
                    <span className="badge active">Active: {searchResults.activeCases}</span>
                  </div>
                </div>
                <div className="cases-list">
                  {searchResults.criminalHistory.map((record, index) => (
                    <div key={record.id} className="case-item compact">
                      <div className="case-header">
                        <div className="case-number">{record.caseNumber}</div>
                        <span className={`case-status status-${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="case-details">
                        <div className="case-title">{record.crime}</div>
                        <p className="case-description">{record.description}</p>
                        <div className="case-meta">
                          <span className="meta-item">
                            <Clock size={14} />
                            {record.date}
                          </span>
                          <span className="meta-item">
                            <MapPin size={14} />
                            {record.location}
                          </span>
                          <span className={`severity severity-${record.severity.toLowerCase()}`}>
                            {record.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toll Gate History Section */}
              <div className="info-section">
                <div className="section-header">
                  <MapPin size={20} />
                  <h3>Recent Toll Activity</h3>
                  <span className="record-count">{searchResults.tollGateHistory.length} Records</span>
                </div>
                <div className="toll-list">
                  {searchResults.tollGateHistory.map((toll) => (
                    <div key={toll.id} className="toll-item compact">
                      <div className="toll-left">
                        <MapPin size={18} />
                      </div>
                      <div className="toll-info">
                        <div className="toll-header">
                          <span className="toll-name">{toll.gateName}</span>
                          <span className="vehicle-plate-mini">{toll.vehicleNumber}</span>
                        </div>
                        <div className="toll-meta">
                          <span className="toll-time">
                            <Clock size={12} />
                            {toll.date} • {toll.time}
                          </span>
                          <span className={`toll-direction direction-${toll.direction.toLowerCase()}`}>
                            {toll.direction}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriminalRecord;