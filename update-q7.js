import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateQ7() {
    const { data: q7Data } = await supabase.from('questions').select('*').eq('question_number', 7).single();
    let text = q7Data.question_text;
    text = text.replace("Scan the QR code and download `tanishqswordocean`.", "Download `ocean_of_words_filled` below.");
    
    const options = {
        bg_image: q7Data.options.bg_image,
        downloads: [
            {
                name: "ocean_of_words_filled.csv",
                url: "/ocean_of_words_filled.csv"
            }
        ]
    };

    const { error } = await supabase.from('questions').update({
        question_text: text,
        options: options
    }).eq('question_number', 7);

    if (error) {
        console.error(error);
    } else {
        console.log("Q7 updated successfully!");
    }
}
updateQ7();
