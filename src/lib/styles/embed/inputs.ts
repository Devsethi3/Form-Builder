export function getInputStyles(): string {
  return `
    .quick-form-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.5;
      transition: border-color 0.15s ease-in-out;
    }
    .quick-form-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    .quick-form-input::placeholder {
      color: #9CA3AF;
    }
    
    .quick-form-checkbox-wrapper { display: flex; align-items: center; gap: 8px; }
    .quick-form-checkbox { 
      width: 16px; 
      height: 16px; 
      border: 2px solid #D1D5DB;
      border-radius: 4px;
      cursor: pointer;
      appearance: none;
      background-color: white;
    }
    .quick-form-checkbox:checked {
      background-color: #6366f1;
      border-color: #6366f1;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E");
    }
    .quick-form-checkbox:hover { border-color: #6366f1; }
    .quick-form-checkbox:focus { 
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px #E0E7FF;
    }
  `;
}
