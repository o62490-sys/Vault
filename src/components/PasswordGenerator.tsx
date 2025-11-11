import React, { useState } from 'react';
import { Checkbox, Slider } from './ui/InputControls';

interface PasswordGeneratorProps {
  onGenerate: (password: string) => void;
}

const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>

export function PasswordGenerator({ onGenerate }: PasswordGeneratorProps) {
  const [length, setLength] = useState(20);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  
  const generatePassword = () => {
    const ambiguousChars = /[l1IO0]/g;

    const charSets = {
      uppercase: { chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', enabled: includeUppercase },
      lowercase: { chars: 'abcdefghijklmnopqrstuvwxyz', enabled: includeLowercase },
      digits: { chars: '0123456789', enabled: includeDigits },
      symbols: { chars: '!@#$%^&*()-_=+', enabled: includeSymbols },
    };

    if (excludeAmbiguous) {
      charSets.uppercase.chars = charSets.uppercase.chars.replace(ambiguousChars, '');
      charSets.lowercase.chars = charSets.lowercase.chars.replace(ambiguousChars, '');
      charSets.digits.chars = charSets.digits.chars.replace(ambiguousChars, '');
    }

    const enabledSets = Object.values(charSets).filter(set => set.enabled && set.chars.length > 0);

    if (enabledSets.length === 0) {
      alert("Please select at least one character set.");
      return;
    }
    
    if (length < enabledSets.length) {
      alert(`Password length must be at least ${enabledSets.length} to include all selected character types.`);
      return;
    }

    let passwordArray = [];
    let allChars = '';

    // 1. Ensure at least one character from each selected set
    enabledSets.forEach(set => {
      allChars += set.chars;
      const randomValues = new Uint32Array(1);
      window.crypto.getRandomValues(randomValues);
      passwordArray.push(set.chars[randomValues[0] % set.chars.length]);
    });

    const remainingLength = length - passwordArray.length;

    // 2. Fill the rest of the password with random characters from all enabled sets
    if (remainingLength > 0) {
      const randomValues = new Uint32Array(remainingLength);
      window.crypto.getRandomValues(randomValues);
      for (let i = 0; i < remainingLength; i++) {
        passwordArray.push(allChars[randomValues[i] % allChars.length]);
      }
    }

    // 3. Shuffle the array to avoid predictable character placement (Fisher-Yates shuffle)
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const randomValues = new Uint32Array(1);
      window.crypto.getRandomValues(randomValues);
      const j = randomValues[0] % (i + 1);
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }
    
    const finalPassword = passwordArray.join('');
    setGeneratedPassword(finalPassword);
    onGenerate(finalPassword);
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedPassword) {
      alert("Generate a password first!");
      return;
    }
    navigator.clipboard.writeText(generatedPassword).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-input-bg p-6 rounded-lg">
      <h2 className="text-xl font-bold text-primary mb-6">Generate Password</h2>
      <div className="space-y-5">
        <Slider label="Length" value={length} onChange={setLength} min={8} max={128} />
        <Checkbox label="Uppercase (A-Z)" checked={includeUppercase} onChange={setIncludeUppercase} />
        <Checkbox label="Lowercase (a-z)" checked={includeLowercase} onChange={setIncludeLowercase} />
        <Checkbox label="Digits (0-9)" checked={includeDigits} onChange={setIncludeDigits} />
        <Checkbox label="Symbols (!@#$..)" checked={includeSymbols} onChange={setIncludeSymbols} />
        <Checkbox label="Exclude Ambiguous (l, 1, I, O, 0)" checked={excludeAmbiguous} onChange={setExcludeAmbiguous} />
      </div>
      
      <div className="mt-8 space-y-3">
        <button onClick={generatePassword} className="btn btn-generate">
          ✨ Generate & Insert
        </button>
        <button onClick={handleCopyToClipboard} className="btn btn-secondary flex items-center justify-center disabled:opacity-50" disabled={!generatedPassword}>
            {copied ? <><IconCheck/> Copied!</> : <><IconCopy/> Copy</>}
        </button>
      </div>
       <p className="text-xs text-text-muted mt-2 text-center">*Password is copied to the Entry field.</p>
    </div>
  );
}