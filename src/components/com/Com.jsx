import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Com() {
  const [searchParams] = useSearchParams();
  const defaultId = searchParams.get('id') || '';
  const [atsukaiList, setAtsukaiList] = useState([]);
  const [selectedId, setSelectedId] = useState(defaultId);
  const [kiji1List, setKiji1List] = useState([]);
  const [kiji2List, setKiji2List] = useState([]);
  const [jyoukyouList, setJyoukyouList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [selectedJyoukyouId, setSelectedJyoukyouId] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [search, setSearch] = useState('');
  const API = import.meta.env.VITE_API_BASE;

  const filteredAtsukaiList = atsukaiList.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTypeList = typeList.filter(t =>
    Number(t.atsukai_order) === Number(
      atsukaiList.find(item => item.id == selectedId)?.display_order
    )
  );
  

  useEffect(() => {
    fetch(`${API}/atsukai`)
      .then(res => res.json())
      .then(data => setAtsukaiList(data))
      .catch(err => console.error('atsukai取得エラー:', err));
  }, []);

  useEffect(() => {
    fetch(`${API}/jyoukyou`)
      .then(res => res.json())
      .then(data => setJyoukyouList(data))
      .catch(err => console.error('jyoukyou取得エラー:', err));
  }, []);

  useEffect(() => {
    fetch(`${API}/type`)
      .then(res => res.json())
      .then(data => setTypeList(data))
      .catch(err => console.error('type取得エラー:', err));
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    fetch(`${API}/kiji1`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(item => Number(item.atsukai_id) === Number(selectedId));
        setKiji1List(filtered);
      });

    fetch(`${API}/kiji2`)
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(item => Number(item.atsukai_id) === Number(selectedId));
        setKiji2List(filtered);
      });
  }, [selectedId]);

  const filteredKiji2 = kiji2List.filter(item => {
    if (item.atsukai_id != selectedId) return false;
    if (!selectedTypeId) return true;
    return Number(item.type_id) === Number(selectedTypeId);
  });
  // 追加：kiji1もtype_idでフィルタ
  const filteredKiji1 = kiji1List.filter(item => {
    if (item.atsukai_id != selectedId) return false;
    if (!selectedTypeId) return true;
    return Number(item.type_id) === Number(selectedTypeId);
  });

  

  const getTypeName = (type_id) => {
    const type = typeList.find(t => t.id === type_id);
    return type ? type.name : '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-6">
        {filteredAtsukaiList.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={`cursor-pointer p-4 rounded-lg shadow-md border 
              ${selectedId === String(item.id) ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'}`}
          >
            <h3 className="text-lg font-bold">{item.name}</h3>
          </div>
        ))}
      </div>

      {filteredTypeList.length > 0 && (
        <div className="mb-6">
          <label className="font-semibold block mb-2">記事タイプを選択：</label>
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="">すべて表示</option>
            {filteredTypeList.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      )}



      {(kiji1List.length > 0 || kiji2List.length > 0) && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold text-center text-indigo-600 mb-4">
            『{atsukaiList.find(a => a.id == selectedId)?.name}』 のCOMの記入例
          </h2>



          <div className="mb-6 flex flex-col md:flex-row justify-center gap-8">
            {/* kiji1 */}
            <div className="md:w-1/2">
              <h3 className="font-bold text-gray-700 mb-2">記事1</h3>
              <div className="space-y-3">
                {filteredKiji1.length > 0 ? (
                  filteredKiji1.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded shadow border border-gray-200">
                      <p className="text-gray-800">
                        {item.content || <span className="text-gray-400">記入しない</span>}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">記事1は記入しない</p>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <h3 className="font-bold text-gray-700 mb-2">記事2</h3>
              <div className="space-y-3">
                {filteredKiji2.length > 0 ? (
                  filteredKiji2.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded shadow border border-gray-200">
                      <p className="text-gray-800">
                        {item.detail || <span className="text-gray-400">記入なし</span>}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">記事2がありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link
          to={`/comedit/${selectedId}`}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          内容を編集する
        </Link>
      </div>
    </div>
  );
}
