const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/forgot_password/page.js',
  'src/app/huecos/page.js',
  'src/app/components/LogoutButton.js'
];

filesToUpdate.forEach(relPath => {
  const filePath = path.join(process.cwd(), relPath);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('import Swal from')) {
    content = content.replace(/(import .*?;?\n)/, '$1import Swal from \'sweetalert2\';\n');
  }

  // Basic string alerts
  content = content.replace(/alert\((['"`])(.*?)\1\);?/g, (match, quote, text) => {
    return `Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: '${text}',
      confirmButtonColor: '#f97316'
    });`;
  });

  // data.error alerts
  content = content.replace(/alert\(data\.error\);?/g, () => {
    return `Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.error,
      confirmButtonColor: '#f97316'
    });`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', relPath);
});

