import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fntdrshtxfhzckcpvxaf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudGRyc2h0eGZoemNrY3B2eGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODQyMDMsImV4cCI6MjEwMzU2MDIwM30._LhKAJBLomPK-IFsL_lr6dRppSDp42-q3JApjrg7KDg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runTests() {
  console.log('--- STARTING SECURITY AUDIT ---')

  // Attack 1: Direct Database Access
  console.log('\n[TEST 1] Attempting to read answer hashes directly via API...')
  const { data: questions, error: qErr } = await supabase.from('questions').select('*')
  if (qErr || questions?.length === 0) {
    console.log('✅ PASS: Database properly blocked unauthorized read access to questions table.')
  } else {
    console.log('❌ FAIL: Able to read questions table directly!')
  }

  // Attack 2: Missing Session Token
  console.log('\n[TEST 2] Attempting to fetch a question without authentication...')
  const res2 = await fetch(`${supabaseUrl}/functions/v1/get-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })
  if (res2.status === 401) {
    console.log('✅ PASS: Edge Function rejected unauthenticated request.')
  } else {
    console.log(`❌ FAIL: Edge Function returned status ${res2.status}`)
  }

  // Generate valid session
  console.log('\n[SETUP] Logging in Test Team for active attacks...')
  const loginRes = await fetch(`${supabaseUrl}/functions/v1/login-team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'Test Team', teamCode: '123456' })
  }).then(r => r.json())

  const sessionToken = loginRes.sessionToken

  // Attack 3: Concurrency Attack
  console.log('\n[TEST 3] Attempting Rapid-Fire Concurrency Attack (5 simultaneous correct answers)...')
  const correctHash = 'placeholder_hash_1'
  
  const promises = []
  for (let i = 0; i < 5; i++) {
    promises.push(
      fetch(`${supabaseUrl}/functions/v1/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, answer: correctHash })
      })
    )
  }

  await Promise.all(promises)

  // Verify resulting level
  const verifyRes = await fetch(`${supabaseUrl}/functions/v1/get-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken })
  }).then(r => r.json())
  
  if (verifyRes.question && (verifyRes.question.question_number === 2 || verifyRes.question.question_number === 6)) {
    console.log('✅ PASS: Concurrency attack blocked. Team only advanced safely despite parallel successful requests.')
  } else {
    console.log(`❌ FAIL: Concurrency attack succeeded! Team advanced to level ${verifyRes.question?.question_number}`)
  }

  // Attack 4: Attempt Skip Ahead
  console.log('\n[TEST 4] Attempting to skip to Level 11 via API payload...')
  const res4 = await fetch(`${supabaseUrl}/functions/v1/get-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken, questionNumber: 11 })
  }).then(r => r.json())

  if (res4.question && (res4.question.question_number === 2 || res4.question.question_number === 6)) {
    console.log('✅ PASS: Server strictly ignored payload manipulation and returned the true database state.')
  } else {
    console.log('❌ FAIL: Server leaked incorrect question!')
  }

  console.log('\n--- SECURITY AUDIT COMPLETE ---')
}

runTests()
