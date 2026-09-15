import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk4NDIwMywiZXhwIjoyMTAzNTYwMjAzfQ.2nOnDuOC9MEZyNbn5aa5PJGKVZq2XPk0fpWFNdiJ8DE';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'clues';

const filesToUpload = [
    { localPath: 'public/q1.png', remoteName: 'q1.png', contentType: 'image/png', questionNum: 1 },
    { localPath: 'public/q2.jpg', remoteName: 'q2.jpg', contentType: 'image/jpeg', questionNum: 2 },
    { localPath: 'public/q3.png', remoteName: 'q3.png', contentType: 'image/png', questionNum: 3 },
    { localPath: 'public/q5.png', remoteName: 'q5.png', contentType: 'image/png', questionNum: 5 },
    { localPath: 'public/q6.jpg', remoteName: 'q6.jpg', contentType: 'image/jpeg', questionNum: 6 },
    { localPath: 'public/q8.png', remoteName: 'q8.png', contentType: 'image/png', questionNum: 8 },
    { localPath: 'public/q9.jpg', remoteName: 'q9.jpg', contentType: 'image/jpeg', questionNum: 9 },
    { localPath: 'public/q11.png', remoteName: 'q11.png', contentType: 'image/png', questionNum: 11 },
    { localPath: 'public/ocean_of_words_filled.csv', remoteName: 'ocean_of_words_filled.csv', contentType: 'text/csv' },
    { localPath: 'public/datacode.txt', remoteName: 'datacode.txt', contentType: 'text/plain' }
];

async function run() {
    console.log('--- UPLOADING ASSETS TO SUPABASE STORAGE ---');

    for (const item of filesToUpload) {
        if (!fs.existsSync(item.localPath)) {
            console.warn(`File not found: ${item.localPath}`);
            continue;
        }

        const fileBuffer = fs.readFileSync(item.localPath);
        const { error } = await supabase.storage.from(BUCKET_NAME).upload(item.remoteName, fileBuffer, {
            contentType: item.contentType,
            upsert: true
        });

        if (error) {
            console.error(`❌ Failed to upload ${item.remoteName}:`, error.message);
        } else {
            const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.remoteName);
            console.log(`✅ Uploaded ${item.remoteName} -> ${data.publicUrl}`);

            // If it maps to a question, update options.image_url in the database
            if (item.questionNum) {
                const { data: qData, error: qFetchErr } = await supabase
                    .from('questions')
                    .select('options')
                    .eq('question_number', item.questionNum)
                    .single();

                if (!qFetchErr && qData) {
                    const updatedOptions = { ...qData.options, image_url: data.publicUrl };
                    
                    // For Q11, also update downloads url
                    if (item.questionNum === 11 && updatedOptions.downloads) {
                        updatedOptions.downloads = [
                            {
                                name: 'The_New_York_Globe_Broadsheet.png',
                                url: data.publicUrl
                            }
                        ];
                    }

                    const { error: qUpErr } = await supabase
                        .from('questions')
                        .update({ options: updatedOptions })
                        .eq('question_number', item.questionNum);

                    if (qUpErr) {
                        console.error(`   ❌ Failed to update DB for Q${item.questionNum}:`, qUpErr.message);
                    } else {
                        console.log(`   ✅ DB options.image_url updated for Q${item.questionNum}`);
                    }
                }
            }
        }
    }

    console.log('\n--- UPLOAD AND DATABASE SYNC COMPLETE ---');
}

run();
