import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

function getSha256Hash(text) {
    return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

const questionText = `Story
The final morning edition of The New York Globe has just hit the stands, bearing a shocking front-page investigation:

"OSCORP LAB BREACHED: ARCHITECT DEAD, MAINFRAME LOCKED
A 12-letter failsafe blocks the NYPD. Did the Spider-Menace silence the city's top builder, or is the crime scene a puzzle waiting to be solved?"

Dr. Elias Vance, Oscorp's chief system architect, was found lifeless in his lab. Before dying, he left a breadcrumb trail scattered across the crime scene:
1. His hand points directly at a vintage schematic of a high-performance combustion engine.
2. Webbed to the precinct ceiling was his old identification card from his early career designing trauma-center tech for the hospital's E.R.
3. Etched faintly into the titanium floorboards with a high-heat laser pen was a solitary letter: 'S'.
4. Across the locked terminal, a 24-hour countdown timer over a rising sun marks the midnight deadline on September 15th, honoring the very essence of his profession.

Task
Examine the broadsheet and assemble Dr. Vance's four clues together to reconstruct the 12-letter failsafe passcode that unlocks the Oscorp central mainframe:

[Clue 1: Mechanical] + [Clue 2: Medical] + [Clue 3: Etched in Steel] + [Clue 4: The 24-Hour Rising Sun]

The vault accepts the single 12-letter password (lowercase, no spaces).`;

async function updateQ11() {
    const rawAnswer = "engineersday";
    const answerHash = getSha256Hash(rawAnswer);
    console.log(`Q11 raw answer: ${rawAnswer}`);
    console.log(`Q11 answer hash: ${answerHash}`);

    const { data: q11Data } = await supabase.from('questions').select('options').eq('question_number', 11).single();
    
    const options = {
        bg_image: q11Data?.options?.bg_image || '/normalimages/11.jpg',
        image_url: '/q11.png',
        downloads: [
            {
                name: 'The_New_York_Globe_Interactive_Broadsheet.pdf',
                url: '/The_New_York_Globe_Interactive_Broadsheet.pdf'
            }
        ]
    };

    const { error } = await supabase.from('questions').update({
        question_text: questionText,
        answer_hash: answerHash,
        options: options
    }).eq('question_number', 11);

    if (error) {
        console.error('❌ Q11 update failed:', error.message);
    } else {
        console.log('✅ Q11 updated successfully (The New York Globe — ENGINEER’S DAY)');
    }
}

updateQ11();
