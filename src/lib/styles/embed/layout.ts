export function getLayoutStyles(): string {
  return `
    .quick-form-two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    
    .quick-form-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `;
}
