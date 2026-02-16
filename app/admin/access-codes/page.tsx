"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Home,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react"
import {
  generateAccessCode,
  listAccessCodes,
  toggleAccessCode,
  deleteAccessCode,
} from "@/app/actions/access-code-actions"

interface AccessCode {
  id: string
  code: string
  description: string | null
  is_active: boolean
  max_uses: number | null
  used_count: number
  created_at: string
  expires_at: string | null
}

export default function AccessCodesPage() {
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadCodes = useCallback(async () => {
    const result = await listAccessCodes()
    setCodes(result.data as AccessCode[])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadCodes()
  }, [loadCodes])

  async function handleGenerate() {
    const result = await generateAccessCode(
      description || undefined,
      maxUses ? parseInt(maxUses) : undefined,
      expiresAt || undefined
    )
    if (!result.error) {
      setDialogOpen(false)
      setDescription("")
      setMaxUses("")
      setExpiresAt("")
      loadCodes()
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    await toggleAccessCode(id, isActive)
    loadCodes()
  }

  async function handleDelete(id: string) {
    await deleteAccessCode(id)
    loadCodes()
  }

  function handleCopy(code: string, id: string) {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-yellow-400">
            Access Codes
          </h1>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-400 text-black hover:bg-yellow-300">
                <Plus className="mr-2 h-4 w-4" />
                Generate Code
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Generate Access Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-gray-400">Description</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Beta testers batch 1"
                    className="mt-1 border-gray-700 bg-gray-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    Max Uses (leave empty for unlimited)
                  </label>
                  <Input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Unlimited"
                    className="mt-1 border-gray-700 bg-gray-800 text-white"
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    Expires At (optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="mt-1 border-gray-700 bg-gray-800 text-white"
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Generate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">
              All Codes ({codes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : codes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No access codes yet. Generate one to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Code</TableHead>
                    <TableHead className="text-gray-400">Description</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Usage</TableHead>
                    <TableHead className="text-gray-400">Expires</TableHead>
                    <TableHead className="text-gray-400">Created</TableHead>
                    <TableHead className="text-gray-400 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((ac) => (
                    <TableRow key={ac.id} className="border-gray-800">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-yellow-400">
                            {ac.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-500 hover:text-white"
                            onClick={() => handleCopy(ac.code, ac.id)}
                          >
                            {copiedId === ac.id ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {ac.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={ac.is_active}
                            onCheckedChange={(checked) =>
                              handleToggle(ac.id, checked)
                            }
                          />
                          <Badge
                            variant={ac.is_active ? "default" : "secondary"}
                            className={
                              ac.is_active
                                ? "bg-green-900 text-green-300"
                                : "bg-gray-800 text-gray-500"
                            }
                          >
                            {ac.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {ac.used_count}
                        {ac.max_uses !== null ? ` / ${ac.max_uses}` : ""}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {ac.expires_at
                          ? new Date(ac.expires_at).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {new Date(ac.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Code</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Delete access code{" "}
                                <code className="text-yellow-400">
                                  {ac.code}
                                </code>
                                ? This will also remove any redemptions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(ac.id)}
                                className="bg-red-600 hover:bg-red-500"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="mt-12 pt-4 border-t border-gray-800 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Rumi. All rights reserved.</p>
      </footer>
    </div>
  )
}
