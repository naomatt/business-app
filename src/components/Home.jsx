import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* ヘッダー */}
      <header className="border-b border-gray-300 py-6 px-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">COMのこと</h1>
        <Link
          to="/Com"
          className="px-5 py-2 border border-black text-black hover:bg-black hover:text-white transition rounded-md text-sm"
        >
          COMの見本を見る
        </Link>
      </header>

      {/* メインメニュー */}
      <main className="flex flex-col items-center justify-center py-20 space-y-6">
        <p className="text-lg text-gray-700">ようこそ。</p>
        <p className="text-sm text-gray-700">ページを選んでください。</p>

        {/* 今後ページ追加されることを想定 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/Com"
            className="px-6 py-3 border border-black rounded hover:bg-black hover:text-white transition"
          >
            COMの見本を見る
          </Link>

          {/* 追加予定ボタンの例（コメントアウトしてもOK） */}
          {/* 
          <Link
            to="/AnotherPage"
            className="px-6 py-3 border border-black rounded hover:bg-black hover:text-white transition"
          >
            別ページ
          </Link>
          */}
        </div>
      </main>
    </div>
  );
}
