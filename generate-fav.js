// make sure to have the logo.svg in the public folder

/**
 * Generate favicons from logo.svg
 * 
 * Prerequisites:
 * npm install -g sharp-cli
 * OR
 * npm install sharp (locally)
 * 
 * Usage:
 * node generate-favicons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if sharp is available (locally first, then globally)
let sharp;
let useGlobalSharp = false;

try {
  // Try local sharp first
  sharp = require('sharp');
  console.log('Using local sharp installation');
} catch (error) {
  try {
    // Check if sharp-cli is available globally
    execSync('sharp --version', { stdio: 'ignore' });
    useGlobalSharp = true;
    console.log('Using global sharp-cli installation');
  } catch (globalError) {
    console.log('Sharp not found locally or globally.');
    console.log('Install options:');
    console.log('1. Local: npm install sharp');
    console.log('2. Global: npm install -g sharp-cli');
    console.log('Then run this script again.');
    process.exit(1);
  }
}

const sizes = [16, 32, 48, 64, 128, 256, 512];
const appleSizes = [180]; // For apple-touch-icon
const inputSvg = path.join(__dirname, 'public', 'logo.svg');
const outputDir = path.join(__dirname, 'public');

async function generateWithLocalSharp() {
  const svgBuffer = fs.readFileSync(inputSvg);
  
  console.log('Generating favicons with local sharp...');
  
  // Generate different sizes
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `favicon-${size}x${size}.png`);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputFile);
    
    console.log(`✓ Generated favicon-${size}x${size}.png`);
  }

  // Generate apple touch icons
  for (const size of appleSizes) {
    const outputFile = path.join(outputDir, `apple-touch-icon.png`);
    const precomposedFile = path.join(outputDir, `apple-touch-icon-precomposed.png`);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputFile);

    await sharp(svgBuffer)
      .resize(size, size) 
      .png()
      .toFile(precomposedFile);
      
    console.log(`✓ Generated apple-touch-icon.png and apple-touch-icon-precomposed.png (${size}x${size})`);
  }
  
  // Generate favicon.ico (32x32)
  const icoFile = path.join(outputDir, 'favicon.ico');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(icoFile);
  
  console.log('✓ Generated favicon.ico');
}

function generateWithGlobalSharp() {
  console.log('Generating favicons with global sharp-cli...');
  
  // Generate different sizes
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `favicon-${size}x${size}.png`);
    
    try {
      execSync(`sharp -i "${inputSvg}" -o "${outputFile}" resize ${size} ${size} --format png`, { stdio: 'inherit' });
      console.log(`✓ Generated favicon-${size}x${size}.png`);
    } catch (error) {
      console.error(`Error generating ${size}x${size} favicon:`, error.message);
    }
  }

  // Generate apple touch icons
  for (const size of appleSizes) {
    const outputFile = path.join(outputDir, `apple-touch-icon.png`);
    const precomposedFile = path.join(outputDir, `apple-touch-icon-precomposed.png`);
    
    try {
      execSync(`sharp -i "${inputSvg}" -o "${outputFile}" resize ${size} ${size} --format png`, { stdio: 'inherit' });
      execSync(`sharp -i "${inputSvg}" -o "${precomposedFile}" resize ${size} ${size} --format png`, { stdio: 'inherit' });
      console.log(`✓ Generated apple-touch-icon.png and apple-touch-icon-precomposed.png (${size}x${size})`);
    } catch (error) {
      console.error(`Error generating apple touch icons:`, error.message);
    }
  }
  
  // Generate favicon.ico (32x32)
  const icoFile = path.join(outputDir, 'favicon.ico');
  try {
    execSync(`sharp -i "${inputSvg}" -o "${icoFile}" resize 32 32 --format png`, { stdio: 'inherit' });
    console.log('✓ Generated favicon.ico');
  } catch (error) {
    console.error('Error generating favicon.ico:', error.message);
  }
}

async function generateFavicons() {
  try {
    if (useGlobalSharp) {
      generateWithGlobalSharp();
    } else {
      await generateWithLocalSharp();
    }
    
    console.log(`
🎉 All favicons generated successfully!

Add this to your metadata:
export const metadata: Metadata = {
  title: "API Tester",
  description:
    "Test your APIs with a clean, modern interface. Built with Next.js, React, and Tailwind CSS.",
  keywords: ["API", "testing", "Postman", "REST", "HTTP", "developer tools"],
  authors: [{ name: "Om Shejul" }],
  creator: "Om Shejul",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico", 
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-precomposed.png", sizes: "180x180", type: "image/png" }
    ],
  },
  openGraph: {
    title: "API Tester",
    description: "Test your APIs with a clean, modern interface",
    type: "website",
  },
};`);
    
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();