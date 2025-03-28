import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>ホーム画面</h1>
      <nav>
        <ul>
          <li><Link to="/Com">Com一覧へ</Link></li>
          <li><Link to="/NewCom">扱い事象の新規登録へ</Link></li>
        </ul>
      </nav>
    </div>
  );
}