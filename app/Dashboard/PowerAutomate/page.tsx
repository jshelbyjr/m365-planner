
"use client";
import { getDelegatedPowerPlatformAccessToken } from '../../lib/msalClient';
import { useAzureAdConfig } from '../../lib/useAzureAdConfig';
import { useEffect, useState } from 'react';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';

type FlowRow = {
  id: string;
  name?: string;
  environmentName?: string;
  ownerName?: string;
  lastRunTime?: string;
  connection?: string;
};

export default function PowerAutomateDashboard() {
  const [data, setData] = useState<FlowRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [scanStarted, setScanStarted] = useState(false);
  const { clientId, tenantId, loading: configLoading, error: configError } = useAzureAdConfig();

  // Fetch Power Automate Flows data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/data/powerautomate');
      if (res.ok) {
        const result = await res.json();
        setData(result.flows || result);
      } else {
        setError('Failed to fetch Power Automate Flows data');
      }
    } catch (e) {
      setError('Failed to fetch Power Automate Flows data');
    } finally {
      setLoading(false);
    }
  };

  // Only poll scan status if scan has started
  useEffect(() => {
    if (!scanStarted) return;
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=powerautomate');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        if (status.status === 'COMPLETED') {
          fetchData();
        }
      }
    };
    if (scanStatus?.status === 'IN_PROGRESS') {
      interval = setInterval(fetchScanStatus, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanStatus?.status, scanStarted]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartScan = async () => {
    if (!clientId || !tenantId) {
      setScanStatus({ status: 'FAILED', error: 'Azure AD config not loaded' });
      return;
    }
    setScanStarted(true);
    setScanStatus({ status: 'IN_PROGRESS' });
    try {
      // Acquire delegated access token on the client
      const accessToken = await getDelegatedPowerPlatformAccessToken(clientId, tenantId);
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType: 'powerautomate', accessToken })
      });
      if (res.ok) {
        setScanStatus({ status: 'IN_PROGRESS' });
      } else {
        setScanStatus({ status: 'FAILED', error: 'Scan failed' });
      }
    } catch (err: any) {
      setScanStatus({ status: 'FAILED', error: err.message || 'Authentication failed' });
    }
  };

  const columns = [
    { key: 'name', label: 'Flow Name' },
    { key: 'environmentName', label: 'Environment' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'lastRunTime', label: 'Last Run Time' },
    { key: 'connection', label: 'Connection' },
  ];

  // Handler to fetch all Flows for export
  const handleExportAll = async () => {
    const res = await fetch('/api/data/powerautomate');
    if (res.ok) {
      const result = await res.json();
      return result.flows || result;
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">Power Automate Flows
        <ExportCSVButton
          data={data}
          columns={columns}
          fileName="power-automate-flows.csv"
        />
      </h1>
      <div className="mb-6">
        <DataCollectionCard
          scanStatus={scanStarted ? scanStatus : null}
          onStartScan={configLoading ? () => {} : handleStartScan}
          renderStatus={() => (
            <>
              {configLoading && <span className="text-gray-600">Loading Azure AD config...</span>}
              {configError && <span className="text-red-600">Config error: {configError}</span>}
              {scanStatus?.status === 'COMPLETED' && scanStatus.completedAt && (
                <span className="text-green-600">Last scan: {new Date(scanStatus.completedAt).toLocaleString()}</span>
              )}
              {scanStatus?.status === 'FAILED' && scanStarted && (
                <span className="text-red-600">Error: {scanStatus.error}</span>
              )}
              {error && scanStarted && (
                <span className="text-red-600">Error: {error}</span>
              )}
            </>
          )}
        />
      </div>
      <DataTable
        title={`Power Automate Flows (${data.length})`}
        data={data}
        displayKey="name"
        columns={columns}
        loading={loading}
      />
    </main>
  );
}
