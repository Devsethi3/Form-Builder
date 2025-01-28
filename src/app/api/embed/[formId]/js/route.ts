import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // Generate the form bundle
    const bundle = `
      (() => {
        // Find or create container
        const containerId = 'quick-form-${formId}';
        let container = document.getElementById(containerId);
        if (!container) {
          console.error('Quick Form container not found:', containerId);
          return;
        }

        // Clear existing content
        container.innerHTML = '';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = \`
          /* Base form styles */
          .quick-form-container { width: 100%; }
          .quick-form { max-width: 600px; margin: 0 auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
          .quick-form-field { margin-bottom: 20px; }
          
          /* Typography */
          .quick-form-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #111827; }
          .quick-form-subtitle { font-size: 18px; color: #4B5563; margin-bottom: 15px; }
          .quick-form-label { display: block; margin-bottom: 5px; font-weight: 500; color: #374151; }
          .quick-form-helper-text { font-size: 14px; color: #6B7280; margin-top: 4px; }
          
          /* Form elements */
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
          
          /* Custom Controls */
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
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
            gap: 12px; 
            margin-top: 8px;
          }
          .quick-form-picture-option { 
            cursor: pointer; 
            border: 2px solid transparent; 
            padding: 4px; 
            border-radius: 8px;
            transition: all 0.2s ease;
            background: white;
          }
          .quick-form-picture-option:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .quick-form-picture-option.selected { 
            border-color: #6366F1;
            background: #F3F4F6;
          }
          .quick-form-picture-option img { 
            width: 100%; 
            height: 150px; 
            object-fit: cover; 
            border-radius: 6px;
          }
          .quick-form-picture-option .label {
            margin-top: 4px;
            text-align: center;
            font-size: 14px;
            color: #4B5563;
          }
          
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
        \`;
        document.head.appendChild(style);

        // Create form
        const form = document.createElement('form');
        form.className = 'quick-form';
        
        // Create form fields
        const formContent = ${JSON.stringify(formContent)};
        formContent.forEach(element => {
          const wrapper = document.createElement('div');
          wrapper.className = 'quick-form-field';

          switch (element.type) {
            case 'TitleField':
              const title = document.createElement('h1');
              title.className = 'quick-form-title';
              title.textContent = element.extraAttributes?.title || '';
              wrapper.appendChild(title);
              break;

            case 'SubTitleField':
              const subtitle = document.createElement('h2');
              subtitle.className = 'quick-form-subtitle';
              subtitle.textContent = element.extraAttributes?.title || '';
              wrapper.appendChild(subtitle);
              break;

            case 'TextField':
              const textLabel = document.createElement('label');
              textLabel.className = 'quick-form-label';
              textLabel.textContent = element.extraAttributes?.label || '';
              
              const textHelperText = document.createElement('div');
              textHelperText.className = 'quick-form-helper-text';
              textHelperText.textContent = element.extraAttributes?.helperText || '';
              
              const textInput = document.createElement('input');
              textInput.type = 'text';
              textInput.name = element.id;
              textInput.className = 'quick-form-input';
              textInput.placeholder = element.extraAttributes?.placeHolder || '';
              textInput.required = element.extraAttributes?.required || false;
              
              wrapper.appendChild(textLabel);
              wrapper.appendChild(textInput);
              wrapper.appendChild(textHelperText);
              break;

            case 'CheckboxField':
              const checkboxLabel = document.createElement('label');
              checkboxLabel.className = 'quick-form-label';
              checkboxLabel.textContent = element.extraAttributes?.label || '';
              
              const helperText = document.createElement('div');
              helperText.className = 'quick-form-helper-text';
              helperText.textContent = element.extraAttributes?.helperText || '';
              
              const checkboxWrapper = document.createElement('div');
              checkboxWrapper.className = 'quick-form-checkbox-wrapper';
              
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.name = element.id;
              checkbox.className = 'quick-form-checkbox';
              checkbox.required = element.extraAttributes?.required || false;
              
              const checkboxText = document.createElement('span');
              checkboxText.textContent = element.extraAttributes?.label || '';
              
              checkboxWrapper.appendChild(checkbox);
              checkboxWrapper.appendChild(checkboxText);
              
              wrapper.appendChild(checkboxLabel);
              wrapper.appendChild(helperText);
              wrapper.appendChild(checkboxWrapper);
              break;

            case 'ImageUploadField':
              const imageLabel = document.createElement('label');
              imageLabel.className = 'quick-form-label';
              imageLabel.textContent = element.extraAttributes?.label || '';
              
              const imageHelperText = document.createElement('div');
              imageHelperText.className = 'quick-form-helper-text';
              imageHelperText.textContent = element.extraAttributes?.helperText || '';
              
              const imageUpload = document.createElement('div');
              imageUpload.className = \`quick-form-image-upload \${element.extraAttributes?.width || 'w-full'} \${element.extraAttributes?.height || 'h-48'}\`;
              imageUpload.textContent = element.extraAttributes?.prompt || 'Click or drag to upload image';
              
              const imageInput = document.createElement('input');
              imageInput.type = 'file';
              imageInput.accept = 'image/*';
              imageInput.style.display = 'none';
              imageInput.name = element.id;
              imageInput.required = element.extraAttributes?.required || false;
              
              const imagePreview = document.createElement('img');
              imagePreview.className = 'quick-form-image-preview';
              imagePreview.style.display = 'none';
              
              imageUpload.addEventListener('click', () => imageInput.click());
              imageInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (e.target && e.target.result) {
                      imagePreview.src = e.target.result.toString();
                      imagePreview.style.display = 'block';
                      imageUpload.style.display = 'none';
                    }
                  };
                  reader.readAsDataURL(file);
                }
              });
              
              wrapper.appendChild(imageLabel);
              wrapper.appendChild(imageHelperText);
              wrapper.appendChild(imageUpload);
              wrapper.appendChild(imageInput);
              wrapper.appendChild(imagePreview);
              break;

            case 'PictureSelectField':
              const pictureSelectLabel = document.createElement('label');
              pictureSelectLabel.className = 'quick-form-label';
              pictureSelectLabel.textContent = element.extraAttributes?.label || '';
              
              const pictureHelperText = document.createElement('div');
              pictureHelperText.className = 'quick-form-helper-text';
              pictureHelperText.textContent = element.extraAttributes?.helperText || '';
              
              const pictureGrid = document.createElement('div');
              pictureGrid.className = 'quick-form-picture-select';
              
              const hiddenInput = document.createElement('input');
              hiddenInput.type = 'hidden';
              hiddenInput.name = element.id;
              hiddenInput.required = element.extraAttributes?.required || false;
              
              const images = element.extraAttributes?.images || [];
              images.forEach(img => {
                const option = document.createElement('div');
                option.className = 'quick-form-picture-option';
                
                const imgEl = document.createElement('img');
                imgEl.src = img.url;
                imgEl.alt = img.label || '';
                
                option.appendChild(imgEl);
                
                if (img.label) {
                  const label = document.createElement('div');
                  label.className = 'label';
                  label.textContent = img.label;
                  option.appendChild(label);
                }
                
                option.addEventListener('click', () => {
                  document.querySelectorAll('.quick-form-picture-option').forEach(el => 
                    el.classList.remove('selected'));
                  option.classList.add('selected');
                  hiddenInput.value = img.url;
                });
                
                pictureGrid.appendChild(option);
              });
              
              wrapper.appendChild(pictureSelectLabel);
              wrapper.appendChild(pictureHelperText);
              wrapper.appendChild(pictureGrid);
              wrapper.appendChild(hiddenInput);
              break;

            case 'RatingScaleField':
              const ratingLabel = document.createElement('label');
              ratingLabel.className = 'quick-form-label';
              ratingLabel.textContent = element.extraAttributes?.label || '';
              
              const ratingHelperText = document.createElement('div');
              ratingHelperText.className = 'quick-form-helper-text';
              ratingHelperText.textContent = element.extraAttributes?.helperText || '';
              
              const ratingQuestion = document.createElement('div');
              ratingQuestion.className = 'text-base font-medium text-gray-900 mt-2';
              ratingQuestion.textContent = element.extraAttributes?.question || '';
              
              const ratingScale = document.createElement('div');
              ratingScale.className = 'quick-form-rating-scale';
              
              const ratingButtons = document.createElement('div');
              ratingButtons.className = 'quick-form-rating-buttons';
              
              const ratingInput = document.createElement('input');
              ratingInput.type = 'hidden';
              ratingInput.name = element.id;
              ratingInput.required = element.extraAttributes?.required || false;
              
              const minValue = element.extraAttributes?.minValue || 1;
              const maxValue = element.extraAttributes?.maxValue || 10;
              
              for (let i = minValue; i <= maxValue; i++) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'quick-form-rating-button';
                button.textContent = i.toString();
                
                button.addEventListener('click', () => {
                  ratingButtons.querySelectorAll('button').forEach(btn => 
                    btn.classList.remove('selected'));
                  button.classList.add('selected');
                  ratingInput.value = i.toString();
                });
                
                ratingButtons.appendChild(button);
              }
              
              const ratingLabels = document.createElement('div');
              ratingLabels.className = 'quick-form-rating-labels';
              
              const minLabel = document.createElement('span');
              minLabel.textContent = element.extraAttributes?.minLabel || '';
              
              const midLabel = document.createElement('span');
              midLabel.textContent = element.extraAttributes?.midLabel || '';
              
              const maxLabel = document.createElement('span');
              maxLabel.textContent = element.extraAttributes?.maxLabel || '';
              
              ratingLabels.appendChild(minLabel);
              ratingLabels.appendChild(midLabel);
              ratingLabels.appendChild(maxLabel);
              
              ratingScale.appendChild(ratingButtons);
              ratingScale.appendChild(ratingLabels);
              
              wrapper.appendChild(ratingLabel);
              wrapper.appendChild(ratingHelperText);
              wrapper.appendChild(ratingQuestion);
              wrapper.appendChild(ratingScale);
              wrapper.appendChild(ratingInput);
              break;

            case 'DualImageUploadField':
              const dualImageLabel = document.createElement('label');
              dualImageLabel.className = 'quick-form-label';
              dualImageLabel.textContent = element.extraAttributes?.label || '';
              
              const dualImageHelperText = document.createElement('div');
              dualImageHelperText.className = 'quick-form-helper-text';
              dualImageHelperText.textContent = element.extraAttributes?.helperText || '';
              
              const dualImageContainer = document.createElement('div');
              dualImageContainer.className = 'quick-form-dual-image';
              
              // Create left side
              const leftSide = document.createElement('div');
              leftSide.className = 'quick-form-dual-image-side';
              
              const leftLabel = document.createElement('div');
              leftLabel.className = 'quick-form-dual-image-label';
              leftLabel.textContent = element.extraAttributes?.leftLabel || 'Left Image';
              
              const leftUpload = document.createElement('div');
              leftUpload.className = 'quick-form-dual-image-upload';
              leftUpload.textContent = element.extraAttributes?.leftPrompt || 'Upload left image';
              
              const leftInput = document.createElement('input');
              leftInput.type = 'file';
              leftInput.accept = 'image/*';
              leftInput.style.display = 'none';
              leftInput.name = \`\${element.id}_left\`;
              leftInput.required = element.extraAttributes?.required || false;
              
              const leftPreview = document.createElement('img');
              leftPreview.className = 'quick-form-dual-image-preview';
              
              leftSide.appendChild(leftLabel);
              leftSide.appendChild(leftUpload);
              leftSide.appendChild(leftInput);
              leftSide.appendChild(leftPreview);
              
              // Create right side
              const rightSide = document.createElement('div');
              rightSide.className = 'quick-form-dual-image-side';
              
              const rightLabel = document.createElement('div');
              rightLabel.className = 'quick-form-dual-image-label';
              rightLabel.textContent = element.extraAttributes?.rightLabel || 'Right Image';
              
              const rightUpload = document.createElement('div');
              rightUpload.className = 'quick-form-dual-image-upload';
              rightUpload.textContent = element.extraAttributes?.rightPrompt || 'Upload right image';
              
              const rightInput = document.createElement('input');
              rightInput.type = 'file';
              rightInput.accept = 'image/*';
              rightInput.style.display = 'none';
              rightInput.name = \`\${element.id}_right\`;
              rightInput.required = element.extraAttributes?.required || false;
              
              const rightPreview = document.createElement('img');
              rightPreview.className = 'quick-form-dual-image-preview';
              
              rightSide.appendChild(rightLabel);
              rightSide.appendChild(rightUpload);
              rightSide.appendChild(rightInput);
              rightSide.appendChild(rightPreview);
              
              // Add click handlers
              leftUpload.addEventListener('click', () => leftInput.click());
              rightUpload.addEventListener('click', () => rightInput.click());
              
              // Add change handlers
              leftInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (e.target && e.target.result) {
                      leftPreview.src = e.target.result.toString();
                      leftPreview.style.display = 'block';
                      leftUpload.style.display = 'none';
                    }
                  };
                  reader.readAsDataURL(file);
                }
              });
              
              rightInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (e.target && e.target.result) {
                      rightPreview.src = e.target.result.toString();
                      rightPreview.style.display = 'block';
                      rightUpload.style.display = 'none';
                    }
                  };
                  reader.readAsDataURL(file);
                }
              });
              
              dualImageContainer.appendChild(leftSide);
              dualImageContainer.appendChild(rightSide);
              
              wrapper.appendChild(dualImageLabel);
              wrapper.appendChild(dualImageHelperText);
              wrapper.appendChild(dualImageContainer);
              break;
          }

          form.appendChild(wrapper);
        });

        // Add submit button wrapper
        const submitWrapper = document.createElement('div');
        submitWrapper.className = 'quick-form-field';
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'quick-form-submit';
        submitBtn.textContent = 'Submit';
        submitWrapper.appendChild(submitBtn);
        form.appendChild(submitWrapper);

        // Add form submit handler
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';

          try {
            const formData = new FormData(form);
            const data = {};
            
            // Process all form fields
            const processPromises = formContent.map(async element => {
              const fieldName = element.id;
              const value = formData.get(fieldName);
              
              if (!value && !element.extraAttributes?.required) {
                return;
              }

              switch (element.type) {
                case 'ImageUploadField':
                  if (value && value instanceof File) {
                    const base64 = await new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        if (e.target && e.target.result) {
                          resolve(e.target.result.toString());
                        }
                      };
                      reader.readAsDataURL(value);
                    });
                    data[fieldName] = base64;
                  }
                  break;

                case 'PictureSelectField':
                  if (value) {
                    data[fieldName] = {
                      url: value,
                      label: element.extraAttributes?.images?.find(img => img.url === value)?.label
                    };
                  }
                  break;

                case 'RatingScaleField':
                  if (value) {
                    data[fieldName] = {
                      value: parseInt(value),
                      maxValue: element.extraAttributes?.maxValue || 10,
                      minValue: element.extraAttributes?.minValue || 1
                    };
                  }
                  break;

                case 'CheckboxField':
                  data[fieldName] = !!value;
                  break;

                case 'DualImageUploadField':
                  if (value) {
                    const leftFile = formData.get(\`\${fieldName}_left\`);
                    const rightFile = formData.get(\`\${fieldName}_right\`);
                    
                    const [leftBase64, rightBase64] = await Promise.all([
                      leftFile instanceof File ? new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          if (e.target && e.target.result) {
                            resolve(e.target.result.toString());
                          }
                        };
                        reader.readAsDataURL(leftFile);
                      }) : null,
                      rightFile instanceof File ? new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          if (e.target && e.target.result) {
                            resolve(e.target.result.toString());
                          }
                        };
                        reader.readAsDataURL(rightFile);
                      }) : null
                    ]);
                    
                    data[fieldName] = {
                      left: leftBase64,
                      right: rightBase64
                    };
                  }
                  break;

                default:
                  if (value) {
                    data[fieldName] = value;
                  }
              }
            });

            // Wait for all field processing to complete
            await Promise.all(processPromises);

            console.log('Submitting form data:', data);

            const response = await fetch('/api/submit-form/${formId}', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });

            if (!response.ok) {
              throw new Error(\`Submission failed: \${response.status} \${response.statusText}\`);
            }

            // Show success message
            form.innerHTML = '<div class="quick-form-field"><h2 class="quick-form-subtitle">Thank you for your submission!</h2></div>';
          } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'quick-form-error';
            errorDiv.textContent = 'Failed to submit form. Please try again.';
            form.insertBefore(errorDiv, form.firstChild);
          }
        });

        // Add form to container
        container.appendChild(form);
      })();
    `;

    // Return the bundle with proper JavaScript content type
    return new NextResponse(bundle, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error('Error generating form bundle:', error);
    return new NextResponse("Error generating form bundle", { status: 500 });
  }
}
