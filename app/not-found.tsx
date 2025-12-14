import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-foreground sm:text-6xl">404</h1>
      <p className="mt-4 text-lg text-slate-600">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  );
}
