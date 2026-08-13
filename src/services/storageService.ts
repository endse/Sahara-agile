import { TaskAttachment } from '../types';

export const uploadTaskAttachment = async (
  taskId: string,
  file: File,
  uploaderName: string = 'Field Operator'
): Promise<TaskAttachment> => {
  const attachmentId = `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const storagePath = `tasks/${taskId}/${Date.now()}_${file.name}`;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });

  return {
    id: attachmentId,
    name: file.name,
    url: dataUrl,
    size: file.size,
    type: file.type || 'application/octet-stream',
    uploadedAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    uploadedBy: uploaderName,
    storagePath: storagePath,
  };
};

export const deleteTaskAttachment = async (storagePath?: string): Promise<void> => {
  // Mock deletion
  console.log('[storage] Attachment removed:', storagePath);
};
