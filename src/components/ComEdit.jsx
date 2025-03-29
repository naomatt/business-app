// components/ComEdit.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ComEdit() {
  const [atsukaiList, setAtsukaiList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedAtsukai, setSelectedAtsukai] = useState(null);
  const [kiji1List, setKiji1List] = useState([]);
  const [kiji2List, setKiji2List] = useState([]);
  const [newKiji1, setNewKiji1] = useState([]);
  const [newKiji2, setNewKiji2] = useState([]);


  // 初回：atsukai一覧を取得
  useEffect(() => {
    fetch('https://business-api-n4v1.onrender.com/atsukai')
      .then(res => res.json())
      .then(data => setAtsukaiList(data));
  }, []);

  // atsukaiを選択したら、対応するkiji1/kiji2を取得
  useEffect(() => {
    if (!selectedId) return;

    // atsukaiの中身を設定（編集用）
    const selected = atsukaiList.find(item => String(item.id) === String(selectedId));
    setSelectedAtsukai(selected);

    fetch('https://business-api-n4v1.onrender.com/kiji1')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(item => Number(item.atsukai_id) === Number(selectedId));
        setKiji1List(filtered);
      });

    fetch('https://business-api-n4v1.onrender.com/kiji2')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(item => Number(item.atsukai_id) === Number(selectedId));
        setKiji2List(filtered);
      });
  }, [selectedId, atsukaiList]);

  // 更新処理
  const handleUpdate = (id, type, key, value) => {
    let body = {};
    if (type === 'kiji1') {
      const item = kiji1List.find(i => i.id === id);
      body = { content: value, atsukai_id: item.atsukai_id };
    } else if (type === 'kiji2') {
      const item = kiji2List.find(i => i.id === id);
      body = { detail: value, atsukai_id: item.atsukai_id };
    }
    fetch(`https://business-api-n4v1.onrender.com/${type}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };
  // 削除処理
  const handleDelete = (id, type) => {
    if (!window.confirm('削除してよろしいですか？')) return;
    fetch(`https://business-api-n4v1.onrender.com/${type}/${id}`, { method: 'DELETE' })
    .then(() => {
      if (type === 'kiji1') {
        setKiji1List(prev => prev.filter(item => item.id !== id));
      } else {
        setKiji2List(prev => prev.filter(item => item.id !== id));
      }
    });
  };
  // 追加処理
  const handleAdd = (type) => {
    const body =
      type === 'kiji1'
      ? { atsukai_id: Number(selectedId), content: newKiji1 }
      : { atsukai_id: Number(selectedId), detail: newKiji2 };
    fetch(`https://business-api-n4v1.onrender.com/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(res => res.json())
      .then(data => {
        if (type === 'kiji1') {
          setKiji1List(prev => [...prev, data]);
          setNewKiji1('');
        } else {
          setKiji2List(prev => [...prev, data]);
          setNewKiji2('');
        }
      });
  };

  return (
    <div>
      <h2>COMの記事を編集するページ</h2>

      <label>編集したい扱いは？：</label>
      <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
        <option value="">選択してください</option>
        {atsukaiList.map(item => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {selectedAtsukai && (
        <div style={{ marginTop: '20px' }}>
          <p>編集する扱い： {selectedAtsukai.name}</p>

          <h3>記事1(kiji1)</h3>
          <ul>
            {kiji1List.map(item => (
              <li key={item.id}>
                <input
                  defaultValue={item.content}
                  onBlur={(e) =>
                    handleUpdate(item.id, 'kiji1', 'content', e.target.value)
                  }
                />
                <button onClick={() => handleDelete(item.id, 'kiji1')}>削除</button>
              </li>
            ))}
          </ul>
          <input
            placeholder='新しい記事1'
            value={newKiji1}
            onChange={(e) => setNewKiji1(e.target.value)}
          />
          <button onClick={() => handleAdd('kiji1')}>＋追加</button>
          
          <h3>記事2(kiji2)</h3>
          <ul>
            {kiji2List.map(item => (
              <li key={item.id}>
                <input
                  defaultValue={item.detail}
                  onBlur={(e) =>
                    handleUpdate(item.id, 'kiji2', 'detail', e.target.value)
                  }
                />
                <button onClick={() => handleDelete(item.id, 'kiji2')}>削除</button>
              </li>
            ))}
          </ul>
          <input
            placeholder='新しい記事1'
            value={newKiji2}
            onChange={(e) => setNewKiji2(e.target.value)}
          />
          <button onClick={() => handleAdd('kiji2')}>＋追加</button>
        </div>
      )}
      <div>
        <Link to="/">ホーム画面へ</Link>
      </div>
    </div>
  );
}
