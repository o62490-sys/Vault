
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
  const [notes, setNotes] = useState('');
  const [notesEncrypted, setNotesEncrypted] = useState(false);
  const [notesPassword, setNotesPassword] = useState('');

  const isEditing = !!entryToEdit;

  useEffect(() => {
    if (entryToEdit) {
      setTitle(entryToEdit.title);
      setUrl(entryToEdit.url);
      setUsername(entryToEdit.username);
      setPassword(entryToEdit.password || '');
      setNotes(entryToEdit.notes || '');
      setNotesEncrypted(entryToEdit.notesEncrypted || false);
      setNotesPassword(entryToEdit.notesPassword || '');
    } else {
      // Reset form when switching to "Add" mode
      setTitle('');
      setUrl('');
      setUsername('');
      setPassword('');
      setNotes('');
      setNotesEncrypted(false);
      setNotesPassword('');
    }
  }, [entryToEdit]);

  // Don't allow changing encryption settings if notes are already encrypted
  const canChangeEncryption = !entryToEdit?.notesEncrypted;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !password.trim()) {
      alert('Title and Password are required.');
      return;
    }
    if (notesEncrypted && !notesPassword.trim()) {
      alert('Notes password is required when encryption is enabled.');
      return;
    }
    onSave({
      id: entryToEdit?.id || new Date().toISOString(),
      title,
      url,
      username,
      password,
      notes: notes.trim() || undefined,
      notesEncrypted,
      notesPassword: notesEncrypted ? notesPassword : undefined,
    });
    // Reset form after saving a new entry
    if (!isEditing) {
        setTitle('');
        setUrl('');
        setUsername('');
        setPassword('');
        setNotes('');
        setNotesEncrypted(false);
        setNotesPassword('');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 p-2">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold text-primary mb-6">{isEditing ? 'Edit Entry' : 'Add New Entry'}</h2>
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
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-field resize-none"
              rows={4}
              placeholder="Additional notes or information..."
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="encrypt-notes"
                type="checkbox"
                checked={notesEncrypted}
                onChange={e => canChangeEncryption && setNotesEncrypted(e.target.checked)}
                disabled={!canChangeEncryption}
                className="custom-checkbox disabled:opacity-50"
              />
              <label htmlFor="encrypt-notes" className={`ml-3 block text-sm ${!canChangeEncryption ? 'text-text-muted' : 'text-text-primary'}`}>
                Encrypt notes with separate password
                {!canChangeEncryption && <span className="text-xs text-error ml-2">(Cannot change once encrypted)</span>}
              </label>
            </div>
            {notesEncrypted && (
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Notes Password</label>
                <input
                  type="password"
                  value={notesPassword}
                  onChange={e => canChangeEncryption && setNotesPassword(e.target.value)}
                  disabled={!canChangeEncryption}
                  className="input-field disabled:opacity-50"
                  placeholder="Password to encrypt notes"
                />
                <p className="text-xs text-text-muted mt-1">
                  This password will be required to view the notes
                  {!canChangeEncryption && <span className="text-error block">⚠️ Password cannot be changed once set</span>}
                </p>
              </div>
            )}
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
