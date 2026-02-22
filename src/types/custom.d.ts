declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}

interface FileSystemDirectoryHandle {
  getFileHandle(name: string, opts?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, opts?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
}

interface FileSystemFileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
  kind: 'file';
  name: string;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  close(): Promise<void>;
}

interface Window {
  showDirectoryPicker?(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
}