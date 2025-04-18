import { InstanceManager } from "@/components/instance-manager"
import { ModeToggle } from "@/components/mode-toggle"
import { UserAccount } from "@/components/user-account"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">AWS Manager</h1>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserAccount />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <InstanceManager />
      </main>

      <footer className="border-t bg-background py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">AWS Manager</div>
      </footer>
    </div>
  )
}
