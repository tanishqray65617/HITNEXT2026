import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

const teamName = process.argv[2] || 'Test Team';
const questionNumber = parseInt(process.argv[3]) || 11;

async function setProgress() {
    const { data, error } = await supabase
        .from('teams')
        .update({
            current_question: questionNumber,
            completed: false,
            completed_at: null
        })
        .ilike('team_name', teamName)
        .select();

    if (error) {
        console.error('Error setting progress:', error.message);
    } else if (data && data.length > 0) {
        console.log(`Success! "${data[0].team_name}" has been set to Question ${questionNumber}.`);
    } else {
        console.log(`Could not find a team matching the name "${teamName}".`);
    }
}
setProgress();
