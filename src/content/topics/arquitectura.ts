import type { Topic } from "../types";

export const arquitectura: Topic = {
  id: "arquitectura",
  title: "Arquitectura de Software",
  short: "Definición, 7 términos de arquitectura y el patrón MVC",
  icon: "🏛️",
  color: "indigo",
  source: "ARQUITECTURAS DE SOFTWARE.pdf",
  summary: [
    "La arquitectura de software es la **estructura** y la **relación entre las partes** de un software y sus **propiedades visibles externas**.",
    "Objetivo: dar **calidad** al sistema (desempeño, ahorro de tiempo, disponibilidad, usabilidad, capacidad de modificarse).",
    "Beneficios para la empresa: **reduce costos**, mejora la **toma de decisiones**, rutas de acción efectivas y proyección acertada.",
    "Ciclo de etapas: **requisitos → diseño → documentación → evaluación** del funcionamiento.",
    "7 términos: **Disponibilidad, Latencia, Topología/conectividad/geografía, Redundancia, Gobierno, Seguridad, Elasticidad**.",
    "MVC = **Modelo** (datos/backend) + **Vista** (interfaz/GUI) + **Controlador** (cerebro, enlace entre vista y modelo).",
    "MVC fue propuesto por **Trygve Reenskaug** para interfaces de aplicaciones de escritorio; hoy se usa en web.",
    "La razón de usar MVC: **separación de preocupaciones (SoC)** → escalable, mantenible y fácil de expandir.",
    "El modelo usa SQL o mejor un **ORM** (Doctrine) / **PDO** para abstraer la base de datos.",
    "La vista **no accede directo a los datos**: los pide (vía controlador) al modelo.",
    "El controlador **no manipula datos ni muestra salida**: solo enlaza modelos y vistas.",
    "Frameworks pioneros con conceptos MVC: **KnockoutJS, Django y Ruby on Rails**.",
  ],
  glossary: [
    { term: "Arquitectura de software", def: "Estructura y relación entre las partes de un software y sus propiedades visibles externas." },
    { term: "Atributo de calidad", def: "Propiedad que mide qué tan bien funciona el sistema: desempeño, disponibilidad, seguridad, usabilidad, modificabilidad…" },
    { term: "Disponibilidad", def: "Posibilidad de acceder a la base de datos / sistema; idealmente todo el tiempo." },
    { term: "Latencia", def: "Según el apunte: distancia entre los datos; la arquitectura debe apuntar a su unificación. En general: tiempo de espera de una respuesta." },
    { term: "Redundancia", def: "Duplicar servidores o componentes para que, si uno cae, otro tome su lugar." },
    { term: "Elasticidad", def: "Capacidad de gestionar desde poca cantidad de datos hasta un gran volumen." },
    { term: "Gobierno (de datos)", def: "Factor que administra la segmentación: reglas, responsables y políticas sobre los datos." },
    { term: "MVC", def: "Patrón Modelo–Vista–Controlador que separa datos, interfaz y lógica de control." },
    { term: "SoC", def: "Separation of Concerns: cada parte del código se ocupa de una sola responsabilidad." },
    { term: "ORM", def: "Object-Relational Mapping: trabaja la base de datos con clases y objetos en lugar de SQL directo (ej. Doctrine)." },
    { term: "PDO", def: "PHP Data Objects: capa de abstracción de acceso a bases de datos en PHP." },
  ],
  sections: [
    {
      id: "definicion",
      title: "¿Qué es la arquitectura de software?",
      goal: "Entender la definición, el objetivo y por qué una empresa invierte en arquitectura.",
      blocks: [
        {
          t: "p",
          text: "La **arquitectura de software** hace referencia a la **estructura** y la **relación entre las diferentes partes** de un software y sus **propiedades visibles externas**.",
        },
        {
          t: "callout",
          kind: "analogy",
          title: "Analogía: los planos de un edificio",
          text: "Antes de construir un edificio, el arquitecto decide dónde van columnas, escaleras, cañerías y salidas de emergencia. Si eso se decide mal, después es carísimo cambiarlo. En software pasa lo mismo: la arquitectura decide qué partes existen (base de datos, servidor, interfaz…) y cómo se comunican.",
        },
        {
          t: "p",
          text: "Una arquitectura de software está compuesta por **varias arquitecturas de datos articuladas entre sí**; por eso abarca tantos elementos y herramientas.",
        },
        { t: "h", text: "Objetivo principal" },
        {
          t: "p",
          text: "Ofrecer **calidad** al sistema de administración de datos a partir de su **desempeño**, **ahorro de tiempo**, **disponibilidad**, **usabilidad** y la **capacidad de modificarse** y adecuarse a nuevas necesidades (atributos de calidad).",
        },
        { t: "h", text: "Beneficios para una compañía" },
        {
          t: "list",
          items: [
            "**Reducción de costos** (menos retrabajo y fallas).",
            "**Mejor toma de decisiones** (información confiable y disponible).",
            "**Efectividad de rutas de acción** (procesos claros).",
            "**Proyección acertada** (el sistema puede crecer con la empresa).",
          ],
        },
        { t: "h", text: "Ciclo de etapas" },
        { t: "diagram", id: "arch-cycle", caption: "Toca cada etapa para ver qué se hace en ella." },
        {
          t: "check",
          q: {
            id: "arq-chk-1",
            type: "choice",
            prompt: "¿Cuál es el orden correcto del ciclo de etapas de una arquitectura de software?",
            options: [
              "Diseño → requisitos → evaluación → documentación",
              "Requisitos → diseño → documentación → evaluación",
              "Documentación → diseño → requisitos → evaluación",
              "Evaluación → requisitos → diseño → documentación",
            ],
            answer: 1,
            explanation: "Primero se levantan los requisitos, luego se diseña, se documenta y finalmente se evalúa su funcionamiento.",
          },
        },
      ],
    },
    {
      id: "siete-terminos",
      title: "Los 7 términos de arquitectura",
      goal: "Memorizar y reconocer en ejemplos los 7 términos.",
      blocks: [
        {
          t: "p",
          text: "El apunte define **7 términos** que un arquitecto debe dominar. Toca cada tarjeta para ver su definición, un ejemplo real y qué pasa si se descuida.",
        },
        { t: "diagram", id: "seven-terms" },
        {
          t: "table",
          head: ["Término", "Definición (apunte)", "Ejemplo real"],
          rows: [
            ["Disponibilidad", "Poder acceder a la base de datos; debería estar disponible todo el tiempo.", "La app del banco funciona 24/7, incluso a las 3 a. m."],
            ["Latencia", "Distancia que puede existir entre los datos; se debe apuntar a la unificación.", "Datos repartidos en 5 servidores lejanos hacen lenta cada consulta."],
            ["Topología / conectividad / geografía", "Relación unificada de los datos entre sí.", "Sucursales de La Paz y Santa Cruz conectadas a una misma base."],
            ["Redundancia", "Saber duplicar servidores: si uno se cae, hay otro.", "Servidor espejo que toma el control si el principal falla."],
            ["Gobierno", "Factor que administra la segmentación.", "Política: solo RR. HH. ve salarios; cada área ve su segmento."],
            ["Seguridad", "Proteger la información durante su desarrollo.", "Cifrado de contraseñas, control de accesos, copias de seguridad."],
            ["Elasticidad", "Gestionar desde poca cantidad de datos hasta un gran volumen.", "Tienda online que soporta el pico de Black Friday."],
          ],
        },
        {
          t: "callout",
          kind: "tip",
          title: "Truco para memorizar",
          text: "**Di**ana **La**va **To**das las **Re**des **Go**rdas **Se**gún **El**la → **Di**sponibilidad, **La**tencia, **To**pología, **Re**dundancia, **Go**bierno, **Se**guridad, **El**asticidad.",
        },
        {
          t: "callout",
          kind: "warn",
          title: "Ojo con dos confusiones típicas",
          text: "**Redundancia ≠ Elasticidad.** Redundancia = tener un repuesto por si algo falla. Elasticidad = crecer o reducirse según la carga. **Disponibilidad** es el resultado (el sistema responde); la redundancia es una técnica para lograrla.",
        },
        {
          t: "check",
          q: {
            id: "arq-chk-2",
            type: "choice",
            prompt: "Una tienda online pasa de 100 a 50.000 usuarios en Black Friday y el sistema sigue funcionando. ¿Qué término describe esto?",
            options: ["Redundancia", "Elasticidad", "Gobierno", "Latencia"],
            answer: 1,
            explanation: "Elasticidad: capacidad de gestionar desde poca cantidad de datos hasta un gran volumen.",
          },
        },
      ],
    },
    {
      id: "mvc",
      title: "Patrón MVC: Modelo – Vista – Controlador",
      goal: "Saber qué hace cada componente y cómo fluye una petición.",
      blocks: [
        {
          t: "p",
          text: "**MVC** significa **Modelo** (model), **Vista** (view) y **Controlador** (controller). Es un patrón de arquitectura que separa la aplicación en tres componentes:",
        },
        {
          t: "terms",
          items: [
            { term: "Modelo (datos)", def: "El **backend** que contiene toda la **lógica de datos**. Administra los datos, vengan de una base de datos, una API o un objeto JSON." },
            { term: "Vista (UI)", def: "El **frontend** o interfaz gráfica de usuario (**GUI**). Decide **qué verá el usuario** en su pantalla y **cómo**." },
            { term: "Controlador (cerebro)", def: "El **cerebro** de la aplicación: controla cómo se muestran los datos. **Extrae, modifica y proporciona datos** al usuario; es el **enlace entre la vista y el modelo**." },
          ],
        },
        { t: "diagram", id: "mvc", caption: "Presiona ▶ para ver el recorrido de una petición paso a paso." },
        {
          t: "callout",
          kind: "info",
          title: "Historia",
          text: "El concepto fue introducido por **Trygve Reenskaug** como una forma de desarrollar la **GUI de aplicaciones de escritorio** (Smalltalk, Xerox PARC, fines de los 70). Hoy se usa en **aplicaciones web modernas** porque las hace **escalables, mantenibles y fáciles de expandir**.",
        },
        {
          t: "callout",
          kind: "analogy",
          title: "Analogía: un restaurante",
          text: "**Vista** = el mozo/la carta que ve el cliente. **Controlador** = el jefe de sala que recibe el pedido y decide a quién pedirle qué. **Modelo** = la cocina y la despensa, donde están los ingredientes (datos) y las recetas (reglas). El cliente nunca entra a la cocina: la vista no toca los datos directamente.",
        },
        {
          t: "check",
          q: {
            id: "arq-chk-3",
            type: "match",
            prompt: "Relaciona cada componente con su responsabilidad.",
            pairs: [
              ["Modelo", "Administrar los datos (BD, API, JSON)"],
              ["Vista", "Decidir qué ve el usuario y cómo"],
              ["Controlador", "Enlazar vista y modelo; responder acciones"],
            ],
            explanation: "Modelo = datos, Vista = interfaz, Controlador = enlace/cerebro.",
          },
        },
      ],
    },
    {
      id: "soc",
      title: "¿Por qué usar MVC? Separación de preocupaciones",
      goal: "Explicar con tus palabras qué problema resuelve MVC.",
      blocks: [
        {
          t: "p",
          text: "Tres palabras: **separación de preocupaciones** (*separation of concerns*, **SoC**). MVC divide el código **frontend** y **backend** en componentes separados, así es mucho más fácil administrar y hacer cambios en un lado **sin que interfieran entre sí**.",
        },
        {
          t: "p",
          text: "Esto es clave cuando **varios desarrolladores** necesitan actualizar, modificar o depurar una aplicación **al mismo tiempo**.",
        },
        { t: "h", text: "Sin MVC vs con MVC" },
        {
          t: "code",
          lang: "php",
          text: `<!-- SIN MVC: todo mezclado en productos.php -->
<?php
$db = new mysqli("localhost", "root", "", "tienda");
$res = $db->query("SELECT * FROM productos WHERE stock > 0");
?>
<h1>Productos</h1>
<?php while ($p = $res->fetch_assoc()) { ?>
  <li><?= $p['nombre'] ?> - Bs <?= $p['precio'] ?></li>
<?php } ?>`,
        },
        {
          t: "code",
          lang: "php",
          text: `// CON MVC
// Modelo: ProductoModel.php  -> solo datos
class ProductoModel {
  public function disponibles() {
    return Producto::where('stock', '>', 0)->get(); // ORM
  }
}

// Controlador: ProductoController.php -> enlace
class ProductoController {
  public function index() {
    $productos = (new ProductoModel)->disponibles();
    return view('productos/lista', ['productos' => $productos]);
  }
}

// Vista: productos/lista.php -> solo presentación
<h1>Productos</h1>
<?php foreach ($productos as $p): ?>
  <li><?= $p->nombre ?> - Bs <?= $p->precio ?></li>
<?php endforeach; ?>`,
        },
        {
          t: "compare",
          left: {
            title: "Todo mezclado",
            items: [
              "Cambiar el diseño obliga a tocar SQL",
              "Dos personas editan el mismo archivo → conflictos",
              "Difícil de probar y reutilizar",
              "Cambiar de MySQL a PostgreSQL afecta todas las páginas",
            ],
          },
          right: {
            title: "Con MVC",
            items: [
              "El diseñador trabaja solo en las vistas",
              "Backend y frontend avanzan en paralelo",
              "El modelo se reutiliza en web, móvil o API",
              "Cambiar de base de datos solo afecta al modelo",
            ],
          },
        },
        {
          t: "check",
          q: {
            id: "arq-chk-4",
            type: "tf",
            prompt: "La principal razón para usar MVC es que el código se ejecuta más rápido.",
            answer: false,
            explanation: "La razón es la separación de preocupaciones (SoC): mantenibilidad, escalabilidad y trabajo en paralelo, no la velocidad.",
          },
        },
      ],
    },
    {
      id: "capas-detalle",
      title: "MVC en detalle: qué hace (y qué NO hace) cada capa",
      goal: "Distinguir responsabilidades para no mezclar capas.",
      blocks: [
        { t: "h", text: "Modelos" },
        {
          t: "p",
          text: "Es la capa donde se trabaja con los datos: contiene mecanismos para **acceder a la información** y **actualizar su estado**. Como los datos suelen estar en una base de datos, aquí están las funciones que hacen **SELECT, UPDATE, INSERT**, etc.",
        },
        {
          t: "p",
          text: "Lo habitual es usar librerías como **PDO** o un **ORM** como **Doctrine**, que permiten trabajar con **abstracción de bases de datos** y **persistencia en objetos**. En vez de sentencias SQL que dependen del motor, se usa un dialecto basado en **clases y objetos**.",
        },
        { t: "h", text: "Vistas" },
        {
          t: "p",
          text: "Contienen el código que **produce la visualización** de las interfaces: renderizan los estados de la aplicación en **HTML**. En las vistas solo hay HTML (y PHP de presentación) para mostrar la salida.",
        },
        {
          t: "callout",
          kind: "exam",
          title: "Pregunta clásica de examen",
          text: "La vista **trabaja con los datos pero NO accede directamente a ellos**: los requiere a los modelos y con ellos genera la salida.",
        },
        { t: "h", text: "Controladores" },
        {
          t: "p",
          text: "Contienen el código para **responder a las acciones** solicitadas: visualizar un elemento, realizar una compra, buscar información, etc. Es la capa que **sirve de enlace** entre vistas y modelos.",
        },
        {
          t: "callout",
          kind: "exam",
          title: "Lo que el controlador NO hace",
          text: "Su responsabilidad **no es manipular directamente datos ni mostrar ningún tipo de salida**, sino **servir de enlace** entre modelos y vistas.",
        },
        {
          t: "table",
          head: ["Capa", "SÍ hace", "NO hace"],
          rows: [
            ["Modelo", "SELECT/INSERT/UPDATE, reglas de datos, validar stock", "Generar HTML, leer clics del usuario"],
            ["Vista", "Mostrar HTML, formularios, botones, mensajes", "Consultar la base de datos"],
            ["Controlador", "Recibir la petición, llamar al modelo, elegir la vista", "Escribir SQL, imprimir HTML"],
          ],
        },
        {
          t: "check",
          q: {
            id: "arq-chk-5",
            type: "classify",
            prompt: "¿En qué capa va cada responsabilidad?",
            buckets: ["Modelo", "Vista", "Controlador"],
            items: [
              { text: "Ejecutar un INSERT de un nuevo cliente", bucket: 0 },
              { text: "Mostrar la tabla de productos en HTML", bucket: 1 },
              { text: "Recibir la acción 'comprar' y decidir qué hacer", bucket: 2 },
              { text: "Usar Doctrine para guardar un pedido", bucket: 0 },
              { text: "Dibujar el botón 'Pagar'", bucket: 1 },
              { text: "Pedir datos al modelo y enviarlos a la vista", bucket: 2 },
            ],
            explanation: "Acceso a datos → Modelo. Presentación → Vista. Coordinación de la acción → Controlador.",
          },
        },
      ],
    },
    {
      id: "frameworks",
      title: "Frameworks que trabajan con MVC",
      goal: "Reconocer frameworks MVC y su lenguaje.",
      blocks: [
        {
          t: "p",
          text: "JavaScript creció en popularidad y se apoderó también del backend; cada vez más aplicaciones adoptan MVC de una u otra manera. **Los frameworks van y vienen, pero los conceptos de MVC se mantienen.**",
        },
        {
          t: "p",
          text: "Algunos de los **primeros frameworks** que aplicaron estos conceptos fueron **KnockoutJS, Django y Ruby on Rails** (según el apunte).",
        },
        {
          t: "table",
          head: ["Framework", "Lenguaje", "Nota"],
          rows: [
            ["KnockoutJS", "JavaScript", "Pionero en el navegador (variante MVVM)"],
            ["Django", "Python", "Lo llama MTV: Model–Template–View"],
            ["Ruby on Rails", "Ruby", "MVC 'puro', muy influyente"],
            ["Laravel", "PHP", "Modelos con ORM Eloquent, vistas Blade"],
            ["Spring MVC", "Java", "Muy usado en empresas"],
            ["ASP.NET MVC", "C#", "Plataforma Microsoft"],
            ["Express (con estructura MVC)", "JavaScript / Node.js", "Carpetas models/, views/, controllers/"],
          ],
        },
        {
          t: "code",
          text: `mi-tienda/
├── models/        ← Producto.js, Cliente.js   (datos)
├── views/         ← productos.html, carrito.html (interfaz)
└── controllers/   ← productoController.js     (enlace)`,
        },
      ],
    },
    {
      id: "caso-tienda",
      title: "Caso completo: una tienda online con MVC",
      goal: "Seguir el flujo MVC en acciones reales.",
      blocks: [
        { t: "p", text: "Sigamos la acción **“Agregar al carrito”** en una tienda online:" },
        {
          t: "steps",
          items: [
            { title: "1. Usuario → Vista", text: "El usuario toca el botón **Agregar al carrito** en la página del producto (Vista)." },
            { title: "2. Vista → Controlador", text: "La vista envía la petición `POST /carrito` con el id del producto y la cantidad al **CarritoController**." },
            { title: "3. Controlador → Modelo", text: "El controlador pide al **ProductoModel** verificar el stock y al **CarritoModel** guardar el ítem." },
            { title: "4. Modelo ↔ Base de datos", text: "El modelo ejecuta las consultas (con ORM) y devuelve el resultado: stock OK, ítem guardado." },
            { title: "5. Controlador → Vista", text: "El controlador elige la vista **carrito** y le pasa los datos actualizados." },
            { title: "6. Vista → Usuario", text: "La vista muestra “Producto agregado ✔” y el total del carrito." },
          ],
        },
        {
          t: "table",
          head: ["Acción del usuario", "Modelo", "Vista", "Controlador"],
          rows: [
            ["Iniciar sesión", "Buscar usuario y verificar contraseña (hash)", "Formulario de login / mensaje de error", "Recibe credenciales, llama al modelo, redirige"],
            ["Buscar 'laptop'", "SELECT por nombre", "Lista de resultados", "Lee el texto buscado y pide resultados"],
            ["Pagar compra", "Registrar pedido y descontar stock", "Pantalla de confirmación", "Coordina pago, pedido y vista final"],
            ["Ver historial", "Consultar pedidos del cliente", "Tabla de pedidos", "Obtiene id del cliente y arma la respuesta"],
          ],
        },
        {
          t: "callout",
          kind: "example",
          title: "Mini caso: cambiar el diseño",
          text: "La empresa quiere una versión móvil con otro diseño. ¿Qué capa cambia? **Solo la Vista.** El modelo (datos) y el controlador (flujo) se reutilizan. Esto demuestra la ventaja de SoC.",
        },
      ],
    },
    {
      id: "ventajas",
      title: "Ventajas, desventajas y errores comunes",
      goal: "Evaluar críticamente MVC.",
      blocks: [
        {
          t: "compare",
          left: {
            title: "Ventajas",
            items: [
              "Separación de preocupaciones (SoC)",
              "Escalable, mantenible y fácil de expandir",
              "Trabajo en paralelo de varios desarrolladores",
              "Reutilización del modelo en varias vistas",
              "Más fácil de probar cada capa",
            ],
          },
          right: {
            title: "Desventajas",
            items: [
              "Más archivos y estructura para proyectos pequeños",
              "Curva de aprendizaje inicial",
              "Riesgo de 'controladores gordos' si se mezcla lógica",
              "Requiere disciplina del equipo",
            ],
          },
        },
        { t: "h", text: "Errores comunes" },
        {
          t: "list",
          items: [
            "Escribir **consultas SQL dentro de la vista**.",
            "Que el **controlador imprima HTML** directamente.",
            "Poner toda la lógica en el controlador (**fat controller**) en lugar del modelo.",
            "Que la **vista** llame directo a la base de datos “porque es más rápido”.",
          ],
        },
      ],
    },
    {
      id: "otros-estilos",
      title: "Para ampliar: otros estilos arquitectónicos",
      goal: "Ubicar MVC entre otras arquitecturas comunes.",
      blocks: [
        {
          t: "callout",
          kind: "info",
          text: "Esta sección amplía el apunte para que tengas contexto. Lo central para el examen es la definición, los 7 términos y MVC.",
        },
        {
          t: "table",
          head: ["Estilo", "Idea", "Ejemplo"],
          rows: [
            ["Monolito", "Toda la aplicación en un solo bloque desplegable", "Sistema académico en un único servidor"],
            ["En capas (n-tier)", "Presentación, negocio y datos en capas", "App web + API + base de datos"],
            ["Cliente–servidor", "Clientes piden, el servidor responde", "Navegador ↔ servidor web"],
            ["Microservicios", "Servicios pequeños e independientes", "Netflix: pagos, catálogo, recomendaciones"],
            ["Orientada a eventos", "Componentes reaccionan a eventos", "Notificación al confirmar un pago"],
          ],
        },
      ],
    },
  ],
  flashcards: [
    { id: "arq-f1", front: "¿Qué es la arquitectura de software?", back: "La estructura y la relación entre las diferentes partes de un software y sus propiedades visibles externas." },
    { id: "arq-f2", front: "Objetivo principal de la arquitectura de software", back: "Ofrecer calidad al sistema: desempeño, ahorro de tiempo, disponibilidad, usabilidad y capacidad de modificarse." },
    { id: "arq-f3", front: "Beneficios para una compañía", back: "Reducción de costos, mejor toma de decisiones, efectividad de rutas de acción y proyección acertada." },
    { id: "arq-f4", front: "Ciclo de etapas", back: "Requisitos → Diseño → Documentación → Evaluación de su funcionamiento." },
    { id: "arq-f5", front: "Los 7 términos de arquitectura", back: "Disponibilidad, Latencia, Topología/conectividad/geografía, Redundancia, Gobierno, Seguridad, Elasticidad." },
    { id: "arq-f6", front: "Disponibilidad", back: "Posibilidad de acceder a la base de datos; debería estar disponible todo el tiempo." },
    { id: "arq-f7", front: "Latencia (según el apunte)", back: "La distancia que puede existir entre los datos; la arquitectura debe apuntar a una unificación." },
    { id: "arq-f8", front: "Redundancia", back: "Saber duplicar los servidores: si uno se cae, debe haber otro." },
    { id: "arq-f9", front: "Gobierno", back: "Factor que administra la segmentación de los datos." },
    { id: "arq-f10", front: "Elasticidad", back: "Gestionar desde poca cantidad de datos hasta un gran volumen." },
    { id: "arq-f11", front: "¿Qué significa MVC?", back: "Modelo (datos/backend), Vista (interfaz/GUI) y Controlador (cerebro, enlace entre vista y modelo)." },
    { id: "arq-f12", front: "¿Quién introdujo MVC y para qué?", back: "Trygve Reenskaug, para desarrollar la GUI de aplicaciones de escritorio." },
    { id: "arq-f13", front: "¿Por qué usar MVC?", back: "Separación de preocupaciones (SoC): frontend y backend separados, fáciles de cambiar sin interferir." },
    { id: "arq-f14", front: "¿La vista accede directo a los datos?", back: "No. Los requiere a los modelos y con ellos genera la salida." },
    { id: "arq-f15", front: "¿Qué NO hace el controlador?", back: "No manipula directamente datos ni muestra salida; solo enlaza modelos y vistas." },
    { id: "arq-f16", front: "Primeros frameworks con conceptos MVC", back: "KnockoutJS, Django y Ruby on Rails." },
    { id: "arq-f17", front: "¿Qué es un ORM? Ejemplo", back: "Mapeo objeto-relacional: acceder a la BD con clases y objetos en lugar de SQL directo. Ej.: Doctrine." },
  ],
  questions: [
    {
      id: "arq-q1",
      type: "choice",
      prompt: "La arquitectura de software hace referencia a…",
      options: [
        "El lenguaje de programación elegido",
        "La estructura y relación entre las partes de un software y sus propiedades visibles externas",
        "El diseño gráfico de la interfaz",
        "El hardware donde se ejecuta el sistema",
      ],
      answer: 1,
      explanation: "Es la definición del apunte: estructura + relación entre partes + propiedades visibles externas.",
      level: 1,
    },
    {
      id: "arq-q2",
      type: "multi",
      prompt: "¿Cuáles son beneficios de implantar una buena arquitectura de software en una compañía? (elige todas)",
      options: ["Reducción de costos", "Mejora en la toma de decisiones", "Eliminar la necesidad de programadores", "Proyección acertada", "Efectividad de rutas de acción"],
      answers: [0, 1, 3, 4],
      explanation: "El apunte menciona reducción de costos, mejor toma de decisiones, efectividad de rutas de acción y proyección acertada.",
      level: 1,
    },
    {
      id: "arq-q3",
      type: "order",
      prompt: "Ordena el ciclo de etapas de una arquitectura de software.",
      items: ["Requisitos", "Diseño", "Documentación", "Evaluación de su funcionamiento"],
      explanation: "Requisitos → Diseño → Documentación → Evaluación.",
      level: 1,
    },
    {
      id: "arq-q4",
      type: "match",
      prompt: "Relaciona cada término con su definición.",
      pairs: [
        ["Disponibilidad", "Acceso a la base de datos todo el tiempo"],
        ["Redundancia", "Duplicar servidores por si uno se cae"],
        ["Elasticidad", "De poco a gran volumen de datos"],
        ["Gobierno", "Administra la segmentación"],
      ],
      explanation: "Son 4 de los 7 términos de arquitectura del apunte.",
      level: 1,
    },
    {
      id: "arq-q5",
      type: "choice",
      prompt: "Un banco duplica su servidor principal para que, si falla, otro tome el control inmediatamente. ¿Qué término aplica?",
      options: ["Elasticidad", "Latencia", "Redundancia", "Topología"],
      answer: 2,
      explanation: "Redundancia: duplicar servidores porque si uno se cae se necesita otro.",
      level: 1,
    },
    {
      id: "arq-q6",
      type: "choice",
      prompt: "Según el apunte, la latencia se refiere a…",
      options: [
        "La cantidad de usuarios simultáneos",
        "La distancia que puede existir entre los datos (se debe apuntar a unificarlos)",
        "La protección de la información",
        "El número de servidores duplicados",
      ],
      answer: 1,
      explanation: "El apunte define latencia como la distancia entre los datos; la arquitectura debe apuntar a la unificación.",
      level: 2,
    },
    {
      id: "arq-q7",
      type: "tf",
      prompt: "La seguridad, como término de arquitectura, indica que la arquitectura de datos debe proteger la información en su desarrollo.",
      answer: true,
      explanation: "Exactamente así lo define el apunte.",
      level: 1,
    },
    {
      id: "arq-q8",
      type: "classify",
      prompt: "Clasifica cada situación según el término de arquitectura.",
      buckets: ["Disponibilidad", "Redundancia", "Elasticidad", "Seguridad"],
      items: [
        { text: "El sistema responde a cualquier hora del día", bucket: 0 },
        { text: "Hay un servidor de respaldo listo", bucket: 1 },
        { text: "Soporta 10 veces más pedidos en temporada alta", bucket: 2 },
        { text: "Las contraseñas se guardan cifradas", bucket: 3 },
      ],
      explanation: "Cada situación ilustra uno de los términos.",
      level: 2,
    },
    {
      id: "arq-q9",
      type: "choice",
      prompt: "En MVC, ¿qué componente es el backend que contiene toda la lógica de datos?",
      options: ["Vista", "Modelo", "Controlador", "Router"],
      answer: 1,
      explanation: "El Modelo administra los datos (BD, API, JSON).",
      level: 1,
    },
    {
      id: "arq-q10",
      type: "choice",
      prompt: "¿Qué componente de MVC es descrito como 'el cerebro de la aplicación'?",
      options: ["Modelo", "Vista", "Controlador", "Base de datos"],
      answer: 2,
      explanation: "El controlador es el cerebro: controla cómo se muestran los datos y enlaza vista y modelo.",
      level: 1,
    },
    {
      id: "arq-q11",
      type: "input",
      prompt: "¿Quién introdujo por primera vez el concepto de MVC? (apellido)",
      answers: ["reenskaug", "trygve reenskaug"],
      placeholder: "Apellido…",
      explanation: "Trygve Reenskaug lo propuso para desarrollar GUIs de aplicaciones de escritorio.",
      level: 2,
    },
    {
      id: "arq-q12",
      type: "choice",
      prompt: "¿Cuál es la razón principal (en tres palabras) para usar MVC?",
      options: ["Velocidad de ejecución", "Separación de preocupaciones", "Menos líneas de código", "Diseño más bonito"],
      answer: 1,
      explanation: "Separation of Concerns (SoC).",
      level: 1,
    },
    {
      id: "arq-q13",
      type: "tf",
      prompt: "En MVC, la vista accede directamente a la base de datos para mostrar la información.",
      answer: false,
      explanation: "La vista no accede directamente a los datos: los requiere a los modelos.",
      level: 1,
    },
    {
      id: "arq-q14",
      type: "tf",
      prompt: "La responsabilidad del controlador es manipular directamente los datos y mostrar la salida.",
      answer: false,
      explanation: "Su responsabilidad NO es manipular datos ni mostrar salida, sino servir de enlace entre modelos y vistas.",
      level: 2,
    },
    {
      id: "arq-q15",
      type: "choice",
      prompt: "¿Qué herramienta permite trabajar la base de datos con clases y objetos en lugar de SQL dependiente del motor?",
      options: ["Un ORM como Doctrine", "Un framework CSS", "Un servidor DNS", "Un compilador"],
      answer: 0,
      explanation: "Los ORM (Doctrine) y PDO abstraen la base de datos.",
      level: 2,
    },
    {
      id: "arq-q16",
      type: "multi",
      prompt: "¿Cuáles fueron, según el apunte, de los primeros frameworks en aplicar conceptos MVC?",
      options: ["KnockoutJS", "Django", "Ruby on Rails", "Photoshop", "Excel"],
      answers: [0, 1, 2],
      explanation: "KnockoutJS, Django y Ruby on Rails.",
      level: 1,
    },
    {
      id: "arq-q17",
      type: "classify",
      prompt: "¿Dónde va este código en MVC?",
      buckets: ["Modelo", "Vista", "Controlador"],
      items: [
        { text: "SELECT * FROM pedidos WHERE cliente_id = 5", bucket: 0 },
        { text: "<button>Comprar</button>", bucket: 1 },
        { text: "function comprar() { pedir al modelo; elegir vista }", bucket: 2 },
        { text: "Producto::where('stock', '>', 0)", bucket: 0 },
        { text: "<table> con la lista de clientes", bucket: 1 },
      ],
      explanation: "Consultas → Modelo; HTML → Vista; coordinación → Controlador.",
      level: 2,
    },
    {
      id: "arq-q18",
      type: "order",
      prompt: "Ordena el flujo de una petición en MVC cuando el usuario presiona 'Buscar'.",
      items: [
        "El usuario interactúa con la Vista",
        "La Vista envía la acción al Controlador",
        "El Controlador pide los datos al Modelo",
        "El Modelo consulta la base de datos y devuelve resultados",
        "El Controlador entrega los datos a la Vista",
        "La Vista muestra los resultados al usuario",
      ],
      explanation: "Usuario → Vista → Controlador → Modelo → Controlador → Vista → Usuario.",
      level: 2,
    },
    {
      id: "arq-q19",
      type: "choice",
      context: "Una empresa decide migrar de MySQL a PostgreSQL. Su aplicación sigue MVC y usa un ORM.",
      prompt: "¿Qué capa debería verse afectada principalmente?",
      options: ["La Vista", "El Modelo", "El Controlador", "Todas por igual"],
      answer: 1,
      explanation: "El acceso a datos vive en el Modelo; con un ORM el cambio es aún menor.",
      level: 3,
    },
    {
      id: "arq-q20",
      type: "choice",
      prompt: "Hoy MVC se usa en aplicaciones web modernas porque permite que la aplicación sea…",
      options: ["Escalable, mantenible y fácil de expandir", "Gratuita", "Imposible de hackear", "Más pequeña en MB"],
      answer: 0,
      explanation: "Es lo que indica el apunte.",
      level: 1,
    },
    {
      id: "arq-q21",
      type: "tf",
      prompt: "Una arquitectura de software está compuesta por varias arquitecturas de datos articuladas entre sí.",
      answer: true,
      explanation: "Por eso abarca tantos elementos y herramientas.",
      level: 2,
    },
    {
      id: "arq-q22",
      type: "choice",
      prompt: "¿Qué término se relaciona con la 'relación unificada de los datos entre sí' en distintas ubicaciones?",
      options: ["Topología / conectividad / geografía", "Elasticidad", "Seguridad", "Redundancia"],
      answer: 0,
      explanation: "Topología/conectividad/geografía: relación unificada de los datos entre sí.",
      level: 2,
    },
  ],
  cases: [
    {
      id: "arq-c1",
      title: "Black Friday en la tienda online",
      scenario:
        "La tienda 'CompraYa' recibe normalmente 300 visitas por hora. En Black Friday llegan 40.000 y el sistema colapsa. El gerente pide que el sistema pueda crecer cuando hay mucha demanda y reducirse después para no pagar de más.",
      hints: ["No se trata de un servidor que falló", "Se trata de manejar distintos volúmenes"],
      question: {
        id: "arq-c1-q",
        type: "choice",
        prompt: "¿Qué término de arquitectura deben mejorar?",
        options: ["Redundancia", "Elasticidad", "Gobierno", "Latencia"],
        answer: 1,
        explanation: "Elasticidad: gestionar desde poca cantidad de datos hasta un gran volumen.",
      },
      reasoning: [
        "El problema no es una falla de hardware, sino un pico de carga.",
        "Necesitan adaptarse de poco a mucho volumen y volver a poco.",
        "Eso es exactamente la definición de elasticidad.",
      ],
    },
    {
      id: "arq-c2",
      title: "El servidor del banco se quemó",
      scenario:
        "A las 2 a. m. el servidor principal del 'Banco Cóndor' sufre una falla de disco. Gracias a un segundo servidor idéntico que estaba sincronizado, los clientes nunca notaron el problema.",
      question: {
        id: "arq-c2-q",
        type: "multi",
        prompt: "¿Qué términos de arquitectura se evidencian? (elige dos)",
        options: ["Redundancia", "Disponibilidad", "Elasticidad", "Gobierno"],
        answers: [0, 1],
        explanation: "La redundancia (servidor duplicado) permitió mantener la disponibilidad (acceso todo el tiempo).",
      },
      reasoning: [
        "Había un servidor duplicado → redundancia.",
        "El sistema siguió accesible para los clientes → disponibilidad.",
        "La redundancia es el medio; la disponibilidad es el resultado.",
      ],
    },
    {
      id: "arq-c3",
      title: "Tres programadores, un solo archivo",
      scenario:
        "En una startup, tres programadores editan el mismo archivo `ventas.php`, que contiene HTML, consultas SQL y la lógica de botones. Cada cambio rompe algo y hay conflictos constantes.",
      question: {
        id: "arq-c3-q",
        type: "choice",
        prompt: "¿Qué solución arquitectónica resolvería mejor el problema?",
        options: [
          "Contratar más programadores",
          "Aplicar MVC para separar datos, interfaz y control",
          "Comprar un servidor más rápido",
          "Eliminar la base de datos",
        ],
        answer: 1,
        explanation: "MVC aplica separación de preocupaciones: cada quien trabaja en su capa sin interferir.",
      },
      reasoning: [
        "El problema es que todo está mezclado (no hay SoC).",
        "MVC divide en Modelo (SQL), Vista (HTML) y Controlador (acciones).",
        "Así cada desarrollador puede trabajar en paralelo en su parte.",
      ],
    },
    {
      id: "arq-c4",
      title: "Nueva app móvil con el mismo backend",
      scenario:
        "La universidad tiene un sistema web MVC para consultar notas. Ahora quiere una app móvil con un diseño totalmente diferente, pero con los mismos datos y reglas.",
      question: {
        id: "arq-c4-q",
        type: "choice",
        prompt: "¿Qué parte del sistema hay que construir de nuevo principalmente?",
        options: ["El Modelo", "La Vista", "La base de datos", "Todo el sistema"],
        answer: 1,
        explanation: "Los datos (Modelo) y el flujo (Controlador) se reutilizan; cambia la presentación (Vista).",
      },
      reasoning: [
        "Los datos y las reglas no cambian → el Modelo se reutiliza.",
        "Lo que cambia es cómo se muestra la información → Vista.",
        "Esta reutilización es una de las grandes ventajas de MVC.",
      ],
    },
    {
      id: "arq-c5",
      title: "¿Quién puede ver los salarios?",
      scenario:
        "En una empresa, el área de ventas pudo ver por error la planilla de sueldos de todos los empleados. La gerencia decide definir qué área accede a qué segmento de los datos y quién es responsable de cada uno.",
      question: {
        id: "arq-c5-q",
        type: "choice",
        prompt: "¿Qué término de arquitectura trata de administrar esa segmentación?",
        options: ["Gobierno", "Latencia", "Elasticidad", "Topología"],
        answer: 0,
        explanation: "Gobierno: factor que administra la segmentación (con apoyo de la seguridad).",
      },
      reasoning: [
        "Se trata de reglas sobre quién accede a qué parte (segmento) de los datos.",
        "Eso es gobierno de datos; la seguridad implementa los controles técnicos.",
      ],
    },
    {
      id: "arq-c6",
      title: "El error en la vista",
      scenario:
        "Revisando el código de un proyecto MVC encuentras esto dentro de `perfil.html`: una conexión a la base de datos y un `SELECT * FROM usuarios`.",
      question: {
        id: "arq-c6-q",
        type: "choice",
        prompt: "¿Cuál es el problema y cómo se corrige?",
        options: [
          "Ninguno, es correcto",
          "La vista accede directo a los datos; la consulta debe ir al Modelo y el Controlador pasar los datos a la vista",
          "El SELECT debe ir en el CSS",
          "Hay que mover el HTML al modelo",
        ],
        answer: 1,
        explanation: "La vista no debe acceder a los datos directamente. El Modelo consulta, el Controlador entrega a la Vista.",
      },
      reasoning: [
        "Regla del apunte: la vista no realiza acceso directo a los datos.",
        "Mover el SELECT a un UsuarioModel.",
        "El controlador llama al modelo y pasa el resultado a la vista.",
      ],
    },
    {
      id: "arq-c7",
      title: "Sucursales lejanas, consultas lentas",
      scenario:
        "Una cadena de farmacias tiene los datos de inventario repartidos en servidores de cinco ciudades distintas, sin conexión unificada. Cada consulta de stock tarda mucho y a veces los datos no coinciden.",
      question: {
        id: "arq-c7-q",
        type: "multi",
        prompt: "¿Qué términos de arquitectura están involucrados? (elige dos)",
        options: ["Latencia", "Topología / conectividad / geografía", "Elasticidad", "Redundancia"],
        answers: [0, 1],
        explanation: "La distancia entre datos (latencia) y la falta de relación unificada entre ellos (topología/geografía).",
      },
      reasoning: [
        "Datos distantes y dispersos → latencia (el apunte pide apuntar a la unificación).",
        "Las sedes no tienen una relación unificada de datos → topología/conectividad/geografía.",
      ],
    },
  ],
  labs: [
    { id: "mvc-flow", title: "Simulador MVC", description: "Elige una acción (login, compra, búsqueda) y mira paso a paso cómo viaja entre Vista, Controlador y Modelo." },
    { id: "mvc-sorter", title: "¿Dónde va este código?", description: "Juego rápido: clasifica responsabilidades y fragmentos de código en Modelo, Vista o Controlador." },
    { id: "terms-sorter", title: "Detective de los 7 términos", description: "Lee situaciones reales y descubre qué término de arquitectura aplica." },
  ],
};
