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
    <div className="min-h-screen bg-white text-black px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-10 border-b pb-4 border-black">COM内容の確認</h1>

      <div className="mb-6">
        <label className="block font-semibold text-[#1B435D] mb-2">どの扱いを見ますか？</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full sm:w-1/2 border border-black p-2 rounded focus:outline-none focus:ring focus:ring-black/30 transition"
        >
          <option value="">選択してください</option>
          {atsukaiList.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {filteredTypeList.length > 0 && (
        <div className="mb-6">
          <label className="block font-semibold text-[#1B435D] mb-2">扱いの種類を絞り込む</label>
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            className="w-full sm:w-1/2 border border-black p-2 rounded focus:outline-none focus:ring focus:ring-black/30 transition"
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
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-wide">
                {atsukaiList.find(a => a.id == selectedId)?.name || ''}{typeList.find(t => t.id == selectedTypeId)?.name || ''}
              </h2>
              <p className="mt-1 text-sm text-gray-500">の COM 記入例</p>
            </div>



            {memo && (
                <div className="my-6 p-4 border border-gray-800 rounded shadow-sm bg-gray-50">
                  <strong className="text-sm text-gray-600 mb-1 font-semibold">📌 処理メモ</strong>
                  <p className="whitespace-pre-wrap text-sm text-gray-900">{memo}</p>
                </div>
              )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* 記事1 */}
              <div className="bg-white border border-black p-4 rounded shadow-sm">
                <h3 className="text-base font-semibold mb-3 text-black">記事1</h3>
                {filteredKiji(kiji1List, selectedTypeId).length > 0 ? (
                  filteredKiji(kiji1List, selectedTypeId).map(item => (
                    <div key={item.id} className="p-3 rounded mb-3 shadow-inner">
                      <p className="text-gray-800 text-sm">{item.content || '記入なし'}</p>
                    </div>
                  ))
                ) : <p className="text-gray-400">記事1は記入されていません</p>}
              </div>

              {/* 記事2 */}
              <div className="bg-white border border-black p-4 rounded shadow-sm">
                <h3 className="text-base font-semibold mb-3 text-black">記事2</h3>
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
                className="mt-8 inline-block px-6 py-2 border border-black text-black rounded hover:bg-black hover:text-white transition"
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
