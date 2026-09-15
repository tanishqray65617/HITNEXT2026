import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

const questionText = `Story
The medic in the Alchemax lab wouldn't write it on the chart. She just drew a small lightning-bolt symbol next to his vitals and moved on.
A veteran of the Spider Society described it differently: “Your cells start arguing with the zip code you're standing in. Eventually the zip code wins.”
A younger one described only what he saw, not what it meant: “His hand went see-through for a second, then it came back the wrong colour, like a bad signal on an old TV.”
None of them used the same words. All three were describing the same thing happening to the same boy.

Task
All three accounts above describe one specific, named affliction that recurs across the Spider-Verse: the painful cellular decay that happens when a person's physical atomic structure does not match the dimension they are currently standing in, manifesting as a colourful, neon jitter across the body. The vault accepts the single word used for this condition.`;

async function updateQ3() {
    const { data: q3Data } = await supabase.from('questions').select('*').eq('question_number', 3).single();
    let options = q3Data.options || {};
    
    // Add the image URL
    options.image_url = "/q3.png";

    const { error } = await supabase.from('questions').update({
        question_text: questionText,
        options: options
    }).eq('question_number', 3);

    if (error) {
        console.error(error);
    } else {
        console.log("Q3 updated with new text and image successfully!");
    }
}
updateQ3();
