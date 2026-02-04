const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function optimizeImage() {
  const inputPath = path.join(__dirname, '..', 'public', 'opengraph.png');
  const outputPath = path.join(__dirname, '..', 'public', 'opengraph-optimized.png');

  console.log('🗜️  Optimizing OpenGraph image...\n');

  const originalStats = fs.statSync(inputPath);
  console.log(`📊 Original size: ${(originalStats.size / 1024).toFixed(2)} KB`);

  await sharp(inputPath)
    .png({
      quality: 85,
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: true, // Use palette for smaller file size
    })
    .toFile(outputPath);

  const optimizedStats = fs.statSync(outputPath);
  const savings = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1);

  console.log(`📊 Optimized size: ${(optimizedStats.size / 1024).toFixed(2)} KB`);
  console.log(`💰 Savings: ${savings}%\n`);

  // Replace original with optimized
  fs.renameSync(outputPath, inputPath);
  console.log('✅ Image optimized and saved!');
}

optimizeImage().catch(console.error);
