'use client';

import { FC, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    files: File[];
    onCancel: () => void;
    onSend: () => void;
    onRemove: (index: number) => void;
}

const ImagePreview: FC<Props> = ({ files, onCancel, onSend, onRemove }) => {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const urls = files.map(file => URL.createObjectURL(file));
        setImageUrls(urls);

        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    const readableSize = (size: number) => (size / 1024).toFixed(1) + ' KB';

    return (
        <Dialog open onOpenChange={onCancel}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <span>Image Preview ({files.length} {files.length === 1 ? 'image' : 'images'})</span>
                        <Button variant="ghost" size="icon" onClick={onCancel}>
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {/* MAIN IMAGE */}
                    <div className="relative bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                        {imageUrls[selectedIndex] && (
                            <img
                                src={imageUrls[selectedIndex]}
                                alt={`Preview ${selectedIndex + 1}`}
                                className="rounded-md max-h-96 object-contain"
                            />
                        )}
                        
                        {/* Remove Button */}
                        {files.length > 1 && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                    onRemove(selectedIndex);
                                    if (selectedIndex >= files.length - 1) {
                                        setSelectedIndex(Math.max(0, selectedIndex - 1));
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* THUMBNAIL GRID */}
                    {files.length > 1 && (
                        <div className="grid grid-cols-6 gap-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all',
                                        selectedIndex === index
                                            ? 'border-blue-600 ring-2 ring-blue-300'
                                            : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-400'
                                    )}
                                    onClick={() => setSelectedIndex(index)}
                                >
                                    <img
                                        src={imageUrls[index]}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(index);
                                            if (selectedIndex >= files.length - 1) {
                                                setSelectedIndex(Math.max(0, selectedIndex - 1));
                                            }
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* INFO */}
                    <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                        <div className="font-medium">{files[selectedIndex]?.name}</div>
                        <div className="text-xs text-gray-500">{readableSize(files[selectedIndex]?.size || 0)}</div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-between items-center gap-3 pt-2">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>

                        <div className="flex gap-2">
                            {files.length > 1 && (
                                <span className="text-sm text-gray-500 flex items-center">
                                    {selectedIndex + 1} of {files.length}
                                </span>
                            )}
                            <Button onClick={onSend} className="min-w-[120px]">
                                <Send className="h-4 w-4 mr-2" /> 
                                Send {files.length > 1 ? `${files.length} images` : 'image'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImagePreview;
