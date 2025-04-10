import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          {/* アプリ名にリンクを追加 */}
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:underline">
            My Business App
          </Link>

          <nav className="mt-2 sm:mt-0">
            <ul className="flex gap-4 text-blue-500">
              <li><Link to="/Com" className="hover:underline">COMの見本</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
