import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Omniflo Platform</h1>
        <p className="text-xl mb-8">
          A modern web application template with authentication and API routes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/sign-in" 
            className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="text-blue-600 border border-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
