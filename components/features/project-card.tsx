import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ProjectCardProps {
  id: string
  title: string
  description: string
  image: string
  price: number
  featured?: boolean
}

export function ProjectCard({ id, title, description, image, price, featured }: ProjectCardProps) {
  return (
    <div className={`group relative ${featured ? 'col-span-2 row-span-2' : ''}`}>
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
        <Image
          src={image}
          alt={title}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
          width={featured ? 800 : 400}
          height={featured ? 800 : 400}
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link href={`/projects/${id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">${price}</p>
      </div>
      <div className="mt-4">
        <Link href={`/projects/${id}`}>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  )
}
