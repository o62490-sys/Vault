
import React, { useState } from 'react';
import type { Entry } from '../types';

interface ViewEntriesTabProps {
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (entryId: string) => void;
}

const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export function ViewEntriesTab({ entries, onEdit, onDelete }: ViewEntriesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleDelete = (entry: Entry) => {
      if (window.confirm(`Are you sure you want to delete "${entry.title}"?`)) {
          onDelete(entry.id);
      }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search entries..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="input-field mb-6"
      />
      
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
        {filteredEntries.length === 0 ? (
          <p className="text-text-muted text-center py-10">No entries found.</p>
        ) : (
          filteredEntries.map(entry => (
            <div key={entry.id} className="bg-input-bg p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
              <div className="flex-grow">
                <h3 className="font-bold text-lg text-text-primary">{entry.title}</h3>
                <p className="text-sm text-text-muted">{entry.username}</p>
                {entry.url && <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{entry.url}</a>}
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => copyToClipboard(entry.password || '', entry.id)}
                  title="Copy Password"
                  className="p-2 bg-surface hover:bg-primary rounded-md transition-colors text-text-muted hover:text-white"
                >
                  {copied === entry.id ? <IconCheck /> : <IconCopy />}
                </button>
                <button onClick={() => onEdit(entry)} title="Edit Entry" className="p-2 bg-surface hover:bg-accent rounded-md transition-colors text-text-muted hover:text-white">
                  <IconEdit />
                </button>
                <button onClick={() => handleDelete(entry)} title="Delete Entry" className="p-2 bg-surface hover:bg-error rounded-md transition-colors text-text-muted hover:text-white">
                  <IconDelete />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}