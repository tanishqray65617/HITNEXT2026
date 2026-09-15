import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

function getSha256Hash(text) {
    return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

const questionText = `🕷️ OSCORP TERMINAL — ENCRYPTED TRANSMISSION

Spider-Man intercepts a scrambled transmission from OsCorp.

A message flashes on the terminal:
“New key. New primes. Nothing recycled.”

🔐 Public Key
n = 6319
e = 13

📡 Intercepted Data
1951 | 5024 | 1873 | 1662 | 5951 | 3377 | 1111 | 4572

Each block represents one letter.

Use:
A = 01, B = 02, ... Z = 26

YOUR MISSION
The public key isn't enough. Find the two prime numbers that multiply to n, then:

1. Calculate phi of n using:
(p − 1) × (q − 1)

2. Find the private key number (d).
It is the number which, when multiplied by e, leaves a remainder of 1 when divided by phi of n.

3. Decrypt each ciphertext number.
For every number c, calculate:

c raised to the power d, divided by n, and take the remainder.

The resulting number will be between 1 and 26.

4. Convert those numbers into letters using A = 1, B = 2, ..., Z = 26.

🕸️ The vault requires an 8-letter word.

What word did Spider-Man recover?`;

async function updateQ8() {
    const rawAnswer = "websling";
    const answerHash = getSha256Hash(rawAnswer);

    const { data: q8Data } = await supabase.from('questions').select('*').eq('question_number', 8).single();
    let options = q8Data.options || {};
    
    // Add the image URL
    options.image_url = "/q8.png";

    const { error } = await supabase.from('questions').update({
        question_text: questionText,
        answer_hash: answerHash,
        options: options
    }).eq('question_number', 8);

    if (error) {
        console.error(error);
    } else {
        console.log("Q8 updated with new text, image, and hashed answer successfully!");
    }
}
updateQ8();
