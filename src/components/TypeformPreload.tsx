"use client";

import { useEffect } from "react";

export function TypeformPreload() {
  useEffect(() => {
    // Check if links already exist to avoid duplicates
    const existingPreconnect = document.querySelector(
      'link[rel="preconnect"][href="https://embed.typeform.com"]'
    );
    const existingDnsPrefetch = document.querySelector(
      'link[rel="dns-prefetch"][href="https://embed.typeform.com"]'
    );

    // Add preconnect link if it doesn't exist
    if (!existingPreconnect) {
      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = "https://embed.typeform.com";
      document.head.appendChild(preconnect);
    }

    // Add dns-prefetch link if it doesn't exist
    if (!existingDnsPrefetch) {
      const dnsPrefetch = document.createElement("link");
      dnsPrefetch.rel = "dns-prefetch";
      dnsPrefetch.href = "https://embed.typeform.com";
      document.head.appendChild(dnsPrefetch);
    }
  }, []);

  return null;
}
