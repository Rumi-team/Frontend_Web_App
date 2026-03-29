"use client"

import { useState } from "react"
import Image from "next/image"
import { Mail } from "lucide-react"
import { ContactModal } from "@/components/contact-modal"

export function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  return (
    <>
      <footer
        className="w-full py-12 bg-black border-t border-white/[0.06]"
        role="contentinfo"
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Image
                src="/rumi_logo.png"
                alt="Rumi Logo"
                width={607}
                height={202}
                className="h-[64px] w-auto opacity-70"
              />
              <span className="text-base text-gray-500">
                Designed in California
              </span>
            </div>
            <div className="text-center">
              <p className="text-base text-gray-500">
                Copyright &copy;2026, Rumi, Inc. Made in California.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center text-lg text-gray-500 hover:text-yellow-400 transition-colors duration-200 py-2 cursor-pointer hover:underline underline-offset-4"
                aria-label="Contact Support"
              >
                <Mail className="h-7 w-7 mr-2" aria-hidden="true" />
                Contact Support
              </button>
              <a
                href="https://rumiagent.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-400 transition-colors duration-200 py-3"
              >
                For developers &amp; enterprise → rumiagent.com
              </a>
            </div>
          </div>
        </div>
      </footer>
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  )
}
