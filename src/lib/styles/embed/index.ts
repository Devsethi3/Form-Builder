import { getBaseStyles } from './base';
import { getInputStyles } from './inputs';
import { getRatingStyles } from './rating';
import { getImageStyles } from './images';
import { getLayoutStyles } from './layout';

export function getAllStyles(): string {
  const styles = [
    getBaseStyles(),
    getInputStyles(),
    getRatingStyles(),
    getImageStyles(),
    getLayoutStyles()
  ];
  
  // Join styles and escape any problematic characters
  return styles
    .join('\n')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

export { getBaseStyles, getInputStyles, getRatingStyles, getImageStyles, getLayoutStyles };
