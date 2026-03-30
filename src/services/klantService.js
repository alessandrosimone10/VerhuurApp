import { supabase } from "../lib/supabase"

export async function getKlanten() {
  return await supabase
    .from("klant")
    .select("*")
    .order("created_at", { ascending: false })
}

export async function addKlant(klant) {
  return await supabase
    .from("klant")
    .insert([klant])
}