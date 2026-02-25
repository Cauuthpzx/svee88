const { generateFonts } = require('fantasticon');
const path = require('path');

// Patch: fantasticon uses path.join which creates backslash paths on Windows.
// glob doesn't handle backslashes. We monkey-patch path.join inside fantasticon.
const origJoin = path.join;
const patchedJoin = (...args) => origJoin(...args).replace(/\\/g, '/');

// Temporarily override path.join
path.join = patchedJoin;

generateFonts({
  inputDir: path.resolve('./app/icons/svg-src'),
  outputDir: path.resolve('./public/fonts'),
  fontTypes: ['woff2', 'woff', 'ttf'],
  assetTypes: ['css'],
  name: 'hub-icons',
  prefix: 'hub-icon',
  tag: 'i',
  fontsUrl: '/fonts',
  fontHeight: 1000,
  normalize: true,
  descent: 100
}).then(result => {
  path.join = origJoin;
  console.log('Icon font generated successfully!');
  console.log('Assets:', Object.keys(result));
  if (result.assetsOut) {
    Object.entries(result.assetsOut).forEach(([type, filePath]) => {
      console.log(`  ${type}: ${filePath}`);
    });
  }
}).catch(err => {
  path.join = origJoin;
  console.error('Failed:', err.message);
  process.exit(1);
});
