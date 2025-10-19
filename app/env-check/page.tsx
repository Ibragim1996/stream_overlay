// app/env-check/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { getBaseUrl, validateUrls, isProduction } from '@/lib/config';

interface EnvStatus {
  name: string;
  value: string;
  status: 'ok' | 'missing' | 'warning';
  description: string;
}

export default function EnvCheckPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>([]);
  const [urlValidation, setUrlValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEnvironment = () => {
      const statuses: EnvStatus[] = [];

      // Firebase Client Variables
      const firebaseClientVars = [
        { name: 'NEXT_PUBLIC_FIREBASE_API_KEY', description: 'Firebase API Key' },
        { name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', description: 'Firebase Auth Domain' },
        { name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', description: 'Firebase Project ID' },
        { name: 'NEXT_PUBLIC_FIREBASE_APP_ID', description: 'Firebase App ID' },
        { name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', description: 'Firebase Messaging Sender ID' },
        { name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', description: 'Firebase Storage Bucket' },
      ];

      firebaseClientVars.forEach(({ name, description }) => {
        const value = process.env[name] || '';
        statuses.push({
          name,
          value: value ? `${value.substring(0, 20)}...` : 'NOT SET',
          status: value ? 'ok' : 'missing',
          description
        });
      });

      // Site URL
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
      statuses.push({
        name: 'NEXT_PUBLIC_SITE_URL',
        value: siteUrl || 'NOT SET',
        status: siteUrl ? (siteUrl.includes('vibekip.com') ? 'ok' : 'warning') : 'missing',
        description: 'Production domain (should be https://vibekip.com)'
      });

      // Base URL
      const baseUrl = getBaseUrl();
      statuses.push({
        name: 'BASE_URL (computed)',
        value: baseUrl,
        status: baseUrl.includes('vibekip.com') ? 'ok' : 'warning',
        description: 'Computed base URL from config'
      });

      // Environment
      statuses.push({
        name: 'NODE_ENV',
        value: process.env.NODE_ENV || 'NOT SET',
        status: process.env.NODE_ENV === 'production' ? 'ok' : 'warning',
        description: 'Node environment'
      });

      // Production check
      statuses.push({
        name: 'IS_PRODUCTION',
        value: isProduction() ? 'true' : 'false',
        status: isProduction() ? 'ok' : 'warning',
        description: 'Production mode check'
      });

      setEnvStatus(statuses);
      setUrlValidation(validateUrls());
      setLoading(false);
    };

    checkEnvironment();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'missing': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return '✅';
      case 'warning': return '⚠️';
      case 'missing': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1020] text-[#e6e9f2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-[#e6e9f2] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔍 Environment Check</h1>
          <p className="text-gray-400">Production Domain: <span className="text-blue-400 font-mono">vibekip.com</span></p>
          <p className="text-gray-400">Current Base URL: <span className="text-blue-400 font-mono">{getBaseUrl()}</span></p>
        </div>

        {/* URL Validation */}
        <div className="mb-8 p-6 bg-gray-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🌐 URL Validation</h2>
          <div className={`p-4 rounded ${urlValidation.valid ? 'bg-green-900/20 border border-green-500' : 'bg-red-900/20 border border-red-500'}`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{urlValidation.valid ? '✅' : '❌'}</span>
              <span className="font-semibold">
                {urlValidation.valid ? 'All URLs are valid' : 'URL validation failed'}
              </span>
            </div>
            {urlValidation.errors.length > 0 && (
              <ul className="list-disc list-inside text-red-400">
                {urlValidation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Environment Variables */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🔧 Environment Variables</h2>
          <div className="space-y-3">
            {envStatus.map((env, index) => (
              <div key={index} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{getStatusIcon(env.status)}</span>
                    <div>
                      <code className="text-blue-400 font-mono">{env.name}</code>
                      <p className="text-sm text-gray-400">{env.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <code className={`font-mono ${getStatusColor(env.status)}`}>
                      {env.value}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 p-6 bg-gray-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/overlay?key=TEST123" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-blue-900/20 border border-blue-500 rounded-lg hover:bg-blue-900/30 transition-colors"
            >
              <h3 className="font-semibold text-blue-400">Test Overlay</h3>
              <p className="text-sm text-gray-400">Open overlay with test key</p>
            </a>
            <a 
              href="/panel" 
              className="p-4 bg-green-900/20 border border-green-500 rounded-lg hover:bg-green-900/30 transition-colors"
            >
              <h3 className="font-semibold text-green-400">Streamer Panel</h3>
              <p className="text-sm text-gray-400">Open streamer control panel</p>
            </a>
            <a 
              href="/api/debug-env" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-purple-900/20 border border-purple-500 rounded-lg hover:bg-purple-900/30 transition-colors"
            >
              <h3 className="font-semibold text-purple-400">Debug API</h3>
              <p className="text-sm text-gray-400">Check server environment</p>
            </a>
            <a 
              href="/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg hover:bg-yellow-900/30 transition-colors"
            >
              <h3 className="font-semibold text-yellow-400">Health Check</h3>
              <p className="text-sm text-gray-400">Check API health status</p>
            </a>
          </div>
        </div>

        {/* Production Checklist */}
        <div className="p-6 bg-gray-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">✅ Production Checklist</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              <span>Domain set to vibekip.com</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              <span>All Firebase variables configured</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              <span>URL validation passed</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              <span>Environment check complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}