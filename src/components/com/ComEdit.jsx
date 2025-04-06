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
        atsukai_order: order
      })
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

  const handleDeleteType = (id) => {
    if (!window.confirm('本当に削除しますか？')) return;
    fetch(`${API}/type/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setTypeList(prev => prev.filter(t => t.id !== id));
      });
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
  ? typeList.filter(t => Number(t.atsukai_order) === Number(selectedAtsukai.display_order))
  : [];

  const filteredKiji1 = kiji1List.filter(item => {
    if (!selectedTypeId) return true;
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
  

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">COMの内容を編集する</h2>
        {/* 扱いの選択 */}
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 mb-10">
        <div className="flex-1">
          <label className="font-semibold block mb-2">編集したい扱い：</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">選択してください</option>
            {atsukaiList.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        {/* 扱い名の編集 */}
        {selectedAtsukai && (
          <div className="flex-1">
            <label className="font-semibold block mb-2">扱い名を編集：</label>
            <div className="flex space-x-2">
              <input
                value={selectedAtsukai.name}
                onChange={(e) =>
                  setSelectedAtsukai({ ...selectedAtsukai, name: e.target.value })
                }
                className="border border-gray-300 p-2 h-10 rounded text-sm flex-grow"
              />
              <button
                onClick={handleUpdateAtsukaiName}
                className="h-10 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                更新
              </button>
            </div>
          </div>
        )}

        {/* 新規typeの追加 */}
        {selectedAtsukai && (
          <div className="flex-1">
            <label className="font-semibold block mb-2">記事タイプを追加：</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="新しい記事タイプ名"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="border border-gray-300 p-2 rounded text-sm flex-grow"
              />
              <button
                onClick={handleAddType}
                className="px-4 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded"
              >
                追加
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedAtsukai && (
        <div>
          {/* type 編集セクション */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">記事タイプの名前を変更・削除</h3>
            {/* 一覧表示 & 編集 */}
            <ul className="space-y-2">
              {filteredTypeList.map(t => (
                <li key={t.id} className="flex items-center space-x-2">
                  <input
                    value={t.name}
                    onChange={(e) => handleTypeNameChange(t.id, e.target.value)}
                    className="border border-gray-300 p-2 rounded text-sm"
                  />
                  
                  <button
                    onClick={() => handleUpdateType(t.id)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    更新
                  </button>
                  <button
                    onClick={() => handleDeleteType(t.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </div>

          


          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">記事1と記事2の編集</h3>
            <div className="mt-4 flex flex-wrap items-start gap-2">
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="border border-gray-300 p-2 text-sm rounded"
              >
                <option value="">記事タイプを選択</option>
                {filteredTypeList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <div className="flex flex-col space-y-1">
                <textarea
                  placeholder="記事1"
                  value={newKiji1}
                  onChange={(e) => setNewKiji1(e.target.value)}
                  className="border border-gray-300 p-2 text-sm rounded w-[300px] h-20 resize-none"
                />
                <button
                  onClick={() => handleAdd('kiji1')}
                  className="h-10 px-4 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded"
                >
                  記事1追加
                </button>
              </div>

              <div className="flex flex-col space-y-1">
                <textarea
                  placeholder="記事2"
                  value={newKiji2}
                  onChange={(e) => setNewKiji2(e.target.value)}
                  className="border border-gray-300 p-2 text-sm rounded w-[300px] h-20 resize-none"
                />
                <button
                  onClick={() => handleAdd('kiji2')}
                  className="h-10 px-4 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded"
                >
                  記事2追加
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">記事1の編集</h3>
            <ul className="space-y-2">
              {filteredKiji1.map(item => {
                const typeName = typeList.find(t => t.id === item.type_id)?.name;
                return (
                  <li key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 bg-white border p-3 rounded shadow">
                    {typeName && (
                      <span className="text-sm text-indigo-600 font-semibold">【{typeName}】</span>
                    )}
                    <textarea
                      defaultValue={item.content}
                      onBlur={(e) => handleUpdate(item.id, 'kiji1', 'content', e.target.value)}
                      className="border border-gray-300 p-2 text-sm rounded w-full sm:w-[500px] h-20 resize-none"
                    />
                    <button
                      onClick={() => handleDelete(item.id, 'kiji1')}
                      className="h-10 px-4 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded mt-2 sm:mt-0"
                    >
                      削除
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>


          <div className="mb-10">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">記事2の編集</h3>
            <ul className="space-y-2">
              {kiji2List
                .filter(item => {
                  if (!selectedTypeId) return true;
                  return String(item.type_id) === selectedTypeId;
                })
                .map(item => {
                  const typeName = typeList.find(t => t.id === item.type_id)?.name;
                  return (
                    <li key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 bg-white border p-3 rounded shadow">
                      {typeName && (
                        <span className="text-sm text-indigo-600 font-semibold">【{typeName}】</span>
                      )}
                      <textarea
                        defaultValue={item.detail}
                        onBlur={(e) => handleUpdate(item.id, 'kiji2', 'detail', e.target.value)}
                        className="border border-gray-300 p-2 text-sm rounded w-full sm:w-[500px] h-20 resize-none"
                      />
                      <button
                        onClick={() => handleDelete(item.id, 'kiji2')}
                        className="h-10 px-4 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded mt-2 sm:mt-0"
                      >
                        削除
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
