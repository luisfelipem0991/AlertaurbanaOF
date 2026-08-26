import Link from 'next/link';
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-gray-50 text-gray-800">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">AlertaUrbana</h1>
        <div className="space-x-6">
          <a href="#features" className="hover:text-blue-600">Características</a>
          <a href="#how" className="hover:text-blue-600">Cómo funciona</a>
          <Link href="/login" style={{ textDecoration: 'none' }}>
  <button style={{ 
    backgroundColor: '#2563eb', // Tu color azul
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer'
  }}>
    Iniciar Sesión
  </button>
</Link>
        </div>
      </nav>

       {/* Hero */}
<section
  className="relative text-center py-50 px-6 text-white bg-[url('/logo-alerta-urbana.png')] bg-cover bg-center"
>

  {/* Overlay oscuro para mejorar la lectura */}
  <div className="absolute inset-0 bg-black/40"></div>

  <div className="relative z-10">
    <h2 className="text-4xl md:text-5xl font-bold mb-6">
      Reporta huecos en las vías y mejora tu ciudad
    </h2>

    <p className="max-w-2xl mx-auto text-lg mb-8">
      AlertaUrbana es una plataforma que permite a los ciudadanos reportar
      huecos y daños en las calles para que las autoridades puedan actuar
      rápidamente y mejorar la movilidad.
    </p>

    <Link href="/huecos/reportar" style={{ textDecoration: 'none' }}>
      <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-100">
        Reportar un hueco
      </button>
    </Link>
  </div>

</section>

      {/* Features */}
      <section id="features" className="py-20 px-8 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-12">
          Características de la plataforma
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-4">📍</div>
            <h4 className="font-semibold text-xl mb-2">Ubicación precisa</h4>
            <p>
              Los usuarios pueden marcar la ubicación exacta del hueco en el mapa.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-4">📷</div>
            <h4 className="font-semibold text-xl mb-2">Evidencia fotográfica</h4>
            <p>
              Adjunta imágenes del daño en la vía para facilitar su identificación.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="font-semibold text-xl mb-2">Seguimiento</h4>
            <p>
              Los reportes pueden ser monitoreados hasta que sean solucionados.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-8 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-12">
          ¿Cómo funciona?
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-4"></div>
            <h4 className="font-semibold text-xl mb-2">Regístrate en la plataforma.</h4>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-4"></div>
            <h4 className="font-semibold text-xl mb-2">Reporta el hueco indicando ubicación y evidencia.</h4>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-4"></div>
            <h4 className="font-semibold text-xl mb-2">Las autoridades reciben el reporte y gestionan la reparación.</h4>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-blue-600 text-white">
        <h3 className="text-3xl font-bold mb-6">
          Ayuda a mejorar las calles de tu ciudad
        </h3>
        <p className="mb-8">
          Cada reporte contribuye a una movilidad más segura para todos.
        </p>
        <Link href="/huecos/reportar" style={{ textDecoration: 'none' }}>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200">
            Crear mi primer reporte
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-center py-6">
        <p>© {new Date().getFullYear()} AlertaUrbana - Proyecto de grado</p>
      </footer>

    </main>
  );
}


