
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Image from 'next/image';
import GroupIcon from '@mui/icons-material/Groups';
import LicenseIcon from '@mui/icons-material/WorkspacePremium';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';

import AppsIcon from '@mui/icons-material/Apps';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const navSections = [
  {
    header: 'Tenant',
    items: [
      { label: 'Domains', href: '/Dashboard/Domains', icon: <PublicIcon fontSize="small" className="mr-2" /> },
      { label: 'Licenses', href: '/Dashboard/Licenses', icon: <LicenseIcon fontSize="small" className="mr-2" /> },
      { label: 'Users', href: '/Dashboard/Users', icon: <PersonIcon fontSize="small" className="mr-2" /> },
    ],
  },
  {
    header: 'EXO',
    items: [
      { label: 'Mailboxes', href: '/Dashboard/ExchangeMailboxes', icon: <Image src="/icons8-microsoft-exchange-2019-50.png" alt="Exchange" width={20} height={20} className="mr-2 inline" /> },
      { label: 'Distribution Lists', href: '#', icon: null },
    ],
  },
  {
    header: 'Collab/Storage',
    items: [
      { label: 'OneDrive', href: '/Dashboard/OneDrive', icon: <Image src="/icons8-microsoft-onedrive-2019-50.png" alt="OneDrive" width={20} height={20} className="mr-2 inline" /> },
      { label: 'SharePoint Sites', href: '/Dashboard/SharePointUsage', icon: <Image src="/icons8-microsoft-sharepoint-2019-50.png" alt="SharePoint Usage" width={20} height={20} className="mr-2 inline" /> },
      { label: 'M365 Groups', href: '/Dashboard/Groups', icon: <GroupIcon fontSize="small" className="mr-2" /> },
      { label: 'Microsoft Teams', href: '/Dashboard/Teams', icon: <Image src="/icons8-microsoft-teams-2019-50.png" alt="Teams" width={20} height={20} className="mr-2 inline" /> },
    ],
  },
  {
    header: 'Power Platform',
    items: [
      { label: 'Power Apps', href: '/Dashboard/PowerApps', icon: <AppsIcon fontSize="small" className="mr-2" /> },
      { label: 'Power Automate', href: '/Dashboard/PowerAutomate', icon: <FlashOnIcon fontSize="small" className="mr-2" /> },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col min-h-screen">
      <div className="p-6 border-b flex items-center gap-2">
        <a href="/" className="flex items-center gap-2">
          <Image src="/icons8-microsoft-365-50.png" alt="M365" width={32} height={32} />
          <h1 className="text-2xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">M365</h1>
        </a>
      </div>
      <nav className="flex flex-col gap-2 p-4 flex-1">
        {navSections.map((section, idx) => (
          <div key={section.header}>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">{section.header}</div>
            <NavigationMenu.Root orientation="vertical">
              <NavigationMenu.List className="flex flex-col gap-1">
                {section.items.map(item => (
                  <NavigationMenu.Item key={item.label}>
                    <NavigationMenu.Link
                      className="flex items-center px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium"
                      href={item.href}
                    >
                      {item.icon}
                      {item.label}
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>
            </NavigationMenu.Root>
            {idx < navSections.length - 1 && <hr className="my-3" />}
          </div>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t">
        <a href="/settings" className="text-indigo-600 hover:underline text-sm">Configure Settings</a>
      </div>
    </aside>
  );
}
