import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { z } from "zod"


const BlogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  date: z.string(),
  excerpt: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  imageUrl: z.string(),
});

const blogPosts = [
  {
    id: 1,
    title: "Getting Started with Next.js",
    author: "Jane Smith",
    date: "May 10, 2025",
    excerpt: "Learn how to build modern web applications with Next.js, the React framework for production.",
    content:
      "Next.js gives you the best developer experience with all the features you need for production: hybrid static & server rendering, TypeScript support, smart bundling, route pre-fetching, and more. No config needed.",
    tags: ["nextjs", "react", "frontend"],
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "The Power of Server Components",
    author: "John Doe",
    date: "May 8, 2025",
    excerpt: "Discover how React Server Components can improve your application's performance and user experience.",
    content:
      "React Server Components allow you to render components on the server, reducing the JavaScript sent to the client and improving performance. They're a game-changer for modern web development.",
    tags: ["react", "server-components", "performance"],
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "Building AI-Powered Applications",
    author: "Alex Johnson",
    date: "May 5, 2025",
    excerpt: "Explore how to integrate AI capabilities into your web applications using the AI SDK.",
    content:
      "The AI SDK makes it easy to add AI capabilities to your applications. From text generation to image recognition, you can leverage the power of AI with just a few lines of code.",
    tags: ["ai", "machine-learning", "sdk"],
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
]

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = streamText({
    model: groq("llama3-70b-8192"),
    messages,
    tools: {
      searchBlogPosts: {
        description: "Search for blog posts by topic, keyword, tag, or author.",
        parameters: z.object({
          query: z.string().describe("The search query for finding blog posts. Can be about the topic, content, tags, or author."),
        }),
        execute: async ({ query }: { query: string }): Promise<z.infer<typeof BlogPostSchema> | { notFound: string }> => {
          console.log(`Searching blog posts with query: "${query}"`)
          const lowerQuery = query.toLowerCase();
          const post = blogPosts.find(
            (p) =>
              p.title.toLowerCase().includes(lowerQuery) ||
              p.content.toLowerCase().includes(lowerQuery) ||
              p.excerpt.toLowerCase().includes(lowerQuery) ||
              p.author.toLowerCase().includes(lowerQuery) ||
              p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
          );

          if (post) {
             console.log(`Found post: "${post.title}"`)
             return post;
          } else {
            console.log(`No post found for query: "${query}"`)
            return { notFound: `No blog post found matching "${query}".` };
          }
        },
      },

    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}