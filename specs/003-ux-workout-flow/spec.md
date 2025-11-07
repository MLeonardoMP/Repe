# Feature Spec: UX Workout Flow Enhancements

## Summary
Mejorar el flujo de creación y gestión de entrenamientos para hacerlo más rápido y sin fricción:
- Crear entrenamiento sin pedir nombre (auto-generado: "Entrenamiento YYYY-MM-DD HH:mm").
- Botón de iniciar entrenamiento visible arriba en la vista principal.
- Selector de ejercicios con lista pre-cargada (biblioteca) + búsqueda, sin necesidad de escribir nombre si existe.
- Diálogo (shadcn) para añadir ejercicio y sets; sustituir prompts nativos.
- Permitir nombre personalizado solo si ejercicio no está en la lista.

## User Stories
1. Como usuario quiero iniciar rápidamente un entrenamiento sin escribir un nombre para no perder tiempo.
2. Como usuario quiero ver el botón de iniciar entrenamiento inmediatamente al abrir la app para reducir pasos.
3. Como usuario quiero seleccionar ejercicios desde una lista predefinida para evitar re-escribir nombres.
4. Como usuario quiero poder buscar ejercicios existentes por nombre para encontrarlos rápido.
5. Como usuario quiero agregar un ejercicio personalizado solo si no aparece en la lista.
6. Como usuario quiero registrar un set rápidamente (reps/peso) en un diálogo optimizado.

## Functional Requirements
- Generar nombre automático con formato `Entrenamiento YYYY-MM-DD HH:mm` si el usuario no provee uno.
- Movimiento del botón de inicio al header del dashboard o página inicial.
- Nuevo endpoint `/api/exercise-library` que entregue lista JSON de ejercicios disponibles (id, name, category, equipment).
- Dialog `ExercisePickerDialog` con: búsqueda, scroll, selección, opción custom.
- Dialog `QuickSetDialog` para reps/peso con validaciones mínimas.
- Reemplazar cualquier uso de `prompt()` por componentes dialog shadcn.

## Non-Functional Requirements
- Mantener principio de Minimalismo: no introducir librerías nuevas pesadas.
- Rendimiento: cargar máximo ~50 ejercicios filtrados; búsqueda en memoria.
- Accesibilidad: contrastos en dark theme, foco en elementos interactivos.
- Evitar bloqueos: carga asíncrona de biblioteca, estado `loading`.

## Success Criteria
- Iniciar entrenamiento sin interacción de texto (< 2 clics).
- Seleccionar ejercicio existente en ≤ 5 segundos promedio.
- Diálogo de set permite guardar set válido en ≤ 3 interacciones.
- Sin prompts nativos restantes.

## Constraints
- Seguir estructura NextJS + app router actual.
- Datos persisten en JSON; biblioteca inicial puede residir en un archivo `data/exercise-library-seed.json`.
- Sin dependencia de base de datos externa.

## Acceptance Criteria
- Crear entrenamiento genera nombre auto y se guarda.
- Endpoint `/api/exercise-library` devuelve lista (HTTP 200) y manejo de error (HTTP 500).
- Dialog de selección lista y permite búsqueda parcial por `name` (case-insensitive).
- Si el usuario introduce un custom name duplicado, se normaliza o se advierte (mensaje de error en UI).
- Todos los sets creados desde `QuickSetDialog` aparecen en el componente `ExerciseCard` inmediatamente.

## Open Questions
- ¿Se requiere ordenar biblioteca por frecuencia de uso? (Futuro)
- ¿Se almacenarán los ejercicios custom agregados por el usuario en la misma biblioteca? (Versión siguiente)

## Out of Scope
- Estadísticas avanzadas de ejercicios.
- Sincronización multi-usuario.
- Versionado de la biblioteca de ejercicios.
