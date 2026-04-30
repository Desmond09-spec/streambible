const fs = require('fs');
const commonPath = 'C:\\Users\\danie\\OneDrive\\Documents\\Projects\\Streambible-suite\\bible-overlay\\desktop-old\\common.css';
const htmlPath = 'C:\\Users\\danie\\OneDrive\\Documents\\Projects\\Streambible-suite\\bible-overlay\\desktop-old\\controller.html';
const destPath = 'C:\\Users\\danie\\OneDrive\\Documents\\Projects\\Streambible-suite\\bible-overlay\\streambible-dual\\src\\pages\\ControllerLegacy.css';

const common = fs.readFileSync(commonPath, 'utf-8');
const html = fs.readFileSync(htmlPath, 'utf-8');
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
const controllerCss = styleMatch ? styleMatch[1] : '';

// Add a specific prefix to body so it only applies when .theme-legacy is present, or just leave it global.
// To avoid breaking the rest of the app, let's wrap the controller CSS in a scope or just let it override.
// Actually, let's just write it out. The user wants the old style.
const combined = common + '\n' + controllerCss;
fs.writeFileSync(destPath, combined);
console.log('CSS extracted and written successfully.');
