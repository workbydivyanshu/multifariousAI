import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface ConsensusRequest {
  userQuery: string
  responses: {
    model: string
    content: string
  }[]
  apiKey?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ConsensusRequest = await request.json()
    const { userQuery, responses, apiKey } = body

    if (!responses || responses.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 responses are required for consensus' },
        { status: 400 }
      )
    }

    // Build the consensus prompt
    const responsesText = responses
      .map((r, i) => `### Response ${i + 1} (${r.model}):\n${r.content}`)
      .join('\n\n')

    const consensusPrompt = `You are an expert AI analyst tasked with finding the best answer from multiple AI responses.

**Original Question:**
${userQuery}

**AI Responses to Analyze:**
${responsesText}

**Your Task:**
1. Carefully analyze each response for:
   - Accuracy and correctness
   - Completeness and depth
   - Clarity and readability
   - Practical usefulness

2. Create a CONSENSUS BEST ANSWER that:
   - Takes the best elements from each response
   - Corrects any errors found in individual responses
   - Provides the most complete and accurate answer
   - Is well-structured and easy to understand

3. Format your response as:
   **Analysis:** (brief 2-3 sentence analysis of which responses were strongest and why)
   
   **Best Answer:**
   (Your synthesized best answer here)

Please provide the consensus best answer now:`

    // Use a free model for consensus (DeepSeek R1 or Llama)
    const key = apiKey || process.env.OPENROUTER_API_KEY

    if (!key) {
      // Fallback: simple voting/averaging if no API key
      const longestResponse = responses.reduce((a, b) => 
        a.content.length > b.content.length ? a : b
      )
      
      return NextResponse.json({
        consensus: `**Note:** No API key available for AI consensus. Showing the most comprehensive response.\n\n**From ${longestResponse.model}:**\n${longestResponse.content}`,
        method: 'fallback'
      })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'MultifariousAI Consensus',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [
          { role: 'user', content: consensusPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3, // Lower temperature for more focused analysis
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Consensus API error:', error)
      
      // Fallback to simple selection
      const longestResponse = responses.reduce((a, b) => 
        a.content.length > b.content.length ? a : b
      )
      
      return NextResponse.json({
        consensus: `**AI Analysis unavailable.** Showing the most comprehensive response.\n\n**From ${longestResponse.model}:**\n${longestResponse.content}`,
        method: 'fallback'
      })
    }

    const data = await response.json()
    const consensusContent = data.choices?.[0]?.message?.content || 'Unable to generate consensus.'

    return NextResponse.json({
      consensus: consensusContent,
      method: 'ai-analysis'
    })

  } catch (error) {
    console.error('Consensus error:', error)
    return NextResponse.json(
      { error: 'Failed to generate consensus' },
      { status: 500 }
    )
  }
}
