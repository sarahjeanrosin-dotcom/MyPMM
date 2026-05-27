import { useState, useRef } from 'react';

export default function FileUpload({ files = [], onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const acceptedTypes = '.pdf,.docx,.txt';
  const acceptedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

  function handleFiles(fileList) {
    const newFiles = Array.from(fileList)
      .filter(f => acceptedMimes.includes(f.type) || f.name.match(/\.(pdf|docx|txt)$/i))
      .map(f => f.name)
      .filter(name => !files.includes(name));
    if (newFiles.length > 0) {
      onChange([...files, ...newFiles]);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleInputChange(e) {
    handleFiles(e.target.files);
    e.target.value = '';
  }

  function removeFile(name) {
    onChange(files.filter(f => f !== name));
  }

  function getFileIcon(name) {
    if (name.endsWith('.pdf')) return '📄';
    if (name.endsWith('.docx')) return '📝';
    if (name.endsWith('.txt')) return '📃';
    return '📎';
  }

  return (
    <div>
      <label className="genea-label">Supporting Files <span className="font-normal text-gray-400">(optional)</span></label>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-genea-bright bg-genea-light scale-[1.01]'
            : 'border-gray-300 bg-gray-50 hover:border-genea-blue hover:bg-genea-light'
          }
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <svg className={`w-10 h-10 ${isDragging ? 'text-genea-bright' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-600">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-gray-400">or click to browse</p>
          <p className="text-xs text-gray-400">PDF, DOCX, TXT — V1 stores file names only</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map(name => (
            <div key={name} className="flex items-center justify-between bg-genea-light rounded-lg px-4 py-2.5 border border-genea-bright/30">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getFileIcon(name)}</span>
                <span className="text-sm font-medium text-genea-navy truncate max-w-xs">{name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(name); }}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                title="Remove file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
