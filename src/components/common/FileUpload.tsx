import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, File, FileText, Image, Video, Music, Archive, FileX, CheckCircle } from 'lucide-react'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

interface FileWithPreview extends File {
  id: string
  preview?: string
  uploadProgress?: number
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error'
}

export function FileUpload({ 
  onFilesSelected, 
  maxFiles = 5, 
  maxFileSize = 10, 
  acceptedTypes = ['*/*'],
  className = '' 
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0]
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-400" />
      case 'video':
        return <Video className="h-5 w-5 text-purple-400" />
      case 'audio':
        return <Music className="h-5 w-5 text-green-400" />
      case 'application':
        if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('tar')) {
          return <Archive className="h-5 w-5 text-orange-400" />
        }
        return <FileText className="h-5 w-5 text-slate-400" />
      default:
        return <File className="h-5 w-5 text-slate-400" />
    }
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type if specific types are specified
    if (acceptedTypes.length > 0 && !acceptedTypes.includes('*/*')) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''))
        }
        return file.type === type
      })
      if (!isAccepted) {
        return `File type ${file.type} is not accepted`
      }
    }

    return null
  }

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithPreview[] = []
    const errors: string[] = []

    Array.from(fileList).forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
        return
      }

      const fileWithPreview: FileWithPreview = {
        ...file,
        id: Math.random().toString(36).substr(2, 9),
        uploadStatus: 'pending'
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          fileWithPreview.preview = e.target?.result as string
          setFiles(prev => prev.map(f => f.id === fileWithPreview.id ? fileWithPreview : f))
        }
        reader.readAsDataURL(file)
      }

      newFiles.push(fileWithPreview)
    })

    if (errors.length > 0) {
      setError(errors.join(', '))
      setTimeout(() => setError(''), 5000)
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
      setFiles(updatedFiles)
      onFilesSelected(updatedFiles)
    }
  }, [files, maxFiles, acceptedTypes, maxFileSize, onFilesSelected])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (fileList) {
      processFiles(fileList)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const fileList = e.dataTransfer.files
    if (fileList) {
      processFiles(fileList)
    }
  }, [processFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-purple-400 bg-purple-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-slate-400" />
          </div>
          
          <div>
            <p className="text-white font-medium">
              Drop files here or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                browse
              </button>
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Max {maxFiles} files, {maxFileSize}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Selected Files ({files.length}/{maxFiles})</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{file.name}</p>
                    <p className="text-slate-400 text-xs">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.uploadStatus === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                  {file.uploadStatus === 'error' && (
                    <FileX className="h-4 w-4 text-red-400" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 