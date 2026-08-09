import React, { useState, useRef } from 'react';
import { TaskAttachment } from '../types';
import { uploadTaskAttachment, deleteTaskAttachment } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

interface TaskAttachmentsManagerProps {
  taskId: string;
  attachments?: TaskAttachment[];
  onAttachmentsChange: (newAttachments: TaskAttachment[]) => void;
  readOnly?: boolean;
}

export const TaskAttachmentsManager: React.FC<TaskAttachmentsManagerProps> = ({
  taskId,
  attachments = [],
  onAttachmentsChange,
  readOnly = false,
}) => {
  const { userProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploaderName = userProfile?.displayName || 'Field Operator';

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    const uploadedList: TaskAttachment[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        // max file size ~ 25MB check
        if (file.size > 25 * 1024 * 1024) {
          setError(`File "${file.name}" exceeds 25MB limit.`);
          continue;
        }

        const newAtt = await uploadTaskAttachment(taskId, file, uploaderName);
        uploadedList.push(newAtt);
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      if (uploadedList.length > 0) {
        onAttachmentsChange([...attachments, ...uploadedList]);
      }
    } catch (err: any) {
      console.error('Error attaching file:', err);
      setError('Failed to upload attachment. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly) setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (readOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async (attToDelete: TaskAttachment) => {
    if (readOnly) return;
    if (attToDelete.storagePath) {
      await deleteTaskAttachment(attToDelete.storagePath);
    }
    const updated = attachments.filter((a) => a.id !== attToDelete.id);
    onAttachmentsChange(updated);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIconInfo = (type: string, name: string) => {
    const isImage = type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
    const isPdf = type.includes('pdf') || /\.pdf$/i.test(name);
    const isDoc = type.includes('word') || type.includes('document') || /\.(doc|docx|txt)$/i.test(name);
    const isSpreadsheet = type.includes('sheet') || type.includes('excel') || type.includes('csv') || /\.(xls|xlsx|csv)$/i.test(name);

    if (isImage) return { icon: 'image', label: 'Image', color: 'text-amber-600 bg-amber-500/10' };
    if (isPdf) return { icon: 'picture_as_pdf', label: 'PDF Document', color: 'text-rose-600 bg-rose-500/10' };
    if (isSpreadsheet) return { icon: 'table_chart', label: 'Spreadsheet', color: 'text-emerald-600 bg-emerald-500/10' };
    if (isDoc) return { icon: 'description', label: 'Document', color: 'text-blue-600 bg-blue-500/10' };
    return { icon: 'attach_file', label: 'Attachment', color: 'text-[#8B5E3C] bg-[#8B5E3C]/10' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#8B5E3C]">attach_file</span>
          <h4 className="font-bold text-xs text-[#3D3028] uppercase tracking-wider">
            Attachments & Telemetry Files ({attachments.length})
          </h4>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-[#606C38] hover:text-[#4d572d] font-bold flex items-center gap-1 bg-[#FEFAE0] border border-[#E9EDC9] px-3 py-1 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            <span>Attach File</span>
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      {!readOnly && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            dragActive
              ? 'border-[#606C38] bg-[#606C38]/10 scale-[1.01]'
              : 'border-[#E5D5C0] bg-[#FDF8F3] hover:bg-white hover:border-[#D4A373]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-full bg-[#D4A373]/20 text-[#8B5E3C] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">cloud_upload</span>
          </div>

          <div>
            <p className="text-xs font-bold text-[#3D3028]">
              Click or drag images & documents to attach
            </p>
            <p className="text-[10px] text-[#8B5E3C] mt-0.5">
              Supports PNG, JPG, PDF, DOCX, CSV, TXT (hosted on Firebase Storage)
            </p>
          </div>
        </div>
      )}

      {/* Uploading Progress */}
      {isUploading && (
        <div className="p-3 bg-[#FEFAE0] border border-[#E9EDC9] rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-[#606C38] font-bold">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-[#606C38] border-t-transparent rounded-full animate-spin" />
              Uploading to Firebase Storage...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-[#E5D5C0] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#606C38] h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-[#BC4749]/10 border border-[#BC4749]/30 text-[#BC4749] text-xs font-medium rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Attachments List / Grid */}
      {attachments.length === 0 ? (
        <p className="text-xs text-[#8B5E3C] italic text-center py-3 bg-[#FDF8F3] rounded-2xl border border-[#F3E9DC]">
          No files attached to this task yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((att) => {
            const isImage = att.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.name);
            const iconInfo = getFileIconInfo(att.type, att.name);

            return (
              <div
                key={att.id}
                className="p-3 bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl flex items-start justify-between gap-3 hover:bg-white transition-all shadow-2xs group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Image Thumbnail or File Icon */}
                  {isImage ? (
                    <div
                      onClick={() => setPreviewImage({ url: att.url, name: att.name })}
                      className="w-12 h-12 rounded-xl border border-[#E5D5C0] overflow-hidden shrink-0 cursor-pointer bg-stone-100 group-hover:scale-105 transition-transform"
                    >
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconInfo.color}`}
                    >
                      <span className="material-symbols-outlined text-2xl">{iconInfo.icon}</span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-[#3D3028] truncate" title={att.name}>
                      {att.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#8B5E3C]">
                      <span>{formatFileSize(att.size)}</span>
                      <span>•</span>
                      <span>{att.uploadedAt}</span>
                    </div>
                    {att.uploadedBy && (
                      <p className="text-[9.5px] text-[#D4A373] font-semibold">
                        Uploaded by {att.uploadedBy}
                      </p>
                    )}
                  </div>
                </div>

                {/* File Action Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  {isImage && (
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ url: att.url, name: att.name })}
                      className="p-1.5 text-[#8B5E3C] hover:text-[#3D3028] hover:bg-[#E5D5C0]/50 rounded-lg transition-colors"
                      title="Preview Image"
                    >
                      <span className="material-symbols-outlined text-base">visibility</span>
                    </button>
                  )}

                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#8B5E3C] hover:text-[#3D3028] hover:bg-[#E5D5C0]/50 rounded-lg transition-colors"
                    title="Open / Download Document"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                  </a>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleDelete(att)}
                      className="p-1.5 text-[#BC4749]/70 hover:text-[#BC4749] hover:bg-[#BC4749]/10 rounded-lg transition-colors"
                      title="Remove Attachment"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-3xl p-4 max-w-3xl w-full max-h-[90vh] flex flex-col space-y-3 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E5D5C0]">
              <span className="text-xs font-bold text-[#3D3028] truncate max-w-md">
                {previewImage.name}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 text-[#8B5E3C] hover:text-[#3D3028] rounded-full hover:bg-[#E5D5C0]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center min-h-[300px] bg-stone-900 rounded-2xl p-2">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[70vh] object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <a
                href={previewImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#606C38] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-[#4d572d]"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Open Original Image</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
