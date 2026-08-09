import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { TaskAttachment } from '../types';

export const uploadTaskAttachment = async (
  taskId: string,
  file: File,
  uploaderName: string = 'Field Operator'
): Promise<TaskAttachment> => {
  const attachmentId = `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `tasks/${taskId}/${Date.now()}_${cleanFileName}`;

  try {
    // Attempt Firebase Storage upload
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      id: attachmentId,
      name: file.name,
      url: downloadURL,
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
  } catch (err) {
    console.warn('Firebase Storage upload failed/fallback to Data URL:', err);

    // Fallback: Read file as Data URL if storage bucket fails or isn't reachable
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
    };
  }
};

export const deleteTaskAttachment = async (storagePath?: string): Promise<void> => {
  if (!storagePath) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (err) {
    console.warn('Could not delete file from Firebase storage:', err);
  }
};
