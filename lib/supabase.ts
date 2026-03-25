import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uqomdtridssuipbjdfnz.supabase.co";
const supabaseKey = "sb_publishable_ix8Y7ALiBC6m5fNPZrimFQ_4X4AG-PA";

export const supabase = createClient(supabaseUrl, supabaseKey);