"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface User {
  email: string
  name: string
  created_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users")
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setUsers(data.users || [])
        }
      } catch (err) {
        setError("Failed to fetch users")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-black">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image src="/rumi_logo.png" alt="Rumi Logo" width={120} height={40} className="h-10 w-auto" />
            <span className="text-xl font-bold">Admin</span>
          </div>
          <Button className="bg-yellow-400 text-black hover:bg-yellow-300" onClick={() => (window.location.href = "/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <Card className="bg-gray-900 text-white border-yellow-400">
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription className="text-gray-300">
              View all users who have registered for the beta launch
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No users have registered yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.email} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          {new Date(user.created_at).toLocaleDateString()} at{" "}
                          {new Date(user.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
