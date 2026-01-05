import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Bulk Audio Upload Page - Production Grade Component
 * 
 * Features:
 * - Drag-and-drop file upload
 * - Multi-file selection
 * - Real-time upload progress
 * - Detailed error reporting
 * - Upload summary
 */
const BulkUploadPage = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [category, setCategory] = useState('shoplabs');
    const [dragActive, setDragActive] = useState(false);

    // Handle file selection via input
    const handleFileSelect = useCallback((e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    }, []);

    // Handle drag events
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    // Handle drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    }, []);

    // Add files to selection
    const addFiles = (files) => {
        const audioFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'aac', 'mp4'].includes(ext);
        });

        setSelectedFiles(prev => [...prev, ...audioFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            status: 'pending'
        }))]);
    };

    // Remove file from selection
    const removeFile = (fileId) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    };

    //  Upload files
    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            selectedFiles.forEach(({ file }) => {
                formData.append('files', file);
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/audio/bulk-upload?category=${category}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            setUploadResult(result);

            if (result.success) {
                toast.success('Files uploaded successfully!');
                // Clear selected files on success
                setTimeout(() => setSelectedFiles([]), 2000);
            }
        } catch (error) {
            toast.error('Upload failed: ' + (error.message || 'Unknown error'));
            setUploadResult({
                success: false,
                message: error.message,
                total_files: selectedFiles.length,
                successful_uploads: 0,
                failed_uploads: selectedFiles.length
            });
        } finally {
            setUploading(false);
        }
    };

    // Format file size
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Bulk Audio Upload
                    </h1>
                    <p className="text-slate-600">Upload multiple call recordings for evaluation</p>
                </div>

                {/* Upload Configuration */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Upload Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={uploading}
                    >
                        <option value="shoplabs">Shoplabs</option>
                        <option value="manual_uploads">Manual Uploads</option>
                        <option value="demo">Demo</option>
                        <option value="testing">Testing</option>
                    </select>
                </div>

                {/* Drop Zone */}
                <div
                    className={`bg-white rounded-xl shadow-lg p-8 mb-6 transition-all ${dragActive ? 'border-4 border-blue-500 border-dashed bg-blue-50' : 'border-2 border-slate-200 border-dashed'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-lg font-semibold text-slate-700 mb-2">
                            Drag and drop audio files here
                        </p>
                        <p className="text-sm text-slate-500 mb-4">
                            or click to browse (WAV, MP3, FLAC, OGG, M4A, AAC, MP4)
                        </p>
                        <input
                            type="file"
                            multiple
                            accept=".wav,.mp3,.flac,.ogg,.m4a,.aac,.mp4"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                            disabled={uploading}
                        />
                        <label
                            htmlFor="file-upload"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Browse Files
                        </label>
                    </div>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Selected Files ({selectedFiles.length})
                            </h3>
                            {!uploading && (
                                <button
                                    onClick={() => setSelectedFiles([])}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {selectedFiles.map(({ id, name, size }) => (
                                <div
                                    key={id}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
                                        <p className="text-xs text-slate-500">{formatSize(size)}</p>
                                    </div>
                                    {!uploading && (
                                        <button
                                            onClick={() => removeFile(id)}
                                            className="ml-4 p-1 text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploading || selectedFiles.length === 0}
                            className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}</>
                            )}
                        </button>
                    </div>
                )}

                {/* Upload Result */}
                {uploadResult && (
                    <div className={`bg-white rounded-xl shadow-lg p-6 ${uploadResult.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                        }`}>
                        <div className="flex items-start gap-3 mb-4">
                            {uploadResult.success ? (
                                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                    {uploadResult.success ? 'Upload Successful' : 'Upload Completed with Errors'}
                                </h3>
                                <p className="text-sm text-slate-600">{uploadResult.message}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{uploadResult.successful_uploads}</p>
                                <p className="text-xs text-slate-600">Successful</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{uploadResult.failed_uploads}</p>
                                <p className="text-xs text-slate-600">Failed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{uploadResult.skipped_uploads}</p>
                                <p className="text-xs text-slate-600">Skipped</p>
                            </div>
                        </div>

                        {uploadResult.upload_batch_id && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-slate-600">Batch ID</p>
                                <p className="text-sm font-mono text-blue-800">{uploadResult.upload_batch_id}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkUploadPage;
