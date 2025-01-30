import { createElement, createHelperText, createInput, createLabel, createWrapper } from './utils/dom';

interface FormElement {
  id: string;
  type: string;
  extraAttributes: Record<string, any>;
}

export function createFormElement(element: FormElement): HTMLElement | null {
  const wrapper = createWrapper();
  
  switch (element.type) {
    case 'TextField': {
      const { label, helperText, required, placeHolder } = element.extraAttributes;
      if (label) wrapper.appendChild(createLabel(label));
      wrapper.appendChild(createInput('text', element.id, required, placeHolder));
      if (helperText) wrapper.appendChild(createHelperText(helperText));
      return wrapper;
    }
    
    case 'NumberField': {
      const { label, helperText, required, placeHolder } = element.extraAttributes;
      if (label) wrapper.appendChild(createLabel(label));
      wrapper.appendChild(createInput('number', element.id, required, placeHolder));
      if (helperText) wrapper.appendChild(createHelperText(helperText));
      return wrapper;
    }
    
    case 'TitleField': {
      const { title, fontSize, alignment } = element.extraAttributes;
      const titleEl = createElement('h1', 'quick-form-title', title);
      titleEl.style.textAlign = alignment;
      if (fontSize === 'h2') titleEl.style.fontSize = '1.5em';
      else if (fontSize === 'h3') titleEl.style.fontSize = '1.17em';
      return titleEl;
    }
    
    case 'SubTitleField': {
      const { subTitle, fontSize, alignment } = element.extraAttributes;
      const subtitleEl = createElement('h2', 'quick-form-subtitle', subTitle);
      subtitleEl.style.textAlign = alignment;
      if (fontSize === 'h3') subtitleEl.style.fontSize = '1.17em';
      else if (fontSize === 'h4') subtitleEl.style.fontSize = '1em';
      return subtitleEl;
    }
    
    case 'RatingScaleField': {
      const { 
        label, helperText, required, question,
        minLabel, midLabel, maxLabel,
        minValue, maxValue
      } = element.extraAttributes;
      
      const container = createWrapper();
      if (label) container.appendChild(createLabel(label));
      if (question) {
        const questionEl = createElement('div', 'quick-form-rating-question', question);
        container.appendChild(questionEl);
      }
      
      const scale = createElement('div', 'quick-form-rating-scale');
      
      // Create buttons
      const buttons = createElement('div', 'quick-form-rating-buttons');
      for (let i = minValue; i <= maxValue; i++) {
        const button = createElement('button', 'quick-form-rating-button', i.toString());
        button.type = 'button';
        button.onclick = function() {
          // Remove selected class from all buttons
          const allButtons = buttons.getElementsByClassName('quick-form-rating-button');
          Array.from(allButtons).forEach(btn => btn.classList.remove('selected'));
          // Add selected class to clicked button
          button.classList.add('selected');
          // Update hidden input
          hiddenInput.value = i.toString();
        };
        buttons.appendChild(button);
      }
      scale.appendChild(buttons);
      
      // Create labels
      const labels = createElement('div', 'quick-form-rating-labels');
      labels.appendChild(createElement('span', '', minLabel));
      if (midLabel) labels.appendChild(createElement('span', '', midLabel));
      labels.appendChild(createElement('span', '', maxLabel));
      scale.appendChild(labels);
      
      // Hidden input for form submission
      const hiddenInput = createInput('hidden', element.id, required);
      scale.appendChild(hiddenInput);
      
      container.appendChild(scale);
      if (helperText) container.appendChild(createHelperText(helperText));
      
      return container;
    }
    
    case 'TwoColumnLayoutField': {
      const { gap, leftColumn, rightColumn } = element.extraAttributes;
      
      const container = createElement('div', 'quick-form-two-column');
      container.style.gap = `${gap}px`;
      
      const leftCol = createElement('div', 'quick-form-column');
      leftColumn.forEach((el: FormElement) => {
        const element = createFormElement(el);
        if (element) leftCol.appendChild(element);
      });
      
      const rightCol = createElement('div', 'quick-form-column');
      rightColumn.forEach((el: FormElement) => {
        const element = createFormElement(el);
        if (element) rightCol.appendChild(element);
      });
      
      container.appendChild(leftCol);
      container.appendChild(rightCol);
      
      return container;
    }
    
    case 'ImageElement': {
      const { 
        base64Image, height, width, maintainAspectRatio,
        alignment, marginTop, marginBottom, marginLeft, marginRight
      } = element.extraAttributes;
      
      const container = createElement('div');
      container.style.textAlign = alignment;
      container.style.marginTop = `${marginTop}px`;
      container.style.marginBottom = `${marginBottom}px`;
      container.style.marginLeft = `${marginLeft}px`;
      container.style.marginRight = `${marginRight}px`;
      
      if (base64Image) {
        const img = createElement('img');
        img.src = base64Image;
        img.style.width = `${width}px`;
        if (maintainAspectRatio) {
          img.style.height = 'auto';
        } else {
          img.style.height = `${height}px`;
        }
        container.appendChild(img);
      }
      
      return container;
    }
    
    default:
      console.warn('Unknown element type:', element.type);
      return null;
  }
}
