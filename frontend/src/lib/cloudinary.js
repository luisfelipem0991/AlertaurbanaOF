// Sube un archivo directo a Cloudinary usando un "unsigned upload preset"
// (no necesita pasar por nuestro backend ni exponer ninguna API secret,
// el preset limita qué se puede subir desde el lado de Cloudinary).
//
// Requiere estas dos variables en frontend/.env.local:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
export async function uploadImageToCloudinary(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Falta configurar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME o NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "alertaurbana/huecos");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("No se pudo subir la imagen");
  }

  const data = await res.json();
  return data.secure_url;
}
