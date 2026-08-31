"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

/* Fotografía que entra sin parpadeo — sistema «Perímetro».
 *
 * Qué resuelve
 * ------------
 * Una foto grande que llega tarde aparece de golpe: el recuadro pasa de tono
 * plano a imagen en un fotograma. No es un salto de maquetación —el hueco ya
 * está reservado— pero sí un chasquido visual. Medio segundo de opacidad lo
 * convierte en algo que parece pensado.
 *
 * Por qué es un componente de cliente, y por qué SÓLO uno
 * ------------------------------------------------------
 * No hay forma de saber en CSS cuándo ha llegado una imagen: el `<img>` existe
 * en el árbol desde el primer fotograma, así que cualquier animación declarada
 * sobre él se consume antes de que la foto exista. Hace falta el `load` del
 * elemento, y eso es JavaScript en el navegador.
 *
 * Por eso este componente existe una sola vez y se usa con cuentagotas. NO se
 * usa en la parrilla del catálogo ni en las fichas de portada: `ProductTile` y
 * `ProductGrid` son HTML de servidor puro, y cambiar treinta fichas por
 * treinta islas para regalar un fundido es exactamente el coste que este
 * proyecto lleva dos PR quitándose de encima (#16, #23). Allí el marcador es
 * el recuadro `bg-surface-2`, que no cuesta un byte. Aquí, en las fotografías
 * editoriales —grandes, bajo el pliegue, perezosas y de descarga lenta—, el
 * fundido se nota y la ficha ya no se repite treinta veces.
 *
 * Tampoco se usa en las imágenes candidatas a LCP (el hero de portada, la
 * primera ficha de la parrilla, la foto principal de la galería): animar la
 * opacidad del elemento más grande de la pantalla retrasa la métrica justo lo
 * que dure la animación. Ésas entran directas.
 *
 * Por qué el HTML del servidor sale VISIBLE
 * -----------------------------------------
 * La regla de este trabajo es que nada esconda contenido que el servidor ya
 * entregó. Si el estado inicial fuese `opacity-0`, una hidratación que no llega
 * —red cortada, error de JS, un navegador viejo— dejaría la foto invisible
 * para siempre: la misma clase de fallo que el overlay que se enterró en
 * 02c7218, en pequeño. Así que el primer render, el del servidor, no lleva
 * ninguna clase de opacidad.
 *
 * El fundido se arma después, ya en el navegador, y sólo si la foto NO había
 * llegado todavía (`complete`): si venía de caché no hay nada que desvanecer y
 * se deja quieta. Como estas fotos son `loading="lazy"` y están bajo el
 * pliegue, cuando el efecto se ejecuta el navegador ni ha empezado a pedirlas,
 * de modo que poner la opacidad a cero no borra nada de la pantalla.
 *
 * Con `prefers-reduced-motion` la transición queda neutralizada desde
 * `globals.css`: la foto aparece de golpe, que es lo correcto ahí. No se
 * duplica la media query.
 */

type FadeInImageProps = React.ComponentProps<typeof Image>

/** Sin armar → el fundido no se ha activado (es lo que sale del servidor). */
type Fase = "sin-armar" | "esperando" | "dentro"

export function FadeInImage({ className = "", alt, ...props }: FadeInImageProps) {
  const [fase, setFase] = useState<Fase>("sin-armar")
  const img = useRef<HTMLImageElement>(null)

  useEffect(() => {
    /* Ya estaba pintada (caché, o llegó entre el commit y este efecto): no se
       arma nada. Ocultarla ahora para desvanecerla sería un parpadeo hacia
       atrás, que es peor que no tener efecto. */
    const el = img.current
    if (el?.complete && el.naturalWidth > 0) return
    setFase("esperando")
  }, [])

  return (
    <Image
      {...props}
      alt={alt}
      ref={img}
      /* Sólo cuenta si el fundido llegó a armarse; si no, se ignora y la foto
         se queda como estaba, visible. */
      onLoad={(e) => {
        setFase((previa) => (previa === "esperando" ? "dentro" : previa))
        props.onLoad?.(e)
      }}
      className={
        fase === "sin-armar"
          ? className
          : `${className} transition-opacity duration-500 ease-out ${
              fase === "esperando" ? "opacity-0" : "opacity-100"
            }`
      }
    />
  )
}
