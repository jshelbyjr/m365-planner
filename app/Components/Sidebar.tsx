import * as NavigationMenu from '@radix-ui/react-navigation-menu';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col min-h-screen">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Migration Dashboard</h1>
      </div>
      <NavigationMenu.Root orientation="vertical" className="flex flex-col gap-2 p-4">
        <NavigationMenu.List className="flex flex-col gap-2">
          <NavigationMenu.Item>
            <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">Tenant Info</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="/Dashboard/Users">Users</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">Microsoft Teams</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="/Dashboard/Groups">M365 Groups</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">Distribution Lists</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link className="block px-4 py-2 rounded hover:bg-indigo-100 text-gray-700 font-medium" href="#">SharePoint Sites</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
      <div className="mt-auto p-4 border-t">
        <a href="/settings" className="text-indigo-600 hover:underline text-sm">Configure Settings</a>
      </div>
    </aside>
  );
}
