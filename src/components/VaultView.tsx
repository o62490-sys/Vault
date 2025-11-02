
import React, { useState } from 'react';
import type { UnlockedVault, Entry, TwoFactorEntry } from '../types';
import { ViewEntriesTab } from './ViewEntriesTab';
import { AddEditEntryTab } from './AddEditEntryTab';
import { BackupTab } from './BackupTab';
import { TwoFactorTab } from './TwoFactorTab';

interface VaultViewProps {
  vault: UnlockedVault;
  onSave: (updatedVault: UnlockedVault) => void;
  onLock: () => void;
}

type Tab = 'view' | 'add_edit' | 'twofactor' | 'backup';

export function VaultView({ vault, onSave, onLock }: VaultViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('view');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setActiveTab('add_edit');
  };

  const handleSaveEntry = (entry: Entry) => {
    const existingIndex = vault.entries.findIndex(e => e.id === entry.id);
    let newEntries;
    if (existingIndex > -1) {
      newEntries = [...vault.entries];
      newEntries[existingIndex] = entry;
    } else {
      newEntries = [...vault.entries, entry];
    }
    onSave({ ...vault, entries: newEntries });
    setEditingEntry(null);
    setActiveTab('view');
  };

  const handleDeleteEntry = (entryId: string) => {
    const newEntries = vault.entries.filter(e => e.id !== entryId);
    onSave({ ...vault, entries: newEntries });
  };
  
  const handleCancelEdit = () => {
    setEditingEntry(null);
    setActiveTab('view');
  };

  const handleSaveTwoFactorEntries = (twoFactorEntries: TwoFactorEntry[]) => {
    onSave({ ...vault, twoFactorEntries });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'add_edit':
        return <AddEditEntryTab onSave={handleSaveEntry} entryToEdit={editingEntry} onCancel={handleCancelEdit} />;
      case 'twofactor':
        return <TwoFactorTab twoFactorEntries={vault.twoFactorEntries} onSave={handleSaveTwoFactorEntries} />;
      case 'backup':
        return <BackupTab vault={vault} />;
      case 'view':
      default:
        return <ViewEntriesTab entries={vault.entries} onEdit={handleEdit} onDelete={handleDeleteEntry} />;
    }
  };
  
  const TabButton = ({ tab, label }: { tab: Tab, label: string }) => (
      <button 
        onClick={() => {
            if (tab === 'add_edit') setEditingEntry(null); // Reset when clicking tab directly
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
      
      <nav className="border-b border-input-bg flex space-x-2">
        <TabButton tab="view" label="Entries" />
        <TabButton tab="add_edit" label="Add/Edit Entry" />
        <TabButton tab="twofactor" label="2FA" />
        <TabButton tab="backup" label="Backup" />
      </nav>

      <main className="mt-6">
        {renderTabContent()}
      </main>
    </div>
  );
}
