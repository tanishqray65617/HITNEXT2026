import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { teamName, teamCode } = await req.json()

    if (!teamName || !teamCode) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing team name or code" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let { data: team, error: searchError } = await supabaseClient
      .from('teams')
      .select('id, session_token')
      .eq('team_code', teamCode.trim())
      .single()

    if (searchError || !team) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid credentials" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Team exists! Update their name just for storage purposes as requested
    await supabaseClient
      .from('teams')
      .update({ team_name: teamName.trim() })
      .eq('id', team.id);

    return new Response(
      JSON.stringify({ success: true, teamId: team.id, sessionToken: team.session_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
