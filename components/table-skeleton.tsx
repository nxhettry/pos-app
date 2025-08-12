import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TableCardSkeleton() {
  return (
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TablesSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
        </div>
      </div>

      {/* Status Summary Skeleton */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Tables Grid Skeleton */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <TableCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3">
        <div className="flex justify-center">
          <Skeleton className="h-10 w-full max-w-xs rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function TableGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TableCardSkeleton key={i} />
      ))}
    </div>
  );
}
