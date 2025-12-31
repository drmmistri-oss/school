
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkjcqmevguleimgbwcni.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdramNxbWV2Z3VsZWltZ2J3Y25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMDMwOTcsImV4cCI6MjA4Mjc3OTA5N30.j8ofkLvPTslP0zF1UzURUmBcxJRBbPk0Znvb7npEod0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
