import React, { useState } from 'react';
import { 
  X, 
  Github, 
  ExternalLink, 
  Copy, 
  Check, 
  GitBranch, 
  Terminal, 
  FolderGit2, 
  Share2, 
  Code2
} from 'lucide-react';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState('yuvashri9b');
  const [repoName, setRepoName] = useState('rescue-swarm-usar-ai');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const gitUrl = `https://github.com/${username}/${repoName}`;
  const gitCloneCommand = `git clone ${gitUrl}.git`;

  const pushCommands = [
    `git init`,
    `git add .`,
    `git commit -m "feat: Rescue Swarm - Autonomous Multi-Drone Disaster Triage System"`,
    `git branch -M main`,
    `git remote add origin https://github.com/${username}/${repoName}.git`,
    `git push -u origin main`
  ].join('\n');

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-white border border-slate-700">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                GITHUB REPOSITORY INTEGRATION
                <span className="px-2 py-0.2 rounded bg-sky-950 text-sky-300 font-mono text-[10px] border border-sky-800">
                  OPEN SOURCE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Connect Rescue Swarm Project to your GitHub account
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 font-mono text-xs overflow-y-auto">
          {/* Target GitHub Repository URL */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2 text-xs font-bold text-white">
                <FolderGit2 className="w-4 h-4 text-amber-400" />
                TARGET REPOSITORY URL
              </span>

              <a
                href={gitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 underline"
              >
                <span>Open on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">GITHUB USERNAME</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">REPOSITORY NAME</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-emerald-400 truncate">{gitUrl}</span>
              <button
                onClick={() => handleCopy(gitUrl, 0)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-[10px]"
              >
                {copiedIndex === 0 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 0 ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          {/* Git Push Commands */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                PUSH CODE TO YOUR GITHUB REPO
              </span>
              <button
                onClick={() => handleCopy(pushCommands, 1)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 transition cursor-pointer text-[10px]"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'Copied All Commands' : 'Copy All Commands'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
              <code>{pushCommands}</code>
            </pre>
          </div>

          {/* Repository Architecture Overview */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-300 block">Repository Highlights:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
              <li>Autonomous Multi-Drone Swarm Engine (Acoustic • Thermal • 20ft Seismic Radar)</li>
              <li>Interactive Tactical Map with Target Proximity Alerts (&lt; 5m)</li>
              <li>Multilingual Gemini AI Agent for voice/text mission commands</li>
              <li>Offline Data Synchronization for communications blackout resiliency</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex justify-end">
          <a
            href={gitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md cursor-pointer"
          >
            <Github className="w-4 h-4" />
            <span>Visit {username}/{repoName} on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
