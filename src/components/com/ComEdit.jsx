// ComEdit.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function ComEdit() {
  const { id } = useParams();
  const [atsukaiList, setAtsukaiList] = useState([]);
  const [selectedId, setSelectedId] = useState(id || '');
  const [selectedAtsukai, setSelectedAtsukai] = useState(null);
  const [kiji1List, setKiji1List] = useState([]);
  const [kiji2List, setKiji2List] = useState([]);
  const [newKiji1, setNewKiji1] = useState('');
  const [newKiji2, setNewKiji2] = useState('');
  const API = import.meta.env.VITE_API_BASE;
  const [typeList, setTypeList] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedKiji1Id, setSelectedKiji1Id] = useState('');
  const [memoContent, setMemoContent] = useState('');
  const [memoId, setMemoId] = useState(null);
  const [newMemoContent, setNewMemoContent] = useState('');
  const [memoList, setMemoList] = useState([]);
  // 🔄 状態で管理
  const [linkedTypeIds, setLinkedTypeIds] = useState([]);

  // 初回のみデータ取得（API経由）
  useEffect(() => {
    const fetchLinkedIds = async () => {
      const [kiji1Res, kiji2Res, memoRes] = await Promise.all([
        fetch(`${API}/kiji1`).then(res => res.json()),
        fetch(`${API}/kiji2`).then(res => res.json()),
        fetch(`${API}/memo/list`).then(res => res.json())
      ]);

      setKiji1List(kiji1Res); // 🔁 ついでにここで状態に保持もOK
      setKiji2List(kiji2Res);
      setMemoList(memoRes);

      const ids = new Set();
      kiji1Res.forEach(k => k.type_id && ids.add(Number(k.type_id)));
      kiji2Res.forEach(k => k.type_id && ids.add(Number(k.type_id)));
      memoRes.forEach(m => m.type_id && ids.add(Number(m.type_id)));

      setLinkedTypeIds(Array.from(ids));
    };

    fetchLinkedIds();
  }, [API]);

  // ✨ リストの更新を検知して再構成（手動削除時のリアルタイム反映）
  useEffect(() => {
    const updateLinkedIds = () => {
      const ids = new Set();
      kiji1List.forEach(k => k.type_id && ids.add(Number(k.type_id)));
      kiji2List.forEach(k => k.type_id && ids.add(Number(k.type_id)));
      memoList.forEach(m => m.type_id && ids.add(Number(m.type_id)));

      setLinkedTypeIds(Array.from(ids));
    };

    updateLinkedIds();
  }, [kiji1List, kiji2List, memoList]);

   // typeとatsukaiの両方が選ばれた後にメモを取得
  useEffect(() => {
    if (!selectedTypeId || selectedTypeId === '__null__' || !selectedId) {
      setMemoContent('');
      setMemoId(null);
      return;
    }

    fetch(`${API}/memo?type_id=${selectedTypeId}&atsukai_id=${selectedId}`)
      .then(res => res.json())
      .then(data => {
        console.log('📥 memo取得:', data);
        if (data) {
          setMemoId(data.id);
          setMemoContent(data.content);
        } else {
          setMemoId(null);
          setMemoContent('');
        }
        setNewMemoContent('');
      });
  }, [selectedTypeId, selectedId]); // ← ここ大事！


  const handleMemoSave = () => {
    const confirm = window.confirm('メモが更新されます！！よろしいですか？？');
    if (!confirm) return;

    const method = memoId ? 'PUT' : 'POST';
    const url = memoId ? `${API}/memo/${memoId}` : `${API}/memo`;
    const body = memoId
      ? JSON.stringify({ content: memoContent })
      : JSON.stringify({ type_id: selectedTypeId, atsukai_id: selectedId, content: memoContent });

  
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    })
      .then(res => res.json())
      .then(data => {
        alert('メモを保存しました');
        if (!memoId) setMemoId(data.id);
      });
  };
  const handleMemoDelete = () => {
    if (!memoId) return;
    if (!window.confirm('本当にメモを削除しますか？')) return;
  
    fetch(`${API}/memo/${memoId}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(() => {
        setMemoContent('');
        setMemoId(null);
        alert('メモを削除しました');
      });
  };

  const handleAddType = () => {
    if (!newTypeName) return alert('タイプ名を入力してください');
    if (!newTypeName.trim()) return alert('タイプ名を入力してください');
  
    const selected = atsukaiList.find(item => String(item.id) === String(selectedId));
    const order = selected?.display_order;
  
    if (!order) {
      return alert('扱いの表示順（display_order）が取得できませんでした');
    }
  
    fetch(`${API}/type`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newTypeName,
        atsukai_order: selectedAtsukai.display_order
      }),
    })
      .then(res => res.json())
      .then(data => {
        setTypeList(prev => [...prev, data]);
        setNewTypeName('');
      });
  };

  const handleTypeNameChange = (id, name) => {
    setTypeList(prev =>
      prev.map(t => (t.id === id ? { ...t, name } : t))
    );
  };

  const handleTypeOrderChange = (id, order) => {
    setTypeList(prev =>
      prev.map(t => (t.id === id ? { ...t, atsukai_order: Number(order) } : t))
    );
  };

  const handleUpdateType = (id) => {
    const target = typeList.find(t => t.id === id);
    fetch(`${API}/type/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: target.name, atsukai_order: target.atsukai_order }),
    })
      .then(res => res.json())
      .then(data => {
        alert('記事タイプを更新しました');
      });
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;
  
    try {
      const [kiji1Res, kiji2Res, memoRes] = await Promise.all([
        fetch(`${API}/kiji1`).then(res => res.json()),
        fetch(`${API}/kiji2`).then(res => res.json()),
        fetch(`${API}/memo/list`).then(res => res.json())
      ]);
  
      const isKiji1Linked = kiji1Res.some(k => String(k.type_id) === String(id));
      const isKiji2Linked = kiji2Res.some(k => String(k.type_id) === String(id));
      const isMemoLinked = memoRes.some(m => String(m.type_id) === String(id));
  
      if (isKiji1Linked || isKiji2Linked || isMemoLinked) {
        alert('このtypeには紐づく記事またはメモがあるため削除できません。先に関連データを削除してください。');
        return;
      }
  
      await fetch(`${API}/type/${id}`, { method: 'DELETE' });
      setTypeList(prev => prev.filter(t => t.id !== id));
  
    } catch (err) {
      alert('削除時にエラーが発生しました。コンソールをご確認ください。');
      console.error('削除エラー:', err);
    }
  };
  


  useEffect(() => {
    fetch(`${API}/atsukai`)
      .then(res => res.json())
      .then(data => setAtsukaiList(data));

    fetch(`${API}/type`)
      .then(res => res.json())
      .then(data => setTypeList(data));
  }, []);
  
  useEffect(() => {
    fetch(`${API}/memo/list`)
      .then(res => res.json())
      .then(data => {
        setMemoList(data || []);
      });
  }, []);
  

  useEffect(() => {
    if (!selectedId || atsukaiList.length === 0) return;

    const selected = atsukaiList.find(item => String(item.id) === String(selectedId));
    setSelectedAtsukai(selected);

    fetch(`${API}/kiji1`)
      .then(res => res.json())
      .then(data => setKiji1List(data.filter(item => Number(item.atsukai_id) === Number(selectedId))));

    fetch(`${API}/kiji2`)
      .then(res => res.json())
      .then(data => setKiji2List(data.filter(item => Number(item.atsukai_id) === Number(selectedId))));
  }, [selectedId, atsukaiList]);

  const filteredTypeList = selectedAtsukai
  ? typeList
      .filter(t => Number(t.atsukai_order) === Number(selectedAtsukai.display_order))
      .sort((a, b) => a.display_order - b.display_order) // ←★ ソート追加
  : [];

  const filteredKiji1 = kiji1List.filter(item => {
    if (item.atsukai_id != selectedId) return false;
    if (selectedTypeId === '') return true;
    if (selectedTypeId === '__null__') return item.type_id == null;
    return String(item.type_id) === selectedTypeId;
  });
  
  const filteredKiji2 = kiji2List.filter(item => {
    if (item.atsukai_id != selectedId) return false;
    if (selectedTypeId === '') return true;
    if (selectedTypeId === '__null__') return item.type_id == null;
    return String(item.type_id) === selectedTypeId;
  });
  
  const filteredMemoList = memoList.filter(item => {
    const isAtsukaiMatch = String(item.atsukai_id) === String(selectedId);
  
    if (!isAtsukaiMatch) return false;
  
    if (selectedTypeId === '') return true;
    if (selectedTypeId === '__null__') return item.type_id == null;
  
    return String(item.type_id) === selectedTypeId;
  });
  
  
  


  const handleUpdateAtsukaiName = () => {
    const inputName = selectedAtsukai.name.trim().toLowerCase();
    const isDuplicate = atsukaiList.some(item =>
      item.id !== selectedAtsukai.id &&
      item.name.trim().toLowerCase() === inputName
    );

    if (isDuplicate) {
      alert('同じ名前の扱いがすでに存在します！');
      return;
    }

    fetch(`${API}/atsukai/${selectedAtsukai.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: selectedAtsukai.name }),
    })
      .then(res => res.json())
      .then(data => {
        alert('atsukaiの名前を変更しました');
        setAtsukaiList(prev => prev.map(item => item.id === data.updated.id ? data.updated : item));
      });
  };

  const handleUpdate = (id, type, key, value) => {
    const item = (type === 'kiji1' ? kiji1List : kiji2List).find(i => i.id === id);
    if (!item) return;

    const body = type === 'kiji1'
      ? { content: value, atsukai_id: item.atsukai_id }
      : { detail: value, atsukai_id: item.atsukai_id };

    fetch(`${API}/${type}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  const handleUpdateMemo = (id, content) => {
    fetch(`${API}/memo/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
      .then(res => res.json())
      .then(data => {
        alert('メモを更新しました！');
        // 必要なら state を更新する処理もここに書けます
      });
  };
  
  const handleDelete = (id, type) => {
    if (!window.confirm('削除してよろしいですか？')) return;
    fetch(`${API}/${type}/${id}`, { method: 'DELETE' })
      .then(() => {
        if (type === 'kiji1') {
          setKiji1List(prev => prev.filter(item => item.id !== id));
        } else {
          setKiji2List(prev => prev.filter(item => item.id !== id));
        }
      });
  };

  const handleAdd = (type) => {
    const body =
      type === 'kiji1'
        ? {
            atsukai_id: Number(selectedId),
            content: newKiji1,
            type_id: selectedTypeId ? Number(selectedTypeId) : null,
          }
        : {
            atsukai_id: Number(selectedId),
            detail: newKiji2,
            type_id: selectedTypeId ? Number(selectedTypeId) : null,
          };
  
    fetch(`${API}/${type}`, {
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

  const handleAddBoth = async () => {
    if (!selectedTypeId || selectedTypeId === '__null__') {
      alert('記事タイプを選択してください');
      return;
    }
  
    // kiji1登録
    if (newKiji1.trim()) {
      await fetch(`${API}/kiji1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atsukai_id: Number(selectedId),
          content: newKiji1,
          type_id: Number(selectedTypeId),
        }),
      })
        .then(res => res.json())
        .then(data => {
          setKiji1List(prev => [...prev, data]);
          setNewKiji1('');
        });
    }
  
    // kiji2登録
    if (newKiji2.trim()) {
      await fetch(`${API}/kiji2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atsukai_id: Number(selectedId),
          detail: newKiji2,
          type_id: Number(selectedTypeId),
        }),
      })
        .then(res => res.json())
        .then(data => {
          setKiji2List(prev => [...prev, data]);
          setNewKiji2('');
        });
    }
  
    // memo登録
    if (newMemoContent.trim()) {
      const existingMemo = memoList.find(
        m => String(m.type_id) === String(selectedTypeId) && String(m.atsukai_id) === String(selectedId)
      );
      
      const method = existingMemo ? 'PUT' : 'POST';
      const url = existingMemo ? `${API}/memo/${existingMemo.id}` : `${API}/memo`;
      const body = existingMemo
        ? JSON.stringify({ content: newMemoContent })
        : JSON.stringify({
            type_id: Number(selectedTypeId),
            atsukai_id: Number(selectedId),
            content: newMemoContent,
          });
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      })
        .then(res => res.json())
        .then(data => {
          if (!existingMemo) {
            setMemoList(prev => [...prev, data]); // 新規追加ならリストに加える
          } else {
            setMemoList(prev =>
              prev.map(m => (m.id === data.id ? data : m)) // 上書きなら内容を更新
            );
          }
          setNewMemoContent('');
        });      
    }
  
    alert('登録完了しました！');
    setSelectedTypeId('');
  };

  const handleAddNewMemo = () => {
    if (!newMemoContent.trim()) return;
  
    fetch(`${API}/memo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type_id: Number(selectedTypeId),
        atsukai_id: Number(selectedId),
        content: newMemoContent,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert('メモを登録しました！');
        setMemoContent(data.content);
        setMemoId(data.id);
        setMemoList((prev) => [...prev, data]);
        setNewMemoContent('');
      });
  };
  
  

  const selectedType = selectedTypeId === '__null__'
  ? null
  : typeList.find(t => String(t.id) === String(selectedTypeId));

  const atsukaiName = selectedAtsukai?.name || '';
  const typeName = selectedTypeId === '__null__' ? '' : selectedType?.name || '';

  const selectedAtsukaiName = atsukaiList.find(a => String(a.id) === String(selectedId))?.name;
  


  
  

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 bg-white text-black">
      <h2 className="text-3xl font-bold mb-8 text-center border-b border-black pb-4">COMの内容を編集する</h2>
      {/* 扱いの選択 */}
      <div className="mb-10 bg-gray-100 border border-black rounded-xl p-6 shadow-sm">
        <label className="text-sm text-gray-600 mb-1">どの扱いを編集する？</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="border border-black p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black/30"
        >
          <option value="">選択してください</option>
          {atsukaiList.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {selectedAtsukai && (
        <div>
          {/* type 編集セクション */}
          <div className="mb-10 bg-gray-100 border border-black rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">処理内容を追加・編集・削除</h3>

            <div className="flex flex-col md:flex-row gap-6">
              {/* いまある処理一覧 */}
              <div className="flex-1">
                <h4 className="text-sm text-gray-600 mb-1">存在する処理内容</h4>
                <ul className="space-y-2">
                  {filteredTypeList.map(t => (
                    <li key={t.id} className="flex items-center space-x-2">
                      <input
                        value={t.name}
                        onChange={(e) => handleTypeNameChange(t.id, e.target.value)}
                        className="border border-gray-300 p-2 rounded text-sm flex-grow"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleUpdateType(t.id)}
                          className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-white hover:text-black border border-black transition"
                        >
                          更新
                        </button>

                        <div className="relative group inline-block">
                          <button
                            onClick={() => handleDeleteType(t.id)}
                            disabled={linkedTypeIds.includes(t.id)}
                            className={`px-3 py-1 text-sm rounded border border-black transition
                              ${linkedTypeIds.includes(t.id)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-white hover:text-black'}
                            `}
                          >
                            削除
                          </button>

                          {linkedTypeIds.includes(t.id) && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max max-w-[200px] 
                                            text-xs bg-black text-white px-2 py-1 rounded 
                                            opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                              紐づくデータがあるため削除できません
                            </div>
                          )}
                        </div>



                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 新規処理の追加 */}
              <div className="flex-1">
                <label className="text-sm text-gray-600 mb-1">新しい処理内容を追加</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="処理名を入力"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    className="border border-gray-300 p-2 rounded text-sm w-full"
                  />
                  <button
                    onClick={handleAddType}
                    className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-white hover:text-black border border-black transition"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 bg-gray-100 border border-black rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">記事を編集する処理</h3>
            <select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              className="border border-gray-300 p-2 text-sm rounded mb-6 w-full max-w-xs"
            >
              <option value="">すべて表示</option>
              {filteredTypeList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* 記事1と記事2とMemoの新規追加 */}
          <div className="mb-10 bg-gray-100 border border-black rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">新規で追加</h3>
              
              <div className="flex flex-col md:flex-row items-start gap-4">
                
                {/* 記事1 */}
                <div className="w-full flex-1 flex flex-col space-y-1">
                  <div className="text-sm text-indigo-600 font-semibold">
                    【{atsukaiName}{typeName} の記事1】
                  </div>
                  <textarea
                    placeholder="記事1"
                    value={newKiji1}
                    onChange={(e) => setNewKiji1(e.target.value)}
                    className="border border-black rounded p-2 w-full text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* 記事2 */}
                <div className="w-full flex-1 flex flex-col space-y-1">
                  <div className="text-sm text-indigo-600 font-semibold">
                    【{atsukaiName}{typeName} の記事2】
                  </div>
                  <textarea
                    placeholder="記事2"
                    value={newKiji2}
                    onChange={(e) => setNewKiji2(e.target.value)}
                    className="border border-black rounded p-2 w-full text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
              {/* memoの登録 */}
              <div className="flex-1 flex flex-col space-y-1 mt-10">
                <h3 className="text-lg font-semibold text-indigo-700">{atsukaiName}{typeName}のMemo</h3>
                {memoId ? (
                  <>
                    <div className="text-sm text-blue-600">📝 以下のメモが登録されています。「メモを更新」すると上書きされます。</div>
                    <textarea
                      value={memoContent}
                      onChange={(e) => setMemoContent(e.target.value)}
                      className="border border-black rounded p-2 w-full text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="メモ内容を編集..."
                    />
                    <button
                      onClick={handleMemoSave}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-white hover:text-black border border-black transition"
                    >
                      メモを更新
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-gray-500">⚠ まだメモは登録されていません。</div>
                    <textarea
                      value={newMemoContent}
                      onChange={(e) => setNewMemoContent(e.target.value)}
                      className="border border-black rounded p-2 w-full text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="新しいメモを入力..."
                    />
                    <button
                      onClick={handleAddNewMemo}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-white hover:text-black border border-black transition"
                    >
                      メモだけ登録
                    </button>
                  </>
                )}
              </div>
            {/* 登録ボタン */}
            <div className="mt-5">
              <button
                onClick={handleAddBoth}
                className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-white hover:text-black border border-black transition"
              >
                記事1・記事2・メモを登録
              </button>
            </div>
          </div>

          {/* すでにある記事の編集 */}
          <div className="mb-10 bg-gray-100 border border-black rounded-xl p-6 shadow-sm">

            {/* 編集欄 */}
            
              <h3 className="text-lg font-semibold mb-4 text-gray-700">既存の記事を編集</h3> 
              
              {/* Memoの編集 */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-4 text-gray-700">登録済みのメモ</h4>
                <ul className="space-y-4">
                  {filteredMemoList.map(item => {
                    const type = typeList.find(t => t.id === item.type_id);
                    const typeName = type?.name || '（未分類）';

                    const handleMemoContentChange = (id, newContent) => {
                      setMemoList(prev =>
                        prev.map(m => (m.id === id ? { ...m, content: newContent } : m))
                      );
                    };

                    const handleUpdateMemo = (id) => {
                      const target = memoList.find(m => m.id === id);
                      if (!target) return;

                      fetch(`${API}/memo/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: target.content }),
                      })
                        .then(res => res.json())
                        .then(updated => {
                          setMemoList(prev =>
                            prev.map(m => (m.id === id ? { ...m, content: updated.content } : m))
                          );
                          alert('メモを更新しました！');
                        });
                    };

                    const handleDeleteMemo = (id) => {
                      if (!window.confirm('このメモを削除しますか？')) return;

                      fetch(`${API}/memo/${id}`, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(() => {
                          setMemoList(prev => prev.filter(m => m.id !== id));
                          if (memoId === id) {
                            setMemoId(null);
                            setMemoContent('');
                          }
                        });
                    };

                    return (
                      <li key={item.id} className="bg-blue-50 border p-4 mb-5 rounded shadow space-y-2">
                        <div className="text-sm font-semibold text-indigo-600">
                          【{atsukaiName}{typeName} のメモ】
                        </div>
                        <textarea
                          value={item.content}
                          onChange={(e) => handleMemoContentChange(item.id, e.target.value)}
                          className="border border-gray-300 p-2 text-sm rounded w-full h-20 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateMemo(item.id)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            更新
                          </button>
                          <button
                            onClick={() => handleDeleteMemo(item.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            削除
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                {/* 記事1 編集 */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700">記事1</h4>
                  <ul className="space-y-4">
                    {filteredKiji1.map(item => {
                      const type = typeList.find(t => t.id === item.type_id);
                      const typeName = type?.name || '';
                      const atsukaiName = selectedAtsukai?.name || '扱い未選択';

                      return (
                        <li key={item.id} className="flex flex-col bg-white border p-4 rounded shadow space-y-2">
                          <div className="text-sm text-indigo-600 font-semibold">
                            【{atsukaiName}{typeName} の記事1】
                          </div>

                          <textarea
                            defaultValue={item.content}
                            onBlur={(e) => setValue(e.target.value)}
                            className="border border-gray-300 p-2 text-sm rounded w-full h-20 resize-none"
                          />

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(item.id, 'kiji1', 'content', value)}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                            >
                              更新
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, 'kiji1')}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
                            >
                              削除
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* 記事2 編集 */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-4 text-gray-700">記事2</h4>
                  <ul className="space-y-4">
                    {filteredKiji2.map(item => {
                      const type = typeList.find(t => t.id === item.type_id);
                      const typeName = type?.name || '';
                      const atsukaiName = selectedAtsukai?.name || '扱い未選択';
                      return (
                        <li key={item.id} className="flex flex-col bg-white border p-4 rounded shadow space-y-2">
                          <div className="text-sm text-indigo-600 font-semibold">
                            【{atsukaiName}{typeName} の記事2】
                          </div>

                          <textarea
                            defaultValue={item.detail}
                            onBlur={(e) => setValue(e.target.value)}
                            className="border border-gray-300 p-2 text-sm rounded w-full h-20 resize-none"
                          />

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(item.id, 'kiji2', 'detail', value)}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                            >
                              更新
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, 'kiji2')}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
                            >
                              削除
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

              </div>
            

          </div>
        </div>
      )}
      <div className="mt-10 flex justify-center">
              <Link
                to={`/com/`}
                className="mt-8 inline-block px-6 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition"
              >
                Com一覧へ
              </Link>
            </div>
    </div>
  );
}
