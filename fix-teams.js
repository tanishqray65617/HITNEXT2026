import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

const csvData = `ClaudeCult ,Nitya Saxena ,698002
brand new day,Tarushi Mishra,437535
Spider Syndicate ,Stuti Modi,284894
Web Slingers ,Eka Shastri ,579755
Alchemax 616,Shriman Maheshwari,709654
Spider Trap,Adityaraj Khare ,793142
?,Adweta Sharma ,701966
WebX,Arjun Kulkarni ,600615
Espresso Yourself ,Kunalika Guha ,900965
NexFlix,Pranjali Deshpande ,425642
Marvel-ous Mistakes,Shreya Lasod,781128
Delta Force ,Mrinank Chandak ,754410
Bad,Deshna ,447301
Delta force OG,Vishesh Nanwani,625448
Spiderox26 ,udita,438741
Powerpuff ,Drishti Hargunani ,301707
Spidey Sense,Yukti Jaiswal,979310
FRIENDLY NEIGHBOURHOOD CODERS,Nandini Agrawal,830073
Dheet Next,Shivani Parate ,844634
FRIENDLY NEIGHBORHOOD CODERS,Nandini Agrawal,720222
Code Blooded,Parv Garg,138639
Spiderx,Diksha Rathi ,608957
Turing ,Mantra raj Shrivastava ,811186
QuadraWeb ,Adweta Sharma ,559690
Infinix,Somy paldaya,173178
AutoKAD,Khwaish Verma ,352181
INFINIX,Naveen Sharma ,918117
.env leakers,Abhideep Jain,811210
1st Year B2,Atharva Srivastava ,337403
Web crawlers ,Namit Patodi ,611395
1st Year b1,Abhinav Prabhat ,132737
Spidey Verse,Shubh Ameriya,410730
Git Happens,Maithli SIngh Tomar,471046
Joint FC ,Arijeet korde ,714595
TeamLegend,Shourya Khandelwal ,679803
DDoS Devils,Aditya Kansal ,405553
Spider-Punk,Dravya Gangwal,199974
Small potato,Mishti Gupta ,370857
Spider Moans,Ishjyot Singh Tuteja,422239
Contra,IshanshThada,987971`;

async function insertTeams() {
    // Delete any bad rows from earlier
    await supabase.from('teams').delete().ilike('team_name', '%brand new day%');
    await supabase.from('teams').delete().eq('team_name', 'glitch');
    await supabase.from('teams').delete().eq('team_name', 'ClaudeCult');

    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    lines.push("glitch,Aadrika Deokathe,100100"); // Assigning 100100 to glitch as placeholder
    
    const records = lines.map(line => {
        const parts = line.split(',');
        return {
            team_name: parts[0].trim(),
            team_code: parts[2].trim(),
            session_token: crypto.randomUUID(),
            current_question: 1,
            completed: false
        };
    });

    const { data, error } = await supabase.from('teams').upsert(records, { onConflict: 'team_name' });

    if (error) {
        console.error("Error inserting teams:", error);
    } else {
        console.log("Teams upserted successfully! Total processed:", records.length);
    }
}
insertTeams();
