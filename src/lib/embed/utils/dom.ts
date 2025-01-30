export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  textContent?: string
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
};

export const createLabel = (text: string): HTMLLabelElement => {
  return createElement('label', 'quick-form-label', text);
};

export const createHelperText = (text: string): HTMLDivElement => {
  return createElement('div', 'quick-form-helper-text', text);
};

export const createInput = (
  type: string,
  name: string,
  required: boolean,
  placeholder?: string
): HTMLInputElement => {
  const input = createElement('input', 'quick-form-input');
  input.type = type;
  input.name = name;
  input.required = required;
  if (placeholder) input.placeholder = placeholder;
  return input;
};

export const createWrapper = (): HTMLDivElement => {
  return createElement('div', 'quick-form-field');
};
