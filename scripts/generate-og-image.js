/**
 * OpenGraph Image Generator
 * Generates a 1200x630 optimized OG image for Watchfinder
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateOGImage() {
  console.log('🎨 Generating OpenGraph image...\n');

  const htmlPath = path.join(__dirname, '..', 'og-image-generator.html');
  const outputPath = path.join(__dirname, '..', 'public', 'opengraph.png');
  const tempPath = path.join(__dirname, '..', 'public', 'opengraph-temp.png');

  // Launch headless browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set exact viewport for OG image dimensions
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2, // Retina quality
    });

    console.log('📄 Loading HTML template...');
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0'
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('📸 Taking screenshot...');
    await page.screenshot({
      path: tempPath,
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 630,
      },
    });

    console.log('🗜️  Compressing and optimizing...');

    // Optimize with sharp - high quality compression
    await sharp(tempPath)
      .png({
        quality: 95,
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center',
      })
      .toFile(outputPath);

    // Clean up temp file
    fs.unlinkSync(tempPath);

    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('\n✅ OpenGraph image generated successfully!');
    console.log(`📏 Dimensions: 1200x630px`);
    console.log(`💾 File size: ${fileSizeKB} KB`);
    console.log(`📁 Location: ${outputPath}`);
    console.log('\n🎉 Ready to deploy!');

  } catch (error) {
    console.error('❌ Error generating image:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  generateOGImage();
} catch (e) {
  console.log('📦 Installing sharp for image optimization...');
  const { execSync } = require('child_process');
  execSync('npm install sharp --no-save', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  generateOGImage();
}
