import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateQ10() {
    const { data: q10Data } = await supabase.from('questions').select('*').eq('question_number', 10).single();
    let text = "Assemble the jigsaw puzzle completely to unlock the next level!";
    
    let options = q10Data.options || {};
    options.iframe_url = "/Jigsaw/index.html";

    const { error } = await supabase.from('questions').update({
        question_text: text,
        options: options,
        answer_hash: "jigsaw_solved"
    }).eq('question_number', 10);

    if (error) {
        console.error(error);
    } else {
        console.log("Q10 updated successfully!");
    }
}
updateQ10();
