import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAllStyles } from '@/lib/styles/embed';

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
    
    // Get the form data - only published forms are accessible
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        published: true,
      },
    });

    console.log("Form found:", form);

    if (!form) {
      console.log("Form not found or not published");
      return new NextResponse("Form not found or not published", { status: 404 });
    }

    // Parse the form content
    let formContent;
    try {
      formContent = JSON.parse(form.content);
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
    const styles = getAllStyles()
      .replace(/\\/g, '\\\\')
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
          
          case 'TwoColumnLayoutField': {
            const { gap, leftColumn, rightColumn } = element.extraAttributes;
            
            const columnWrapper = createElement('div', 'quick-form-two-column');
            columnWrapper.style.gap = gap + 'px';
            
            const leftCol = createElement('div', 'quick-form-column');
            leftColumn.forEach(el => {
              const columnElement = createFormElement(el);
              if (columnElement) leftCol.appendChild(columnElement);
            });
            
            const rightCol = createElement('div', 'quick-form-column');
            rightColumn.forEach(el => {
              const columnElement = createFormElement(el);
              if (columnElement) rightCol.appendChild(columnElement);
            });
            
            columnWrapper.appendChild(leftCol);
            columnWrapper.appendChild(rightCol);
            
            return columnWrapper;
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
        'Content-Type': 'application/javascript',
      },
    });
  } catch (error) {
    console.error("Error generating form bundle:", error);
    return new NextResponse("Error generating form bundle", { status: 500 });
  }
}