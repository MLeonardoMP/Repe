# Data Model Notes: UX Workout Flow Enhancements

No se introducen cambios estructurales en el esquema actual. Se documentan convenciones:

- WorkoutSession.name: si el usuario no provee, se genera automáticamente con el formato `Entrenamiento YYYY-MM-DD HH:mm`.
- Orden por tiempo: las vistas priorizan `startTime` y `updatedAt` para ordenar.
- Biblioteca de ejercicios: fuente de lectura en `data/exercise-library-seed.json` con campos `{ id, name, category, equipment? }`.
