import Link from 'next/link';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            SecureTask Manager
          </Link>
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Tasks
            </Link>
            <Link 
              href="/chat" 
              className="text-indigo-600 dark:text-indigo-400 font-medium"
            >
              AI Chat
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}