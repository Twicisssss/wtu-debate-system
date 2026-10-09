import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlammjpllkjclozwjcsl.supabase.co';
const supabaseAnonKey = 'sb_publishable_P95mhPA8VTl9p_6B8UKpXQ_89WbCWCC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
