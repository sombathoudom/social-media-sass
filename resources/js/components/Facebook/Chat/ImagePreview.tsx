'use client';

import { FC, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Send } from 'lucide-react';

interface Props {
    file: File;
    onCancel: () => void;
    onSend: () => void;
}

const ImagePreview: FC<Props> = ({ file, onCancel, onSend }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const readableSize = (file.size / 1024).toFixed(1) + ' KB';

    return (
        <Dialog open onOpenChange={onCancel}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <span>Image Preview</span>
                        <Button variant="ghost" size="icon" onClick={onCancel}>
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                {/* IMAGE */}
                <div className="mt-4 flex flex-col items-center">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Preview"
                            className="rounded-md max-h-80 object-contain"
                        />
                    )}

                    {/* INFO */}
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 text-center">
                        <div>{file.name}</div>
                        <div>{readableSize}</div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 mt-4 w-full">
                        <Button variant="secondary" onClick={onCancel}>
                            Cancel
                        </Button>

                        <Button onClick={onSend}>
                            <Send className="h-4 w-4 mr-1" /> Send
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImagePreview;
