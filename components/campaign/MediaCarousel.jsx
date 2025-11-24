"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Play, Pause } from "lucide-react"
import Image from "next/image"

export default function MediaCarousel({ media = [], className = "" }) {
  // Sort media array to put primary image first
  const sortedMedia = [...media].sort((a, b) => {
    // Primary media comes first
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    // Otherwise maintain original order (by display_order)
    return (a.display_order || 0) - (b.display_order || 0)
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState({})
  const [videoLoading, setVideoLoading] = useState({})

  // Reset to first image when media changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [media])

  if (!sortedMedia || sortedMedia.length === 0) {
    return (
      <div className="relative w-full h-72 md:h-96 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
        <Image
          src="/placeholder.svg"
          alt="No media available"
          fill
          className="object-cover"
        />
      </div>
    )
  }

  const currentMedia = sortedMedia[currentIndex]

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedMedia.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length)
  }

  const goToIndex = (index) => {
    setCurrentIndex(index)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const togglePlayPause = (index) => {
    const video = document.getElementById(`video-${index}`)
    if (video) {
      if (video.paused) {
        video.play()
        setIsPlaying({ ...isPlaying, [index]: true })
      } else {
        video.pause()
        setIsPlaying({ ...isPlaying, [index]: false })
      }
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === 'ArrowLeft') goToPrevious()
        if (e.key === 'ArrowRight') goToNext()
        if (e.key === 'Escape') setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const MediaContent = ({ media, index, isFullscreenView = false }) => {
    const containerClass = isFullscreenView
      ? "w-full h-full"
      : "w-full h-full"

    if (media.media_type === 'video' || media.type === 'video') {
      const videoUrl = media.media_url || media.preview

      return (
        <div className={`${containerClass} relative bg-black flex items-center justify-center`}>
          <video
            key={videoUrl}
            src={videoUrl}
            className="w-full h-full object-contain"
            controls
            playsInline
            preload="metadata"
            style={{ maxHeight: isFullscreenView ? '100vh' : '400px' }}
          />
        </div>
      )
    }

    return (
      <div className={`${containerClass} relative bg-gray-100`}>
        <Image
          src={media.media_url || media.preview}
          alt={media.file_name || media.name || `Media ${index + 1}`}
          fill
          className="object-contain"
          quality={100}
          priority={index === currentIndex}
          unoptimized
          sizes={isFullscreenView ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"}
        />
      </div>
    )
  }

  return (
    <>
      {/* Main Carousel */}
      <div className={`relative rounded-xl overflow-hidden shadow-2xl group ${className}`}>
        {/* Main Media Display */}
        <div className="relative w-full h-72 md:h-96 bg-black">
          <MediaContent media={currentMedia} index={currentIndex} />

          {/* Navigation Arrows */}
          {sortedMedia.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToPrevious}
                aria-label="Previous media"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToNext}
                aria-label="Next media"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Media Counter */}
          {sortedMedia.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {currentIndex + 1} / {sortedMedia.length}
            </div>
          )}

          {/* Fullscreen Button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={toggleFullscreen}
          >
            Fullscreen
          </Button>
        </div>

        {/* Thumbnail Navigation */}
        {sortedMedia.length > 1 && (
          <div className="bg-black/90 p-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {sortedMedia.map((item, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  aria-label={`Go to media ${index + 1}`}
                >
                  {item.media_type === 'video' || item.type === 'video' ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                      <video
                        src={item.media_url || item.preview}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-6 w-6 text-white fill-current" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={item.media_url || item.preview}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white border-0 z-10"
            onClick={toggleFullscreen}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Media Counter */}
          {sortedMedia.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
              {currentIndex + 1} / {sortedMedia.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {sortedMedia.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white border-0 z-10 h-14 w-14"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white border-0 z-10 h-14 w-14"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Fullscreen Media */}
          <div className="w-full h-full p-8">
            <MediaContent media={currentMedia} index={currentIndex} isFullscreenView={true} />
          </div>

          {/* Thumbnail Navigation in Fullscreen */}
          {sortedMedia.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-4">
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {sortedMedia.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? 'border-blue-500 ring-2 ring-blue-300'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {item.media_type === 'video' || item.type === 'video' ? (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                        <video
                          src={item.media_url || item.preview}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="h-8 w-8 text-white fill-current" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={item.media_url || item.preview}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
