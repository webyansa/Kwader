import { ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthAccessSkeletonProps {
  message?: string;
}

const AuthAccessSkeleton = ({ message = "جارٍ التحقق من صلاحيات الوصول..." }: AuthAccessSkeletonProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default AuthAccessSkeleton;
