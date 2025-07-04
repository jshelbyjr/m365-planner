
"use client";

import React, { useState, useEffect } from 'react';
import { useApiData } from '../../../lib/useApiData';
import { CircularProgress, Typography, Box } from '@mui/material';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';
import DataTable from '../../Components/DataTable';
import ExportCSVButton from '../../Components/ExportCSVButton';

/**
 * LicenseDashboardPage - Displays Microsoft 365 license information in a table.
 */

type License = {
  id: string;
  skuPartNumber: string;
  status?: string;
  totalSeats?: number;
  consumedSeats?: number;
  availableSeats?: number;
  warningUnits?: number;
  suspendedUnits?: number;
};



const LICENSE_COLUMNS = [
  { key: 'skuPartNumber', label: 'SKU Part Number' },
  { key: 'status', label: 'Status' },
  { key: 'totalSeats', label: 'Total Seats' },
  { key: 'consumedSeats', label: 'Consumed Seats' },
  { key: 'availableSeats', label: 'Available Seats' },
  { key: 'warningUnits', label: 'Warning Units' },
  { key: 'suspendedUnits', label: 'Suspended Units' },
];


const LicenseDashboardPage = () => {
  const { data: licenses, loading, error, refetch } = useApiData<License[]>('/api/data/licenses');
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan?dataType=licenses');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        if (status.status === 'COMPLETED') {
          refetch();
        }
      }
    };
    fetchScanStatus();
    if (scanStatus?.status === 'IN_PROGRESS') {
      interval = setInterval(fetchScanStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [scanStatus?.status, refetch]);

  const handleStartScan = async () => {
    setScanStatus({ status: 'IN_PROGRESS' });
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType: 'licenses' })
    });
    if (res.ok) {
      refetch();
      const statusRes = await fetch('/api/scan?dataType=licenses');
      if (statusRes.ok) setScanStatus(await statusRes.json());
    } else {
      setScanStatus({ status: 'FAILED', error: 'Scan failed' });
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Microsoft 365 Licenses
      </Typography>
      <Box mb={3}>
        <DataCollectionCard
          scanStatus={scanStatus}
          onStartScan={handleStartScan}
          renderStatus={() => (
            <>
              {scanStatus?.status === 'COMPLETED' && scanStatus.completedAt && (
                <span style={{ color: 'green' }}>Last scan: {new Date(scanStatus.completedAt).toLocaleString()}</span>
              )}
              {scanStatus?.status === 'FAILED' && (
                <span style={{ color: 'red' }}>Error: {scanStatus.error}</span>
              )}
              {error && (
                <span style={{ color: 'red' }}>Error: {error}</span>
              )}
            </>
          )}
        />
      </Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          License Data
        </Typography>
        <ExportCSVButton data={licenses || []} columns={LICENSE_COLUMNS} fileName="licenses.csv" />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <DataTable
          title="Licenses"
          data={licenses || []}
          columns={LICENSE_COLUMNS}
          displayKey="skuPartNumber"
        />
      )}
    </Box>
  );
};

export default LicenseDashboardPage;
