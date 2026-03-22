"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Home, ArrowLeft, LogIn, Mic, Calendar } from "lucide-react"
import {
  listUserActivity,
  type UserActivity,
} from "@/app/actions/access-code-actions"

export default function UserActivityPage() {
  const [users, setUsers] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadUsers = useCallback(async () => {
    const result = await listUserActivity()
    setUsers(result.data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const totalLogins = users.reduce((sum, u) => sum + u.login_count, 0)
  const totalSessions = users.reduce((sum, u) => sum + u.session_count, 0)

  return (
    <div className="container mx-auto p-4 bg-black text-white min-h-screen">
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/rumi_logo.png"
              alt="Rumi Logo"
              width={303}
              height={101}
              className="h-[24.3px] w-auto"
            />
          </Link>
          <span className="text-xl font-bold text-yellow-400">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <Home className="mr-2 h-4 w-4" />
              Site
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <h1 className="text-3xl font-semibold text-yellow-400 mb-6">
          User Activity
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-400/10">
                  <LogIn className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                  <p className="text-sm text-gray-400">Web Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-400/10">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalLogins}</p>
                  <p className="text-sm text-gray-400">Total Logins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-400/10">
                  <Mic className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalSessions}</p>
                  <p className="text-sm text-gray-400">Coaching Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">
              All Web Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No web users yet. Assign access codes to Gmail accounts to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Gmail</TableHead>
                      <TableHead className="text-gray-400">Logins</TableHead>
                      <TableHead className="text-gray-400">Sessions</TableHead>
                      <TableHead className="text-gray-400">Last Session</TableHead>
                      <TableHead className="text-gray-400">Signed Up</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.user_id} className="border-gray-800">
                        <TableCell>
                          <span className="text-blue-400 text-sm">
                            {u.email}
                          </span>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {u.login_count}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {u.session_count}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">
                          {u.last_session_at
                            ? formatRelativeDate(u.last_session_at)
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {u.session_count > 0 ? (
                            <Badge className="bg-green-900 text-green-300">
                              Active
                            </Badge>
                          ) : u.login_count > 0 ? (
                            <Badge className="bg-yellow-900 text-yellow-300">
                              Logged In
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-800 text-gray-500">
                              Invited
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="mt-12 pt-4 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Rumi.</p>
      </footer>
    </div>
  )
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
