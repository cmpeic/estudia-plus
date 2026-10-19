# Estudia+ 📚

App web **interactiva para estudiar desde el celular**, hecha con Next.js. Convierte los apuntes de la materia en lecciones cortas, diagramas que se pueden tocar, laboratorios, tarjetas de memoria, casos prácticos y simulacros de examen.

## Temas

| Tema | Qué incluye |
|---|---|
| 🌐 **Direcciones IP** (nuevo) | IPv4/IPv6, públicas y privadas, CIDR, subnetting, NAT/CGNAT, DNS/DHCP/ARP, comandos de diagnóstico en Windows |
| 🏛️ **Arquitectura de Software** | Definición, los 7 términos de arquitectura, patrón MVC |
| ⚙️ **Ingeniería de Software** | Entorno de funcionamiento y entornos Dev → QA → Staging → Producción |
| 📐 **UML** | Requerimientos funcionales y no funcionales, diagrama de casos de uso, include/extend/generalización |
| 🧭 **Usabilidad** | ISO 9241-11, métodos de evaluación y escala SUS |
| 🎣 **Quishing** | Phishing con códigos QR: cómo funciona, cómo protegerse y cómo detectarlo |

## Formas de estudiar

- **Aprender**: lecciones por secciones, con analogías, tablas, ejemplos y mini-preguntas para comprobar lo entendido.
- **Diagramas interactivos** (25): flujo MVC paso a paso, viaje de un paquete por la red, tabla NAT, DHCP, diagramas de casos de uso, escala SUS…
- **Laboratorios** (23): calculadora de subredes, retos de subnetting infinitos, conversor binario, terminal de diagnóstico de Windows, simulador NAT, inspector de QR, simulador de pedidos, constructor de casos de uso, calculadora SUS y juegos de clasificación.
- **Tarjetas** con repetición espaciada.
- **Práctica**: 7 tipos de pregunta (opción única, múltiple, V/F, emparejar, ordenar, clasificar, respuesta escrita), con explicación en cada una.
- **Casos prácticos**: situaciones reales con razonamiento paso a paso.
- **Simulacro**: examen mezclado con cronómetro y nota sobre 100.
- **Repaso**: preguntas falladas, tarjetas del día y pregunta relámpago.
- **Glosario** con buscador.

El progreso se guarda en el propio dispositivo (sin cuentas) y la app funciona **sin conexión** después de abrirla una vez. Se puede instalar en la pantalla de inicio del celular.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

## Compilar

```bash
npm run build
```

Genera un sitio 100 % estático en `out/`, que se puede publicar en Vercel, Netlify, GitHub Pages o cualquier hosting estático.

## Estructura

```
src/
├── app/              Páginas (inicio, tema/[id], examen, repaso, glosario, ajustes)
├── content/          Contenido de estudio (un archivo .ts por tema)
│   └── topics/
├── components/
│   ├── quiz/         Motor de preguntas
│   ├── diagrams/     Diagramas interactivos
│   └── labs/         Laboratorios y juegos
└── lib/              Progreso (localStorage), cálculo de IPs, utilidades
```

### Agregar un tema nuevo

1. Crea `src/content/topics/mi-tema.ts` siguiendo el tipo `Topic` de `src/content/types.ts` (secciones, tarjetas, preguntas, casos, resumen y glosario).
2. Agrégalo a la lista `TOPICS` en `src/content/index.ts`.

Las páginas del tema, sus preguntas en el simulacro y sus términos en el glosario se generan solos.
