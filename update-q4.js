import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateQ4() {
    const { data: q4Data } = await supabase.from('questions').select('*').eq('question_number', 4).single();
    let text = q4Data.question_text;
    text = text.replace(/datacode\.docx/g, "datacode.txt");
    
    // update downloads
    let options = q4Data.options || {};
    if (options.downloads) {
        options.downloads = options.downloads.map(d => {
            if (d.name === "datacode.docx") {
                return { name: "datacode.txt", url: "/datacode.txt" };
            }
            return d;
        });
    } else {
        options.downloads = [
            {
                name: "datacode.txt",
                url: "/datacode.txt"
            }
        ];
    }

    const { error } = await supabase.from('questions').update({
        question_text: text,
        options: options
    }).eq('question_number', 4);

    if (error) {
        console.error(error);
    } else {
        console.log("Q4 updated successfully!");
    }
}
updateQ4();
