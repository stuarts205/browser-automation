import { auth } from "@clerk/nextjs/server"

export default async function TestPage() {
  const { userId } = await auth.protect()

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <p className="text-sm">
        Protected page. Signed in as <span className="font-mono">{userId}</span>.
      </p>
    </div>
  )
}
