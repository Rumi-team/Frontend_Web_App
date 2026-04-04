import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center px-4">
      <Link href="/" className="mb-12" aria-label="Rumi home">
        <Image
          src="/rumi_logo.png"
          alt="Rumi Logo"
          width={607}
          height={202}
          className="h-[64px] w-auto opacity-60"
        />
      </Link>
      <p className="text-8xl font-black bg-gradient-to-b from-white to-gray-600 bg-clip-text text-transparent mb-4">
        404
      </p>
      <p className="text-xl text-gray-400 mb-8">
        This page doesn&apos;t exist.
      </p>
      <Link href="/">
        <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-base px-8 h-12">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Rumi
        </Button>
      </Link>
    </div>
  )
}
