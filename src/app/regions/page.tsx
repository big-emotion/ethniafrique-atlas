"use client";

import { Suspense } from "react";
import { RegionsPageContent } from "./RegionsPageContent";

export default function RegionsPage() {
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
      <RegionsPageContent />
    </Suspense>
  );
}
