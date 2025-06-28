
"use client";

import { useEffect, useState } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import DataTable from '../../Components/DataTable';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import ExportCSVButton from '../../Components/ExportCSVButton';

interface SharePointSite {
  id: string;
  name?: string;
  storageUsed?: number;
  filesCount?: number;
  externalSharing?: string;
  teams?: string | null;
  m365Group?: string | null;
}

export default function SharePointDashboardPage() {
  const [sites, setSites] = useState<SharePointSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  // Fetch SharePoint sites
  useEffect(() => {
    const fetchSites = async () => {
      setLoading(true);
      const res = await fetch('/api/data/sharepoint');
      if (res.ok) {
        const allSites: SharePointSite[] = await res.json();
        // Only show sites not related to Teams or M365 Groups
        const filtered = allSites.filter(site => !site.teams && !site.m365Group);
        setSites(filtered);
      }
      setLoading(false);
    };
    fetchSites();
  }, []);

  // Fetch scan status for SharePoint
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        // If scan just completed, refresh sites
        if (status.status === 'COMPLETED') {
          const sitesRes = await fetch('/api/data/sharepoint');
          if (sitesRes.ok) {
            const allSites: SharePointSite[] = await sitesRes.json();
            const filtered = allSites.filter(site => !site.teams && !site.m365Group);
            setSites(filtered);
          }
        }
      }
    };
    fetchScanStatus();
    if (scanStatus?.status === 'IN_PROGRESS') {
      interval = setInterval(fetchScanStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [scanStatus?.status]);

  const handleStartScan = async () => {
    setScanStatus({ status: 'IN_PROGRESS' });
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType: 'sharepoint' })
    });
    if (res.ok) {
      // Optionally refetch sites after scan
      const sitesRes = await fetch('/api/data/sharepoint');
      if (sitesRes.ok) {
        const allSites: SharePointSite[] = await sitesRes.json();
        const filtered = allSites.filter(site => !site.teams && !site.m365Group);
        setSites(filtered);
      }
      // Refetch scan status
      const statusRes = await fetch('/api/scan');
      if (statusRes.ok) setScanStatus(await statusRes.json());
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  const columns = [
    { key: 'name', label: 'Site Name' },
    { key: 'storageUsed', label: 'Storage (MB)' },
    { key: 'filesCount', label: 'Files' },
    { key: 'externalSharing', label: 'External Sharing' },
  ];

  // Handler to fetch all SharePoint sites and export as CSV
  const handleExportAllSites = async () => {
    const res = await fetch('/api/data/sharepoint');
    if (res.ok) {
      const allSites: SharePointSite[] = await res.json();
      return allSites.filter(site => !site.teams && !site.m365Group);
    }
    return [];
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center">SharePoint Sites
        <ExportCSVButton
          data={sites}
          columns={columns}
          fileName="sharepoint-sites.csv"
          // @ts-ignore
          fetchAllData={handleExportAllSites}
        />
      </h1>
      <div className="mb-6">
        <DataCollectionCard
          scanStatus={scanStatus}
          onStartScan={handleStartScan}
          renderStatus={() => (
            <>
              {scanStatus?.status === 'COMPLETED' && scanStatus.completedAt && (
                <span className="text-green-600">Last scan: {new Date(scanStatus.completedAt).toLocaleString()}</span>
              )}
              {scanStatus?.status === 'FAILED' && (
                <span className="text-red-600">Error: {scanStatus.error}</span>
              )}
            </>
          )}
        />
      </div>
      {loading ? (
        <CircularProgress />
      ) : (
        <DataTable
          title={`SharePoint Sites (${sites.length})`}
          data={sites.map(site => ({
            ...site,
            storageUsed: site.storageUsed !== undefined && site.storageUsed !== null ? site.storageUsed.toLocaleString() : '-',
          }))}
          displayKey="name"
          columns={columns}
        />
      )}
    </main>
  );
}
