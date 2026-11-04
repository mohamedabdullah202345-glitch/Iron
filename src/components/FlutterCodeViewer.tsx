import React, { useState } from 'react';
import { FLUTTER_PROJECT_FILES, FlutterFile } from '../flutterCode/flutterProject';
import { Copy, Check, Download, Code2, FolderGit2 } from 'lucide-react';

interface FlutterCodeViewerProps {
  onClose?: () => void;
}

export const FlutterCodeViewer: React.FC<FlutterCodeViewerProps> = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_PROJECT_FILES[1]); // lib/main.dart
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const bundle: Record<string, string> = {};
    FLUTTER_PROJECT_FILES.forEach((f) => {
      bundle[f.path] = f.content;
    });

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iron-flutter-codebase.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl flex flex-col my-4">
      {/* Top Banner */}
      <div className="bg-[#181818] border-b border-[#2a2a2a] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#e11d1d]/20 border border-[#e11d1d]/40 flex items-center justify-center text-[#ff5c5c]">
            <Code2 size={16} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white uppercase tracking-wider flex items-center gap-2">
              Flutter 3.x Source Code
              <span className="text-[10px] bg-[#e11d1d]/20 text-[#ff5c5c] font-mono px-1.5 py-0.5 rounded border border-[#e11d1d]/40">
                Dart
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Ready to paste into VS Code or Android Studio (`flutter run`)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] text-white rounded-md border border-[#333333] flutter-tap transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy File'}
          </button>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#e11d1d] hover:bg-[#c91818] text-white rounded-md flutter-tap transition-colors"
          >
            <Download size={14} />
            Export Bundle
          </button>
        </div>
      </div>

      {/* Main File Explorer Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#222222] min-h-[440px]">
        {/* Sidebar File Tree */}
        <div className="p-3 bg-[#0d0d0d] space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 px-2 py-1 flex items-center gap-1">
            <FolderGit2 size={13} /> Project Files
          </div>
          {FLUTTER_PROJECT_FILES.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-mono transition-colors flex flex-col gap-0.5 ${
                  isSelected
                    ? 'bg-[#1f1616] text-[#ff6c6c] border border-[#e11d1d]/40 font-bold'
                    : 'text-neutral-300 hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <span className="truncate">{file.path}</span>
                <span className="text-[10px] text-neutral-400 font-sans truncate">
                  {file.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Code Content View */}
        <div className="md:col-span-3 flex flex-col bg-[#080808]">
          <div className="px-4 py-2 bg-[#121212] border-b border-[#222222] flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>{selectedFile.path}</span>
            <span className="uppercase text-[10px] text-neutral-400">{selectedFile.language}</span>
          </div>

          <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-200 leading-relaxed max-h-[500px] overflow-y-auto selection:bg-[#e11d1d]/40">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
