"use client"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitContactForm, type ContactFormState } from "@/app/contact-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300 text-base" disabled={pending}>
      {pending ? "Sending..." : "Send Message"}
    </Button>
  )
}

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const initialState: ContactFormState = {}
  const [formState, formAction] = useActionState(submitContactForm, initialState)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-w-md p-6 bg-gray-900 rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">Contact Us</h2>

        {formState?.success ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-500 mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-10 h-10"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-medium text-white mb-2">Message Sent!</h3>
            <p className="text-gray-300 text-base md:text-lg mb-6">{formState.message}</p>
            <Button onClick={onClose} className="bg-yellow-400 text-black hover:bg-yellow-300 text-base">
              Close
            </Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-base md:text-lg font-medium text-gray-200 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-base md:text-lg font-medium text-gray-200 mb-1">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-base md:text-lg font-medium text-gray-200 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>

            {formState?.error && (
              <div className="text-red-500 text-base md:text-lg p-2 bg-red-950 bg-opacity-30 rounded border border-red-800">
                {formState.error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 text-base"
              >
                Cancel
              </Button>
              <SubmitButton />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
