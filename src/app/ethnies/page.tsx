"use client";

import { Suspense } from "react";
import { EthniesPageContent } from "./EthniesPageContent";

export default function EthniesPage() {
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
      <EthniesPageContent />
    </Suspense>
  );
}
