"use client";

import { Suspense } from "react";
import { RegioesPageContent } from "./RegioesPageContent";

export default function RegioesPage() {
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
      <RegioesPageContent />
    </Suspense>
  );
}
