import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
    Image as ImageIcon, 
    Video, 
    Smile, 
    X, 
    Loader2,
    Upload
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    pageId: number;
    onClose: () => void;
    onSuccess: () => void;
}

interface PhotoWithCaption {
    file: File;
    preview: string;
    caption?: string;
}

interface VideoData {
    file: File;
    preview: string;
}

export default function CreatePostModal({ pageId, onClose, onSuccess }: Props) {
    const [message, setMessage] = useState('');
    const [photos, setPhotos] = useState<PhotoWithCaption[]>([]);
    const [video, setVideo] = useState<VideoData | null>(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);

    const photoInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newPhotos: PhotoWithCaption[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const preview = URL.createObjectURL(file);
            newPhotos.push({ file, preview, caption: '' });
        }

        setPhotos(prev => [...prev, ...newPhotos]);
        setVideo(null); // Clear video if photos are added
        toast.success(`${newPhotos.length} photo(s) selected`);
        
        // Reset input
        if (photoInputRef.current) {
            photoInputRef.current.value = '';
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);
        setVideo({ file, preview });
        setPhotos([]); // Clear photos if video is added
        toast.success('Video selected');
        
        // Reset input
        if (videoInputRef.current) {
            videoInputRef.current.value = '';
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // Revoke the object URL to free memory
            URL.revokeObjectURL(prev[index].preview);
            return updated;
        });
        if (editingPhotoIndex === index) {
            setEditingPhotoIndex(null);
        }
    };

    const updatePhotoCaption = (index: number, caption: string) => {
        setPhotos(prev => prev.map((photo, i) => 
            i === index ? { ...photo, caption } : photo
        ));
    };

    const handleSubmit = async () => {
        if (!message.trim() && photos.length === 0 && !video) {
            toast.error('Please add some content to your post');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('message', message);

        // Upload photos
        if (photos.length > 0) {
            photos.forEach((photo, index) => {
                formData.append(`photos[${index}]`, photo.file);
                formData.append(`photo_captions[${index}]`, photo.caption || '');
            });
        }

        // Upload video
        if (video) {
            formData.append('video', video.file);
        }

        router.post(`/facebook/pages/${pageId}/posts/create`, formData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Post created successfully!');
                
                // Clean up object URLs
                photos.forEach(photo => URL.revokeObjectURL(photo.preview));
                if (video) URL.revokeObjectURL(video.preview);
                
                onSuccess();
                onClose();
            },
            onError: (errors) => {
                console.error('Failed to create post:', errors);
                const errorMessage = Object.values(errors)[0] as string || 'Failed to create post';
                toast.error(errorMessage);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Create Post
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Text Area */}
                    <div className="relative">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="What's on your mind?"
                            className="min-h-[150px] text-lg resize-none"
                        />
                        
                        {/* Emoji Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-2 right-2"
                            onClick={() => setShowEmoji(!showEmoji)}
                        >
                            <Smile className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmoji && (
                        <div className="border rounded-lg p-2">
                            <EmojiPicker
                                open
                                onEmojiClick={(emoji) => {
                                    setMessage(prev => prev + emoji.emoji);
                                    setShowEmoji(false);
                                }}
                                width="100%"
                            />
                        </div>
                    )}

                    {/* Photo Preview Grid */}
                    {photos.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Photos ({photos.length})
                                </h3>
                                {photos.length > 1 && (
                                    <span className="text-xs text-gray-500">Click photo to add caption</span>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {photos.map((photo, index) => (
                                    <div key={index} className="relative group">
                                        <div 
                                            className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer"
                                            onClick={() => setEditingPhotoIndex(editingPhotoIndex === index ? null : index)}
                                        >
                                            <img
                                                src={photo.preview}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {photo.caption && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                                                    {photo.caption}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removePhoto(index);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        {editingPhotoIndex === index && (
                                            <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded-lg"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Caption Input for Selected Photo */}
                            {editingPhotoIndex !== null && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Caption for Photo {editingPhotoIndex + 1}
                                    </label>
                                    <input
                                        type="text"
                                        value={photos[editingPhotoIndex]?.caption || ''}
                                        onChange={(e) => updatePhotoCaption(editingPhotoIndex, e.target.value)}
                                        placeholder="Add a caption for this photo..."
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Video Preview */}
                    {video && (
                        <div className="relative rounded-lg overflow-hidden">
                            <video src={video.preview} controls className="w-full max-h-96" />
                            <button
                                onClick={() => {
                                    URL.revokeObjectURL(video.preview);
                                    setVideo(null);
                                }}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Media Upload Buttons */}
                    <div className="flex gap-2 p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handlePhotoUpload}
                            disabled={!!video || loading}
                        />
                        <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoUpload}
                            disabled={photos.length > 0 || loading}
                        />

                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => photoInputRef.current?.click()}
                            disabled={!!video || loading}
                        >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Add Photos
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={photos.length > 0 || loading}
                        >
                            <Video className="h-4 w-4 mr-2" />
                            Add Video
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Post
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
