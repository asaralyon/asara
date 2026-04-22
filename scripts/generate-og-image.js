const sharp = require('sharp');
const path = require('path');

async function generateOGImage() {
  const logoPath = path.join(__dirname, '../public/images/logo.png');
  const outputPath = path.join(__dirname, '../public/images/og-image.jpg');

  // Créer un fond avec dégradé vert
  const width = 1200;
  const height = 630;

  // SVG avec fond dégradé et texte
  const svgBackground = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0fdf4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#dcfce7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="600" y="480" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#2D8C3C" text-anchor="middle">ASARA France</text>
      <text x="600" y="540" font-family="Arial, sans-serif" font-size="28" fill="#666666" text-anchor="middle">Annuaire des Syriens de France</text>
    </svg>
  `;

  try {
    // Charger le logo et le redimensionner
    const logo = await sharp(logoPath)
      .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Créer l'image finale
    await sharp(Buffer.from(svgBackground))
      .composite([
        {
          input: logo,
          top: 100,
          left: 450,
        }
      ])
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log('✅ Image OG créée:', outputPath);
  } catch (error) {
    console.error('Erreur:', error);
    
    // Fallback: créer juste le fond avec texte
    await sharp(Buffer.from(svgBackground))
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    console.log('✅ Image OG créée (sans logo):', outputPath);
  }
}

generateOGImage();
