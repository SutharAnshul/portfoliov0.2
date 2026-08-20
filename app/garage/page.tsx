'use client'

import { useState, useRef, useEffect } from 'react'
import { Settle } from '@/components/Settle'

interface GarageProject {
  id: number
  title: string
  description: string
  image: string
  date: string
}

export default function GaragePage() {
  const [selectedProject, setSelectedProject] = useState<GarageProject | null>(null)
  const [projectIndex, setProjectIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const garageProjects: GarageProject[] = [
    {
      id: 1,
      title: 'Solic Arc',
      description: 'An extension of player\'s body - a premium ergonomic electric guitar design that merges industrial craft with modern aesthetics.',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cover-zlSqvnVnIOH9qeQybWCVSIX5hm8O4c.png',
      date: 'Jun 2024',
    },
    {
      id: 2,
      title: 'Project 2',
      description: 'Another creative endeavor showcasing your work',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cover-zlSqvnVnIOH9qeQybWCVSIX5hm8O4c.png',
      date: 'May 2024',
    },
    {
      id: 3,
      title: 'Project 3',
      description: 'Exploring new ideas and creative boundaries',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cover-zlSqvnVnIOH9qeQybWCVSIX5hm8O4c.png',
      date: 'Apr 2024',
    },
    {
      id: 4,
      title: 'Project 4',
      description: 'A creative exploration and experimental work',
      image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cover-zlSqvnVnIOH9qeQybWCVSIX5hm8O4c.png',
      date: 'Mar 2024',
    },
  ]

  const handleProjectClick = (project: GarageProject, index: number) => {
    setSelectedProject(project)
    setProjectIndex(index)
  }

  const handlePrevious = () => {
    const newIndex = projectIndex === 0 ? garageProjects.length - 1 : projectIndex - 1
    setProjectIndex(newIndex)
    setSelectedProject(garageProjects[newIndex])
  }

  const handleNext = () => {
    const newIndex = projectIndex === garageProjects.length - 1 ? 0 : projectIndex + 1
    setProjectIndex(newIndex)
    setSelectedProject(garageProjects[newIndex])
  }

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageContainerRef.current) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setZoomPosition({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    })
  }

  if (selectedProject) {
    return (
      <div className="bg-background text-foreground h-screen flex flex-col overflow-hidden">
        {/* Top Section: Image and Info Side by Side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Image Section */}
          <div className="flex-1 flex items-center justify-center bg-surface/60 p-6 overflow-hidden">
            <div
              ref={imageContainerRef}
              className={`relative w-full h-full flex items-center justify-center group ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={() => setIsZoomed(!isZoomed)}
              onMouseMove={handleImageMouseMove}
            >
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className={`transition-all duration-200 ${isZoomed
                    ? 'w-full h-full object-cover scale-200'
                    : 'max-w-full max-h-full object-contain'
                  }`}
                style={
                  isZoomed
                    ? {
                      transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                    }
                    : {}
                }
              />
              {!isZoomed && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="w-80 bg-sidebar border-l border-border/30 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 border-b border-border/30 px-8 py-8">
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-8 right-8 flex h-7 w-7 items-center justify-center  text-foreground/50 transition-colors hover:text-foreground hover:bg-foreground/10"
                aria-label="Close detail"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
              <h1 className="text-sm font-bold uppercase tracking-widest text-foreground pr-6">{selectedProject.title}</h1>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col px-8 pt-8 space-y-6">
              <div className="t-label">
                {selectedProject.date}
              </div>
              <div>
                <p className="t-body">
                  {selectedProject.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <button
                  onClick={handlePrevious}
                  className="card-link t-title" style={{ padding: '6px 10px' }}
                >
                  ← PREV
                </button>
                <span className="t-meta">
                  {projectIndex + 1} / {garageProjects.length}
                </span>
                <button
                  onClick={handleNext}
                  className="card-link t-title" style={{ padding: '6px 10px' }}
                >
                  NEXT →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Other Projects - Full Width */}
        <div className="flex-shrink-0 border-t border-border/30 bg-sidebar/50">
          <div className="px-8 py-4">
            <h3 className="t-label mb-3">OTHER TINKERINGS</h3>
          </div>
          <div className="flex gap-2 justify-center px-8 pb-4 overflow-x-auto">
            {garageProjects.map((proj, idx) => (
              <button
                key={proj.id}
                onClick={() => handleProjectClick(proj, idx)}
                className={`relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-[var(--r-sm)] border transition-all group ${idx === projectIndex
                    ? 'border-[var(--card-line-strong)]'
                    : 'border-border/30 hover:border-border/60'
                  }`}
              >
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <style>{`
        .garage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 152px), 2fr));
          gap: 16px;
          padding: 24px;
        }
        @media (min-width: 768px) {
          .garage-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
            padding: 48px;
          }
        }
        .garage-tile:hover {
          transform: translateY(-4px);
        }
      `}</style>

      {/* Header */}
      <div className="px-6 md:px-12 py-8 md:py-12 max-w-full">
        <div className="garage-title">
          <Settle boot mass="light">
            <h1 className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">MY GARAGE</h1>
          </Settle>
          <Settle boot mass="light" delay={80}>
            <p className="t-body">This is a collection of things I make, tinker with, and experiment on. Creative chaos organized.</p>
          </Settle>
        </div>
      </div>

      {/* Infinite Canvas Grid */}
      <div className="garage-grid">
        {garageProjects.map((project, index) => (
          <Settle key={project.id} boot mass="medium" delay={140 + index * 70}>
          <button
            onClick={() => handleProjectClick(project, index)}
            className="group relative aspect-square w-full bg-surface  overflow-hidden   transition-all duration-300"
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />

            {/* Overlay with info */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end justify-end p-3 md:p-4">
              <div className="text-right">
                <p className="text-white font-bold uppercase text-xs tracking-wide leading-tight">
                  {project.title}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {project.date}
                </p>
              </div>
            </div>
          </button>
          </Settle>
        ))}
      </div>

      {/* Footer spacer for mobile */}
      <div className="h-8 md:h-12"></div>
    </div>
  )
}
