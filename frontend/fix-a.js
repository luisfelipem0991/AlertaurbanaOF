const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/forgot_password/page.js',
  'src/app/huecos/page.js',
  'src/app/register/page.js',
  'src/app/login/page.js',
  'src/app/components/LogoutButton.js'
];

filesToUpdate.forEach(relPath => {
  const filePath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Undo the A replacement
  content = content.replace(/¡/g, 'A');

  // Fix specific occurrences
  content = content.replace(/ATu voz/g, '¡Tu voz');
  content = content.replace(/ASé el primero/g, '¡Sé el primero');
  content = content.replace(/ACuenta creada!/g, '¡Cuenta creada!');
  content = content.replace(/AContraseña actualizada!/g, '¡Contraseña actualizada!');
  
  // Other known fixes from before
  content = content.replace(/AAtención/g, 'Atención');
  content = content.replace(/AtenciA3n/g, 'Atención');
  content = content.replace(/sesiA3n/g, 'sesión');
  content = content.replace(/contraseA±a/g, 'contraseña');
  content = content.replace(/cA3digo/g, 'código');
  content = content.replace(/dA-a/g, 'día');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Restored A in', relPath);
});

