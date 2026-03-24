import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id, answers } = await req.json();

    if (!submission_id || !answers) {
      return new Response(
        JSON.stringify({ error: "submission_id and answers are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI roommate compatibility engine. Given a user's questionnaire answers, generate 5 realistic potential roommate matches with compatibility scores.

For each match, analyze the user's answers and create profiles that would realistically exist, with varying degrees of compatibility. Consider:
- Sleep schedule alignment
- Cleanliness standards
- Noise tolerance
- Guest frequency preferences
- Smoking/pet preferences
- Budget compatibility
- Social energy alignment
- Cooking habits

Return a JSON array of exactly 5 matches. Each match must have:
- name: A realistic Indian name
- age: number (20-35)
- occupation: string
- compatibility: number (60-98, sorted descending)
- avatar: Two-letter initials
- sharedTraits: array of 2-5 strings describing compatible habits
- clashPoints: array of 0-3 strings describing potential friction points

Higher compatibility matches should have more shared traits and fewer clash points. Lower matches should have more clash points.

IMPORTANT: Return ONLY valid JSON array, no markdown, no explanation.`;

    const userPrompt = `Here are the user's questionnaire answers:
${JSON.stringify(answers, null, 2)}

Generate 5 roommate matches sorted by compatibility (highest first). Make the shared traits and clash points specific to the user's actual answers. For example, if the user is a "Night Owl", a high-compatibility match should also be a Night Owl (shared trait), while a low-compatibility match might be an "Early Bird" (clash point).`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse AI response - strip markdown fences if present
    let matches;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      matches = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Store matches in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from("match_results")
      .insert({ submission_id, matches });

    if (insertError) {
      console.error("DB insert error:", insertError);
    }

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-matches error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
