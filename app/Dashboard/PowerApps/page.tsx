"use client";

"use client";
import { useEffect, useState } from 'react';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';
import { getDelegatedPowerPlatformAccessToken } from '../../lib/msalClient';

type PowerAppRow = {
  id: string;
  name?: string;
  type?: string;
  environmentName?: string;
  ownerName?: string;
  lastAccessed?: string;
  connection?: string;
};


export default function PowerAppsDashboard() {
  const [data, setData] = useState<PowerAppRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [scanStarted, setScanStarted] = useState(false);

  // Fetch Power Apps data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/data/powerapps');
      if (res.ok) {
        const result = await res.json();
        setData(result.powerApps || result);
      } else {
        setError('Failed to fetch Power Apps data');
      }
    } catch (e) {
      setError('Failed to fetch Power Apps data');
    } finally {
      setLoading(false);
    }
  };

  // Only poll scan status if scan has started
  useEffect(() => {
    if (!scanStarted) return;
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=powerapps');
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
    setScanStarted(true);
    setScanStatus({ status: 'IN_PROGRESS' });
    try {
      // Acquire delegated access token on the client
      const accessToken = await getDelegatedPowerPlatformAccessToken();
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType: 'powerapps', accessToken })
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
    { key: 'name', label: 'App Name' },
    { key: 'type', label: 'Type' },
    { key: 'environmentName', label: 'Environment' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'lastAccessed', label: 'Last Accessed' },
    { key: 'connection', label: 'Connection' },
  ];

  // Handler to fetch all Power Apps for export
  const handleExportAll = async () => {
    const res = await fetch('/api/data/powerapps');
    if (res.ok) {
      const result = await res.json();
      return result.powerApps || result;
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">Power Apps
        <ExportCSVButton
          data={data}
          columns={columns}
          fileName="power-apps.csv"
        />
      </h1>
      <div className="mb-6">
        <DataCollectionCard
          scanStatus={scanStarted ? scanStatus : null}
          onStartScan={handleStartScan}
          renderStatus={() => (
            <>
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
        title={`Power Apps (${data.length})`}
        data={data}
        displayKey="name"
        columns={columns}
        loading={loading}
      />
    </main>
  );
}
