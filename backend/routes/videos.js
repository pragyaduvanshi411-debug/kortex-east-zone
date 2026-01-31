import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { requireAuth, requireAdmin, requireUser } from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept video files only
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'), false);
        }
    }
});

// Path to videos.json file
const videosFilePath = path.join(__dirname, '../data/videos.json');

// Helper function to read videos from JSON file
async function readVideos() {
    try {
        const data = await fs.readFile(videosFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write videos to JSON file
async function writeVideos(videos) {
    await fs.writeFile(videosFilePath, JSON.stringify(videos, null, 2));
}

// GET all videos - accessible by both Admin and User
router.get('/', requireAuth, requireUser, async (req, res) => {
    try {
        const videos = await readVideos();
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// POST upload video - Admin only
router.post('/upload', requireAuth, requireAdmin, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Video title is required' });
        }

        // Local File Storage Implementation for MVP
        const fileName = `video_${Date.now()}_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
        const filePath = path.join(__dirname, '../uploads', fileName);

        // Ensure uploads directory exists (just in case)
        await fs.mkdir(path.join(__dirname, '../uploads'), { recursive: true });

        // Write file buffer to disk
        await fs.writeFile(filePath, req.file.buffer);

        // Construct URL based on current environment
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const result = {
            public_id: fileName,
            secure_url: `${baseUrl}/uploads/${fileName}`,
            duration: 0, // Duration calculation skipped
            format: 'mp4'
        };

        // Create video metadata
        const videoMetadata = {
            id: Date.now().toString(),
            title,
            public_id: result.public_id,
            secure_url: result.secure_url,
            uploadedBy: req.auth.userId,
            createdAt: new Date().toISOString(),
            duration: result.duration,
            format: result.format,
            views: 0 // Initialize views
        };

        // Save to videos.json
        const videos = await readVideos();
        videos.push(videoMetadata);
        await writeVideos(videos);

        res.status(201).json({
            message: 'Video uploaded successfully',
            video: videoMetadata
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

// POST increment view count - User/Admin
router.post('/:publicId/view', async (req, res) => {
    try {
        const { publicId } = req.params;
        const videos = await readVideos();
        const videoIndex = videos.findIndex(v => v.public_id === publicId);

        if (videoIndex === -1) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Initialize views if not present (migration for old data)
        if (!videos[videoIndex].views) {
            videos[videoIndex].views = 0;
        }

        videos[videoIndex].views += 1;
        await writeVideos(videos);

        res.json({
            message: 'View counted',
            views: videos[videoIndex].views
        });
    } catch (error) {
        console.error('Error incrementing view:', error);
        res.status(500).json({ error: 'Failed to increment view count' });
    }
});

// DELETE video - Admin only
router.delete('/:publicId', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { publicId } = req.params;

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

        // Remove from videos.json
        let videos = await readVideos();
        videos = videos.filter(video => video.public_id !== publicId);
        await writeVideos(videos);

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

export default router;
