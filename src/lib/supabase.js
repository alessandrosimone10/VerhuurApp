import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://haubzanebwqbrcmqqjrw.supabase.co"
const supabaseKey = "sb_publishable_GVRQCQHOm7UBacIJGFc9KA_dV3uMKYa"

export const supabase = createClient(supabaseUrl, supabaseKey)