import React, { useState, useRef } from 'react';
import type { TwoFactorEntry } from '../types';
import * as OTPAuth from 'otpauth';
import QRCode from 'react-qr-code';

interface TwoFactorTabProps {
  twoFactorEntries: TwoFactorEntry[];
  onSave: (entries: TwoFactorEntry[]) => void;
}

export function TwoFactorTab({ twoFactorEntries, onSave }: TwoFactorTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TwoFactorEntry | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    secret: '',
    algorithm: 'SHA1' as 'SHA1' | 'SHA256' | 'SHA512',
    digits: 6 as 6 | 8,
    period: 30,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>({});
  const [showQR, setShowQR] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const generateTOTP = (entry: TwoFactorEntry): string => {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: entry.issuer,
        label: entry.title,
        secret: entry.secret,
        algorithm: entry.algorithm || 'SHA1',
        digits: entry.digits || 6,
        period: entry.period || 30,
      });
      return totp.generate();
    } catch (error) {
      console.error('Error generating TOTP:', error);
      return 'Error';
    }
  };

  const updateGeneratedCodes = () => {
    const codes: Record<string, string> = {};
    twoFactorEntries.forEach(entry => {
      codes[entry.id] = generateTOTP(entry);
    });
    setGeneratedCodes(codes);
  };

  React.useEffect(() => {
    updateGeneratedCodes();
    const interval = setInterval(updateGeneratedCodes, 1000);
    return () => clearInterval(interval);
  }, [twoFactorEntries]);

  // Cleanup camera when scanning stops
  React.useEffect(() => {
    if (!isScanning) {
      stopScanning();
    }
  }, [isScanning]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.secret.trim()) {
      alert('Secret is required');
      return;
    }

    try {
      // Try to create TOTP instance to validate
      new OTPAuth.TOTP({
        secret: formData.secret,
        algorithm: formData.algorithm,
        digits: formData.digits,
        period: formData.period,
      });
    } catch (error) {
      alert('Invalid TOTP secret. Most secrets are base32 encoded (A-Z, 2-7). Please check your secret key.');
      return;
    }

    const newEntry: TwoFactorEntry = {
      id: editingEntry?.id || crypto.randomUUID(),
      title: formData.title,
      issuer: formData.issuer,
      secret: formData.secret,
      algorithm: formData.algorithm,
      digits: formData.digits,
      period: formData.period,
    };

    let updatedEntries;
    if (editingEntry) {
      updatedEntries = twoFactorEntries.map(entry =>
        entry.id === editingEntry.id ? newEntry : entry
      );
    } else {
      updatedEntries = [...twoFactorEntries, newEntry];
    }

    onSave(updatedEntries);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      secret: '',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });
    setEditingEntry(null);
    setShowAddForm(false);
  };

  const handleEdit = (entry: TwoFactorEntry) => {
    setFormData({
      title: entry.title,
      issuer: entry.issuer,
      secret: entry.secret,
      algorithm: entry.algorithm || 'SHA1',
      digits: entry.digits || 6,
      period: entry.period || 30,
    });
    setEditingEntry(entry);
    setShowAddForm(true);
  };

  const handleDelete = (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this 2FA entry?')) {
      const updatedEntries = twoFactorEntries.filter(entry => entry.id !== entryId);
      onSave(updatedEntries);
    }
  };

  const generateQRCode = (entry: TwoFactorEntry) => {
    const totp = new OTPAuth.TOTP({
      issuer: entry.issuer,
      label: entry.title,
      secret: entry.secret,
      algorithm: entry.algorithm || 'SHA1',
      digits: entry.digits || 6,
      period: entry.period || 30,
    });
    return totp.toString();
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);

      // Dynamically import ZXing library only when needed
      const { BrowserMultiFormatReader } = await import('@zxing/library');
      const reader = new BrowserMultiFormatReader();

      const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current!);
      if (result) {
        parseQRCode(result.getText());
      }
      reader.reset();
    } catch (error) {
      console.error('QR scan error:', error);
      alert('Failed to scan QR code. Please try again or enter the secret manually.');
    } finally {
      stopScanning();
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const parseQRCode = (qrText: string) => {
    try {
      // Parse TOTP URI (otpauth://totp/...)
      const url = new URL(qrText);
      if (url.protocol === 'otpauth:' && url.host === 'totp') {
        const params = new URLSearchParams(url.search);
        const secret = params.get('secret');
        const issuer = params.get('issuer');
        const algorithm = params.get('algorithm') as 'SHA1' | 'SHA256' | 'SHA512';
        const digits = parseInt(params.get('digits') || '6') as 6 | 8;
        const period = parseInt(params.get('period') || '30');

        if (secret) {
          // Extract issuer and account name from path
          const pathParts = url.pathname.substring(1).split(':');
          let extractedIssuer = issuer || '';
          let accountName = pathParts[pathParts.length - 1] || '';

          // If issuer is not in params but in path, extract it
          if (!extractedIssuer && pathParts.length > 1) {
            extractedIssuer = pathParts[0];
          }

          setFormData(prev => ({
            ...prev,
            title: accountName,
            issuer: extractedIssuer,
            secret: secret,
            algorithm: algorithm || 'SHA1',
            digits: digits || 6,
            period: period || 30,
          }));

          // Show advanced settings if non-default values are detected
          if (algorithm && algorithm !== 'SHA1' || digits && digits !== 6 || period && period !== 30) {
            setShowAdvanced(true);
          }
        }
      } else {
        alert('Invalid QR code. Please scan a valid TOTP QR code.');
      }
    } catch (error) {
      console.error('QR parse error:', error);
      alert('Failed to parse QR code. Please enter the secret manually.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary">Two-Factor Authentication</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-tfa !w-auto text-sm px-4 py-2"
        >
          {showAddForm ? 'Cancel' : 'Add 2FA Entry'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-surface-secondary p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-medium text-primary">
            {editingEntry ? 'Edit 2FA Entry' : 'Add New 2FA Entry'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="e.g., Google Account"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Issuer</label>
              <input
                type="text"
                value={formData.issuer}
                onChange={e => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                className="input-field"
                placeholder="e.g., Google"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Secret Key</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.secret}
                onChange={e => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                className="input-field flex-1"
                placeholder="Enter your TOTP secret key"
                required
              />
              <button
                type="button"
                onClick={startScanning}
                disabled={isScanning}
                className="btn btn-tfa-secondary !w-auto px-4 py-2 whitespace-nowrap disabled:opacity-50"
                title="Scan QR code from your phone"
              >
                📱 {isScanning ? 'Scanning...' : 'Scan QR'}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1">
              This is the secret key from your 2FA setup (usually base32 encoded). Or click "Scan QR" to scan from your phone.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-primary hover:underline focus:outline-none"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-input-bg pt-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Algorithm</label>
                <select
                  value={formData.algorithm}
                  onChange={e => setFormData(prev => ({ ...prev, algorithm: e.target.value as any }))}
                  className="input-field"
                >
                  <option value="SHA1">SHA1 (default)</option>
                  <option value="SHA256">SHA256</option>
                  <option value="SHA512">SHA512</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Digits</label>
                <select
                  value={formData.digits}
                  onChange={e => setFormData(prev => ({ ...prev, digits: parseInt(e.target.value) as any }))}
                  className="input-field"
                >
                  <option value={6}>6 digits (default)</option>
                  <option value={8}>8 digits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Period (seconds)</label>
                <input
                  type="number"
                  value={formData.period}
                  onChange={e => setFormData(prev => ({ ...prev, period: parseInt(e.target.value) }))}
                  className="input-field"
                  min="1"
                  max="300"
                />
                <p className="text-xs text-text-muted mt-1">Usually 30 seconds</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button type="submit" className="btn btn-tfa-add">
              {editingEntry ? 'Update' : 'Add'} Entry
            </button>
            <button type="button" onClick={resetForm} className="btn btn-danger">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 pointer-events-auto">
            <h3 className="text-lg font-medium text-primary mb-4 text-center">
              Scan QR Code
            </h3>
            <p className="text-sm text-text-muted mb-4 text-center">
              Point your camera at the QR code from your 2FA setup
            </p>
            <div className="relative mb-4">
              <video
                ref={videoRef}
                className="w-full rounded border"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute inset-0 border-2 border-primary rounded pointer-events-none opacity-50"></div>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={stopScanning}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {twoFactorEntries.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <p>No 2FA entries yet. Click "Add 2FA Entry" to get started.</p>
          </div>
        ) : (
          twoFactorEntries.map(entry => (
            <div key={entry.id} className="bg-surface-secondary p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-primary">{entry.title}</h4>
                  <p className="text-sm text-text-muted">{entry.issuer}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowQR(showQR === entry.id ? null : entry.id)}
                    className="btn btn-secondary !w-auto px-3 py-1 text-sm"
                  >
                    {showQR === entry.id ? 'Hide QR' : 'Show QR'}
                  </button>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="btn btn-secondary !w-auto px-3 py-1 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="btn btn-danger !w-auto px-3 py-1 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {showQR === entry.id && (
                <div className="mb-4 flex justify-center">
                  <div className="bg-white p-4 rounded">
                    <QRCode value={generateQRCode(entry)} size={200} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-muted">Code:</span>
                  <span className="font-mono text-xl font-bold text-primary">
                    {generatedCodes[entry.id] || 'Generating...'}
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  Refreshes every {entry.period || 30}s
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
