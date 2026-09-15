import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

function getSha256Hash(text) {
    return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

async function updateQ3Answer() {
    const rawAnswer = "glitching";
    const answerHash = getSha256Hash(rawAnswer);

    const { error } = await supabase.from('questions').update({
        answer_hash: answerHash
    }).eq('question_number', 3);

    if (error) {
        console.error(error);
    } else {
        console.log("Q3 answer hash updated successfully!");
    }
}
updateQ3Answer();
