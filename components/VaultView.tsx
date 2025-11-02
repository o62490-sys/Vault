
import React, { useState } from 'react';
import type { UnlockedVault, Entry } from '../types';
import { ViewEntriesTab } from './ViewEntriesTab';
import { AddEditEntryTab } from './AddEditEntryTab';
import { BackupTab } from './BackupTab';

interface VaultViewProps {
  vault: UnlockedVault;
  onSave: (updatedVault: UnlockedVault) => void;
  onLock: () => void;
}

type Tab = 'view' | 'add_edit' | 'backup';

export function VaultView({ vault, onSave, onLock }: VaultViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('view');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (entry: Entry) => {
    setError(null); // Clear any previous errors
    setEditingEntry(entry);
    setActiveTab('add_edit');
  };

  const handleSaveEntry = async (entry: Entry) => {
    setError(null); // Clear any previous errors
    try {
      const existingIndex = vault.entries.findIndex(e => e.id === entry.id);
      let newEntries;
      if (existingIndex > -1) {
        newEntries = [...vault.entries];
        newEntries[existingIndex] = entry;
      } else {
        newEntries = [...vault.entries, entry];
      }
      await onSave({ ...vault, entries: newEntries });
      setEditingEntry(null);
      setActiveTab('view');
    } catch (e) {
      setError(`Failed to save entry: ${(e as Error).message}`);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    setError(null); // Clear any previous errors
    try {
      const newEntries = vault.entries.filter(e => e.id !== entryId);
      await onSave({ ...vault, entries: newEntries });
    } catch (e) {
      setError(`Failed to delete entry: ${(e as Error).message}`);
    }
  };
  
  const handleCancelEdit = () => {
    setError(null); // Clear any previous errors
    setEditingEntry(null);
    setActiveTab('view');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'add_edit':
        return <AddEditEntryTab onSave={handleSaveEntry} entryToEdit={editingEntry} onCancel={handleCancelEdit} />;
      case 'backup':
        return <BackupTab vault={vault} />;
      case 'view':
      default:
        return <ViewEntriesTab entries={vault.entries} onEdit={handleEdit} onDelete={handleDeleteEntry} />;
    }
  };
  
  const TabButton = ({ tab, label, panelId }: { tab: Tab, label: string, panelId: string }) => (
      <button 
        id={`tab-${tab}`}
        role="tab"
        aria-controls={panelId}
        aria-selected={activeTab === tab}
        onClick={() => {
            if (tab === 'add_edit') setEditingEntry(null); // Reset when clicking tab directly
            setError(null); // Clear any previous errors
            setActiveTab(tab);
        }}
        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
        {label}
      </button>
  );

  return (
    <div className="bg-surface rounded-lg shadow-main p-4 sm:p-8 animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-primary truncate pr-4">{vault.name}</h1>
        <button onClick={onLock} className="btn btn-danger !w-auto text-sm px-4 py-2">
          Lock
        </button>
      </header>
      
      <nav className="border-b border-input-bg flex space-x-2" role="tablist">
        <TabButton tab="view" label="Entries" panelId="panel-view" />
        <TabButton tab="add_edit" label="Add/Edit Entry" panelId="panel-add_edit" />
        <TabButton tab="backup" label="Backup" panelId="panel-backup" />
      </nav>

      <main className="mt-6">
        {error && <div className="text-red-500 bg-red-100 border border-red-400 rounded p-3 mb-4" role="alert">{error}</div>}
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}