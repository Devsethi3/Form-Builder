export function getBaseStyles(): string {
  return `
    /* Base form styles */
    .quick-form-container { width: 100%; }
    .quick-form { max-width: 600px; margin: 0 auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
    .quick-form-field { margin-bottom: 20px; }
    
    /* Typography */
    .quick-form-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #111827; }
    .quick-form-subtitle { font-size: 18px; color: #4B5563; margin-bottom: 15px; }
    .quick-form-label { display: block; margin-bottom: 5px; font-weight: 500; color: #374151; }
    .quick-form-helper-text { font-size: 14px; color: #6B7280; margin-top: 4px; }
    
    /* Submit button */
    .quick-form-submit {
      background: #6366f1;
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }
    .quick-form-submit:hover {
      background: #4f46e5;
    }
    .quick-form-submit:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
    }
    .quick-form-error {
      color: #ef4444;
      font-size: 14px;
      margin-top: 4px;
    }
  `;
}
