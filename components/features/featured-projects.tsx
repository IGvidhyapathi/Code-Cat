import { ProjectCard } from "./project-card"
import prisma from "@/lib/prisma"

async function getFeaturedProjects() {
  const projects = await prisma.project.findMany({
    where: {
      featured: true,
      status: "ACTIVE"
    },
    take: 4,
    orderBy: {
      createdAt: "desc"
    }
  })
  return projects
}

export async function FeaturedProjects() {
  const projects = await getFeaturedProjects()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
        <h2 className="text-2xl font-bold text-gray-900">Featured Projects</h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              image={project.images[0] || "/placeholder.jpg"}
              price={project.price}
              featured={project.featured}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
