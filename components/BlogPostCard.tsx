import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface BlogPostCardProps {
  post: {
    id: number
    title: string
    author: string
    date: string
    excerpt: string
    content: string
    tags: string[]
    imageUrl: string
  }
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-md">
      <div className="relative h-48 w-full">
        <Image src={post.imageUrl || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{post.title}</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>{post.author}</span>
          <span className="text-sm text-gray-500">{post.date}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-gray-700">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-0">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {tag}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  )
}
