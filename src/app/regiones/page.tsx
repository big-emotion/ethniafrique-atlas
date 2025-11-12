"use client";

import { Suspense } from "react";
import { RegionesPageContent } from "./RegionesPageContent";

export default function RegionesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen gradient-earth flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <RegionesPageContent />
    </Suspense>
  );
}
