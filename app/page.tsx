"use client"

import type { ToolInvocation } from "ai"
import { type Message, useChat } from "@ai-sdk/react"
import { BlogPostCard } from "@/components/BlogPostCard"

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } = useChat({
    maxSteps: 5,
  })

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch gap-4">
      {messages?.map((m: Message) => (
        <div key={m.id} className="whitespace-pre-wrap flex flex-col gap-1">
          <strong>{`${m.role}: `}</strong>
          {m.content}
          {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
            const toolCallId = toolInvocation.toolCallId

            if (toolInvocation.toolName === "askForConfirmation") {
              return (
                <div key={toolCallId} className="text-gray-500 flex flex-col gap-2">
                  {toolInvocation.args.message}
                  <div className="flex gap-2">
                    {"result" in toolInvocation ? (
                      <b>{toolInvocation.result}</b>
                    ) : (
                      <>
                        <button
                          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                          onClick={() =>
                            addToolResult({
                              toolCallId,
                              result: "Yes, confirmed.",
                            })
                          }
                        >
                          Yes
                        </button>
                        <button
                          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                          onClick={() =>
                            addToolResult({
                              toolCallId,
                              result: "No, denied",
                            })
                          }
                        >
                          No
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            }

            return "result" in toolInvocation ? (
              toolInvocation.toolName === "searchBlogPosts" ? (
                <div key={toolCallId} className="my-4 w-full">
                  <BlogPostCard post={toolInvocation.result} />
                </div>
              ) : toolInvocation.toolName === "getLocation" ? (
                <div key={toolCallId} className="text-gray-500 bg-gray-100 rounded-lg p-4">
                  User is in {toolInvocation.result}.
                </div>
              ) : (
                <div key={toolCallId} className="text-gray-500">
                  Tool call {`${toolInvocation.toolName}: `}
                  {JSON.stringify(toolInvocation.result)}
                </div>
              )
            ) : (
              <div key={toolCallId} className="text-gray-500">
                Calling {toolInvocation.toolName}...
              </div>
            )
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Ask about blog posts..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}
