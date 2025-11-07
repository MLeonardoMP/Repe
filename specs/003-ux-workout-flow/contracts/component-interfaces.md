# Component Contracts

## ExercisePickerDialog
```typescript
interface ExercisePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
}
```

## QuickSetDialog
```typescript
interface QuickSetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reps: number, weight?: number) => void;
}
```
