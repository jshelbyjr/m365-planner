// Users DataTable Page
'use client';
import { useEffect, useState } from 'react';
import DataTable from '../../Components/DataTable';

type User = {
  id: string;
  displayName: string;
  userPrincipalName: string;
  accountEnabled: boolean;
  department?: string;
  jobTitle?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/data/users');
      if (res.ok) setUsers(await res.json());
    };
    fetchUsers();
  }, []);

  // Define columns to display in the DataTable
  const columns = [
    { key: 'displayName', label: 'Display Name' },
    { key: 'userPrincipalName', label: 'User Principal Name' },
    { key: 'accountEnabled', label: 'Account Enabled' },
    { key: 'department', label: 'Department' },
    { key: 'jobTitle', label: 'Job Title' },
  ];

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <DataTable
        title={`Users (${users.length})`}
        data={users}
        displayKey="userPrincipalName"
        columns={columns}
      />
    </main>
  );
}
