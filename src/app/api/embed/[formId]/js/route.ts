import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAllStyles } from '@/lib/styles/embed';
import type { Form, Page } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { formId: string } }
) {
  if (!params.formId) {
    console.log("Missing formId");
    return new NextResponse("Missing formId", { status: 400 });
  }

  try {
    const formId = parseInt(params.formId);
    console.log("Looking for form:", formId);
    
    // First get the form
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        published: true,
      }
    }) as Form | null;

    console.log("Form found:", form);

    if (!form) {
      console.log("Form not found or not published");
      return new NextResponse("Form not found or not published", { status: 404 });
    }

    // Get pages if it's a multi-page form
    let formContent;
    try {
      if (form.isMultiPage) {
        const pages = await prisma.page.findMany({
          where: { formId: form.id },
          orderBy: { order: 'asc' }
        });
        
        formContent = pages.reduce((acc: any[], page) => {
          const pageElements = JSON.parse(page.elements);
          return [...acc, ...pageElements];
        }, []);
      } else {
        formContent = JSON.parse(form.content);
      }
      console.log("Form content parsed:", formContent);
    } catch (error) {
      console.error("Error parsing form content:", error);
      return new NextResponse("Invalid form content", { status: 500 });
    }

    if (!Array.isArray(formContent)) {
      console.error("Form content is not an array:", formContent);
      return new NextResponse("Invalid form content", { status: 500 });
    }

    // Get all styles as a single string and escape it for JavaScript
    const styles = `
      ${getAllStyles(form.theme)}

      .quick-form-two-column {
        width: 100%;
        margin: 1rem 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }

      .quick-form-column {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0 0.5rem;
      }

      .quick-form-column > * {
        width: 100%;
      }

      @media (max-width: 640px) {
        .quick-form-two-column {
          grid-template-columns: 1fr;
        }
        
        .quick-form-column {
          padding: 0;
        }
      }

      /* Base styles */
      .quick-form-wrapper {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
      }

      .quick-form-title {
        font-size: 2em;
        margin-bottom: 1rem;
        font-weight: 600;
      }

      .quick-form-subtitle {
        font-size: 1.5em;
        margin-bottom: 1rem;
        font-weight: 500;
        color: #666;
      }

      .quick-form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .quick-form-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }

      .quick-form-helper-text {
        font-size: 0.875rem;
        color: #666;
        margin-top: 0.25rem;
      }

      .quick-form-error {
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      /* Rating scale styles */
      .quick-form-rating-wrapper {
        margin: 1rem 0;
      }

      .quick-form-rating-question {
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      .quick-form-rating-scale {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }

      .quick-form-rating-label {
        font-size: 0.875rem;
        color: #666;
        text-align: center;
      }

      .quick-form-rating-radio {
        margin: 0 0.25rem;
      }

      /* Image styles */
      .quick-form-image {
        max-width: 100%;
        height: auto;
        margin: 1rem auto;
        display: block;
      }
    `.replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, ' ')
      .trim();

    // Create utility functions for the bundle
    const utilityFunctions = `
      function createElement(tag, className, textContent) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
      }

      function createLabel(text) {
        return createElement('label', 'quick-form-label', text);
      }

      function createHelperText(text) {
        return createElement('div', 'quick-form-helper-text', text);
      }

      function createInput(type, name, required, placeholder) {
        const input = createElement('input', 'quick-form-input');
        input.type = type;
        input.name = name;
        input.required = required;
        if (placeholder) input.placeholder = placeholder;
        return input;
      }

      function createWrapper() {
        return createElement('div', 'quick-form-field');
      }

      function createFormElement(element) {
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
          
          case 'TwoColumnLayoutField': {
            const { gap, columns } = element.extraAttributes;
            const layoutWrapper = createElement('div', 'quick-form-two-column');
            layoutWrapper.style.display = 'grid';
            layoutWrapper.style.gridTemplateColumns = 'repeat(2, 1fr)';
            layoutWrapper.style.gap = (parseFloat(gap) * 0.25) + 'rem';

            // Create left column
            const leftColumn = createElement('div', 'quick-form-column');
            if (columns.left && Array.isArray(columns.left)) {
              columns.left.forEach(childElement => {
                const childNode = createFormElement(childElement);
                if (childNode) leftColumn.appendChild(childNode);
              });
            }
            layoutWrapper.appendChild(leftColumn);

            // Create right column
            const rightColumn = createElement('div', 'quick-form-column');
            if (columns.right && Array.isArray(columns.right)) {
              columns.right.forEach(childElement => {
                const childNode = createFormElement(childElement);
                if (childNode) rightColumn.appendChild(childNode);
              });
            }
            layoutWrapper.appendChild(rightColumn);

            return layoutWrapper;
          }
          
          case 'RatingScaleField': {
            const { 
              label, helperText, required, question,
              minLabel, midLabel, maxLabel,
              minValue, maxValue
            } = element.extraAttributes;
            
            const fieldWrapper = createWrapper();
            if (label) fieldWrapper.appendChild(createLabel(label));
            if (question) {
              const questionEl = createElement('div', 'quick-form-rating-question', question);
              fieldWrapper.appendChild(questionEl);
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
            
            fieldWrapper.appendChild(scale);
            if (helperText) fieldWrapper.appendChild(createHelperText(helperText));
            
            return fieldWrapper;
          }
          
          case 'ImageElement': {
            const { 
              base64Image, height, width, maintainAspectRatio,
              alignment, marginTop, marginBottom, marginLeft, marginRight
            } = element.extraAttributes;
            
            const imageWrapper = createElement('div');
            imageWrapper.style.textAlign = alignment;
            imageWrapper.style.marginTop = marginTop + 'px';
            imageWrapper.style.marginBottom = marginBottom + 'px';
            imageWrapper.style.marginLeft = marginLeft + 'px';
            imageWrapper.style.marginRight = marginRight + 'px';
            
            if (base64Image) {
              const img = createElement('img');
              img.src = base64Image;
              img.style.width = width + 'px';
              if (maintainAspectRatio) {
                img.style.height = 'auto';
              } else {
                img.style.height = height + 'px';
              }
              imageWrapper.appendChild(img);
            }
            
            return imageWrapper;
          }
          
          case 'ImageUploadField': {
            const { label, helperText, required } = element.extraAttributes;
            const wrapper = createWrapper();
            if (label) wrapper.appendChild(createLabel(label));
            
            const uploadWrapper = createElement('div', 'quick-form-upload');
            const input = createInput('file', element.id, required);
            input.accept = 'image/*';
            
            const preview = createElement('div', 'quick-form-image-preview');
            input.onchange = function(e) {
              const target = e.target;
              const file = target && target.files ? target.files[0] : null;
              if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                  const target = e.target;
                  preview.innerHTML = '';
                  const img = createElement('img');
                  img.src = target ? target.result : '';
                  preview.appendChild(img);
                };
                reader.readAsDataURL(file);
              }
            };
            
            uploadWrapper.appendChild(input);
            uploadWrapper.appendChild(preview);
            wrapper.appendChild(uploadWrapper);
            if (helperText) wrapper.appendChild(createHelperText(helperText));
            return wrapper;
          }

          case 'DualImageUpload': {
            const { label, helperText, required } = element.extraAttributes;
            const wrapper = createWrapper();
            if (label) wrapper.appendChild(createLabel(label));
            
            const uploadsWrapper = createElement('div', 'quick-form-dual-upload');
            
            // First upload
            const upload1 = createElement('div', 'quick-form-upload');
            const input1 = createInput('file', element.id + '_1', required);
            input1.accept = 'image/*';
            const preview1 = createElement('div', 'quick-form-image-preview');
            input1.onchange = function(e) {
              const target = e.target;
              const file = target && target.files ? target.files[0] : null;
              if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                  const target = e.target;
                  preview1.innerHTML = '';
                  const img = createElement('img');
                  img.src = target ? target.result : '';
                  preview1.appendChild(img);
                };
                reader.readAsDataURL(file);
              }
            };
            upload1.appendChild(input1);
            upload1.appendChild(preview1);
            
            // Second upload
            const upload2 = createElement('div', 'quick-form-upload');
            const input2 = createInput('file', element.id + '_2', required);
            input2.accept = 'image/*';
            const preview2 = createElement('div', 'quick-form-image-preview');
            input2.onchange = function(e) {
              const target = e.target;
              const file = target && target.files ? target.files[0] : null;
              if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                  const target = e.target;
                  preview2.innerHTML = '';
                  const img = createElement('img');
                  img.src = target ? target.result : '';
                  preview2.appendChild(img);
                };
                reader.readAsDataURL(file);
              }
            };
            upload2.appendChild(input2);
            upload2.appendChild(preview2);
            
            uploadsWrapper.appendChild(upload1);
            uploadsWrapper.appendChild(upload2);
            wrapper.appendChild(uploadsWrapper);
            if (helperText) wrapper.appendChild(createHelperText(helperText));
            return wrapper;
          }

          case 'PictureSelect': {
            const { label, helperText, required, options } = element.extraAttributes;
            const wrapper = createWrapper();
            if (label) wrapper.appendChild(createLabel(label));
            
            const optionsWrapper = createElement('div', 'quick-form-picture-select');
            const hiddenInput = createInput('hidden', element.id, required);
            
            options.forEach((option, index) => {
              const optionWrapper = createElement('div', 'quick-form-picture-option');
              const img = createElement('img');
              img.src = option.base64Image;
              img.alt = option.label || 'Option ' + (index + 1);
              
              optionWrapper.onclick = function() {
                // Remove selected class from all options
                const allOptions = optionsWrapper.getElementsByClassName('quick-form-picture-option');
                Array.from(allOptions).forEach(opt => opt.classList.remove('selected'));
                // Add selected class to clicked option
                optionWrapper.classList.add('selected');
                // Update hidden input
                hiddenInput.value = option.value || index.toString();
              };
              
              if (option.label) {
                const label = createElement('div', 'quick-form-picture-label', option.label);
                optionWrapper.appendChild(label);
              }
              
              optionWrapper.appendChild(img);
              optionsWrapper.appendChild(optionWrapper);
            });
            
            optionsWrapper.appendChild(hiddenInput);
            wrapper.appendChild(optionsWrapper);
            if (helperText) wrapper.appendChild(createHelperText(helperText));
            return wrapper;
          }

          case 'CheckboxField': {
            const { label, helperText, required } = element.extraAttributes;
            const wrapper = createWrapper();
            
            const checkboxWrapper = createElement('div', 'quick-form-checkbox');
            const input = createInput('checkbox', element.id, required);
            const labelEl = createLabel(label);
            
            checkboxWrapper.appendChild(input);
            checkboxWrapper.appendChild(labelEl);
            wrapper.appendChild(checkboxWrapper);
            
            if (helperText) wrapper.appendChild(createHelperText(helperText));
            return wrapper;
          }
          
          default:
            console.warn('Unknown element type:', element.type);
            return null;
        }
      }
    `;

    // Generate the form bundle - using an array of strings to avoid template literal formatting issues
    const bundleScript = [
      '(() => {',
      utilityFunctions,
      `const containerId = 'quick-form-${formId}';`,
      `const formId = ${formId};`,
      'let container = document.getElementById(containerId);',
      'if (!container) {',
      '  console.error("Quick Form container not found:", containerId);',
      '  return;',
      '}',
      'container.innerHTML = "";',
      'const style = document.createElement("style");',
      `style.textContent = '${styles}';`,
      'document.head.appendChild(style);',
      'const form = document.createElement("form");',
      'form.className = "quick-form";',
      `const formContent = ${JSON.stringify(formContent)};`,
      'formContent.forEach(element => {',
      '  const node = createFormElement(element);',
      '  if (node) form.appendChild(node);',
      '});',
      'form.onsubmit = async (e) => {',
      '  e.preventDefault();',
      '  const formData = new FormData(form);',
      '  const data = Object.fromEntries(formData.entries());',
      '  try {',
      '    const response = await fetch("/api/submit/" + formId, {',
      '      method: "POST",',
      '      headers: {',
      '        "Content-Type": "application/json",',
      '      },',
      '      body: JSON.stringify(data),',
      '    });',
      '    if (response.ok) {',
      '      alert("Form submitted successfully!");',
      '      form.reset();',
      '    } else {',
      '      alert("Error submitting form. Please try again.");',
      '    }',
      '  } catch (error) {',
      '    console.error("Error submitting form:", error);',
      '    alert("Error submitting form. Please try again.");',
      '  }',
      '};',
      'const submitBtn = document.createElement("button");',
      'submitBtn.type = "submit";',
      'submitBtn.className = "quick-form-submit";',
      'submitBtn.textContent = "Submit";',
      'form.appendChild(submitBtn);',
      'container.appendChild(form);',
      '})();'
    ].join('\n');

    return new NextResponse(bundleScript, {
      headers: {
        'Content-Type': 'application/javascript'
      }
    });
  } catch (error) {
    console.error('Error generating form bundle:', error);
    return new NextResponse('Error generating form bundle', { status: 500 });
  }
}