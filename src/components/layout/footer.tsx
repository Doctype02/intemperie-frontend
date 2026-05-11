import Link from "next/link";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer id="contacto" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded bg-green-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs">I</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                INTEMPERIE
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Seguridad y Elegancia Al Aire Libre.
            </p>
            <p className="text-sm text-gray-400">
              Especialistas en cercas de PVC y malla electrosoldada con cobertura en todo Panamá.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/productos" className="hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/calculadora" className="hover:text-white transition-colors">
                  Calculadora
                </Link>
              </li>
              <li>
                <Link href="/colecciones/residencial" className="hover:text-white transition-colors">
                  Colección Residencial
                </Link>
              </li>
              <li>
                <Link href="/colecciones/industrial" className="hover:text-white transition-colors">
                  Colección Industrial
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <a href="tel:+50762874042" className="hover:text-white transition-colors">
                  +507 6287-4042
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-500" />
                <a href="mailto:ventas@tiendasintemperie.com" className="hover:text-white transition-colors">
                  ventas@tiendasintemperie.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Provincia de Panamá Oeste, La Chorrera, Barrio Colón</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Síguenos</h4>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/tiendasintemperie"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-700 transition-colors"
                aria-label="Facebook"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/tiendasintemperie"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-700 transition-colors"
                aria-label="Instagram"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@tiendasintemperie"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-700 transition-colors"
                aria-label="YouTube"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-white mb-2 text-sm">Horario</h4>
              <p className="text-sm text-gray-400">
                Lunes a Viernes: 7:00 AM - 5:00 PM<br />
                Sábados: 8:00 AM - 12:00 PM
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Intemperie. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
