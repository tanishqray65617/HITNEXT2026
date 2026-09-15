import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

function getSha256Hash(text) {
    return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

// ─── Q2 (Easy) ── Number-to-letter cipher ── Answer: VENOM ───
const q2Text = `Story
Miles Morales is scanning his dad's old police radio frequencies late at night when he picks up a coded dispatch. The officers on the channel aren't using names — just numbers. The dispatcher's voice crackles through the static:

"All units, be advised. Suspect classification for the Midtown incident is confirmed:
22 – 5 – 14 – 15 – 13.
Repeat: 22 – 5 – 14 – 15 – 13. Requesting immediate containment. Over."

Miles reaches for a pen.

Task
The NYPD dispatch code is a simple letter-number substitution:
A = 1, B = 2, C = 3 … Z = 26.

Convert each number in the dispatch to its corresponding letter and assemble them in order.

The vault accepts the five-letter suspect classification.`;

// ─── Q6 (Medium) ── TVA Breach Report ── Answer: DOWNBAD ───
const q6Text = `Story
A breach in the Time Variance Authority's records has exposed a classified status code. The rogue agent left behind seven encrypted fragments — each one pointing to a single word. But the code isn't the word itself. It's buried inside it.

"He was Iron. Then he was Doom. The line between hero and villain was never a wall — it was a door. And he walked through it."

Task
THE SEVEN FRAGMENTS
Each fragment below describes something from across the multiverse. Identify the word, then extract the single letter at the position indicated.

Fragment 1 — Take the 4th letter:
"The arachnid who swings between Manhattan's skyscrapers."

Fragment 2 — Take the 2nd letter:
"The sovereign ruler of Latveria, cloaked in iron and sorcery."

Fragment 3 — Take the 4th letter:
"Miles Morales' uncle walked this dark path before him."

Fragment 4 — Take the 5th letter:
"The colour of Norman Osborn's airborne alter ego."

Fragment 5 — Take the 3rd letter:
"What Spider-Man spins between buildings to trap his enemies."

Fragment 6 — Take the 3rd letter:
"The surname of the man who once carried the arc reactor in his chest."

Fragment 7 — Take the 6th letter:
"The covert agency whose emblem is an eagle — protectors from the shadows."

THE EXTRACTION
Arrange the seven extracted letters in fragment order. The resulting word is the classified status code assigned to the fallen hero.

The vault accepts this seven-letter code as one word.`;

// ─── Q9 (Hard) ── Vigenère Cipher ── Answer: SINISTER ───
const q9Text = `Story
Spider-Man intercepts an encrypted transmission from Kingpin's private network. Unlike the simple substitution codes used by street-level criminals, Kingpin employs a Vigenère cipher — a polyalphabetic system where each letter is shifted by a different amount based on a repeating keyword.

Two pieces of evidence were recovered from the scene:

EVIDENCE A — The intercepted ciphertext:
O M O E W U A V

EVIDENCE B — A torn note found in Kingpin's wastebasket, with one word circled:
WEB

Task
The Vigenère cipher works as follows:
• The keyword "WEB" repeats to cover the length of the ciphertext:
  W – E – B – W – E – B – W – E

• Each ciphertext letter was created by shifting the original letter forward by the keyword letter's value (A = 0, B = 1, C = 2, … Z = 25).

• To decrypt, reverse the process: subtract the keyword letter's value from the ciphertext letter. If the result is negative, add 26.

Worked example:
  Cipher letter: O (position 14)
  Key letter:    W (value 22)
  14 − 22 = −8 → add 26 → 18 → S

Decrypt all eight letters to reveal the word that describes what Kingpin is building.

The vault accepts the eight-letter word.`;

async function updateQuestions() {
    let success = 0;

    // ── Update Q2 ──
    const q2Hash = getSha256Hash('venom');
    console.log(`Q2 answer hash (venom): ${q2Hash}`);

    const { data: q2Data } = await supabase.from('questions').select('options').eq('question_number', 2).single();
    const q2Options = { bg_image: q2Data?.options?.bg_image || '/normalimages/2.jpg' };

    const { error: q2Err } = await supabase.from('questions').update({
        question_text: q2Text,
        answer_hash: q2Hash,
        options: q2Options
    }).eq('question_number', 2);

    if (q2Err) {
        console.error('❌ Q2 update failed:', q2Err.message);
    } else {
        console.log('✅ Q2 updated successfully (Easy — VENOM)');
        success++;
    }

    // ── Update Q6 ──
    const q6Hash = getSha256Hash('downbad');
    console.log(`Q6 answer hash (downbad): ${q6Hash}`);

    const { data: q6Data } = await supabase.from('questions').select('options').eq('question_number', 6).single();
    const q6Options = { bg_image: q6Data?.options?.bg_image || '/normalimages/6.jpg' };

    const { error: q6Err } = await supabase.from('questions').update({
        question_text: q6Text,
        answer_hash: q6Hash,
        options: q6Options
    }).eq('question_number', 6);

    if (q6Err) {
        console.error('❌ Q6 update failed:', q6Err.message);
    } else {
        console.log('✅ Q6 updated successfully (Medium — DOWNBAD)');
        success++;
    }

    // ── Update Q9 ──
    const q9Hash = getSha256Hash('sinister');
    console.log(`Q9 answer hash (sinister): ${q9Hash}`);

    const { data: q9Data } = await supabase.from('questions').select('options').eq('question_number', 9).single();
    const q9Options = { bg_image: q9Data?.options?.bg_image || '/normalimages/9.jpg' };

    const { error: q9Err } = await supabase.from('questions').update({
        question_text: q9Text,
        answer_hash: q9Hash,
        options: q9Options
    }).eq('question_number', 9);

    if (q9Err) {
        console.error('❌ Q9 update failed:', q9Err.message);
    } else {
        console.log('✅ Q9 updated successfully (Hard — SINISTER)');
        success++;
    }

    console.log(`\n── Done: ${success}/3 questions updated ──`);
}

updateQuestions();
