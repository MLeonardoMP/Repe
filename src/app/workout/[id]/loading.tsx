import { Card, CardContent } from '@/components/ui/card';

export default function WorkoutDetailLoading() {
  return (
    <div className="flex-1 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-neutral-800 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-20 flex-1 rounded bg-neutral-800 animate-pulse" />
            <div className="h-20 flex-1 rounded bg-neutral-800 animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(key => (
            <Card key={key} className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4 space-y-2">
                <div className="h-4 w-1/2 rounded bg-neutral-800 animate-pulse" />
                <div className="h-4 w-1/3 rounded bg-neutral-800 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}