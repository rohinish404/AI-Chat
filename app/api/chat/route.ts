import { groq } from "@ai-sdk/groq"
import { streamText, tool } from "ai"
import { SerperClient } from "@agentic/stdlib"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const googleSearch = new SerperClient({
  apiKey: process.env.SERPER_API_KEY,
})

export const maxDuration = 30

export const googleSearchTool = tool({
  description:
    "Search Google for a query and return the search results. Use this for general web searches, finding information, news, etc., when you do not have the information readily available.",
  parameters: z.object({
    query: z.string().describe("The search query to pass to Google. Be specific and comprehensive."),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      console.log(`[Google Search Tool] Initiating search for: "${query}"`)
      if (!query || query.trim() === "") {
        console.warn("[Google Search Tool] Received empty or blank query.")
        return { error: "Search query cannot be empty.", searchPerformed: query, results: [] }
      }

      const searchResults = await googleSearch.search(query)
      console.log(`[Google Search Tool] Received ${searchResults.organic?.length || 0} organic results for: "${query}"`)

      const simplifiedResults = searchResults.organic
        ?.map((r) => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet,
        }))
        .slice(0, 5)

      if (simplifiedResults && simplifiedResults.length > 0) {
        return { searchPerformed: query, results: simplifiedResults }
      } else {
        return { searchPerformed: query, message: "No relevant organic results found.", results: [] }
      }
    } catch (error: any) {
      console.error("[Google Search Tool] Error during search:", error)
      return {
        error: "Failed to perform Google search.",
        details: error.message || String(error),
        searchPerformed: query,
      }
    }
  },
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: groq("llama3-70b-8192"),
      tools: {
        searchGoogle: googleSearchTool,
      },
      toolChoice: "auto",
      messages,
      experimental_toolCallStreaming: true,
    })

    return result.toDataStreamResponse()
  } catch (err) {
    console.error("Error in POST handler:", err)
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 })
  }
}
