"use client"
import type { ToolResult } from "@/types/types"
import { useChat } from "@ai-sdk/react"
import { Search, Send, Loader2 } from "lucide-react"

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    maxSteps: 5,
  })

  const isLoading = status === "streaming"

  return (
    <div className="flex flex-col w-full max-w-4xl min-h-screen mx-auto text-gray-800 bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-blue-600">AI Search Assistant</h1>
        </div>
      </header>

      <div className="flex-grow p-4 pb-32 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <Search className="w-16 h-16 mb-4 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-600">Ask me anything</h2>
            <p className="max-w-md mt-2 text-gray-500">
              I can search the web and provide information on various topics
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 ${message.role === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[90%]"}`}
            >
              <div
                className={`p-4 rounded-lg shadow-sm ${
                  message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {message.parts.map((part, i) => {
                  const partKey = `${message.id}-part-${i}`

                  switch (part.type) {
                    case "text":
                      return (
                        <div key={partKey} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      )

                    case "tool-invocation": {
                      const toolInvocation = part.toolInvocation
                      const { toolName, toolCallId, state } = toolInvocation

                      if (toolName === "searchGoogle") {
                        switch (state) {
                          case "call":
                            return (
                              <div key={partKey} className="my-2 p-3 bg-gray-100 rounded-md">
                                <div className="flex items-center gap-2 text-amber-600">
                                  <Search className="w-4 h-4" />
                                  <span className="font-medium">Searching Google...</span>
                                </div>
                                {toolInvocation.args?.query && (
                                  <p className="mt-1 text-sm text-gray-600">"{toolInvocation.args.query}"</p>
                                )}
                              </div>
                            )
                          case "result":
                            if (!toolInvocation.result) return null

                            return (
                              <div
                                key={partKey}
                                className="my-3 rounded-md overflow-hidden border border-gray-200 shadow-sm"
                              >
                                <div className="bg-gray-100 p-2 text-sm font-medium flex items-center gap-2 text-gray-700">
                                  <Search className="w-4 h-4" />
                                  Search results for: "{toolInvocation.args?.query || "Unknown query"}"
                                </div>
                                <div className="p-3 bg-white">
                                  {toolInvocation.result.results && toolInvocation.result.results.length > 0 ? (
                                    <div className="space-y-3">
                                      {toolInvocation.result.results.map((result: ToolResult, idx: number) => (
                                        <div key={idx} className="p-2 bg-gray-50 rounded border border-gray-200">
                                          <h3 className="font-medium text-blue-600">{result.title}</h3>
                                          <a
                                            href={result.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-gray-500 hover:text-blue-600 truncate block"
                                          >
                                            {result.link}
                                          </a>
                                          <p className="mt-1 text-sm text-gray-700">{result.snippet}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500">No results found</p>
                                  )}
                                </div>
                              </div>
                            )
                          default:
                            return null
                        }
                      }

                      return null
                    }

                    default:
                      return null
                  }
                })}
              </div>
              <div className="mt-1 text-xs text-gray-500 px-1">{message.role === "user" ? "You" : "AI Assistant"}</div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-md"
      >
        <div className="container flex max-w-4xl p-4 mx-auto">
          <input
            className="flex-grow p-3 border border-gray-300 rounded-l-md bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={input}
            placeholder="Ask something or trigger a search..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  )
}
