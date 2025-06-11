import { NextResponse } from "next/server"

// This is a server-side API route that will handle the Anthropic API call
export async function POST(request: Request) {
  try {
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Get the API key from environment variables
    const apiKey = process.env.ANTHROPIC_API_KEY || ""

    if (!apiKey) {
      console.error("Missing Anthropic API key")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Prepare the prompt for Anthropic
    const prompt = `
      You are an expert child psychologist specializing in art therapy. 
      Analyze this child's drawing and provide insights about their emotional state, 
      creativity level, and potential areas of focus for parents or therapists.
      
      Please structure your analysis with these sections:
      1. Primary Emotion (single word)
      2. Secondary Emotion (single word)
      3. Stroke Intensity (Light/Medium/Heavy)
      4. Colors Analysis (what the color choices might indicate)
      5. Detailed Analysis (2-3 sentences about the drawing's psychological implications)
      6. Suggested Actions (3 brief recommendations for parents/therapists)
      
      Keep your analysis positive, supportive, and focused on growth opportunities.
    `

    // Call the Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/png",
                  data: imageData.replace(/^data:image\/png;base64,/, ""),
                },
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Anthropic API error:", errorData)
      return NextResponse.json({ error: "Error analyzing drawing" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      analysis: data.content[0].text,
    })
  } catch (error) {
    console.error("Error in analyze-drawing route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
