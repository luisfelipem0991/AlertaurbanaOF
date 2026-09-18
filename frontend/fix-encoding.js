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
  
  content = content.replace(/AtenciA3n/g, 'Atención');
  content = content.replace(/sesiA3n/g, 'sesión');
  content = content.replace(/contraseA±a/g, 'contraseña');
  content = content.replace(/cA3digo/g, 'código');
  content = content.replace(/dA-a/g, 'día');
  content = content.replace(/A/g, '¡');
  content = content.replace(/A?XITO/g, 'ÉXITO');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed encoding in', relPath);
});

