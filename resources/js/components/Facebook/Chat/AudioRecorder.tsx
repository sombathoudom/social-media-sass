'use client';

import { FC, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Mic, Square, Play, Pause, Check, X, Loader2 } from 'lucide-react';

interface Props {
    onSend: (file: File) => void;
    onCancel: () => void;
}

const AudioRecorder: FC<Props> = ({ onSend, onCancel }) => {
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [loading, setLoading] = useState(false);

    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);

    // -----------------------------------------------------------------------
    // START RECORDING
    // -----------------------------------------------------------------------
    const startRecording = async () => {
        setAudioUrl(null);
        setAudioBlob(null);
        chunksRef.current = [];

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);

            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        };

        recorder.start();
        setRecording(true);
    };

    // -----------------------------------------------------------------------
    // STOP RECORDING
    // -----------------------------------------------------------------------
    const stopRecording = () => {
        recorderRef.current?.stop();
        setRecording(false);
    };

    // -----------------------------------------------------------------------
    // SEND AUDIO FILE
    // -----------------------------------------------------------------------
    const onSendAudio = () => {
        if (!audioBlob) return;

        setLoading(true);

        const file = new File([audioBlob], 'voice-message.webm', {
            type: 'audio/webm',
        });

        onSend(file);

        setLoading(false);
        onCancel();
    };

    // -----------------------------------------------------------------------
    // CLEANUP
    // -----------------------------------------------------------------------
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    // -----------------------------------------------------------------------
    // MAIN RENDER
    // -----------------------------------------------------------------------
    return (
        <Dialog open onOpenChange={onCancel}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <span>Voice Message</span>
                        <Button variant="ghost" size="icon" onClick={onCancel}>
                            <X className="h-5 w-5" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-6">

                    {/* RECORDING UI */}
                    {recording && (
                        <div className="flex flex-col items-center">
                            <div className="text-red-600 font-semibold mb-2">
                                Recording...
                            </div>

                            <Button
                                variant="destructive"
                                size="lg"
                                className="rounded-full h-16 w-16"
                                onClick={stopRecording}
                            >
                                <Square className="h-8 w-8" />
                            </Button>
                        </div>
                    )}

                    {/* PREVIEW UI */}
                    {!recording && audioUrl && (
                        <div className="flex flex-col items-center space-y-3">
                            <audio ref={audioRef} controls src={audioUrl} />

                            <div className="flex gap-3">
                                <Button onClick={startRecording}>
                                    Re-record
                                </Button>

                                <Button onClick={onSendAudio} disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="animate-spin h-4 w-4" />
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-1" /> Send
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* INITIAL STATE */}
                    {!recording && !audioUrl && (
                        <div className="flex flex-col items-center">
                            <Button
                                onClick={startRecording}
                                size="lg"
                                className="rounded-full h-16 w-16 bg-blue-600 hover:bg-blue-700"
                            >
                                <Mic className="h-8 w-8 text-white" />
                            </Button>

                            <div className="text-gray-500 mt-3">
                                Tap to start recording
                            </div>
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AudioRecorder;
