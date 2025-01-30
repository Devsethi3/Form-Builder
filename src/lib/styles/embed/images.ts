export function getImageStyles(): string {
  return `
    .quick-form-image-upload { 
      border: 2px dashed #D1D5DB; 
      padding: 20px; 
      text-align: center; 
      border-radius: 8px; 
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F9FAFB;
      transition: all 0.2s ease;
    }
    .quick-form-image-upload:hover { 
      border-color: #6366F1;
      background: #F3F4F6;
    }
    .quick-form-image-preview { 
      max-width: 100%;
      margin-top: 10px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .quick-form-picture-select {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 8px;
    }
    .quick-form-picture-option {
      border: 2px solid #D1D5DB;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }
    .quick-form-picture-option:hover {
      border-color: #6366F1;
      transform: translateY(-2px);
    }
    .quick-form-picture-option.selected {
      border-color: #6366F1;
      background: #F3F4F6;
    }
    .quick-form-picture-option img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .quick-form-picture-option .label {
      padding: 8px;
      text-align: center;
      font-weight: 500;
      color: #4B5563;
    }
    
    /* Dual Image Upload */
    .quick-form-dual-image {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }
    .quick-form-dual-image-side {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .quick-form-dual-image-upload { 
      border: 2px dashed #D1D5DB; 
      padding: 20px; 
      text-align: center; 
      border-radius: 8px; 
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F9FAFB;
      transition: all 0.2s ease;
      min-height: 200px;
    }
    .quick-form-dual-image-upload:hover { 
      border-color: #6366F1;
      background: #F3F4F6;
    }
    .quick-form-dual-image-preview { 
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: none;
    }
    .quick-form-dual-image-label {
      font-weight: 500;
      color: #4B5563;
      font-size: 14px;
    }
  `;
}
