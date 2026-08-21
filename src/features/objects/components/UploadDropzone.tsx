import { useRef } from "react"
import { UploadCloud } from "lucide-react"

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

export function UploadDropzone({ onFilesSelected, disabled }: UploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files) return
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      onFilesSelected(files)
    }
    // reset input so the same files can be picked again
    e.target.value = ""
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-card/30 hover:bg-card/60 ${
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        multiple
        className="hidden"
      />
      <div className="p-3 bg-primary/10 rounded-full text-primary">
        <UploadCloud className="w-6 h-6" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          Drag and drop files here, or <span className="text-primary hover:underline">browse</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Supports multipart upload with progress tracking for large files
        </p>
      </div>
    </div>
  )
}
