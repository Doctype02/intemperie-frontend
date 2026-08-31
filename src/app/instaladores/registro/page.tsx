"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  FileText,
  MapPin,
  Wrench,
} from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { CONTACT } from "@/components/layout/nav-data"
import { Button } from "@/components/ui/button"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  BENEFITS,
  CLOSING,
  COVERAGE_AREAS,
  EXPERIENCE_RANGES,
  FORM_INTRO,
  MIN_YEARS_NOTE,
  REQUIREMENTS,
  SPECIALTIES,
  SUBMIT_NOTE,
  SUCCESS,
} from "../content"

/* Registro de instaladores — sistema «Perímetro».
 *
 * Era el archivo con más color escrito a mano del proyecto: 87 clases
 * literales —green-900, gray-200, red-500, amber— en la página donde el
 * sistema más falta hace, porque un campo con borde `gray-200` no se distingue
 * del papel y un error en `red-500` sobre `red-50` no llega a 4.5:1. Ahora todo
 * sale de token: el campo usa `--input` (3:1 contra el papel) y el error usa
 * `--destructive`, que tiene contraparte oscura.
 *
 * Y llevaba su propia copia de las listas, ya desincronizada con la página del
 * programa: allí «mínimo 2 años de experiencia», aquí «al menos 1 año». Allí
 * diez provincias; aquí catorce entradas que mezclaban provincias y comarcas,
 * ponían «Emberá» y «Madungandí» al nivel de una provincia y se dejaban fuera
 * Guna de Wargandí. Allí cercas de PVC y malla; aquí, además, cercas de madera
 * y metálicas, que Intemperie no fabrica. Las listas vienen ahora de
 * `content.ts`, una sola vez, para las dos páginas.
 *
 * Lo demás es accesibilidad, que en un formulario no es adorno sino el trabajo:
 *
 *   · Cada campo con su `<label>` asociada por `htmlFor`. Antes las etiquetas
 *     no apuntaban a nada: pulsar el texto no enfocaba el campo y el lector de
 *     pantalla anunciaba «cuadro de edición» a secas.
 *   · Los errores se anuncian: `role="alert"` en el mensaje, `aria-describedby`
 *     desde el campo y el foco viaja al primer campo que falla. Antes el error
 *     era rojo y nada más: quien no ve el rojo pulsaba enviar sin enterarse.
 *   · Las agrupaciones son `<fieldset>` con `<legend>`. «Sí/No» sin la pregunta
 *     delante no significa nada dicho en voz alta.
 *   · La cobertura es un `<select>` nativo con `<optgroup>`: provincias y
 *     comarcas separadas, como en la división real del país.
 *   · Objetivo táctil de 44 px en todo lo pulsable, casillas incluidas.
 *   · El foco nunca se elimina. `focus:outline-none` estaba en cada campo.
 *
 * NO se ha tocado el envío: valida, construye el mismo mensaje línea a línea y
 * lo abre en el mismo `wa.me`. Lo único añadido es guardar esa dirección para
 * poder ofrecerla otra vez si el navegador bloquea la ventana emergente, que
 * es el fallo silencioso de este formulario.
 */

type FormData = {
  companyName: string
  contactName: string
  phone: string
  email: string
  province: string
  experience: string
  specialties: string[]
  references: string
  hasRUC: string
  hasTools: string
  message: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

/* El orden manda: al fallar la validación el foco va al primer campo en falta
   siguiendo el orden en que se leen, no el orden en que valida el código. */
const FIELD_ORDER: (keyof FormData)[] = [
  "companyName",
  "contactName",
  "phone",
  "email",
  "province",
  "experience",
  "specialties",
  "hasRUC",
  "hasTools",
]

const YES_NO = [
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
]

/* Un campo lleva siempre las mismas cuatro piezas —etiqueta, control, ayuda y
   error— cosidas por los mismos identificadores. Declararlas una vez es lo que
   impide que al décimo campo alguien se deje el `aria-describedby`. */
function Field({
  id,
  label,
  required = false,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      {/* `gap-1` y no el hueco por defecto de `Label`: el asterisco pertenece a
          la etiqueta, no es una segunda columna. El color lo pone el propio
          `Label` a través de `data-required`. */}
      <Label htmlFor={id} className="mb-1.5 gap-1">
        {label}
        {required && (
          <span data-required aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

/* Encabezado de bloque del formulario. Es `<legend>` y no un `<h3>` suelto:
   el lector de pantalla lo repite al entrar en cada campo del grupo. */
function GroupLegend({ Icon, children }: { Icon: typeof Building2; children: React.ReactNode }) {
  return (
    <legend className="mb-4 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
      <Icon className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
      {children}
    </legend>
  )
}

/* El `<select>` nativo se queda: es el único que agrupa con `<optgroup>` y el
   único que en un móvil abre la rueda del sistema. Se le viste con las mismas
   medidas y el mismo borde que `Input` —44 px de alto y cuerpo de 16 px, por
   debajo del cual Safari hace zoom al enfocar y descoloca la página—. */
const selectClass = [
  "h-11 w-full min-w-0 rounded-lg border border-input bg-surface px-3",
  "text-[1rem] text-foreground",
  "transition-colors duration-150 outline-none",
  "hover:border-foreground/35 focus-visible:border-ring",
  "aria-invalid:border-destructive",
].join(" ")

/* Casilla y radio: 20 px visibles, fila pulsable de 44 px. El dedo de quien
   monta cercas no es un ratón. */
const choiceRowClass =
  "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:border-border-strong has-checked:border-primary has-checked:bg-secondary has-checked:text-secondary-foreground"

const choiceInputClass = "size-5 shrink-0 accent-primary"

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
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  /* La dirección que se acaba de abrir, guardada para poder reabrirla a mano.
     No cambia el envío: es la misma cadena que recibió `window.open`. */
  const [sentHref, setSentHref] = useState("")

  const uid = useId()
  const fieldId = (field: keyof FormData) => `${uid}-${field}`

  /* A dónde va el foco cuando un grupo falla: al primer control del grupo, que
     es donde el lector de pantalla anuncia la pregunta entera. */
  const anchorId = (field: keyof FormData) => {
    if (field === "specialties") return `${uid}-specialty-${SPECIALTIES[0]?.value ?? ""}`
    if (field === "hasRUC" || field === "hasTools") return `${uid}-${field}-yes`
    return fieldId(field)
  }

  const successRef = useRef<HTMLDivElement>(null)

  /* Al enviarse, el formulario desaparece y con él el botón que tenía el foco:
     sin esto el foco cae al `<body>` y quien navega con teclado o lector de
     pantalla se queda sin saber qué ha pasado. */
  useEffect(() => {
    if (submitted) successRef.current?.focus()
  }, [submitted])

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: "" }))
  }

  const toggleSpecialty = (value: string) => {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(value)
        ? f.specialties.filter((s) => s !== value)
        : [...f.specialties, value],
    }))
    setErrors((e) => ({ ...e, specialties: "" }))
  }

  /* Los mensajes dicen qué hacer, no que algo está mal. «Requerido» obliga a
     adivinar qué esperaba el formulario. */
  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!form.companyName.trim()) e.companyName = "Escriba el nombre con el que factura."
    if (!form.contactName.trim()) e.contactName = "Escriba quién atiende el teléfono."
    if (!form.phone.trim()) e.phone = "Hace falta un teléfono: la verificación empieza por una llamada."
    if (!form.email.trim()) e.email = "Escriba un correo de contacto."
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Ese correo no parece completo. Revise que lleve @ y dominio."
    if (!form.province) e.province = "Elija la provincia o comarca donde trabaja."
    if (!form.experience) e.experience = "Elija cuántos años lleva montando."
    if (form.specialties.length === 0) e.specialties = "Marque al menos una cosa de las que monta."
    if (!form.hasRUC) e.hasRUC = "Conteste sí o no."
    if (!form.hasTools) e.hasTools = "Conteste sí o no."
    setErrors(e)
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate()
    const firstError = FIELD_ORDER.find((field) => found[field])
    if (firstError) {
      document.getElementById(anchorId(firstError))?.focus()
      return
    }

    const specialtyLabels = form.specialties
      .map((s) => SPECIALTIES.find((sp) => sp.value === s)?.label || s)
      .join(", ")

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
      .join("\n")

    const encoded = encodeURIComponent(lines)
    const href = `https://wa.me/50762874042?text=${encoded}`
    window.open(href, "_blank")
    setSentHref(href)
    setSubmitted(true)
  }

  const describedBy = (field: keyof FormData, hasHint = false) =>
    [hasHint ? `${fieldId(field)}-hint` : null, errors[field] ? `${fieldId(field)}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <>
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* ── Migas ────────────────────────────────────────────────────────── */}
        <nav aria-label="Ruta de navegación" className="border-b border-border bg-surface-2">
          <ol className="shell flex flex-wrap items-center gap-1.5 py-2.5 text-xs text-muted-foreground">
            <li>
              <Link
                href="/"
                className="rounded-sm transition-colors hover:text-brand-green-deep dark:hover:text-brand-green"
              >
                Inicio
              </Link>
            </li>
            <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
            <li>
              <Link
                href="/instaladores"
                className="rounded-sm transition-colors hover:text-brand-green-deep dark:hover:text-brand-green"
              >
                Instaladores
              </Link>
            </li>
            <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
            <li aria-current="page" className="font-semibold text-foreground">
              Registro de empresa
            </li>
          </ol>
        </nav>

        {/* ── Encabezado ───────────────────────────────────────────────────── */}
        <section className="border-b border-border bg-brand-navy-deep text-on-dark">
          <div className="shell py-8 sm:py-10">
            <div className="max-w-prose">
              <p className="eyebrow text-brand-green">{FORM_INTRO.eyebrow}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {FORM_INTRO.title}
              </h1>
              <p className="mt-3 text-base text-on-dark-soft">{FORM_INTRO.lead}</p>
            </div>
          </div>
        </section>

        <section className="bg-background">
          <div className="shell py-8 sm:py-10 lg:py-14">
            {submitted ? (
              /* ── Enviado ────────────────────────────────────────────────
                 El envío es síncrono: no hay espera que anunciar, hay un
                 resultado. Y se cuenta con palabras —qué acaba de pasar, qué
                 pasa después y qué hacer si la ventana no se abrió—, no con un
                 aspa verde y «¡Solicitud enviada!», que además era falso: hasta
                 que no se pulsa enviar dentro de WhatsApp no ha llegado nada. */
              <div
                ref={successRef}
                tabIndex={-1}
                className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 sm:p-8"
              >
                <span className="flex size-12 items-center justify-center rounded-lg bg-secondary">
                  <Check className="size-6 text-secondary-foreground" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-balance text-foreground">
                  {SUCCESS.title}
                </h2>
                <p className="mt-3 text-sm text-foreground">{SUCCESS.body}</p>
                <p className="mt-3 text-sm text-muted-foreground">{SUCCESS.next}</p>

                <p className="mt-5 rounded-lg border border-border bg-surface-sunk p-4 text-sm text-muted-foreground">
                  {SUCCESS.blocked}{" "}
                  <a
                    href={sentHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm font-semibold text-brand-green-deep underline underline-offset-4 transition-colors hover:text-brand-green dark:text-brand-green"
                  >
                    {SUCCESS.blockedCta}
                  </a>
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href="/instaladores"
                    className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
                  >
                    {SUCCESS.backCta}
                  </Link>
                  <Link
                    href="/productos"
                    className="flex h-11 items-center gap-2 rounded-lg border border-border-strong px-5 font-heading font-semibold text-foreground transition-colors hover:bg-surface-2"
                  >
                    {SUCCESS.catalogCta}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
                {/* ── Formulario ─────────────────────────────────────────── */}
                <div className="lg:col-span-2">
                  <div className="rounded-xl border border-border bg-surface p-5 sm:p-7">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                      {FORM_INTRO.formTitle}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{FORM_INTRO.formLead}</p>

                    <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-8">
                      {/* Datos de la empresa */}
                      <fieldset className="min-w-0">
                        <GroupLegend Icon={Building2}>Datos de la empresa</GroupLegend>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field
                            id={fieldId("companyName")}
                            label="Nombre de la empresa"
                            required
                            error={errors.companyName}
                          >
                            <Input
                              id={fieldId("companyName")}
                              type="text"
                              required
                              autoComplete="organization"
                              placeholder="Construcciones López, S.A."
                              value={form.companyName}
                              onChange={(e) => set("companyName", e.target.value)}
                              aria-invalid={errors.companyName ? true : undefined}
                              aria-describedby={describedBy("companyName")}
                            />
                          </Field>

                          <Field
                            id={fieldId("contactName")}
                            label="Persona de contacto"
                            required
                            error={errors.contactName}
                          >
                            <Input
                              id={fieldId("contactName")}
                              type="text"
                              required
                              autoComplete="name"
                              placeholder="Nombre y apellido"
                              value={form.contactName}
                              onChange={(e) => set("contactName", e.target.value)}
                              aria-invalid={errors.contactName ? true : undefined}
                              aria-describedby={describedBy("contactName")}
                            />
                          </Field>
                        </div>
                      </fieldset>

                      {/* Contacto */}
                      <fieldset className="min-w-0">
                        <GroupLegend Icon={MapPin}>Contacto y cobertura</GroupLegend>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field
                            id={fieldId("phone")}
                            label="WhatsApp o teléfono"
                            required
                            hint="Es el número al que llamamos para verificar."
                            error={errors.phone}
                          >
                            <Input
                              id={fieldId("phone")}
                              type="tel"
                              required
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="6000-0000"
                              value={form.phone}
                              onChange={(e) => set("phone", e.target.value)}
                              aria-invalid={errors.phone ? true : undefined}
                              aria-describedby={describedBy("phone", true)}
                            />
                          </Field>

                          <Field
                            id={fieldId("email")}
                            label="Correo electrónico"
                            required
                            error={errors.email}
                          >
                            <Input
                              id={fieldId("email")}
                              type="email"
                              required
                              inputMode="email"
                              autoComplete="email"
                              autoCapitalize="none"
                              spellCheck={false}
                              placeholder="empresa@correo.com"
                              value={form.email}
                              onChange={(e) => set("email", e.target.value)}
                              aria-invalid={errors.email ? true : undefined}
                              aria-describedby={describedBy("email")}
                            />
                          </Field>

                          {/* Provincias y comarcas separadas: es la división real
                              del país y es la misma cadena con la que se agrupará
                              el directorio el día que haya fichas. */}
                          <Field
                            id={fieldId("province")}
                            label="Zona de cobertura"
                            required
                            error={errors.province}
                          >
                            <select
                              id={fieldId("province")}
                              required
                              className={selectClass}
                              value={form.province}
                              onChange={(e) => set("province", e.target.value)}
                              aria-invalid={errors.province ? true : undefined}
                              aria-describedby={describedBy("province")}
                            >
                              <option value="">Elija provincia o comarca</option>
                              {COVERAGE_AREAS.map((group) => (
                                <optgroup key={group.label} label={group.label}>
                                  {group.options.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </Field>

                          <Field
                            id={fieldId("experience")}
                            label="Años montando cercas"
                            required
                            hint={MIN_YEARS_NOTE}
                            error={errors.experience}
                          >
                            <select
                              id={fieldId("experience")}
                              required
                              className={selectClass}
                              value={form.experience}
                              onChange={(e) => set("experience", e.target.value)}
                              aria-invalid={errors.experience ? true : undefined}
                              aria-describedby={describedBy("experience", true)}
                            >
                              <option value="">Elija un rango</option>
                              {EXPERIENCE_RANGES.map((range) => (
                                <option key={range} value={range}>
                                  {range}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      </fieldset>

                      {/* Qué monta. Casillas de verdad y no botones que fingen
                          serlo: el navegador ya sabe decir «casilla marcada». */}
                      <fieldset
                        className="min-w-0"
                        aria-describedby={
                          errors.specialties ? `${uid}-specialties-error` : undefined
                        }
                      >
                        <GroupLegend Icon={Wrench}>
                          Qué monta{" "}
                          <span className="font-normal text-muted-foreground">
                            (marque todo lo que aplique)
                          </span>
                        </GroupLegend>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {SPECIALTIES.map(({ value, label }) => (
                            <label
                              key={value}
                              htmlFor={`${uid}-specialty-${value}`}
                              className={choiceRowClass}
                            >
                              <input
                                id={`${uid}-specialty-${value}`}
                                type="checkbox"
                                className={choiceInputClass}
                                checked={form.specialties.includes(value)}
                                onChange={() => toggleSpecialty(value)}
                                aria-describedby={
                                  errors.specialties ? `${uid}-specialties-error` : undefined
                                }
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                        {errors.specialties && (
                          <p
                            id={`${uid}-specialties-error`}
                            role="alert"
                            className="mt-2 flex items-start gap-1.5 text-sm font-medium text-destructive"
                          >
                            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            {errors.specialties}
                          </p>
                        )}
                      </fieldset>

                      {/* Perfil: dos preguntas de sí o no. Cada una es su propio
                          grupo, porque «Sí» suelto no significa nada leído en
                          voz alta si no arrastra la pregunta. */}
                      <fieldset className="min-w-0">
                        <GroupLegend Icon={FileText}>Perfil profesional</GroupLegend>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {(
                            [
                              {
                                field: "hasRUC" as const,
                                legend: "¿Tiene RUC o aviso de operación?",
                              },
                              {
                                field: "hasTools" as const,
                                legend: "¿Tiene herramienta y equipo propios?",
                              },
                            ] satisfies { field: keyof FormData; legend: string }[]
                          ).map(({ field, legend }) => (
                            <fieldset
                              key={field}
                              className="min-w-0"
                              aria-describedby={
                                errors[field] ? `${fieldId(field)}-error` : undefined
                              }
                            >
                              <legend className="mb-1.5 font-heading text-sm font-semibold text-foreground">
                                {legend}
                                <span className="text-destructive" aria-hidden="true">
                                  {" *"}
                                </span>
                              </legend>
                              <div className="grid grid-cols-2 gap-2">
                                {YES_NO.map(({ value, label }) => (
                                  <label
                                    key={value}
                                    htmlFor={`${uid}-${field}-${value}`}
                                    className={choiceRowClass}
                                  >
                                    <input
                                      id={`${uid}-${field}-${value}`}
                                      type="radio"
                                      name={`${uid}-${field}`}
                                      value={value}
                                      required
                                      className={choiceInputClass}
                                      checked={form[field] === value}
                                      onChange={() => set(field, value)}
                                      /* El error va colgado de cada opción y no
                                         sólo del grupo: la descripción de un
                                         `<fieldset>` no la anuncian todos los
                                         lectores al entrar en el radio. */
                                      aria-describedby={
                                        errors[field] ? `${fieldId(field)}-error` : undefined
                                      }
                                    />
                                    {label}
                                  </label>
                                ))}
                              </div>
                              {errors[field] && (
                                <p
                                  id={`${fieldId(field)}-error`}
                                  role="alert"
                                  className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-destructive"
                                >
                                  <AlertCircle
                                    className="mt-0.5 size-4 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {errors[field]}
                                </p>
                              )}
                            </fieldset>
                          ))}
                        </div>
                      </fieldset>

                      {/* Referencias y comentarios */}
                      <fieldset className="min-w-0">
                        <GroupLegend Icon={Check}>Referencias y comentarios</GroupLegend>
                        <div className="space-y-4">
                          <Field
                            id={fieldId("references")}
                            label="Referencias de obra (opcional)"
                            hint="Nombre del cliente y un teléfono al que podamos llamar. Son las tres referencias que pide el programa."
                          >
                            <Input
                              id={fieldId("references")}
                              type="text"
                              placeholder="Cliente, obra y teléfono de contacto"
                              value={form.references}
                              onChange={(e) => set("references", e.target.value)}
                              aria-describedby={describedBy("references", true)}
                            />
                          </Field>

                          <Field
                            id={fieldId("message")}
                            label="Cuéntenos de su empresa (opcional)"
                          >
                            <Textarea
                              id={fieldId("message")}
                              rows={4}
                              placeholder="Obras montadas, gente en el equipo, corregimientos que cubre…"
                              value={form.message}
                              onChange={(e) => set("message", e.target.value)}
                            />
                          </Field>
                        </div>
                      </fieldset>

                      <div>
                        <Button type="submit" size="block">
                          Enviar solicitud por WhatsApp
                          <ArrowRight aria-hidden="true" />
                        </Button>
                        {/* Dice lo que de verdad hace el botón. El texto anterior
                            —«Al enviar aceptas que Intemperie guarde tu
                            información»— no explicaba que se abre otra
                            aplicación y que el envío lo da usted. */}
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                          {SUBMIT_NOTE}
                        </p>
                      </div>
                    </form>
                  </div>
                </div>

                {/* ── Barra lateral ──────────────────────────────────────────
                    Las dos listas salen de `content.ts`: son las mismas que
                    pinta la página del programa, así que ya no pueden decir
                    cosas distintas. */}
                <aside className="space-y-4">
                  <div className="rounded-xl border border-border bg-surface-sunk p-5">
                    <h2 className="font-heading text-sm font-bold text-foreground">
                      {FORM_INTRO.sidebarBenefits}
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {BENEFITS.map((benefit) => (
                        <li key={benefit.title} className="flex items-start gap-2.5">
                          <benefit.Icon
                            className="mt-0.5 size-4 shrink-0 text-brand-green"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{benefit.title}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{benefit.body}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-5">
                    <h2 className="font-heading text-sm font-bold text-foreground">
                      {FORM_INTRO.sidebarRequirements}
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {REQUIREMENTS.map((requirement) => (
                        <li key={requirement} className="flex items-start gap-2.5">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-brand-green"
                            aria-hidden="true"
                          />
                          <span className="text-sm text-muted-foreground">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-5">
                    <h2 className="font-heading text-sm font-bold text-foreground">
                      {FORM_INTRO.sidebarHelp}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {FORM_INTRO.sidebarHelpBody}
                    </p>
                    <div className="mt-4 space-y-2">
                      <a
                        href={whatsappHref(CLOSING.askMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 items-center gap-2 rounded-lg bg-whatsapp px-4 font-heading text-sm font-semibold text-on-dark transition-colors hover:bg-whatsapp-deep"
                      >
                        <IconWhatsApp />
                        {CLOSING.askCta}
                      </a>
                      <a
                        href={`${CONTACT.emailHref}?subject=${encodeURIComponent("Programa de instaladores")}`}
                        className="flex h-11 items-center gap-2 rounded-lg border border-border-strong px-4 font-heading text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
                      >
                        {CONTACT.email}
                      </a>
                    </div>
                  </div>

                  <Link
                    href="/instaladores"
                    className="flex min-h-11 items-center gap-2 rounded-lg font-heading text-sm font-semibold text-brand-green-deep transition-colors hover:text-brand-green dark:text-brand-green"
                  >
                    <ChevronRight className="size-4 rotate-180" aria-hidden="true" />
                    {FORM_INTRO.backToProgram}
                  </Link>
                </aside>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
