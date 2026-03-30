import { supabase } from "../lib/supabase"

export async function getRackets() {
  return await supabase
    .from("racket")
    .select("*")
}