import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jskpwjbffldjsnawjcsp.supabase.co';
const supabaseKey = 'sb_publishable_7BHFB14bhgBYQIxmzc7B8g_72c9aWrX';

export const supabase = createClient(supabaseUrl, supabaseKey);
