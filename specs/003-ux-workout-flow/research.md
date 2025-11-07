# Research: UX Workout Flow Enhancements

## Decisions

### Dialogs (shadcn/ui) vs prompts nativos
**Decision**: Usar componentes Dialog de shadcn/ui con inputs controlados.
**Rationale**: Mejor UX, control de estilos (dark theme), validaciones.
**Alternatives**: prompts nativos → pobre UX, sin control visual.

### Biblioteca de ejercicios
**Decision**: Endpoint `GET /api/exercise-library` que lee `data/exercise-library-seed.json`.
**Rationale**: Fuente única de verdad local, fácil de mantener, rápido.
**Alternatives**: Cargar todo desde cliente → duplicación y mayor bundle.

### Nombre auto-generado de sesión
**Decision**: Generar "Entrenamiento YYYY-MM-DD HH:mm" con zona horaria local.
**Rationale**: Inicio sin fricción, ordenamiento por tiempo.
**Alternatives**: Forzar nombre manual → más pasos, peor UX.

### Rendimiento de lista
**Decision**: Filtrar en memoria y limitar render a 50 resultados, búsqueda case-insensitive.
**Rationale**: Biblioteca 100–500 ítems → suficiente y rápido.
**Alternatives**: Indexado/librerías externas → innecesario ahora.
