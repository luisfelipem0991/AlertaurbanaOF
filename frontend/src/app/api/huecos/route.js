import pool from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { requireRole } from "@/lib/auth";

/**
 * Sube un archivo de imagen a Cloudinary y devuelve la URL segura.
 * Soporta tanto Upload Preset (unsigned) como API Key + Secret (signed).
 * @param {File} file
 * @returns {Promise<string>} URL de la imagen en Cloudinary
 */
async function uploadToCloudinary(file) {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName) {
    throw new Error("No se ha configurado el Cloud Name de Cloudinary.");
  }

  // 1. Método con Upload Preset (unsigned / sin secret)
  if (uploadPreset) {
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type || "image/jpeg" });
    const uploadData = new FormData();
    uploadData.append("file", blob, file.name || "reporte.jpg");
    uploadData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    const resData = await response.json();
    if (!response.ok || resData.error) {
      throw new Error(
        resData.error?.message || "Error al subir imagen a Cloudinary con upload_preset"
      );
    }

    return resData.secure_url;
  }

  // 2. Método con API Key + API Secret (signed)
  if (apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "alerta-urbana/huecos",
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  throw new Error(
    "Faltan credenciales de Cloudinary (configura CLOUDINARY_UPLOAD_PRESET o CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET)."
  );
}

// GET /api/huecos
// Devuelve todos los huecos ordenados por fecha de creacion descendente.
// Los registros sin latitud/longitud (NULL) se incluyen normalmente.
export async function GET(request) {
  const auth = requireRole(request, ["USER", "JAC", "ALCALDIA", "ADMIN", "SUPERADMIN"]);
  if (auth.error) return auth.error;

  try {
    const result = await pool.query(
      `SELECT
         id, user_id, direccion, descripcion, imagen_url,
         estado, prioridad, created_at,
         latitud, longitud
       FROM huecos
       ORDER BY created_at DESC`
    );
    return Response.json(result.rows);
  } catch (error) {
    console.error("GET /api/huecos error:", error.message);
    return Response.json(
      { error: "Error al obtener los huecos" },
      { status: 500 }
    );
  }
}

// POST /api/huecos
// Crea un nuevo reporte de hueco.
// Espera multipart/form-data con:
//   direccion    - texto (obligatorio)
//   descripcion  - texto (obligatorio)
//   imagen       - archivo de imagen (obligatorio)
//   latitud      - numero -90..90 (opcional)
//   longitud     - numero -180..180 (opcional)
export async function POST(request) {
  const auth = requireRole(request, ["USER"]);
  if (auth.error) return auth.error;

  try {
    const formData = await request.formData();

    const direccion = formData.get("direccion")?.trim();
    const descripcion = formData.get("descripcion")?.trim();
    const imagen = formData.get("imagen");
    const latitudRaw = formData.get("latitud");
    const longitudRaw = formData.get("longitud");

    // Validaciones basicas
    if (!direccion || !descripcion) {
      return Response.json(
        { error: "Los campos direccion y descripcion son obligatorios" },
        { status: 400 }
      );
    }

    if (!imagen || imagen.size === 0) {
      return Response.json(
        { error: "La imagen es obligatoria" },
        { status: 400 }
      );
    }

    // Validacion de coordenadas (opcionales)
    let latitud = null;
    let longitud = null;

    if (latitudRaw !== null && latitudRaw !== "" && latitudRaw !== undefined) {
      const lat = parseFloat(latitudRaw);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return Response.json(
          { error: "Latitud invalida. Debe estar entre -90 y 90" },
          { status: 400 }
        );
      }
      latitud = lat;
    }

    if (longitudRaw !== null && longitudRaw !== "" && longitudRaw !== undefined) {
      const lng = parseFloat(longitudRaw);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return Response.json(
          { error: "Longitud invalida. Debe estar entre -180 y 180" },
          { status: 400 }
        );
      }
      longitud = lng;
    }

    // Subida de imagen a Cloudinary
    let imagen_url;
    try {
      imagen_url = await uploadToCloudinary(imagen);
    } catch (uploadError) {
      console.error("Error al subir imagen a Cloudinary:", uploadError.message);
      return Response.json(
        { error: "No se pudo subir la imagen. Verifica las credenciales de Cloudinary." },
        { status: 500 }
      );
    }

    // Insercion en PostgreSQL
    const result = await pool.query(
      `INSERT INTO huecos
         (user_id, direccion, descripcion, imagen_url, latitud, longitud)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, direccion, descripcion, imagen_url,
                 estado, prioridad, created_at, latitud, longitud`,
      [auth.session.id, direccion, descripcion, imagen_url, latitud, longitud]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/huecos error:", error.message);
    return Response.json(
      { error: "Error interno al crear el reporte" },
      { status: 500 }
    );
  }
}
