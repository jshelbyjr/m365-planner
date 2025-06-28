import * as NavigationMenu from '@radix-ui/react-navigation-menu';

const navSections = [
  {
    header: 'Tenant',
    items: [
      { label: 'Tenant Info', href: '#' },
      { label: 'Licenses', href: '#' },
      { label: 'Users', href: '/Dashboard/Users' },
    ],
  },
  {
    header: 'EXO',
    items: [
      { label: 'Mailboxes', href: '#' },
      { label: 'Distribution Lists', href: '#' },
    ],
  },
  {
    header: 'Collab/Storage',
    items: [
      { label: 'OneDrive', href: '/Dashboard/OneDrive' },
      { label: 'SharePoint Sites', href: '/Dashboard/SharePoint' },
      { label: 'M365 Groups', href: '/Dashboard/Groups' },
      { label: 'Microsoft Teams', href: '/Dashboard/Teams' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col min-h-screen">
      <div className="p-6 border-b">
        <a href="/">
          <h1 className="text-2xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">Tenant Inventory</h1>
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
                      className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium"
                      href={item.href}
                    >
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
