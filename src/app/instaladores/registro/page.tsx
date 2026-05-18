"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  CheckCircle2,
  ChevronRight,
  Percent,
  Truck,
  Award,
  Headphones,
  ArrowRight,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Star,
  FileText,
} from "lucide-react";

const PROVINCES = [
  "Panamá",
  "Panamá Oeste",
  "Colón",
  "Coclé",
  "Herrera",
  "Los Santos",
  "Veraguas",
  "Chiriquí",
  "Bocas del Toro",
  "Darién",
  "Emberá",
  "Guna Yala",
  "Ngäbe-Buglé",
  "Madungandí",
];

const SPECIALTIES = [
  { value: "pvc", label: "Cercas PVC" },
  { value: "mallas", label: "Mallas de alambre" },
  { value: "madera", label: "Cercas de madera" },
  { value: "metalicas", label: "Cercas metálicas" },
  { value: "todas", label: "Todas las anteriores" },
];

const EXPERIENCE_RANGES = [
  "Menos de 1 año",
  "1 – 2 años",
  "3 – 5 años",
  "6 – 10 años",
  "Más de 10 años",
];

type FormData = {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  province: string;
  experience: string;
  specialties: string[];
  references: string;
  hasRUC: string;
  hasTools: string;
  message: string;
};

export default function RegistroPage() {
  const [form, setForm] = useState<FormData>({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    province: "",
    experience: "",
    specialties: [],
    references: "",
    hasRUC: "",
    hasTools: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const toggleSpecialty = (value: string) => {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(value)
        ? f.specialties.filter((s) => s !== value)
        : [...f.specialties, value],
    }));
    setErrors((e) => ({ ...e, specialties: "" }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.companyName.trim()) e.companyName = "Requerido";
    if (!form.contactName.trim()) e.contactName = "Requerido";
    if (!form.phone.trim()) e.phone = "Requerido";
    if (!form.email.trim()) e.email = "Requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Correo inválido";
    if (!form.province) e.province = "Selecciona una provincia";
    if (!form.experience) e.experience = "Selecciona tu experiencia";
    if (form.specialties.length === 0) e.specialties = "Selecciona al menos una especialidad";
    if (!form.hasRUC) e.hasRUC = "Requerido";
    if (!form.hasTools) e.hasTools = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const specialtyLabels = form.specialties
      .map((s) => SPECIALTIES.find((sp) => sp.value === s)?.label || s)
      .join(", ");

    const lines = [
      `*SOLICITUD DE INSTALADOR CERTIFICADO*`,
      ``,
      `*Empresa:* ${form.companyName}`,
      `*Contacto:* ${form.contactName}`,
      `*Teléfono:* ${form.phone}`,
      `*Correo:* ${form.email}`,
      `*Provincia:* ${form.province}`,
      `*Experiencia:* ${form.experience}`,
      `*Especialidades:* ${specialtyLabels}`,
      `*Tiene RUC/personería:* ${form.hasRUC === "yes" ? "Sí" : "No"}`,
      `*Tiene herramientas propias:* ${form.hasTools === "yes" ? "Sí" : "No"}`,
      form.references ? `*Referencias:* ${form.references}` : null,
      form.message ? `*Comentarios:* ${form.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const encoded = encodeURIComponent(lines);
    window.open(`https://wa.me/50762874042?text=${encoded}`, "_blank");
    setSubmitted(true);
  };

  const inputClass = (field: keyof FormData) =>
    `w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
    }`;

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">

        {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
        <div className="border-b bg-gray-50">
          <div className="mx-auto max-w-5xl px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Link href="/" className="hover:text-green-600">Inicio</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/instaladores" className="hover:text-green-600">Instaladores</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-700 font-medium">Registro de empresa</span>
            </div>
          </div>
        </div>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-200 mb-5">
              Programa de instaladores
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Registro de Empresas<br className="hidden sm:block" /> de Instalación
            </h1>
            <p className="mt-4 text-base text-green-100/80 max-w-xl mx-auto leading-relaxed">
              Únete a la red de instaladores certificados de Intemperie y accede a precios exclusivos,
              capacitación técnica y clientes en tu zona.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium text-white/90">
              {["Sin cuota de membresía", "Certificación incluida", "Leads en tu zona"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-300" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Benefits Bar ─────────────────────────────────────────────────── */}
        <section className="border-b border-gray-100 bg-white py-6">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Percent, title: "Descuento instalador", desc: "Hasta 20% en productos" },
                { icon: Truck, title: "Envío express", desc: "Entrega prioritaria en obra" },
                { icon: Award, title: "Certificación oficial", desc: "Badge verificado Intemperie" },
                { icon: Headphones, title: "Soporte técnico", desc: "Asesoría directa del equipo" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                    <Icon className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Form + Sidebar ─────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4">
            {submitted ? (
              <div className="mx-auto max-w-md text-center py-16">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">¡Solicitud enviada!</h2>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Un asesor revisará tu perfil y se pondrá en contacto contigo en menos de 24 horas hábiles.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/instaladores"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-800 transition-colors"
                  >
                    Ver directorio de instaladores
                  </Link>
                  <Link
                    href="/productos"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Explorar productos
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-10 lg:grid-cols-3">
                {/* Form */}
                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                      Formulario de solicitud
                    </h2>
                    <p className="text-sm text-gray-500 mb-8">
                      Completa el formulario y envíanos tu solicitud por WhatsApp. Te respondemos en 24 horas hábiles.
                    </p>

                    <form onSubmit={handleSubmit} noValidate className="space-y-6">

                      {/* Company info */}
                      <div>
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-4">
                          <Building2 className="h-4 w-4 text-green-600" />
                          Datos de la empresa
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              Nombre de la empresa <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Ej. Construcciones López S.A."
                              className={inputClass("companyName")}
                              value={form.companyName}
                              onChange={(e) => set("companyName", e.target.value)}
                            />
                            {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              Persona de contacto <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Nombre y apellido"
                              className={inputClass("contactName")}
                              value={form.contactName}
                              onChange={(e) => set("contactName", e.target.value)}
                            />
                            {errors.contactName && <p className="mt-1 text-xs text-red-500">{errors.contactName}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Contact */}
                      <div>
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-4">
                          <Phone className="h-4 w-4 text-green-600" />
                          Información de contacto
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              WhatsApp / Teléfono <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              placeholder="6000-0000"
                              className={inputClass("phone")}
                              value={form.phone}
                              onChange={(e) => set("phone", e.target.value)}
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              Correo electrónico <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              placeholder="empresa@correo.com"
                              className={inputClass("email")}
                              value={form.email}
                              onChange={(e) => set("email", e.target.value)}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              Provincia de cobertura <span className="text-red-500">*</span>
                            </label>
                            <select
                              className={inputClass("province")}
                              value={form.province}
                              onChange={(e) => set("province", e.target.value)}
                            >
                              <option value="">Selecciona una provincia</option>
                              {PROVINCES.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              Años de experiencia <span className="text-red-500">*</span>
                            </label>
                            <select
                              className={inputClass("experience")}
                              value={form.experience}
                              onChange={(e) => set("experience", e.target.value)}
                            >
                              <option value="">Selecciona</option>
                              {EXPERIENCE_RANGES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                            {errors.experience && <p className="mt-1 text-xs text-red-500">{errors.experience}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div>
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-4">
                          <Star className="h-4 w-4 text-green-600" />
                          Especialidades <span className="font-normal text-gray-400">(selecciona todas las que apliquen)</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {SPECIALTIES.map(({ value, label }) => (
                            <button
                              type="button"
                              key={value}
                              onClick={() => toggleSpecialty(value)}
                              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                                form.specialties.includes(value)
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : "border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50"
                              }`}
                            >
                              {form.specialties.includes(value) && (
                                <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" />
                              )}
                              {label}
                            </button>
                          ))}
                        </div>
                        {errors.specialties && <p className="mt-2 text-xs text-red-500">{errors.specialties}</p>}
                      </div>

                      {/* Yes/No questions */}
                      <div>
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-4">
                          <Briefcase className="h-4 w-4 text-green-600" />
                          Perfil profesional
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2">
                              ¿Tienes RUC o personería jurídica? <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-3">
                              {["yes", "no"].map((v) => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="hasRUC"
                                    value={v}
                                    checked={form.hasRUC === v}
                                    onChange={() => set("hasRUC", v)}
                                    className="accent-green-600"
                                  />
                                  <span className="text-sm text-gray-700">{v === "yes" ? "Sí" : "No"}</span>
                                </label>
                              ))}
                            </div>
                            {errors.hasRUC && <p className="mt-1 text-xs text-red-500">{errors.hasRUC}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2">
                              ¿Cuentas con herramientas propias? <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-3">
                              {["yes", "no"].map((v) => (
                                <label key={v} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="hasTools"
                                    value={v}
                                    checked={form.hasTools === v}
                                    onChange={() => set("hasTools", v)}
                                    className="accent-green-600"
                                  />
                                  <span className="text-sm text-gray-700">{v === "yes" ? "Sí" : "No"}</span>
                                </label>
                              ))}
                            </div>
                            {errors.hasTools && <p className="mt-1 text-xs text-red-500">{errors.hasTools}</p>}
                          </div>
                        </div>
                      </div>

                      {/* References */}
                      <div>
                        <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-4">
                          <FileText className="h-4 w-4 text-green-600" />
                          Referencias y comentarios
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              Referencias de proyectos anteriores{" "}
                              <span className="font-normal text-gray-400">(opcional)</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Nombre de empresa o cliente, teléfono de contacto"
                              className={inputClass("references")}
                              value={form.references}
                              onChange={(e) => set("references", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              Cuéntanos sobre tu empresa{" "}
                              <span className="font-normal text-gray-400">(opcional)</span>
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Proyectos realizados, equipo de trabajo, zona de cobertura adicional..."
                              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
                              value={form.message}
                              onChange={(e) => set("message", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-700 hover:bg-green-800 px-6 py-3.5 text-sm font-extrabold text-white transition-colors shadow-sm"
                      >
                        Enviar solicitud por WhatsApp
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <p className="text-center text-xs text-gray-400">
                        Al enviar tu solicitud aceptas que Intemperie guarde tu información de contacto para darte seguimiento.
                      </p>
                    </form>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                  {/* What you get */}
                  <div className="rounded-2xl border border-green-100 bg-green-50/40 p-5">
                    <h3 className="text-sm font-extrabold text-green-800 mb-4">
                      ¿Qué obtienes al ser parte de la red?
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Descuento exclusivo de instalador en todos los productos",
                        "Capacitación técnica presencial y virtual",
                        "Leads de clientes en tu zona de cobertura",
                        "Certificado digital y badge verificado",
                        "Prioridad en el directorio de instaladores",
                        "Soporte técnico directo con el equipo de Intemperie",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-4">Requisitos mínimos</h3>
                    <ul className="space-y-2.5">
                      {[
                        "Al menos 1 año de experiencia en instalación de cercas",
                        "Herramientas básicas de instalación",
                        "Disponibilidad para capacitación (1 día)",
                        "Zona de cobertura definida en Panamá",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contact */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-3">¿Tienes preguntas?</h3>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Nuestro equipo está disponible para aclarar cualquier duda sobre el programa de instaladores.
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://wa.me/50762874042?text=Hola%2C%20tengo%20preguntas%20sobre%20el%20programa%20de%20instaladores"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-700 transition-colors"
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Preguntar por WhatsApp
                      </a>
                      <a
                        href="mailto:ventas@intemperie.com?subject=Programa%20de%20instaladores"
                        className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                        ventas@intemperie.com
                      </a>
                    </div>
                  </div>

                  {/* Back link */}
                  <Link
                    href="/instaladores"
                    className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-semibold transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Ver directorio de instaladores
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
