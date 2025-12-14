import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteWorkout, getWorkout } from "@/lib/db/repos/workout";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDuration(start: Date, end?: Date) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const duration = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const formatDate = (date: Date) => date.toLocaleString("es-ES");

export default async function WorkoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  const workout = await getWorkout(id);

  if (!workout) {
    notFound();
  }

  const totalSets = workout.sets.length;
  const completedSets = workout.sets.filter(set => (set.reps ?? 0) > 0).length;
  const isActive = workout.updatedAt.getTime() === workout.createdAt.getTime();

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
                <p className="text-xl font-semibold text-white">{formatDuration(workout.createdAt, workout.updatedAt)}</p>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-neutral-900 border-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-neutral-400">Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-white">{completedSets}/{totalSets}</p>
                <p className="text-xs text-neutral-400">completados</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-3">
          {workout.exercises.length === 0 ? (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4 text-center text-neutral-400">No exercises added yet.</CardContent>
            </Card>
          ) : (
            workout.exercises.map(exercise => (
              <Card key={exercise.id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{exercise.exercise.name}</p>
                    <span className="text-sm text-neutral-400">Orden {exercise.orderIndex}</span>
                  </div>
                  <p className="text-sm text-neutral-400">Objetivo: {exercise.targetReps ?? '-'} reps</p>
                </CardContent>
              </Card>
            ))
          )}
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
