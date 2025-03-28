import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Com() {
  const [atsukaiList, setAstukaiList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [kiji1List, setKiji1List] = useState([]);
  const [kiji2List, setKiji2List] = useState([]);

  // 初回に扱い事象一覧を取得
  useEffect(() => {
    fetch('http://localhost:4000/atsukai')
    .then(res => res.json())
    .then(data => setAstukaiList(data))
    .catch(err => console.error('取得エラー:', err));
  }, []);

  // 選択された時にkiji1,kiji2を取得・フィルター
  useEffect(() => {
    if (!selectedId) return;

    // kiji1を取得
    fetch('http://localhost:4000/kiji1')
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(item => item.atsukai_id === Number(selectedId));
      setKiji1List(filtered);
    });
    // kiji2を取得
    fetch('http://localhost:4000/kiji2')
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(item => item.atsukai_id === Number(selectedId));
      setKiji2List(filtered);
    });
  }, [selectedId]);

  return (
    <div>
      <h2>COMの見本を表示</h2>
      <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
        <option value="">選択してください</option>
        {atsukaiList.map(item => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {selectedId && (
        <div style={{marginTop: '20px'}}>
          <h3>記事1(kiji1)</h3>
          <ul>
            {kiji1List.map(k => (
              <li key={k.id}>
                {k.content}
              </li>
            ))}
          </ul>

          <h3>記事2(kiji2)</h3>
          <ul>
            {kiji2List.map(k => (
              <li key={k.id}>
                {k.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{marginTop: '30px'}}>
        <Link to="/comedit">COMの内容を編集する</Link>
        <br />
        <Link to="/">ホーム画面に戻る</Link>
      </div>
    </div>
  );
}