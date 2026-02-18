import { createClient } from "./client";
import type { Gender, PetPreference } from "@/questionnaire/types";

export interface ProfileInsert {
  name: string | null;
  age: number;
  gender: Gender;
  pet_preference: PetPreference | null;
  session_id: string;
  user_id?: string | null;
}

export async function saveProfile(data: ProfileInsert): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").insert(data);
  if (error) {
    console.error("[Supabase] Failed to save profile:", error.message);
  }
}
