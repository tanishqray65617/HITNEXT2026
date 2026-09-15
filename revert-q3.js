import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function revertQ3() {
    const { data: q3Data } = await supabase.from('questions').select('*').eq('question_number', 3).single();
    let options = q3Data.options || {};
    delete options.downloads; // Remove the downloads we just added by mistake

    const { error } = await supabase.from('questions').update({
        options: options
    }).eq('question_number', 3);

    if (error) {
        console.error(error);
    } else {
        console.log("Q3 reverted successfully!");
    }
}
revertQ3();
