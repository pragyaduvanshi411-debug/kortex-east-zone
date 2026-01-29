import { useState } from 'react'
import { Play, Trash2, Clock, BarChart, Video } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function VideoCard({ video, isAdmin, onPlay, onDelete }) {
    const formatDuration = (duration) => {
        if (!duration) return 'N/A'
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const [imgError, setImgError] = useState(false)

    // Helper to determine thumbnail URL
    const getThumbnailUrl = (url) => {
        if (url && url.includes('cloudinary')) {
            return `${url.replace('/upload/', '/upload/w_400,h_225,c_fill/')}.jpg`
        }
        return null
    }

    const thumbnailUrl = getThumbnailUrl(video.secure_url)

    return (
        <Card className="group overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white">
            {/* Video Thumbnail */}
            <div className="relative aspect-video bg-gray-900 overflow-hidden flex items-center justify-center">
                {thumbnailUrl && !imgError ? (
                    <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 gap-2">
                        <Video className="w-12 h-12 opacity-50" />
                    </div>
                )}

                {/* Play Overlay */}
                <div
                    onClick={onPlay}
                    className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                    <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300 drop-shadow-2xl">
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-white/20 hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 ml-1 text-white fill-white" />
                        </Button>
                    </div>
                </div>

                {/* Duration Badge */}
                {video.duration > 0 && (
                    <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/80 text-white border-0 gap-1 text-[10px] h-5 px-1.5">
                        <Clock className="w-3 h-3" />
                        {formatDuration(video.duration)}
                    </Badge>
                )}
            </div>

            {/* Video Info */}
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(video.createdAt)}</span>
                    <span className="flex items-center gap-1">
                        <BarChart className="w-3 h-3" />
                        {video.views || 0} views
                    </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 gap-3">
                <Button
                    onClick={onPlay}
                    className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg border-0"
                >
                    <Play className="w-4 h-4 fill-current" />
                    Play
                </Button>

                {isAdmin && (
                    <Button
                        onClick={onDelete}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg border-0"
                        size="icon"
                        title="Delete video"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

export default VideoCard
