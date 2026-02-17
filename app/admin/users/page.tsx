import { createServerSupabaseClient } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Force dynamic rendering (not static) so env vars are available
export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const supabase = createServerSupabaseClient()

  // Fetch users from the database
  const { data: users, error } = await supabase
    .from("website_waitlist")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return <div className="p-8 bg-black text-red-400 min-h-screen">Error loading users: {error.message}</div>
  }

  return (
    <div className="container mx-auto p-4 bg-black text-white min-h-screen">
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image src="/rumi_logo.png" alt="Rumi Logo" width={303} height={101} className="h-[24.3px] w-auto" />
          </Link>
          <span className="text-xl font-bold text-yellow-400">Admin Dashboard</span>
        </div>
        <Link href="/admin">
          <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <main>
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-yellow-400">Waitlist Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-yellow-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-yellow-400">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-yellow-400">Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.email} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          {new Date(user.created_at).toLocaleDateString()}{" "}
                          {new Date(user.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-center text-gray-400">
                        No users have registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-gray-400">
          <p>Total users: {users?.length || 0}</p>
        </div>
      </main>

      <footer className="mt-12 pt-4 border-t border-gray-800 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Rumi. All rights reserved.</p>
      </footer>
    </div>
  )
}
