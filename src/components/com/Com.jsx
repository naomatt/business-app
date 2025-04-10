import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Com() {
  const [searchParams] = useSearchParams();
  const defaultId = searchParams.get('id') || '';
  const [atsukaiList, setAtsukaiList] = useState([]);
  const [selectedId, setSelectedId] = useState(defaultId);
  const [kiji1List, setKiji1List] = useState([]);
  const [kiji2List, setKiji2List] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE;

  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (!selectedId || !selectedTypeId) {
      setMemo('');
      return;
    }
  
    fetch(`${API}/memo?type_id=${selectedTypeId}&atsukai_id=${selectedId}`)
      .then(res => res.json())
      .then(data => {
        setMemo(data?.content || '');
      });
  }, [selectedId, selectedTypeId]);
  

  useEffect(() => {
    if (!selectedId || typeList.length === 0 || atsukaiList.length === 0) return;
  
    const displayOrder = atsukaiList.find(item => item.id == selectedId)?.display_order;
    const relatedTypes = typeList.filter(t => Number(t.atsukai_order) === Number(displayOrder));
  
    if (relatedTypes.length > 0) {
      setSelectedTypeId(String(relatedTypes[0].id)); // ✅ ここで自動選択！
    } else {
      setSelectedTypeId('');
      setMemo(''); // ← typeがない場合はmemoもリセット
    }
  }, [selectedId, typeList, atsukaiList]);
  

  useEffect(() => {
    const fetchMemo = () => {
      if (!selectedId || !selectedTypeId || selectedTypeId === '__null__') {
        setMemo('');
        return;
      }
      fetch(`${API}/memo?type_id=${selectedTypeId}&atsukai_id=${selectedId}`)
        .then(res => res.json())
        .then(data => {
          setMemo(data?.content || '');
        });
    };
    fetchMemo();
  }, [selectedId, selectedTypeId]);

  const filteredTypeList = typeList
  .filter(t =>
    Number(t.atsukai_order) === Number(
      atsukaiList.find(item => item.id == selectedId)?.display_order
    )
  )
  .sort((a, b) => a.display_order - b.display_order); // ←★ ソート追加


  useEffect(() => {
    setLoading(true);
    fetch(`${API}/atsukai`).then(res => res.json()).then(setAtsukaiList).finally(() => setLoading(false));
    fetch(`${API}/type`).then(res => res.json()).then(setTypeList);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/kiji1`).then(res => res.json()),
      fetch(`${API}/kiji2`).then(res => res.json())
    ]).then(([k1, k2]) => {
      setKiji1List(k1.filter(item => item.atsukai_id == selectedId));
      setKiji2List(k2.filter(item => item.atsukai_id == selectedId));
    }).finally(() => setLoading(false));
  }, [selectedId, selectedTypeId]);

  useEffect(() => {
    if (filteredTypeList.length > 0 && !selectedTypeId) {
      setSelectedTypeId(String(filteredTypeList[0].id));
    }
  }, [filteredTypeList]);
  useEffect(() => {
    console.log('selectedTypeId:', selectedTypeId);
  }, [selectedTypeId]);
  
  

  const filteredKiji = (list, typeId) => {
    return list.filter(item => {
      if (item.atsukai_id != selectedId) return false;
      if (!typeId) return true;
      if (typeId === '__null__') return item.type_id == null;
      return String(item.type_id) === typeId;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 bg-[#D5EEFF] rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center text-[#1B435D] mb-8">COM内容の確認</h1>

      <div className="mb-6">
        <label className="block font-semibold text-[#1B435D] mb-2">どの扱いを見ますか？</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full sm:w-1/2"
        >
          <option value="">選択してください</option>
          {atsukaiList.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {filteredTypeList.length > 0 && (
        <div className="mb-6">
          <label className="block font-semibold text-[#1B435D] mb-2">記事タイプを絞り込む</label>
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full sm:w-1/2"
          >
            {filteredTypeList.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-10 text-lg animate-pulse">
          Now Loading...
        </div>
      ) : (
        (kiji1List.length > 0 || kiji2List.length > 0) && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-bold text-center text-[#1B435D] mb-6">
              『{atsukaiList.find(a => a.id == selectedId)?.name}』 のCOM記入例
            </h2>
            {memo && (
                <div className="my-4 p-3 bg-blue-50 border border-blue-300 text-sm rounded">
                  <strong className="block text-blue-700">📌 処理メモ</strong>
                  <p className="text-gray-700 whitespace-pre-wrap">{memo}</p>
                </div>
              )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* 記事1 */}
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-[#1B435D] font-bold mb-3">記事1</h3>
                {filteredKiji(kiji1List, selectedTypeId).length > 0 ? (
                  filteredKiji(kiji1List, selectedTypeId).map(item => (
                    <div key={item.id} className="p-3 rounded mb-3 shadow-inner">
                      <p className="text-gray-800 text-sm">{item.content || '記入なし'}</p>
                    </div>
                  ))
                ) : <p className="text-gray-400">記事1は記入されていません</p>}
              </div>

              {/* 記事2 */}
              <div className="bg-white p-4 rounded-lg shadow border border-[#78BBE6]">
                <h3 className="text-[#1B435D] font-bold mb-3">記事2</h3>
                {filteredKiji(kiji2List, selectedTypeId).length > 0 ? (
                  filteredKiji(kiji2List, selectedTypeId).map(item => (
                    <div key={item.id} className="p-3 rounded mb-3 shadow-inner">
                      <p className="text-gray-800 text-sm">{item.detail || '記入なし'}</p>
                    </div>
                  ))
                ) : <p className="text-gray-400">記事2は記入されていません</p>}
              </div>

            </div>

            <div className="mt-10 flex justify-center">
              <Link
                to={`/comedit/${selectedId}`}
                className="px-6 py-3 bg-[#F99F48] text-white font-semibold rounded shadow hover:bg-orange-500 transition"
              >
                内容を編集する
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
}
