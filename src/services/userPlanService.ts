import { supabase } from "@/lib/supabase";

import type { UserPlan } from "@/types/userPlan";

type ProfilePlanRow = {
  plan: string | null;
};

const isUserPlan = (value: unknown): value is UserPlan => {
  return value === "free" || value === "plus";
};

export async function loadUserPlan(
  userId: string
): Promise<UserPlan> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = data as ProfilePlanRow | null;

  return isUserPlan(row?.plan)
    ? row.plan
    : "free";
}