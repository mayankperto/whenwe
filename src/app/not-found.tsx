import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="glass rounded-2xl p-12 text-center max-w-sm w-full">
        <p className="text-6xl mb-6">🌫️</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button variant="gradient">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
