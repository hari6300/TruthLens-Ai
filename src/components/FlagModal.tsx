import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertTriangle,
  Flag,
  Check,
  UploadCloud,
  Image as ImageIcon,
  Mic,
  Video as VideoIcon,
  FileText,
  Trash2,
  FileAudio,
  FileVideo,
  Link as LinkIcon
} from 'lucide-react';

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    title?: string;
    url?: string;
    category?: string;
  } | null;
  onFlagSubmitted?: () => void;
}

export const FlagModal: React.FC<FlagModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onFlagSubmitted
}) => {
  const [contentTitle, setContentTitle] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [contentType, setContentType] = useState<'TEXT_DISINFO' | 'IMAGE_DEEPFAKE' | 'VOICE_CLONE' | 'VIDEO_DEEPFAKE' | 'SOCIAL_LINK'>('TEXT_DISINFO');
  const [category, setCategory] = useState('SOCIAL_DISINFO');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [userReason, setUserReason] = useState('');
  const [textContent, setTextContent] = useState('');
  
  // Media upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.title) setContentTitle(initialData.title);
      if (initialData.url) setContentUrl(initialData.url);
      if (initialData.category) {
        const cat = initialData.category.toUpperCase();
        if (cat.includes('IMAGE') || cat.includes('PHOTO')) {
          setContentType('IMAGE_DEEPFAKE');
        } else if (cat.includes('VOICE') || cat.includes('AUDIO')) {
          setContentType('VOICE_CLONE');
        } else if (cat.includes('VIDEO')) {
          setContentType('VIDEO_DEEPFAKE');
        } else if (cat.includes('LINK') || cat.includes('URL')) {
          setContentType('SOCIAL_LINK');
        } else {
          setContentType('TEXT_DISINFO');
        }
        setCategory(initialData.category);
      }
    }
  }, [initialData]);

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setMediaPreview(null);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Switch content type & clear media if type changed
  const handleContentTypeChange = (newType: any) => {
    setContentType(newType);
    setSelectedFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentTitle.trim() || !userReason.trim()) {
      setError('Please fill in the content title and reason for flagging.');
      return;
    }

    if (contentType === 'TEXT_DISINFO' && !textContent.trim() && !contentTitle.trim()) {
      setError('Please provide the suspicious text content or claim.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentTitle,
          contentUrl: contentUrl || undefined,
          contentType,
          userReason,
          category,
          severity,
          flaggedBy: 'Community Investigator',
          mediaUrl: mediaPreview || undefined,
          mediaName: selectedFile?.name || undefined,
          mediaSize: selectedFile?.size || undefined,
          textContent: textContent || undefined
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit community flag');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onFlagSubmitted) onFlagSubmitted();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error submitting flag');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Flag Suspicious Content</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Report synthetic media, fake news or deception cues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-10 text-center space-y-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Threat Successfully Flagged!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recorded in TruthLens Community Threat Repository</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Content Title / Threat Headline *</label>
              <input
                type="text"
                placeholder="e.g. Fabricated audio clip claiming emergency economic curfew"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Content Type & Severity Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => handleContentTypeChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="TEXT_DISINFO">Text</option>
                  <option value="IMAGE_DEEPFAKE">Image</option>
                  <option value="VOICE_CLONE">Voice</option>
                  <option value="VIDEO_DEEPFAKE">Video</option>
                  <option value="SOCIAL_LINK">Social Media Link</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Severity Rating</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="low">Low Impact</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Threat</option>
                  <option value="critical">Critical Severity</option>
                </select>
              </div>
            </div>

            {/* DYNAMIC FIELD ACCORDING TO CONTENT TYPE */}
            {/* 1. TEXT OR SOCIAL LINK -> SHOW TEXT AREA */}
            {(contentType === 'TEXT_DISINFO' || contentType === 'SOCIAL_LINK') && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Suspicious Content / Text Area {contentType === 'TEXT_DISINFO' && '*'}</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste or type the suspicious headline, claim text, quote, or social post body here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            {/* 2. IMAGE -> SHOW UPLOAD THE IMAGE */}
            {contentType === 'IMAGE_DEEPFAKE' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                    Upload the Image
                  </span>
                  {selectedFile && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  )}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to upload image or drag & drop here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports PNG, JPG, JPEG, WEBP, GIF (up to 20MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileChange(null)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {mediaPreview && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-44 bg-black/5 flex items-center justify-center">
                        <img
                          src={mediaPreview}
                          alt="Uploaded suspicious content preview"
                          className="max-h-44 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. VOICE -> SHOW UPLOAD AUDIO */}
            {contentType === 'VOICE_CLONE' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-purple-500" />
                    Upload Audio
                  </span>
                  {selectedFile && (
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  )}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/mp3, audio/wav, audio/m4a, audio/ogg, audio/aac, audio/*"
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="p-2.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                      <FileAudio className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to upload audio or drag & drop clip here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports MP3, WAV, M4A, OGG, AAC (up to 50MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileAudio className="w-4 h-4 text-purple-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileChange(null)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Remove audio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {mediaPreview && (
                      <audio controls src={mediaPreview} className="w-full h-9 rounded-lg" />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. VIDEO -> SHOW UPLOAD VIDEO */}
            {contentType === 'VIDEO_DEEPFAKE' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <VideoIcon className="w-3.5 h-3.5 text-amber-500" />
                    Upload Video
                  </span>
                  {selectedFile && (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  )}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4, video/webm, video/quicktime, video/x-msvideo, video/*"
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="p-2.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <FileVideo className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to upload video or drag & drop clip here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports MP4, WEBM, MOV (up to 100MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileVideo className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileChange(null)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Remove video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {mediaPreview && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-44 bg-black flex items-center justify-center">
                        <video
                          controls
                          src={mediaPreview}
                          className="max-h-44 w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Target URL / Source Link (shown for Social Link or optional source) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Target URL / Source Link {contentType === 'SOCIAL_LINK' ? '*' : '(Optional)'}</span>
              </label>
              <input
                type="text"
                placeholder="https://example.com/suspicious-post-or-video"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Reason for Flagging */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Reason for Flagging / Deception Cues *
              </label>
              <textarea
                rows={3}
                placeholder="Explain why this content is deceptive (e.g. artificial lip-sync artifacts, cloned speech cadence, missing source context, doctored frames)..."
                value={userReason}
                onChange={(e) => setUserReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Flag...' : 'Submit Flag Report'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

