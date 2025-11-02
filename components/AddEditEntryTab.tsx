

import React, { useState, useEffect } from 'react';
import type { Entry } from '../types';
import { PasswordGenerator } from './PasswordGenerator';

interface AddEditEntryTabProps {
  onSave: (entry: Entry) => void;
  entryToEdit: Entry | null;
  onCancel: () => void;
}

export function AddEditEntryTab({ onSave, entryToEdit, onCancel }: AddEditEntryTabProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const isEditing = !!entryToEdit;

  useEffect(() => {
    if (entryToEdit) {
      setTitle(entryToEdit.title);
      setUrl(entryToEdit.url);
      setUsername(entryToEdit.username);
      setPassword(entryToEdit.password || '');
    } else {
      // Reset form when switching to "Add" mode
      setTitle('');
      setUrl('');
      setUsername('');
      setPassword('');
    }
    setErrorMessage(null); // Clear error on entryToEdit change
  }, [entryToEdit]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Clear previous errors

    if (!title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Password is required.');
      return;
    }

    onSave({
      id: entryToEdit?.id || new Date().toISOString(),
      title,
      url,
      username,
      password,
    });
    // Reset form after saving a new entry
    if (!isEditing) {
        setTitle('');
        setUrl('');
        setUsername('');
        setPassword('');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 p-2">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold text-primary mb-6">{isEditing ? 'Edit Entry' : 'Add New Entry'}</h2>
        {errorMessage && <div className="text-red-500 bg-red-100 border border-red-400 rounded p-3 mb-4" role="alert">{errorMessage}</div>}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={isEditing} className="input-field disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="mt-8 flex space-x-3">
            <button type="submit" className="btn btn-primary">
                {isEditing ? 'Save Changes' : 'Add Entry'}
            </button>
            {isEditing && (
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                    Cancel
                </button>
            )}
        </div>
      </form>

      <PasswordGenerator onGenerate={setPassword} />
    </div>
  );
}
