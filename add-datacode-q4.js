import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateQ4() {
    const { data: q4Data } = await supabase.from('questions').select('*').eq('question_number', 4).single();
    let options = q4Data.options || {};
    
    // Ensure all 4 files are downloadable
    options.downloads = [
        { name: "codeformat.html", url: "/codeformat.html" },
        { name: "decoration.css", url: "/decoration.css" },
        { name: "working.js", url: "/working.js" },
        { name: "datacode.txt", url: "/datacode.txt" }
    ];

    const { error } = await supabase.from('questions').update({
        options: options
    }).eq('question_number', 4);

    if (error) {
        console.error(error);
    } else {
        console.log("Q4 updated with all downloads successfully!");
    }
}
updateQ4();
