import { useState, useEffect } from 'react'
import api from '../lib/api'
import Header from '../components/Header'
import VideoCard from '../components/VideoCard'
import VideoUpload from '../components/VideoUpload'
import VideoPlayer from '../components/VideoPlayer'
import Analytics from '../components/Analytics'
import { Search, Video, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

function Dashboard() {
    const { user } = useAuth()

    const [videos, setVideos] = useState([])
    const [filteredVideos, setFilteredVideos] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedVideo, setSelectedVideo] = useState(null)
    const [showUpload, setShowUpload] = useState(false)

    // Determine user role (ensure user object exists)
    const userRole = user?.role || 'user'
    const isAdmin = userRole === 'admin'

    useEffect(() => {
        fetchVideos()
    }, [])

    useEffect(() => {
        // Filter videos based on search query
        if (searchQuery.trim()) {
            const filtered = videos.filter(video =>
                video.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredVideos(filtered)
        } else {
            setFilteredVideos(videos)
        }
    }, [searchQuery, videos])

    const fetchVideos = async () => {
        try {
            setLoading(true)
            const response = await api.get('/videos')
            setVideos(response.data)
            setFilteredVideos(response.data)
        } catch (error) {
            console.error('Error fetching videos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVideoUploaded = () => {
        setShowUpload(false)
        fetchVideos()
    }

    const [deleteVideoId, setDeleteVideoId] = useState(null)

    // ... (rest of logic)

    const handleDeleteClick = (publicId) => {
        setDeleteVideoId(publicId)
    }

    const confirmDelete = async () => {
        if (!deleteVideoId) return

        try {
            await api.delete(`/videos/${deleteVideoId}`)
            toast.success("Video deleted successfully")
            fetchVideos()
        } catch (error) {
            console.error('Error deleting video:', error)
            toast.error("Failed to delete video")
        } finally {
            setDeleteVideoId(null)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 text-foreground">
            <Header userRole={userRole} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-purple-100 via-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">{user?.firstName || user?.username || 'User'}</span>
                        </h2>
                        <p className="text-slate-600 mt-2 text-lg">
                            {isAdmin ? 'Manage your video library and view analytics.' : 'Browse and watch your favorite videos.'}
                        </p>
                    </div>

                    {isAdmin && (
                        <Button
                            onClick={() => setShowUpload(true)}
                            className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg px-6 py-6 h-auto text-base"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Upload Video
                        </Button>
                    )}
                </div>

                {/* Analytics Section (Admin only) */}
                {isAdmin && videos.length > 0 && !loading && (
                    <Analytics videos={videos} />
                )}

                {/* Search and Filter */}
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-300 transition-all duration-300 max-w-md">
                    <Search className="w-5 h-5 text-purple-600" />
                    <Input
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400 h-10 text-base"
                    />
                </div>

                {/* Videos Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-[225px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-dashed">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <Video className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">No videos found</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm text-center">
                            {searchQuery ? 'Try adjusting your search terms.' : 'Get started by uploading your first video.'}
                        </p>
                        {isAdmin && !searchQuery && (
                            <Button variant="link" onClick={() => setShowUpload(true)} className="mt-2 text-primary">
                                Upload a video
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredVideos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                isAdmin={isAdmin}
                                onPlay={() => setSelectedVideo(video)}
                                onDelete={() => handleDeleteClick(video.public_id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <VideoPlayer
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}

            {/* Upload Dialog */}
            {isAdmin && (
                <VideoUpload
                    open={showUpload}
                    onOpenChange={setShowUpload}
                    onVideoUploaded={handleVideoUploaded}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteVideoId} onOpenChange={() => setDeleteVideoId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the video
                            from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Video
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default Dashboard
