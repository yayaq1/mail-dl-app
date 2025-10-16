'use client';

import { useState } from 'react';
import { Loader2, Mail, Lock, Server, Network } from 'lucide-react';
import ProviderSelector from '@/components/ProviderSelector';
import { getProviderList } from '@/lib/providers';

interface EmailLoginFormProps {
  onSuccess: (folders: string[]) => void;
  onError: (error: string) => void;
}

export default function EmailLoginForm({ onSuccess, onError }: EmailLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [provider, setProvider] = useState('dreamhost');
  const [customImap, setCustomImap] = useState('');
  const [customPort, setCustomPort] = useState('993');
  const [loading, setLoading] = useState(false);
  const providers = getProviderList();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError('');

    try {
      let imapServer = '';
      let imapPort = 993;

      if (provider === 'custom') {
        if (!customImap) {
          onError('Please enter IMAP server address');
          setLoading(false);
          return;
        }
        imapServer = customImap;
        imapPort = parseInt(customPort) || 993;
      } else {
        const selectedProvider = providers.find((p) => p.id === provider);
        if (selectedProvider) {
          if (!selectedProvider.provider.available) {
            onError('This email provider is not yet available. Please select Dreamhost Webmail or use Custom IMAP Server.');
            setLoading(false);
            return;
          }
          imapServer = selectedProvider.provider.imap;
          imapPort = selectedProvider.provider.port;
        }
      }

      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          imapServer,
          imapPort,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect');
      }

      onSuccess(data.folders);
    } catch (error: any) {
      onError(error.message || 'Failed to connect to email server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 transition-all-smooth hover:shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-block p-2 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Email Bulk Attachment Downloader
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Download all PDF attachments in bulk - Perfect for recruiters
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Provider
            </label>
            <ProviderSelector
              value={provider}
              onValueChange={(value) => setProvider(value)}
              disabled={loading}
            />
          </div>

          {provider === 'custom' && (
            <div className="animate-slide-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Server className="w-4 h-4 inline mr-1" />
                  IMAP Server
                </label>
                <input
                  type="text"
                  value={customImap}
                  onChange={(e) => setCustomImap(e.target.value)}
                  placeholder="imap.example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all-smooth hover:border-blue-400"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Network className="w-4 h-4 inline mr-1" />
                  Port
                </label>
                <input
                  type="number"
                  value={customPort}
                  onChange={(e) => setCustomPort(e.target.value)}
                  placeholder="993"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all-smooth hover:border-blue-400"
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your credentials are encrypted and only stored temporarily
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-all-smooth transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect & Fetch Folders'
            )}
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>Currently supports Dreamhost Webmail. More providers coming soon!</p>
        </div>
      </div>
    </div>
  );
}

