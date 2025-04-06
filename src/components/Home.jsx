import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー部分 */}
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-gray-800">Comの見本</h1>
      </header>

      {/* 中央メニュー */}
      <main className="flex flex-col items-center mt-10 space-y-4">
        <Link
          to="/Com"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          COMの見本を見る
        </Link>
        <Link
          to="/NewCom"
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          COMの見本を追加
        </Link>
      </main>
    </div>
  );
}
