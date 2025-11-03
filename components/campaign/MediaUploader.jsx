"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X, Upload, Image as ImageIcon, Video, Star } from "lucide-react"
import Image from "next/image"

export default function MediaUploader({ media = [], onChange, maxFiles = 10 }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [media, onChange])

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    if (media.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`)
      return
    }

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      const isValidSize = file.size <= 100 * 1024 * 1024 // 100MB max

      if (!isImage && !isVideo) {
        alert(`${file.name} is not an image or video file`)
        return false
      }
      if (!isValidSize) {
        alert(`${file.name} is too large. Max size is 100MB`)
        return false
      }
      return true
    })

    const newMedia = validFiles.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name,
      size: file.size,
      isPrimary: media.length === 0 && index === 0, // First file is primary by default
      displayOrder: media.length + index
    }))

    onChange([...media, ...newMedia])
  }

  const removeMedia = (index) => {
    const wasPrimary = media[index].isPrimary
    const newMedia = media.filter((_, i) => i !== index)

    // If we removed the primary media and there are still media files, make the first one primary
    if (wasPrimary && newMedia.length > 0) {
      newMedia[0].isPrimary = true
    }

    onChange(newMedia)
  }

  const setPrimary = (index) => {
    const newMedia = media.map((item, i) => ({
      ...item,
      isPrimary: i === index
    }))
    onChange(newMedia)
  }

  const reorderMedia = (fromIndex, toIndex) => {
    const newMedia = [...media]
    const [movedItem] = newMedia.splice(fromIndex, 1)
    newMedia.splice(toIndex, 0, movedItem)

    // Update display order
    newMedia.forEach((item, index) => {
      item.displayOrder = index
    })

    onChange(newMedia)
  }

  return (
    <div className="space-y-4">
      <Label>Campaign Media (Images & Videos)</Label>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drag and drop media files here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse (max {maxFiles} files, up to 100MB each)
        </p>
        <Input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="media-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('media-upload').click()}
          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
        >
          <Upload className="h-4 w-4 mr-2" />
          Select Files
        </Button>
      </div>

      {/* Media Preview Grid */}
      {media.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {media.length} file{media.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-gray-500">
              Click the star to set primary media (thumbnail)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item, index) => (
              <Card key={index} className={`relative group overflow-hidden ${
                item.isPrimary ? 'ring-2 ring-blue-500' : ''
              }`}>
                <div className="aspect-video relative bg-gray-100">
                  {item.type === 'image' ? (
                    <Image
                      src={item.preview || item.media_url}
                      alt={item.name || `Media ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <video
                        src={item.preview || item.media_url}
                        className="w-full h-full object-cover"
                        controls={false}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Video className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimary(index)}
                      className={`${
                        item.isPrimary
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-white/90 hover:bg-white'
                      }`}
                      title="Set as primary media"
                    >
                      <Star className={`h-4 w-4 ${item.isPrimary ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMedia(index)}
                      title="Remove media"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Primary Badge */}
                  {item.isPrimary && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Primary
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    {item.type === 'image' ? (
                      <ImageIcon className="h-3 w-3" />
                    ) : (
                      <Video className="h-3 w-3" />
                    )}
                    {item.type}
                  </div>
                </div>

                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate" title={item.name}>
                    {item.name || `Media ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
