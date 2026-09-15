import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get the team name from the command line arguments, or default to "Test Team"
const teamName = process.argv[2] || 'Test Team';

async function resetTeam() {
    console.log(`Resetting progress for team: "${teamName}"...`);
    
    const { data, error } = await supabase
        .from('teams')
        .update({
            current_question: 1,
            completed: false,
            completed_at: null
        })
        .ilike('team_name', teamName)
        .select();

    if (error) {
        console.error('Error resetting team:', error.message);
    } else if (data && data.length > 0) {
        console.log(`\nSuccess! "${data[0].team_name}" has been reset back to Level 1.`);
        console.log(`They can now refresh their browser and start from the beginning.`);
    } else {
        console.log(`Could not find a team matching the name "${teamName}".`);
    }
}

resetTeam();
