// scripts/fix-metadata.js
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../app');

function fixMetadataInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if file has both metadata and viewport/themeColor
    const hasViewportInMetadata = content.includes('viewport:') && content.includes('export const metadata');
    const hasThemeColorInMetadata = content.includes('themeColor:') && content.includes('export const metadata');

    if (!hasViewportInMetadata && !hasThemeColorInMetadata) {
        return false;
    }

    console.log(`Fixing metadata in: ${filePath}`);

    // Extract viewport and themeColor from metadata
    const viewportMatch = content.match(/viewport:\s*['"`]([^'"`]+)['"`]/);
    const themeColorMatch = content.match(/themeColor:\s*['"`](#?[^'"`]+)['"`]/);

    // Remove viewport and themeColor from metadata
    content = content.replace(/,\s*viewport:\s*['"`][^'"`]+['"`]/g, '');
    content = content.replace(/,\s*themeColor:\s*['"`][^'"`]+['"`]/g, '');

    // Add viewport export if it exists
    if (viewportMatch) {
        const viewportValue = viewportMatch[1];
        const viewportExport = `
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  ${themeColorMatch ? `themeColor: '${themeColorMatch[1]}',` : ''}
};
`;

        // Insert after metadata export
        const metadataEnd = content.indexOf('export const metadata') + 1;
        const insertPosition = content.indexOf('\n', content.indexOf('};', metadataEnd)) + 1;
        content = content.slice(0, insertPosition) + viewportExport + content.slice(insertPosition);
    }

    fs.writeFileSync(filePath, content);
    return true;
}

function findAndFixFiles(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findAndFixFiles(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            fixMetadataInFile(filePath);
        }
    });
}

// Run the fix
findAndFixFiles(pagesDir);
console.log('Metadata fixes completed!');
