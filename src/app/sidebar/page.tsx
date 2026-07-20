import { SideMenu } from "@/components/side-menu";

export default function SidebarPage() {
  return (
    <div className="flex h-screen bg-app-dark-700">
      <SideMenu />
      {/* placeholder page content so the menu reads in context */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="h-16 rounded-xl border border-app-light-stroke bg-app-dark-100" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-xl border border-app-light-stroke bg-app-dark-100"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
