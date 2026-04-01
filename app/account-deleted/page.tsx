import Link from "next/link"

export default function AccountDeletedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FAF8F3] dark:bg-[#1a1a1a] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
        <span className="text-2xl">&#x1F44B;</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Your account has been deleted
      </h1>
      <p className="mt-3 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        All your data has been permanently removed. We're sorry to see you go.
        If you change your mind, you can always create a new account.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gray-800 dark:bg-gray-200 px-8 py-3 text-sm font-medium text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
      >
        Return to home
      </Link>
    </div>
  )
}
