import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteWorkout, getWorkout } from "@/lib/db/repos/workout";
import { getHistoryByWorkoutId } from "@/lib/db/repos/history";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDurationSeconds(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${minutes}:${pad(secs)}`;
}

const formatDate = (date: Date) => date.toLocaleString("es-ES");

export default async function WorkoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  const workout = await getWorkout(id);

  if (!workout) {
    notFound();
  }

  // Get history entry for this workout to get accurate duration
  const historyEntry = await getHistoryByWorkoutId(id);
  const durationSeconds = historyEntry?.durationSeconds ?? 0;

  // Only count sets that were actually performed (reps > 0)
  const completedSets = workout.sets.filter(set => (set.reps ?? 0) > 0);
  const totalCompletedSets = completedSets.length;
  const isActive = !historyEntry;

  const handleDelete = async () => {
    "use server";
    await deleteWorkout(id);
    redirect("/history");
  };

  return (
    <div className="flex-1 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/history">
              <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {isActive && (
                  <Badge variant="outline" className="bg-white text-black border-white">
                    Activo
                  </Badge>
                )}
                <span className="text-sm text-neutral-400">{formatDate(workout.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Card className="flex-1 bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-neutral-400">Duración</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-white">{formatDurationSeconds(durationSeconds)}</p>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-neutral-400">Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-white">{totalCompletedSets}</p>
                <p className="text-xs text-neutral-400">completados</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-3">
          {(() => {
            // Filter exercises that have at least one completed set
            const exercisesWithSets = workout.exercises
              .map(exercise => ({
                exercise,
                sets: completedSets.filter(set => set.workoutExerciseId === exercise.id)
              }))
              .filter(({ sets }) => sets.length > 0);

            if (exercisesWithSets.length === 0) {
              return (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="p-4 text-center text-neutral-400">
                    No hay ejercicios realizados en este entrenamiento.
                  </CardContent>
                </Card>
              );
            }

            return exercisesWithSets.map(({ exercise, sets: exerciseSets }) => (
              <Card key={exercise.id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{exercise.exercise.name}</p>
                    <span className="text-sm text-neutral-400">{exerciseSets.length} sets</span>
                  </div>
                  <div className="space-y-1">
                    {exerciseSets.map((set, idx) => (
                      <div key={set.id} className="flex items-center gap-2 text-sm text-neutral-300">
                        <span className="text-neutral-500 w-6">{idx + 1}.</span>
                        <span>{set.reps} reps</span>
                        {set.weight && parseFloat(set.weight) > 0 && (
                          <span className="text-neutral-400">@ {set.weight} kg</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ));
          })()}
        </div>

        <div className="flex gap-3">
          <Link href={`/workout/active?id=${workout.id}`} className="flex-1">
            <Button className="w-full">Continuar</Button>
          </Link>
          <form action={handleDelete} className="flex-1">
            <Button variant="secondary" type="submit" className="w-full">
              Eliminar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
