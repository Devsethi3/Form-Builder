export function getRatingStyles(): string {
  return `
    .quick-form-rating-scale { 
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }
    .quick-form-rating-buttons {
      display: flex;
      gap: 8px;
      justify-content: space-between;
      align-items: center;
    }
    .quick-form-rating-button {
      width: 40px;
      height: 40px;
      border: 2px solid #D1D5DB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: white;
      transition: all 0.2s ease;
      font-weight: 500;
    }
    .quick-form-rating-button:hover {
      transform: translateY(-2px);
      border-color: #6366F1;
    }
    .quick-form-rating-button.selected {
      background: #6366F1;
      border-color: #6366F1;
      color: white;
    }
    .quick-form-rating-labels {
      display: flex;
      justify-content: space-between;
      color: #6B7280;
      font-size: 14px;
    }
  `;
}
