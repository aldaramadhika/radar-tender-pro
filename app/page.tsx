"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [tab, setTab] = useState("dashboard");
  const [dataAll, setDataAll] = useState<any>({ perusahaan: [], pengalaman: [], pipeline: [], catatan: [], rekaman: [], rekanan: [] });
  const [loading, setLoading] = useState(false);

  const API_URL = "https://script.google.com/macros/s/AKfycbyvh-_d9WtyupB5Xx1_B_iBRbSHU4RzlHvaWFPiP8MEjcljXyGiFksMgp6rjW18LCNn/exec";
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  // State Perusahaan
  const [editIndexP, setEditIndexP] = useState<number | null>(null);
  const [namaP, setNamaP] = useState("");
  const [jenisP, setJenisP] = useState("Pemerintah");
  const [urlP, setUrlP] = useState("");
  const [statusRek, setStatusRek] = useState("Belum");
  const [pernahProj, setPernahProj] = useState("Belum");

  // State Pipeline
  const [editIndexPipe, setEditIndexPipe] = useState<number | null>(null);
  const [pipePerusahaan, setPipePerusahaan] = useState("");
  const [pipeProjek, setPipeProjek] = useState("");
  const [pipeNilai, setPipeNilai] = useState("");
  const [pipeTayang, setPipeTayang] = useState("");
  const [pipeTahapan, setPipeTahapan] = useState("1. Eksplorasi");
  const [pipeCatatan, setPipeCatatan] = useState("");

  // State Portofolio / Pengalaman Manual & Filter
  const [editIndexExp, setEditIndexExp] = useState<number | null>(null);
  const [expPerusahaan, setExpPerusahaan] = useState("");
  const [expIndustri, setExpIndustri] = useState("IT & Software");
  const [expPekerjaan, setExpPekerjaan] = useState("");
  const [expTahun, setExpTahun] = useState("2026");
  const [expLama, setExpLama] = useState("3 Bulan");
  const [expNilai, setExpNilai] = useState("");
  const [expKet, setExpKet] = useState("");
  const [filterIndustri, setFilterIndustri] = useState("Semua");
  const [filterKeyword, setFilterKeyword] = useState("");

  // State Rekanan
  const [editIndexRekanan, setEditIndexRekanan] = useState<number | null>(null);
  const [rekNama, setRekNama] = useState("");
  const [rekProduk, setRekProduk] = useState("");
  const [rekHarga, setRekHarga] = useState("");
  const [rekPic, setRekPic] = useState("");
  const [rekTelp, setRekTelp] = useState("");
  const [rekVisit, setRekVisit] = useState("");
  const [rekKet, setRekKet] = useState("");

  // State Rekaman & AI Assistant
  const [recPerusahaan, setRecPerusahaan] = useState("");
  const [recTopik, setRecTopik] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<any>(null);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);

  // State AI Search Assistant
  const [aiQuery, setAiQuery] = useState("");
  const [aiSearchResult, setAiSearchResult] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // State Catatan
  const [catTopik, setCatTopik] = useState("");
  const [catPerusahaan, setCatPerusahaan] = useState("Umum");
  const [catIsi, setCatIsi] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getAll`);
      const json = await res.json();
      setDataAll(json);
    } catch (e) { console.log("Gagal memuat data"); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenEproc = async (namaPerusahaan: string, url: string) => {
    window.open(url, "_blank");
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "updateClick", namaPerusahaan })
    });
    setTimeout(fetchData, 2000);
  };

  const handleSavePerusahaan = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexP !== null ? "edit" : "add";
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Daftar Perusahaan", action: actionType, rowIndex: editIndexP, nama: namaP, jenis: jenisP, url: urlP, statusRekanan: statusRek, pernahProjek: pernahProj })
    });
    setNamaP(""); setUrlP(""); setEditIndexP(null);
    fetchData();
  };

  const handleSavePipeline = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexPipe !== null ? "edit" : "add";
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Pipeline", action: actionType, rowIndex: editIndexPipe, namaPerusahaan: pipePerusahaan, namaProjek: pipeProjek, estimasiNilai: pipeNilai, tanggalTayang: pipeTayang, tahapan: pipeTahapan, logCatatan: pipeCatatan })
    });
    setPipeProjek(""); setPipeNilai(""); setPipeTayang(""); setPipeCatatan(""); setEditIndexPipe(null);
    fetchData();
  };

  const handleSavePengalaman = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexExp !== null ? "edit" : "add";
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Pengalaman", action: actionType, rowIndex: editIndexExp, namaPerusahaan: expPerusahaan, jenisIndustri: expIndustri, namaPekerjaan: expPekerjaan, tahunPelaksanaan: expTahun, lamaPekerjaan: expLama, nilaiProjek: expNilai, keterangan: expKet })
    });
    setExpPerusahaan(""); setExpPekerjaan(""); setExpNilai(""); setExpKet(""); setEditIndexExp(null);
    fetchData();
  };

  const handleSaveRekanan = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexRekanan !== null ? "edit" : "add";
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Rekanan", action: actionType, rowIndex: editIndexRekanan, namaRekanan: rekNama, produkRekanan: rekProduk, hargaProduk: rekHarga, pic: rekPic, noTelp: rekTelp, terakhirVisit: rekVisit, keterangan: rekKet })
    });
    setRekNama(""); setRekProduk(""); setRekHarga(""); setRekPic(""); setRekTelp(""); setRekVisit(""); setRekKet(""); setEditIndexRekanan(null);
    fetchData();
  };

  const handleInlineStatusChange = async (index: number, newTahapan: string, newStatus: string) => {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Pipeline", action: "updateStatus", rowIndex: index, tahapan: newTahapan, status: newStatus })
    });
    fetchData();
  };

  const handleDelete = async (sheetName: string, rowIndex: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus "${nama}" dan memindahkannya ke Sampah?`)) return;
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "delete", sheetName, rowIndex, alasan: "Dihapus manual dari web" })
    });
    fetchData();
  };

  const handleSaveCatatan = async (e: any) => {
    e.preventDefault();
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Catatan", action: "add", namaPerusahaan: catPerusahaan, topik: catTopik, isiCatatan: catIsi })
    });
    setCatTopik(""); setCatIsi("");
    fetchData();
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      recorder.onstop = () => { setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/webm' })); };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) { alert("Gagal mengakses mikrofon."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track: any) => track.stop());
    }
  };

  const processAudioWithAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Buat ringkasan meeting profesional untuk ${recPerusahaan || "Umum"} dengan topik ${recTopik || "Diskusi"}. Format: 1. Pembahasan, 2. Hambatan, 3. Action Plan.` }] }]
        })
      });
      const json = await res.json();
      setAiResult(json.candidates[0].content.parts[0].text);
    } catch (e) { alert("Gagal memproses AI"); }
    setAiLoading(false);
  };

  const saveRekamanToSheet = async () => {
    if (!aiResult) return;
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Rekaman", action: "add", namaPerusahaan: recPerusahaan || "Umum", topik: recTopik || "Meeting", hasilRangkuman: aiResult })
    });
    alert("Berhasil disimpan!");
    setAiResult(""); setRecTopik(""); setAudioBlob(null);
    fetchData();
  };

  const handleSmartSearch = async (e: any) => {
    e.preventDefault();
    if (!aiQuery) return;
    setSearchLoading(true);
    try {
      const contextData = JSON.stringify(dataAll);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Bertindaklah sebagai asisten data tender profesional. Berdasarkan data keseluruhan berikut: ${contextData}, carikan dan rangkumkan informasi yang sesuai dengan permintaan pengguna ini: "${aiQuery}". Jawab dengan ringkas, jelas, dan terstruktur dalam bahasa Indonesia.` }] }]
        })
      });
      const json = await res.json();
      setAiSearchResult(json.candidates[0].content.parts[0].text);
    } catch (err) {
      setAiSearchResult("Gagal melakukan pencarian cerdas dengan AI.");
    }
    setSearchLoading(false);
  };

  const filteredPengalaman = dataAll.pengalaman.filter((item: any) => {
    const matchIndustri = filterIndustri === "Semua" || item.JenisIndustri === filterIndustri;
    const keyword = filterKeyword.toLowerCase();
    const matchKeyword = !keyword || 
      item.NamaPekerjaan?.toLowerCase().includes(keyword) || 
      item.NamaPerusahaan?.toLowerCase().includes(keyword) || 
      item.Keterangan?.toLowerCase().includes(keyword);
    return matchIndustri && matchKeyword;
  });

  const totalPipeline = dataAll.pipeline.length;
  const hotCount = dataAll.pipeline.filter((p: any) => p.Tahapan?.includes("5.") || p.Tahapan?.includes("6.") || p.Tahapan?.includes("7.")).length;
  const coldCount = dataAll.pipeline.filter((p: any) => p.Tahapan?.includes("1.") || p.Tahapan?.includes("2.") || p.Tahapan?.includes("3.") || p.Tahapan?.includes("4.")).length;
  const failedCount = dataAll.pipeline.filter((p: any) => p.Tahapan?.includes("8.")).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-100 text-slate-800 pb-36 flex flex-col items-center">
      <header className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 text-white shadow-xl py-6 px-6 mb-8 rounded-b-[2.5rem]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-wide">⚡ Radar e-Proc & Tender Pro</h1>
            <p className="text-xs md:text-sm text-indigo-100 font-medium mt-1">Sistem Monitoring e-Procurement & CRM Tender</p>
          </div>
          <div className="flex gap-2 text-xs font-bold">
            <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">🏢 Portal: {dataAll.perusahaan.length}</span>
            <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">🚀 Pipeline: {totalPipeline}</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl px-4 space-y-8">
        {/* TAB 1: DASHBOARD E-PROC */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-5">{editIndexP !== null ? "Edit Portal e-Proc" : "Tambah Portal e-Proc Baru"}</h2>
              <form onSubmit={handleSavePerusahaan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Perusahaan / Instansi</label>
                    <input type="text" placeholder="Contoh: PT Telkom" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={namaP} onChange={e => setNamaP(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Jenis Instansi</label>
                    <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={jenisP} onChange={e => setJenisP(e.target.value)}>
                      <option>Pemerintah</option><option>BUMN/BUMD</option><option>Swasta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">URL / Link e-Proc</label>
                  <input type="url" placeholder="https://..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={urlP} onChange={e => setUrlP(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Status Rekanan</label>
                    <select value={statusRek} onChange={e => setStatusRek(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl"><option>Belum</option><option>Sudah</option></select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Riwayat Projek</label>
                    <select value={pernahProj} onChange={e => setPernahProj(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl"><option>Belum</option><option>Pernah</option></select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg">{editIndexP !== null ? "Simpan Perubahan" : "Simpan Portal"}</button>
              </form>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-5">Daftar Portal Terdaftar ({dataAll.perusahaan.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataAll.perusahaan.map((item: any, i: number) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col justify-between gap-4 shadow-md">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-slate-900">{item.NamaPerusahaan}</h3>
                        <span className="text-[10px] px-3 py-1 rounded-full font-extrabold uppercase bg-indigo-100 text-indigo-700">{item.Jenis}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">Status Rekanan: <strong className="text-indigo-600">{item.StatusRekanan}</strong></p>
                      <p className="text-[11px] text-slate-400 mt-1">🕒 Terakhir diklik: <span className="font-semibold text-slate-600">{item.LastClicked || "Belum pernah"}</span></p>
                      <p className="text-[11px] text-indigo-600 font-bold">📊 Sering dibuka: {item.FrekuensiBuka || 0} kali</p>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditIndexP(i); setNamaP(item.NamaPerusahaan); setJenisP(item.Jenis); setUrlP(item.URL); setStatusRek(item.StatusRekanan); setPernahProj(item.PernahAdaProjek); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-indigo-600 font-bold">Edit</button>
                        <span>|</span>
                        <button onClick={() => handleDelete("Daftar Perusahaan", i, item.NamaPerusahaan)} className="text-rose-600 font-bold">Hapus</button>
                      </div>
                      <button onClick={() => handleOpenEproc(item.NamaPerusahaan, item.URL)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold shadow">Buka e-Proc ↗</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PIPELINE */}
        {tab === "pipeline" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow flex justify-between items-center">
                <div><p className="text-xs font-bold uppercase">🔥 Hot Deals</p><h3 className="text-3xl font-black mt-1">{hotCount}</h3></div>
                <div className="text-3xl">⚡</div>
              </div>
              <div className="bg-blue-500 text-white p-5 rounded-3xl shadow flex justify-between items-center">
                <div><p className="text-xs font-bold uppercase">❄️ Cold Deals</p><h3 className="text-3xl font-black mt-1">{coldCount}</h3></div>
                <div className="text-3xl">🌱</div>
              </div>
              <div className="bg-rose-500 text-white p-5 rounded-3xl shadow flex justify-between items-center">
                <div><p className="text-xs font-bold uppercase">❌ Gagal</p><h3 className="text-3xl font-black mt-1">{failedCount}</h3></div>
                <div className="text-3xl">📋</div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-5">{editIndexPipe !== null ? "Edit Pipeline" : "Tambah Pipeline Baru"}</h2>
              <form onSubmit={handleSavePipeline} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={pipePerusahaan} onChange={e => setPipePerusahaan(e.target.value)} required>
                    <option value="">-- Pilih Perusahaan --</option>
                    {dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan}>{p.NamaPerusahaan}</option>)}
                  </select>
                  <input type="text" placeholder="Nama Projek" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={pipeProjek} onChange={e => setPipeProjek(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Estimasi Nilai (Rp)" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={pipeNilai} onChange={e => setPipeNilai(e.target.value)} />
                  <input type="date" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={pipeTayang} onChange={e => setPipeTayang(e.target.value)} />
                  <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={pipeTahapan} onChange={e => setPipeTahapan(e.target.value)}>
                    <option>1. Eksplorasi</option><option>2. Pendekatan</option><option>3. Penawaran</option><option>4. Menunggu Tender</option><option>5. Tender Tayang</option><option>6. Negosiasi</option><option>7. Menang</option><option>8. Kalah</option>
                  </select>
                </div>
                <textarea placeholder="Catatan singkat..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs" rows={3} value={pipeCatatan} onChange={e => setPipeCatatan(e.target.value)} />
                <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg">Simpan Pipeline</button>
              </form>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-5">Daftar Pipeline ({dataAll.pipeline.length})</h2>
              <div className="space-y-4">
                {dataAll.pipeline.map((p: any, i: number) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow space-y-3">
                    <div className="flex justify-between items-center">
                      <div><span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full uppercase">{p.NamaPerusahaan}</span><h3 className="font-black text-slate-900 mt-1">{p.NamaProjek}</h3></div>
                      <select className="bg-indigo-50 border-2 border-indigo-300 font-extrabold text-xs p-2.5 rounded-2xl" value={p.Tahapan || "1. Eksplorasi"} onChange={(e) => handleInlineStatusChange(i, e.target.value, p.Status || "Aktif")}>
                        <option>1. Eksplorasi</option><option>2. Pendekatan</option><option>3. Penawaran</option><option>4. Menunggu Tender</option><option>5. Tender Tayang</option><option>6. Negosiasi</option><option>7. Menang</option><option>8. Kalah</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs bg-indigo-50/50 p-3 rounded-2xl">
                      <div>💰 Nilai: <strong>{p.EstimasiNilaiProjek || "-"}</strong></div>
                      <div>📅 Tayang: <strong>{p.TanggalEstimasiTayangTender || "-"}</strong></div>
                      <div>🚀 Mulai: <strong>{p.TanggalMulaiPeluang || "-"}</strong></div>
                    </div>
                    {p.LogCatatan && <p className="text-xs bg-slate-50 p-3 rounded-xl border">📝 {p.LogCatatan}</p>}
                    <div className="flex justify-between items-center pt-2 border-t text-xs font-bold">
                      <div className="flex gap-3"><button onClick={() => { setEditIndexPipe(i); setPipePerusahaan(p.NamaPerusahaan); setPipeProjek(p.NamaProjek); setPipeNilai(p.EstimasiNilaiProjek); setPipeTayang(p.TanggalEstimasiTayangTender); setPipeTahapan(p.Tahapan); setPipeCatatan(p.LogCatatan); window.scrollTo({top:200, behavior:'smooth'}); }} className="text-indigo-600">Edit</button><span>|</span><button onClick={() => handleDelete("Pipeline", i, p.NamaProjek)} className="text-rose-600">Hapus</button></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PORTOFOLIO & FILTER */}
        {tab === "portofolio" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-4">{editIndexExp !== null ? "Edit Portofolio" : "➕ Tambah Portofolio Manual"}</h2>
              <form onSubmit={handleSavePengalaman} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nama Perusahaan Klien" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={expPerusahaan} onChange={e => setExpPerusahaan(e.target.value)} required />
                  <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={expIndustri} onChange={e => setExpIndustri(e.target.value)}>
                    <option>IT & Software</option><option>Digital Marketing</option><option>Infrastruktur & Jaringan</option><option>Konsultansi & Audit</option><option>Lainnya</option>
                  </select>
                </div>
                <input type="text" placeholder="Jenis Pekerjaan / Judul Projek" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={expPekerjaan} onChange={e => setExpPekerjaan(e.target.value)} required />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Tahun (2026)" className="p-3 bg-slate-50 border rounded-2xl text-xs" value={expTahun} onChange={e => setExpTahun(e.target.value)} />
                  <input type="text" placeholder="Lama (3 Bulan)" className="p-3 bg-slate-50 border rounded-2xl text-xs" value={expLama} onChange={e => setExpLama(e.target.value)} />
                  <input type="text" placeholder="Nilai Projek (Rp)" className="p-3 bg-slate-50 border rounded-2xl text-xs" value={expNilai} onChange={e => setExpNilai(e.target.value)} />
                </div>
                <textarea placeholder="Keterangan / Deskripsi Projek..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs" rows={2} value={expKet} onChange={e => setExpKet(e.target.value)} />
                <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow">{editIndexExp !== null ? "Simpan Perubahan" : "Simpan Portofolio"}</button>
              </form>
            </div>

            {/* FILTER PORTO */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100 space-y-4">
              <h2 className="font-extrabold text-lg text-indigo-900">🔍 Filter Portofolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Filter Jenis Industri:</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-2xl" value={filterIndustri} onChange={e => setFilterIndustri(e.target.value)}>
                    <option value="Semua">Semua Industri</option>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Infrastruktur & Jaringan">Infrastruktur & Jaringan</option>
                    <option value="Konsultansi & Audit">Konsultansi & Audit</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Cari Keyword (Klien / Pekerjaan):</label>
                  <input type="text" placeholder="Ketik kata kunci..." className="w-full p-3 bg-slate-50 border rounded-2xl" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <h3 className="font-bold text-sm text-slate-700">Hasil Portofolio ({filteredPengalaman.length})</h3>
                {filteredPengalaman.map((item: any, i: number) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-black text-slate-900 text-base">{item.NamaPekerjaan}</h4>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">{item.NamaPerusahaan} • <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">{item.JenisIndustri}</span></p>
                      <p className="text-xs text-slate-500 mt-1">Nilai: <strong>{item.NilaiProjek}</strong> ({item.TahunPelaksanaan}) — Lama: {item.LamaPekerjaan}</p>
                      {item.Keterangan && <p className="text-xs bg-slate-50 p-2 rounded-xl mt-2 text-slate-700">{item.Keterangan}</p>}
                    </div>
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => { setEditIndexExp(i); setExpPerusahaan(item.NamaPerusahaan); setExpIndustri(item.JenisIndustri); setExpPekerjaan(item.NamaPekerjaan); setExpTahun(item.TahunPelaksanaan); setExpLama(item.LamaPekerjaan); setExpNilai(item.NilaiProjek); setExpKet(item.Keterangan); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-indigo-600 font-bold">Edit</button>
                      <span>|</span>
                      <button onClick={() => handleDelete("Pengalaman", i, item.NamaPekerjaan)} className="text-rose-600 font-bold">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REKANAN */}
        {tab === "rekanan" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-4">{editIndexRekanan !== null ? "Edit Rekanan" : "➕ Tambah Rekanan / Partner Baru"}</h2>
              <form onSubmit={handleSaveRekanan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nama Rekanan / Partner" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={rekNama} onChange={e => setRekNama(e.target.value)} required />
                  <input type="text" placeholder="Produk Rekanan" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl" value={rekProduk} onChange={e => setRekProduk(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" placeholder="Harga Produk" className="p-3 bg-slate-50 border rounded-2xl text-xs" value={rekHarga} onChange={e => setRekHarga(e.target.value)} />
                  <input type="text" placeholder="Terakhir Visit (YYYY-MM-DD)" className="p-3 bg-slate-50 border rounded-2xl text-xs" value={rekVisit} onChange={e => setRekVisit(e.target.value)} />
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2">
                  <label className="block text-xs font-extrabold text-indigo-900">👥 Data PIC (Bisa lebih dari 1, tuliskan berurutan dipisah koma atau baris baru agar rapi):</label>
                  <input type="text" placeholder="Contoh: 1. Budi (0812345), 2. Siska (0898765)" className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-medium" value={rekPic} onChange={e => setRekPic(e.target.value)} required />
                  <input type="text" placeholder="No Telp / Kontak Utama PIC" className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-medium" value={rekTelp} onChange={e => setRekTelp(e.target.value)} />
                </div>
                <textarea placeholder="Keterangan partner..." className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs" rows={2} value={rekKet} onChange={e => setRekKet(e.target.value)} />
                <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow">{editIndexRekanan !== null ? "Simpan Perubahan" : "Simpan Rekanan"}</button>
              </form>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-5">Daftar Rekanan & Partner ({dataAll.rekanan.length})</h2>
              <div className="space-y-4">
                {dataAll.rekanan.map((r: any, i: number) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border shadow space-y-2">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{r.NamaRekanan}</span>
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Produk: {r.ProdukRekanan || "-"}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border">
                      <div>💵 Harga: <strong>{r.HargaProduk || "-"}</strong></div>
                      <div>📅 Visit: <strong>{r.TerakhirVisit || "-"}</strong></div>
                      <div className="md:col-span-2">👥 PIC: <strong className="text-indigo-900">{r.PIC}</strong> | 📞 No Telp: <strong>{r.NoTelpPIC}</strong></div>
                    </div>
                    {r.Keterangan && <p className="text-xs text-slate-600">💬 {r.Keterangan}</p>}
                    <div className="flex justify-end gap-3 text-xs pt-2 border-t">
                      <button onClick={() => { setEditIndexRekanan(i); setRekNama(r.NamaRekanan); setRekProduk(r.ProdukRekanan); setRekHarga(r.HargaProduk); setRekPic(r.PIC); setRekTelp(r.NoTelpPIC); setRekVisit(r.TerakhirVisit); setRekKet(r.Keterangan); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-indigo-600 font-bold">Edit</button>
                      <span>|</span>
                      <button onClick={() => handleDelete("Rekanan", i, r.NamaRekanan)} className="text-rose-600 font-bold">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REKAMAN & AI ASSISTANT */}
        {tab === "rekaman" && (
          <div className="space-y-6">
            {/* ASISTEN PENCARIAN PINTAR AI */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-[2rem] shadow-xl space-y-4">
              <div>
                <h3 className="font-extrabold text-lg text-indigo-200">🔍 Asisten Pintar Cari Data dengan AI</h3>
                <p className="text-xs text-slate-300 mt-1">Ketik apa saja (contoh: "pengalaman bumn", "tender telkom", atau "rekanan security"), AI akan mencarikan datanya untuk Anda.</p>
              </div>
              <form onSubmit={handleSmartSearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ketik apa yang ingin dicari..." 
                  className="flex-1 p-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-400 font-medium"
                  value={aiQuery} 
                  onChange={e => setAiQuery(e.target.value)} 
                  required 
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3.5 rounded-2xl font-bold text-xs shadow transition">
                  {searchLoading ? "Mencari..." : "Cari AI"}
                </button>
              </form>
              {aiSearchResult && (
                <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 text-xs leading-relaxed space-y-2">
                  <strong className="text-indigo-300 block">✨ Hasil Pencarian AI:</strong>
                  <p className="whitespace-pre-line text-slate-200 font-medium">{aiSearchResult}</p>
                </div>
              )}
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100 space-y-4">
              <h2 className="font-extrabold text-xl text-indigo-900">🎙️ Perekam Meeting & Rangkuman AI</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="w-full p-3.5 bg-slate-50 border rounded-2xl" value={recPerusahaan} onChange={e => setRecPerusahaan(e.target.value)}>
                  <option value="">-- Pilih Perusahaan --</option>
                  {dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan}>{p.NamaPerusahaan}</option>)}
                </select>
                <input type="text" placeholder="Topik Meeting" className="w-full p-3.5 bg-slate-50 border rounded-2xl" value={recTopik} onChange={e => setRecTopik(e.target.value)} />
              </div>
              <div className="flex gap-3">
                {!isRecording ? (
                  <button onClick={startRecording} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow">🎙️ Mulai Rekam</button>
                ) : (
                  <button onClick={stopRecording} className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow animate-pulse">⏹️ Selesai Rekam</button>
                )}
                {audioBlob && !isRecording && (
                  <button onClick={processAudioWithAI} className="bg-violet-600 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow">{aiLoading ? "Memproses..." : "✨ Buat Rangkuman AI"}</button>
                )}
              </div>
              {aiResult && (
                <div className="space-y-3 pt-4 border-t">
                  <textarea className="w-full p-4 bg-slate-50 border rounded-2xl text-xs leading-relaxed" rows={6} value={aiResult} onChange={e => setAiResult(e.target.value)} />
                  <button onClick={saveRekamanToSheet} className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow">💾 Simpan ke Sheets</button>
                </div>
              )}
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-4">Riwayat Rekaman ({dataAll.rekaman.length})</h2>
              <div className="space-y-3">
                {dataAll.rekaman.map((r: any, i: number) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border shadow space-y-2">
                    <div className="flex justify-between font-bold text-xs text-indigo-600">
                      <span>{r.Topik} • <strong className="text-slate-900">{r.NamaPerusahaan}</strong></span>
                      <span className="text-slate-400">{r.Tanggal}</span>
                    </div>
                    <p className="text-slate-700 text-xs whitespace-pre-line bg-slate-50 p-3 rounded-xl">{r.HasilRangkuman}</p>
                    <div className="flex justify-end pt-1"><button onClick={() => handleDelete("Rekaman", i, r.Topik)} className="text-xs text-rose-600 font-bold">Hapus</button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CATATAN */}
        {tab === "catatan" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-4">Tulis Catatan / Strategi</h2>
              <form onSubmit={handleSaveCatatan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Topik Catatan" className="w-full p-3.5 bg-slate-50 border rounded-2xl" value={catTopik} onChange={e => setCatTopik(e.target.value)} required />
                  <select className="w-full p-3.5 bg-slate-50 border rounded-2xl" value={catPerusahaan} onChange={e => setCatPerusahaan(e.target.value)}>
                    <option value="Umum">Umum / Semua</option>
                    {dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan}>{p.NamaPerusahaan}</option>)}
                  </select>
                </div>
                <textarea placeholder="Isi catatan..." className="w-full p-3.5 bg-slate-50 border rounded-2xl text-xs" rows={3} value={catIsi} onChange={e => setCatIsi(e.target.value)} required />
                <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow">Simpan Catatan</button>
              </form>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-indigo-100">
              <h2 className="font-extrabold text-lg text-indigo-900 mb-4">Daftar Catatan ({dataAll.catatan.length})</h2>
              <div className="space-y-3">
                {dataAll.catatan.map((c: any, i: number) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border shadow space-y-1">
                    <div className="flex justify-between font-bold text-xs text-indigo-600"><span>{c.Topik} ({c.NamaPerusahaan})</span><span className="text-slate-400">{c.Tanggal}</span></div>
                    <p className="text-slate-700 text-xs">{c.IsiCatatan}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION (6 MENU) */}
      <nav className="fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl border border-indigo-100 p-2.5 max-w-xl mx-auto rounded-full shadow-2xl flex justify-around text-[10px] md:text-xs font-bold z-50">
        <button onClick={() => setTab("dashboard")} className={`flex items-center gap-1 px-3 py-2 rounded-full transition ${tab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}><span>🏢</span><span>e-Proc</span></button>
        <button onClick={() => setTab("pipeline")} className={`flex items-center gap-1 px-3 py-2 rounded-full transition ${tab === 'pipeline' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}><span>🚀</span><span>Pipeline</span></button>
        <button onClick={() => setTab("portofolio")} className={`flex items-center gap-1 px-3 py-2 rounded-full transition ${tab === 'portofolio' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}><span>🏆</span><span>Portofolio</span></button>
        <button onClick={() => setTab("rekanan")} className={`flex items-center gap-1 px-3 py-2 rounded-full transition ${tab === 'rekanan' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}><span>🤝</span><span>Rekanan</span></button>
        <button onClick={() => setTab("rekaman")} className={`flex items-center gap-1 px-3 py-2 rounded-full transition ${tab === 'rekaman' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}><span>🎙️</span><span>AI</span></button>
        <button onClick={() => setTab("catatan")} className={`flex items-center gap-1 px-3 py-2 rounded-full transition ${tab === 'catatan' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}><span>📝</span><span>Catatan</span></button>
      </nav>
    </main>
  );
}
