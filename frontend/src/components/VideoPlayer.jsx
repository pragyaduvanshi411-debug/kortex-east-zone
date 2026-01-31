import { X } from 'lucide-react'
import { useEffect } from 'react'
import api from '../lib/api'

function VideoPlayer({ video, onClose }) {
    // Close on ESC key and Increment View
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)

        // Increment view count
        const incrementView = async () => {
            try {
                await api.post(`/videos/${video.public_id}/view`);
            } catch (error) {
                console.error('Failed to increment view count', error);
            }
        };

        incrementView();

        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose, video.public_id])

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* Video Title */}
                <h2 className="text-white text-2xl font-bold mb-4">{video.title}</h2>

                {/* Video Player */}
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                    <video
                        src={video.secure_url}
                        controls
                        autoPlay
                        className="w-full"
                        controlsList="nodownload"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Video Details */}
                <div className="mt-4 text-gray-300 text-sm">
                    <p>Format: {video.format?.toUpperCase() || 'N/A'}</p>
                    <p>Uploaded: {new Date(video.createdAt).toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer
