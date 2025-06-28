"use client";
import React, { useEffect, useState } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import DataCollectionCard, { ScanStatus } from '../../Components/DataCollectionCard';

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


const LicenseDashboardPage = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);

  const fetchLicenses = async () => {
    const res = await fetch('/api/data/licenses');
    if (res.ok) setLicenses(await res.json());
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchScanStatus = async () => {
      const res = await fetch('/api/scan');
      if (res.ok) {
        const status = await res.json();
        setScanStatus(status);
        if (status.status === 'COMPLETED') {
          fetchLicenses();
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
      body: JSON.stringify({ dataType: 'licenses' })
    });
    if (res.ok) {
      fetchLicenses();
      const statusRes = await fetch('/api/scan');
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
            </>
          )}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU Part Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Seats</TableCell>
              <TableCell>Consumed Seats</TableCell>
              <TableCell>Available Seats</TableCell>
              <TableCell>Warning Units</TableCell>
              <TableCell>Suspended Units</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {licenses.map((license) => (
              <TableRow key={license.id}>
                <TableCell>{license.skuPartNumber}</TableCell>
                <TableCell>{license.status}</TableCell>
                <TableCell>{license.totalSeats}</TableCell>
                <TableCell>{license.consumedSeats}</TableCell>
                <TableCell>{license.availableSeats}</TableCell>
                <TableCell>{license.warningUnits}</TableCell>
                <TableCell>{license.suspendedUnits}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LicenseDashboardPage;
