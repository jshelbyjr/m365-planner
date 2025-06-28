// file: app/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { API_ENDPOINTS, Status } from '../lib/constants';

export default function HomePage() {
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  
  const [message, setMessage] = useState('');
  const [testStatus, setTestStatus] = useState<Status>(Status.IDLE);
  const [testMessage, setTestMessage] = useState('');

  // Fetch existing configuration on page load
  useEffect(() => {
    const fetchConfig = async () => {
      const response = await fetch(API_ENDPOINTS.CONFIG);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setTenantId(data.tenantId);
          setClientId(data.clientId);
        }
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    const response = await fetch(API_ENDPOINTS.CONFIG, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, clientId, clientSecret }),
    });

    const result = await response.json();
    if (response.ok) {
      setMessage('Configuration saved successfully!');
      setClientSecret(''); // Clear secret field after successful save
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };
  
  const handleTestAuth = async () => {
    setTestStatus(Status.TESTING);
    setTestMessage('');
    const response = await fetch(API_ENDPOINTS.TEST_AUTH);
    const result = await response.json();
    
    if (response.ok) {
        setTestStatus(Status.SUCCESS);
        setTestMessage(result.message);
    } else {
        setTestStatus(Status.ERROR);
        setTestMessage(`Error: ${result.error}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">M365 Migration Planner Setup</h1>
        <p className="mb-6 text-gray-600">Enter the credentials from your Azure AD App Registration.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">Directory (Tenant) ID</label>
            <input
              id="tenantId"
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Application (Client) ID</label>
            <input
              id="clientId"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700">Client Secret Value</label>
            <input
              id="clientSecret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter secret to save/update"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Configuration
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
        
        <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold">Test Connection</h2>
            <button
              onClick={handleTestAuth}
              disabled={testStatus === Status.TESTING}
              className="mt-2 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
            >
              {testStatus === Status.TESTING ? 'Testing...' : 'Run Auth Test'}
            </button>
             {testMessage && (
                <div className={`mt-4 p-3 rounded-md text-sm ${testStatus === Status.SUCCESS ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {testMessage}
                </div>
             )}
        </div>
      </div>
    </main>
  );
}