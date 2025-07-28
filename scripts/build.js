const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../icon-source/ux-icons-holder.html');
const outputPath = path.join(__dirname, '../dist/ux-icons-holder.js');

//
// 1. Convert ux-icons-holder.html to ux-icons-holder.js
//

const htmlContent = fs.readFileSync(inputPath, 'utf8');


// 2. Extract content inside <template ...>...</template>
const match = htmlContent.match(/<template[^>]*>([\s\S]*?)<\/template>/i);

var templateInnerContent = match[1].trim();

// 3. Inject custom content before </svg>
const contentToInject = `//add-here\n`;

templateInnerContent = templateInnerContent.replace(/<\/svg>/i, `${contentToInject}</svg>`);

// 3. Escape backticks and ${}
const safeHTML = templateInnerContent
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const htmlOutput = `var uxIconsHTML = \`\n${safeHTML}\n\`;\n`;
fs.writeFileSync(outputPath, htmlOutput, 'utf8');
console.log('✅ Converted ux-icons-holder.html → ux-icons-holder.js');
