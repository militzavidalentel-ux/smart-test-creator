# Smart Test Creator

Crea una app educativa para docentes totalmente funcional llamada "Generador de Pruebas y Rúbricas". La app debe permitir gestionar contenidos educativos, generar pruebas automáticamente a partir de esos contenidos y crear una rúbrica de evaluación para cada pregunta.

La app debe tener una pantalla principal tipo dashboard y las siguientes secciones: "Inicio", "Mis Cursos", "Contenidos", "Generar Prueba", "Mis Pruebas" y "Rúbricas".

En "Mis Cursos", el docente debe poder crear y administrar cursos, indicando: nombre del curso, nivel, asignatura, año y descripción. Cada curso debe permitir organizar los contenidos en Unidades y Temas.

En "Contenidos", el docente debe poder subir archivos PDF, Word e imágenes, además de agregar enlaces externos. Cada contenido debe poder asociarse a un curso, unidad y tema. Mostrar nombre del archivo o recurso, tipo, fecha de carga y opciones para visualizar, editar o eliminar.

La sección "Generar Prueba" debe funcionar como un asistente paso a paso. Primero el docente selecciona el curso, unidad, tema y contenidos que utilizará como fuente. Luego debe configurar la prueba indicando: nombre de la prueba, tipos de preguntas y cantidad de preguntas. Los tipos disponibles deben ser Verdadero/Falso, Alternativas y Desarrollo, permitiendo combinar distintos tipos dentro de una misma prueba. El docente debe poder definir el puntaje de cada pregunta o utilizar un mismo puntaje para todas. Mostrar siempre el puntaje total de la prueba, calculado automáticamente.

Incluir un botón "Generar Prueba con IA". La IA debe utilizar los contenidos seleccionados como fuente para generar preguntas relacionadas directamente con el material, evitando preguntas repetidas o ambiguas y adaptando la dificultad al nivel del curso.

Para preguntas de alternativas, generar alternativas y determinar la respuesta correcta. Para Verdadero/Falso, generar la afirmación y respuesta correcta. Para preguntas de desarrollo, generar además una respuesta esperada y criterios de evaluación.

Después de generar la prueba, mostrar una pantalla de revisión y edición. El docente debe poder editar cualquier pregunta, alternativas, respuesta correcta y puntaje; cambiar el orden de las preguntas; eliminar preguntas; agregar nuevas preguntas y regenerar individualmente una pregunta mediante IA. La prueba nunca debe considerarse definitiva hasta que el docente la revise.

Cada pregunta debe generar automáticamente una rúbrica específica para esa pregunta, utilizando exactamente cuatro niveles:

No logrado — Logrado parcialmente — Logrado en gran parte — Totalmente logrado.

Cada nivel debe incluir una descripción clara del desempeño esperado y el puntaje correspondiente. El puntaje máximo de los cuatro niveles debe coincidir con el puntaje asignado a la pregunta. Por ejemplo, si una pregunta vale 10 puntos, los niveles podrían ser 0, 3, 7 y 10 puntos. El docente debe poder modificar manualmente los criterios y puntajes.

Crear una sección "Evaluar Prueba" donde el docente pueda corregir cada pregunta utilizando la rúbrica. Para cada pregunta mostrar los cuatro niveles como opciones seleccionables. Al seleccionar un nivel, asignar automáticamente el puntaje correspondiente. Calcular en tiempo real el puntaje obtenido, puntaje máximo y porcentaje de logro de la prueba.

Mostrar un resumen final con el resultado por pregunta, nivel de logro seleccionado, puntaje obtenido, puntaje máximo, porcentaje de logro y un campo para observaciones del docente.

Permitir guardar, duplicar, editar y eliminar pruebas. Una prueba guardada debe mantener sus preguntas, respuestas, puntajes y rúbricas.

Incluir botones para "Exportar Prueba" y "Exportar Prueba + Rúbrica". La prueba exportada debe tener un formato profesional listo para imprimir, con nombre del establecimiento, asignatura, curso, unidad, fecha, nombre del estudiante, instrucciones, preguntas y espacio para respuestas. La rúbrica debe poder exportarse como documento separado o junto con la prueba.

Diseño: interfaz moderna, profesional, limpia y educativa, con navegación lateral, tarjetas, tablas y asistentes paso a paso. Utilizar un diseño responsivo para computador, tablet y móvil. La generación debe sentirse como un flujo simple:

1. Seleccionar contenidos → 2. Configurar prueba → 3. Generar con IA → 4. Revisar y editar → 5. Generar rúbrica → 6. Aplicar y evaluar → 7. Obtener resultados.

En el dashboard mostrar tarjetas con: cantidad de cursos, contenidos, pruebas creadas y pruebas pendientes de revisión. Mostrar también las últimas pruebas creadas y accesos rápidos a "Crear Curso", "Cargar Contenido" y "Generar Prueba".

La aplicación debe ser totalmente funcional, guardar la información de manera persistente y quedar preparada para conectar un proveedor de IA mediante API para el análisis de los contenidos y generación de preguntas y rúbricas.

Prioriza la facilidad de uso: un docente debe poder cargar un contenido, seleccionar la cantidad y tipo de preguntas y obtener rápidamente una prueba completa + respuestas + rúbricas + sistema de evaluación.

Conéctala, Despliégala y proporciona la URL pública.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a294fd4e-b225-455e-a451-463e922fa073).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
