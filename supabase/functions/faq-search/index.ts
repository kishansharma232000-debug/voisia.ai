import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface FAQSearchRequest {
  user_id: string;
  query: string;
  limit?: number;
}

interface FAQEntry {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  faq_usage_count: number;
  created_at: string;
  updated_at: string;
}

interface FAQSearchResult {
  entry: FAQEntry;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'keyword';
}

/**
 * Supabase Edge Function: faq-search
 * 
 * Handles FAQ search queries with fuzzy matching and keyword search
 * Used by Vapi assistants to find relevant FAQ answers
 */
Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { user_id, query, limit = 5 }: FAQSearchRequest = await req.json();

    if (!user_id || !query) {
      return new Response(
        JSON.stringify({ error: "user_id and query are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's FAQs
    const { data: faqs, error: fetchError } = await supabase
      .from('faq_entries')
      .select('*')
      .eq('user_id', user_id);

    if (fetchError) {
      throw fetchError;
    }

    if (!faqs || faqs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          results: [],
          message: "No FAQs found for this user"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Search and rank FAQs
    const searchResults: FAQSearchResult[] = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

    for (const faq of faqs) {
      const questionLower = faq.question.toLowerCase();
      const answerLower = faq.answer.toLowerCase();
      
      let score = 0;
      let matchType: 'exact' | 'fuzzy' | 'keyword' = 'keyword';

      // Exact match (highest priority)
      if (questionLower.includes(queryLower)) {
        score = 100;
        matchType = 'exact';
      }
      // Fuzzy matching - check if most query words are present
      else {
        let wordMatches = 0;
        for (const word of queryWords) {
          if (questionLower.includes(word) || answerLower.includes(word)) {
            wordMatches++;
          }
        }
        
        if (wordMatches > 0) {
          score = (wordMatches / queryWords.length) * 80;
          matchType = queryWords.length > 1 && wordMatches >= queryWords.length * 0.6 ? 'fuzzy' : 'keyword';
        }
      }

      // Boost score for shorter questions (more specific)
      if (score > 0 && faq.question.length < 100) {
        score += 10;
      }

      // Add to results if score is above threshold
      if (score >= 20) {
        searchResults.push({
          entry: faq,
          score,
          matchType
        });
      }
    }

    // Sort by score (descending) and limit results
    searchResults.sort((a, b) => b.score - a.score);
    const topResults = searchResults.slice(0, limit);

    // Update usage count for the best match
    if (topResults.length > 0 && topResults[0].score >= 60) {
      const bestMatch = topResults[0];
      await supabase
        .from('faq_entries')
        .update({ 
          faq_usage_count: bestMatch.entry.faq_usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', bestMatch.entry.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results: topResults,
        total_faqs: faqs.length,
        query: query
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("FAQ search error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: "Failed to search FAQs"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});