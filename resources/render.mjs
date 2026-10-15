// Genera los PNG de icono y splash a partir del logo de Tech Doctor.
// Uso: node resources/render.mjs && npx capacitor-assets generate --android
import sharp from 'sharp'

const LOGO = 'resources/techdoctor-logo.webp' // 2000×2000, fondo blanco
const WHITE = '#ffffff'
const LIGHT = '#f2f2f2'
const DARK = '#121412'

const logo = size => sharp(LOGO).resize(size, size).png().toBuffer()
const canvas = (size, bg) => sharp({ create: { width: size, height: size, channels: 4, background: bg } })
const circle = size =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`)

// Icono clásico y de Play Store: el logo tal cual, sobre blanco
await sharp(LOGO).resize(1024, 1024).png().toFile('resources/icon-only.png')
await sharp(LOGO).resize(512, 512).png().toFile('resources/play-store-icon-512.png')

// Icono adaptativo: capacitor-assets ya aplica un margen del 16,7 % (zona segura),
// así que el primer plano es el logo a tamaño completo
await sharp(LOGO).resize(1024, 1024).png().toFile('resources/icon-foreground.png')
await canvas(1024, WHITE).png().toFile('resources/icon-background.png')

// Splash claro y oscuro (logo dentro de un círculo blanco, como en el banner)
const splash = async (bg, file) =>
  canvas(2732, bg)
    .composite([
      { input: circle(900), gravity: 'center' },
      { input: await logo(760), gravity: 'center' },
    ])
    .png()
    .toFile(file)
await splash(LIGHT, 'resources/splash.png')
await splash(DARK, 'resources/splash-dark.png')

// Logo para la cabecera de la app
await sharp(LOGO).resize(192, 192).webp({ quality: 90 }).toFile('src/assets/logo.webp')
console.log('ok')
