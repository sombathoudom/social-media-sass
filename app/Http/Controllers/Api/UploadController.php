<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:51200', // 50MB max
        ]);

        try {
            $file = $request->file('file');
            $path = $file->store('posts', 'public');

            return response()->json([
                'url' => url('storage/' . $path),
                'path' => $path,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to upload file',
            ], 500);
        }
    }
}
