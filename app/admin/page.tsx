import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Settings, Home } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4 bg-black text-white min-h-screen">
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image src="/rumi_logo.png" alt="Rumi Logo" width={303} height={101} className="h-[24.3px] w-auto" />
          </Link>
          <span className="text-xl font-bold text-yellow-400">Admin</span>
        </div>
        <Link href="/">
          <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
            <Home className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
        </Link>
      </header>

      <main>
        <h1 className="text-3xl font-semibold mb-6 text-yellow-400">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users">
            <Card className="bg-gray-900 border-gray-800 hover:border-yellow-400 transition-all cursor-pointer h-full">
              <CardHeader>
                <Users className="h-8 w-8 text-yellow-400 mb-2" />
                <CardTitle>Manage Users</CardTitle>
                <CardDescription className="text-gray-400">View and manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">
                  Access the complete list of users who have registered for the waitlist.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gray-900 border-gray-800 h-full">
            <CardHeader>
              <Settings className="h-8 w-8 text-yellow-400 mb-2" />
              <CardTitle>Settings</CardTitle>
              <CardDescription className="text-gray-400">Configure site settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">Manage website configuration and preferences.</p>
              <Button className="mt-4 bg-gray-800 hover:bg-gray-700" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-12 pt-4 border-t border-gray-800 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Rumi. All rights reserved.</p>
      </footer>
    </div>
  )
}
