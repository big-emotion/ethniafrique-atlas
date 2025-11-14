import { NextRequest } from "next/server";
import { getPendingContributions } from "@/lib/supabase/admin-queries";
import { jsonWithCors, corsOptionsResponse } from "@/lib/api/cors";
import { isAdminAuthenticated } from "@/lib/auth/admin";

/**
 * Route API pour lister les contributions en attente (admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return jsonWithCors({ error: "Unauthorized" }, { status: 401 });
    }

    const contributions = await getPendingContributions();
    return jsonWithCors(contributions);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return jsonWithCors(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return corsOptionsResponse();
}
