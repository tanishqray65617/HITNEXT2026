import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

function getSha256Hash(text) {
    return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

const questionText = `Story
After the bridge incident, City Hall didn't call a press conference. It is called a filing cabinet.
The D.O.D.C. doesn't chase criminals. It chases anyone operating without a badge, a licence, or a permission slip — and Spider-Man has none of the three.
Two different departments filled out two different forms about the same decision, the same week. Neither form survived the archive intact.
One got rained on in transit. The other got redacted before it ever left the building. Nobody thought to keep a clean copy of either.

Task
The nine-letter classification survives only in fragments, split across the two damaged exhibits pinned to the board. Exhibit A (the water-damaged intake form) preserves only the 1st, 2nd, 5th, 7th, and 9th letters of the word — the rest washed out. Exhibit B (the redacted DODC memo) preserves only the 3rd, 4th, 6th, and 8th letters — exactly the ones Exhibit A lost. Reconstruct the full nine-letter word letter-by-letter from both exhibits together, and confirm it matches the definition stapled to the case file: ‘The legal status given to Spider-Man by the police and the Department of Damage Control (D.O.D.C.) to treat him as a rogue criminal rather than a hero.’ The vault accepts the full nine-letter word.`;

async function updateQ5() {
    const rawAnswer = "vigilante";
    const answerHash = getSha256Hash(rawAnswer);

    const { data: q5Data } = await supabase.from('questions').select('*').eq('question_number', 5).single();
    let options = q5Data.options || {};
    
    // Add the image URL
    options.image_url = "/q5.png";

    const { error } = await supabase.from('questions').update({
        question_text: questionText,
        answer_hash: answerHash,
        options: options
    }).eq('question_number', 5);

    if (error) {
        console.error(error);
    } else {
        console.log("Q5 updated with new text, image, and hashed answer successfully!");
    }
}
updateQ5();
