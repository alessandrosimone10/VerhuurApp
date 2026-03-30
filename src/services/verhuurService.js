import { supabase } from "../lib/supabase"

export async function getVerhuur() {
  return await supabase
    .from("verhuur")
    .select("*")
}