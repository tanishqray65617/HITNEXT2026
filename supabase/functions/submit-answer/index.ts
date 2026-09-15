import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionToken, answer } = await req.json()

    if (!sessionToken || !answer) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing token or answer" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Authenticate team
    const { data: team, error: teamError } = await supabaseClient
      .from('teams')
      .select('id, current_question, completed')
      .eq('session_token', sessionToken)
      .single()

    if (teamError || !team) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid session" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    if (team.completed) {
      return new Response(
        JSON.stringify({ success: true, isCorrect: false, error: "Already completed" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 2. Rate limit: check submission cooldown (2 seconds)
    const COOLDOWN_SECONDS = 2
    const { data: lastSubmission } = await supabaseClient
      .from('submissions')
      .select('submitted_at')
      .eq('team_id', team.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastSubmission?.submitted_at) {
      const lastTime = new Date(lastSubmission.submitted_at).getTime()
      const diffSeconds = (Date.now() - lastTime) / 1000
      if (diffSeconds < COOLDOWN_SECONDS) {
        const waitTime = Math.ceil(COOLDOWN_SECONDS - diffSeconds)
        return new Response(
          JSON.stringify({
            success: false,
            rateLimited: true,
            error: `Rate limit exceeded. Please wait ${waitTime}s before submitting again.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
    }

    // 3. Fetch current question to check answer
    const { data: question, error: questionError } = await supabaseClient
      .from('questions')
      .select('id, answer_hash')
      .eq('question_number', team.current_question)
      .single()

    if (questionError || !question) {
      return new Response(
        JSON.stringify({ success: false, error: "Question not found" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // 3. Hash the submitted answer (normalize first)
    const normalizedAnswer = answer.trim().toLowerCase()
    const hashedAnswer = await sha256(normalizedAnswer)

    // Compare against the true hash, but temporarily also check raw string since placeholder hashes were used in seed.sql
    const isCorrect = hashedAnswer === question.answer_hash || normalizedAnswer === question.answer_hash

    // 4. Log the submission
    await supabaseClient.from('submissions').insert({
      team_id: team.id,
      question_id: question.id,
      submitted_answer: answer,
      is_correct: isCorrect,
    })

    // 5. If correct, advance level
    if (isCorrect) {
      const nextQuestion = team.current_question + 1
      const isCompleted = nextQuestion > 11
      
      const updateData: any = { current_question: nextQuestion }
      if (isCompleted) {
        updateData.completed = true
        updateData.completed_at = new Date().toISOString()
      }

      await supabaseClient
        .from('teams')
        .update(updateData)
        .eq('id', team.id)
      
      return new Response(
        JSON.stringify({ success: true, isCorrect: true, completed: isCompleted }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      return new Response(
        JSON.stringify({ success: true, isCorrect: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
