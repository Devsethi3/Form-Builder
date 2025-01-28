const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Read package.json and get dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

// Define directories to scan
const dirsToScan = [
  'src',
  'pages',
  'components',
  'lib',
  'utils',
  'styles',
  'app'
];

// Get all JS/TS files
const files = glob.sync(`{${dirsToScan.join(',')}}/**/*.{js,jsx,ts,tsx}`);

// Initialize results
const results = {
  used: new Set(),
  unused: new Set(),
  nextSpecific: new Set(['next', '@next/font', 'next-auth']), // Common Next.js packages
  internal: new Set() // For @/ imports
};

// Process each file
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for import statements
  const importRegex = /import.*?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Handle different import types
    if (importPath.startsWith('@/')) {
      results.internal.add(importPath);
      continue;
    }
    
    // Get package name (handle scoped packages)
    const packageName = importPath.startsWith('@') 
      ? importPath.split('/').slice(0, 2).join('/')
      : importPath.split('/')[0];
    
    if (dependencies[packageName]) {
      results.used.add(packageName);
    }
  }
  
  // Check for require statements
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    const packageName = match[1].split('/')[0];
    if (dependencies[packageName]) {
      results.used.add(packageName);
    }
  }
});

// Find unused dependencies
Object.keys(dependencies).forEach(dep => {
  if (!results.used.has(dep) && !results.nextSpecific.has(dep)) {
    results.unused.add(dep);
  }
});

// Print results
console.log('\nDependency Audit Results\n');
console.log('Used Dependencies:', Array.from(results.used).sort());
console.log('\nPotentially Unused Dependencies:', Array.from(results.unused).sort());
console.log('\nNext.js Specific Dependencies:', Array.from(results.nextSpecific));
console.log('\nInternal Imports:', Array.from(results.internal).sort());

// Print summary
console.log('\nSummary:');
console.log(`Total Dependencies: ${Object.keys(dependencies).length}`);
console.log(`Used: ${results.used.size}`);
console.log(`Potentially Unused: ${results.unused.size}`);
console.log(`Next.js Specific: ${results.nextSpecific.size}`);

console.log('\nNote: This is a basic analysis and may have false positives. Please verify before removing any packages.');