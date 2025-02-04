import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';

const perplexity = createPerplexity({
  apiKey: process.env.PERPLEXITY_API_KEY ?? '',
});

export async function POST(req) {
  try {
    const body = await req.json();
    let { influencerName, timePeriod, claimsCount, journals } = body;

    if (!timePeriod || !claimsCount) {
      console.error('\n❌ Missing required fields:', body);
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('\n🔎 Searching with parameters:', { influencerName, timePeriod, claimsCount, journals });

    // 🔹 Determinar el texto correcto para el prompt
    const influencerText = influencerName && influencerName.trim() !== ""
      ? `the health influencer ${influencerName}`
      : "the most famous health influencers";

    // 🔹 Construcción de la sección de journals en el prompt (si aplica)
    const journalsText = Array.isArray(journals) && journals.length > 0
      ? `Use the following scientific journals, along with other reliable scientific sources and verified information available on the internet, to verify the claims: ${journals.join(', ')}.`
      : "Use reliable scientific sources and verified information available on the internet to verify the claims.";

    // 🔹 Construcción del prompt asegurando la búsqueda correcta
    const prompt = `
     ### Instructions:
1. Extract up to ${claimsCount} health claims from ${influencerText} during the ${timePeriod} period.  
- Consider social media posts, interviews, online articles, and any other publicly available sources.  
- The claims should be related to nutrition, medicine, or health in general.  

2. For each claim, provide:  
- "claim": "Exact text of the claim".  
- "influencer": "Name of the health influencer who made the claim".  
- "follower_count": "Approximate number of followers of the influencer".  
- "category": "Nutrition | Medicine | Mental Health | etc."  
- "original_source": "The **exact URL** where the influencer originally published this claim (official website, blog post, interview, or a publicly verifiable article)".  

3. **Ensure 'original_source' is always a valid, publicly accessible webpage.**  
   - Do **NOT** use broken links or general homepage URLs.  
   - The source must point directly to the **specific article, blog post, or interview** containing the claim.  
   - **If the exact URL is unavailable, continue searching until a valid one is found.**  
   - **No "404 Not Found" or invalid links.**  

4. **Always return at least one claim.**  
   - If no claims are immediately found, expand the search across multiple sources.  
   - Use **Perplexity AI** to its full capacity—this is mandatory.  
   - **DO NOT return empty results under any circumstances.**  

5. Verify each claim by comparing it to reliable information.  
- Assign a classification based on the available evidence:  
    - "verification": "Verified" (evidence in favor)  
    - "verification": "Questionable" (contradictory or insufficient evidence)  
    - "verification": "Debunked" (evidence against)  
- "confidence_score": A number between 0 and 100 indicating how reliable the claim is.  
- ${journalsText}

6. Provide a list of **scientific studies** that support or refute the claim:  
- "scientific_studies": [  
    {  
        "title": "Study title",  
        "authors": "Study authors",  
        "publication": "Scientific journal",  
        "year": 202X,  
        "link": "Study URL"  
    }  
]  

7. **If no valid claims can be retrieved from this influencer**, DO NOT return an error.  
   - Instead, return at least one **health-related claim** from a well-known **credible** health influencer.  
   - Prioritize influencers with **scientific credentials, peer-reviewed work, and strong reputations**.  
   - Ensure that **every search yields usable results.**  

--   **FINAL REQUIREMENT:**  
The JSON **must** return the extracted claims under the key "claims", NOT "health_claims".  
The "original_source" field **must always** contain a valid, working URL to the exact claim reference.  
No placeholder links, homepages, or broken URLs.  
  

      `.trim();

    // 🔹 Llamada a la API de Perplexity
    const { text } = await generateText({
      model: perplexity('sonar-pro'),
      system: 'Act as a health claims extraction and verification system. ' +
        'Respond only in JSON format. Do not add explanations or additional text. ' +
        'Use the provided scientific sources and other reliable sources if necessary. ' +
        'If you cannot verify a claim, simply omit it. ' +
        'Access Instagram, Twitter, Facebook, YouTube, blogs, and news websites. ' +
        `Search for ${claimsCount} health claims from ${influencerText} in the ${timePeriod} period. ` +
        'Remove repeated claims. ' +
        'Ensure that the "original_source" link for each claim is a valid and existing URL that directly references the claim. ' +
        'Do not include broken, unrelated, or inaccessible links. ' +
        'If a valid original source cannot be found, omit the "original_source" field. ' +
        'Verify that the URL leads to a post, video, or article where the claim was made, rather than a generic social media profile or unrelated content.',
      prompt: prompt,
    });

    console.log('\n📌 Raw API response:', text);

    // 🔹 Intentamos parsear la respuesta como JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      console.error('\n❌ Error parsing API response:', parseError);
      parsedResponse = attemptFixJson(text);
      if (!parsedResponse) {
        return Response.json({ error: 'Invalid API response format', rawResponse: text }, { status: 500 });
      }
    }

    if (parsedResponse.error) {
      console.warn('\n⚠️ No claims found:', parsedResponse.error);
      return Response.json({ message: parsedResponse.error }, { status: 404 });
    }

    return Response.json({ results: parsedResponse }, { status: 200 });
  } catch (error) {
    console.error('\n❌ Error processing request:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


function attemptFixJson(text) {
  try {
    let fixedText = text
      .replace(/(\w+)\s*:\s*(\w+)/g, '"$1": "$2"') // Agrega comillas a claves y valores simples
      .replace(/(\w+)\s*:\s*"([^"{[]+?)"/g, '"$1": "$2"') // Asegura claves con valores de texto
      .replace(/,\s*}/g, '}') // Corrige comas finales incorrectas
      .replace(/,\s*]/g, ']'); // Corrige comas finales en listas
    return JSON.parse(fixedText);
  } catch (fixError) {
    console.error('\n❌ Could not fix JSON:', fixError);
    return null;
  }
}