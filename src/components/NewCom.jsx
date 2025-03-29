import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function NewCom() {
  const navigate = useNavigate();
  const [ atsukaiName, setAtsukaiName ] = useState('');
  const [ kiji1List, setKiji1List ] = useState(['']);
  const [ kiji2List, setKiji2List ] = useState(['']);

  const handleAddRow = (type) => {
    if (type === 'kiji1') {
      setKiji1List([...kiji1List, '']);
    } else {
      setKiji2List([...kiji2List, '']);
    }
  };

  const handleChange = (type, index, value) => {
    const list = type === 'kiji1' ? [...kiji1List] : [...kiji2List];
    list[index] = value;
    type === 'kiji1' ? setKiji1List(list) : setKiji2List(list);
  };

  const handleSubmit = async () => {
    if (!atsukaiName.trim()) {
      alert('扱い名を入力してください')
      return;
    }
    try {
      // atsukaiの登録
      const atsukaiRes = await fetch(`https://business-api-n4v1.onrender.com/atsukai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: atsukaiName }),
      });
      const atsukai = await atsukaiRes.json();

      // kiji1の登録
      for (const content of kiji1List.filter(v => v.trim())) {
        await fetch(`https://business-api-n4v1.onrender.com/kiji1`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ atsukai_id: atsukai.id,  content }),
        });
      }

      // kiji2の登録
      for (const detail of kiji2List.filter(v => v.trim())) {
        await fetch(`https://business-api-n4v1.onrender.com/kiji2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ atsukai_id: atsukai.id, detail }),
        });
      }
      alert('登録が完了しました!');
      navigate('/Com'); // 一覧ページへ
    } catch(error) {
      console.error('登録エラー:', error);
      alert('登録に失敗しました');
    }
  };

  return (
    <div>
      <h2>新しい事象の登録</h2>
      <div>
        <label>扱い事象名:</label>
        <input
          value={atsukaiName}
          onChange={(e) => setAtsukaiName(e.target.value)}
        />
      </div>

      <h3>記事1</h3>
      {kiji1List.map((val, idx) => (
        <div key={idx}>
          <input
            value={val}
            onChange={(e) => handleChange('kiji1', idx, e.target.value)}
          />
        </div>
      ))}

      <h3>記事2</h3>
      {kiji2List.map((val, idx) => (
        <div key={idx}>
          <input
            value={val}
            onChange={(e) => handleChange('kiji2', idx, e.target.value)}
          />
        </div>
      ))}

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSubmit}>登録</button>
      </div>
      <div>
        <Link to="/">ホーム画面へ</Link>
      </div>
    </div>
  );
}