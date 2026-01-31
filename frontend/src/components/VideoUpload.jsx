import { useState } from 'react'
import api from '../lib/api'
import { Upload, X, Film, FileVideo } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

function VideoUpload({ open, onOpenChange, onVideoUploaded }) {
    const [title, setTitle] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState('')

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.type.startsWith('video/')) {
                setError('Please select a valid video file')
                return
            }
            // Validate file size (100MB max)
            if (selectedFile.size > 100 * 1024 * 1024) {
                setError('File size must be less than 100MB')
                return
            }
            setFile(selectedFile)
            setError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!title.trim()) {
            setError('Please enter a video title')
            return
        }

        if (!file) {
            setError('Please select a video file')
            return
        }

        setUploading(true)
        setProgress(0)
        setError('')

        try {
            const formData = new FormData()
            formData.append('video', file)
            formData.append('title', title)

            // api interceptor handles the token
            await api.post('/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    setProgress(percentCompleted)
                }
            })

            // Reset form
            setTitle('')
            setFile(null)
            setProgress(0)

            // Close dialog and notify
            onOpenChange(false)
            onVideoUploaded()
        } catch (err) {
            console.error('Upload error:', err)
            setError(err.response?.data?.error || 'Failed to upload video')
        } finally {
            setUploading(false)
        }
    }

    const removeFile = () => {
        setFile(null)
        setError('')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-primary" />
                        Upload New Video
                    </DialogTitle>
                    <DialogDescription>
                        Share your video with the Kortex East Zone community.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Title Input */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Video Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Q1 2026 Town Hall"
                            disabled={uploading}
                        />
                    </div>

                    {/* File Input */}
                    <div className="space-y-2">
                        <Label>Video File</Label>
                        {!file ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-muted-foreground/25">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground/75">Video files only (Max 100MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-background p-2 rounded-md">
                                        <FileVideo className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                {!uploading && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={removeFile}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Uploading...</span>
                                <span>{progress}%</span>
                            </div>
                            // Note: We need to install standard progress, or use customized one.
                            // Using standard HTML progress for simplicity if Shadcn Progress not installed yet? 
                            // I installed 'skeleton', 'badge', 'alert' but NOT 'progress'.
                            // Let's use a simple div for now to avoid error, or assume I should stick to custom div if Progress is missing.
                            // Actually 'progress' component is part of shadcn but I didn't install it. 
                            {/* Falling back to custom styled progress bar to avoid missing dependency error */}
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-primary h-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !title.trim() || !file}
                        >
                            {uploading ? 'Uploading...' : 'Upload Video'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default VideoUpload
