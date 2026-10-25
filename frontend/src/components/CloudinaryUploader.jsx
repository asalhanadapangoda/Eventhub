import React, { useState } from 'react';

/**
 * CloudinaryUploader Component
 * Allows users to upload images or videos up to 500MB with real-time upload progress tracking.
 *
 * @param {Function} onUploadSuccess Callback function receiving (url, fileData)
 * @param {string} accept Mime type accept string e.g. "image/*,video/*"
 * @param {string} label Button or section label text
 */
export default function CloudinaryUploader({ 
  onUploadSuccess, 
  accept = "image/*,video/*", 
  label = "Upload Image or Video" 
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [resourceType, setResourceType] = useState('image');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');
    setUploadProgress(0);
    setFileName(file.name);

    // 500MB Client-side limit check
    const MAX_SIZE_BYTES = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed video size is 500MB.`);
      return;
    }

    const isVideo = file.type.startsWith('video/');
    setResourceType(isVideo ? 'video' : 'image');
    setUploading(true);

    const token = localStorage.getItem('eventhub_token');
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // 5 minute timeout for large video uploads
    xhr.timeout = 300000;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      try {
        const result = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && result.success && result.data) {
          setUploadProgress(100);
          setPreviewUrl(result.data.url);
          setResourceType(result.data.resourceType || (isVideo ? 'video' : 'image'));
          
          if (onUploadSuccess) {
            onUploadSuccess(result.data.url, result.data);
          }
        } else {
          setErrorMsg(result.message || `Upload failed with status code ${xhr.status}.`);
        }
      } catch (parseErr) {
        setErrorMsg(`Server returned non-JSON response (Status ${xhr.status}).`);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setErrorMsg('Network error while uploading file. Please ensure the server is active.');
    };

    xhr.ontimeout = () => {
      setUploading(false);
      setErrorMsg('Upload timed out after 5 minutes. Please try again with a compressed video.');
    };

    xhr.send(formData);
  };

  return (
    <div className="cloudinary-uploader-container" style={{ margin: '1rem 0' }}>
      <label 
        className="btn btn-outline" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: uploading ? 'not-allowed' : 'pointer', 
          borderColor: '#5d4df6', 
          color: '#5d4df6',
          opacity: uploading ? 0.75 : 1,
        }}
      >
        <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : (resourceType === 'video' ? 'fa-video' : 'fa-cloud-arrow-up')}`}></i>
        <span>
          {uploading ? `Uploading ${fileName ? `"${fileName.slice(0, 18)}..."` : 'media'} (${uploadProgress}%)` : label}
        </span>
        <input 
          type="file" 
          accept={accept} 
          onChange={handleFileSelect} 
          disabled={uploading} 
          style={{ display: 'none' }} 
        />
      </label>

      {/* Upload Progress Bar */}
      {uploading && (
        <div style={{ marginTop: '0.65rem', maxWidth: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '3px' }}>
            <span>Uploading to server...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${uploadProgress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #5d4df6 0%, #2563eb 100%)', 
                borderRadius: '4px',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.5rem', fontWeight: '600' }}>
          ⚠️ {errorMsg}
        </p>
      )}

      {previewUrl && (
        <div className="media-preview-box" style={{ marginTop: '0.85rem', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#059669', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="fa-solid fa-circle-check"></i> Video Uploaded & Ready
            </span>
            <button 
              type="button" 
              onClick={() => {
                setPreviewUrl('');
                setFileName('');
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Remove
            </button>
          </div>

          {resourceType === 'video' ? (
            <video src={previewUrl} controls style={{ width: '100%', maxHeight: '250px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <img src={previewUrl} alt="Uploaded Media Preview" style={{ width: '100%', maxHeight: '250px', borderRadius: '8px', objectFit: 'cover' }} />
          )}
          
          <input 
            type="text" 
            readOnly 
            value={previewUrl} 
            style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.78rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff' }} 
          />
        </div>
      )}
    </div>
  );
}
