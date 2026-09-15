import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

const questionText = `Story
For six consecutive nights, an anonymous source slipped a sealed envelope beneath the door of the Daily Bugle.
Each envelope contained only one cryptic statement.
No names.
No photographs.
No aliases.
No descriptions obvious enough to print alongside a police sketch.
J. Jonah Jameson eventually published all six statements beneath a single headline:
“Six criminals. Six clues. One word. If you need Spider-Man to solve it, you have already failed.”
The statements were deliberately printed out of sequence.
At the bottom of the page, Jameson added one final instruction:
“Do not begin by asking who they are. Begin by asking what they have in common.”

Task
THE SIX TIP-OFFS
1.
“The accident gave me more hands than the man I was before ever needed.
What I reached for became what now reaches for me.”
2.
“They called me a beast because a stone broke against me.
My greatest weapon was never something I carried.”
3.
“I studied life until life answered by rewriting me.
When the transformation was complete, even my reflection belonged to another species.”
4.
“I wanted the tools of a legend before I understood the price of becoming one.
Now the darkness is not something I enter. It is what people see first.”
5.
“The first strike was an accident.
Every strike after that was a decision.
Lightning does not remember the hand that created it.”
6.
“Bars once separated me from the world.
Then the world learned that bars are useful only against things that remain solid.”

THE SECOND LOCK
Once you identify the six criminals, do not use their aliases.
Take the first letter of each criminal's real name, keeping the numerical order of the clues.
You will obtain six letters.
They are not in their final order.
Jameson's final note reads:
“A prison, a laboratory, a rooftop, a battlefield, a machine and a storm all tell the same story.
Rearrange what you found until the six letters describe the enemy every one of them has spent a lifetime chasing.”

What single word must be entered into the vault?`;

async function updateQ1() {
    const { data: q1Data } = await supabase.from('questions').select('*').eq('question_number', 1).single();
    let options = q1Data.options || {};
    
    // Add the image URL
    options.image_url = "/q1.png";

    const { error } = await supabase.from('questions').update({
        question_text: questionText,
        options: options
    }).eq('question_number', 1);

    if (error) {
        console.error(error);
    } else {
        console.log("Q1 updated with new text and image successfully!");
    }
}
updateQ1();
