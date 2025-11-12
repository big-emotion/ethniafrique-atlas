"use client";

import { Suspense } from "react";
import { EthnicitiesPageContent } from "./EthnicitiesPageContent";

export default function EthnicitiesPage() {
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
      <EthnicitiesPageContent />
    </Suspense>
  );
}
