"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [tab, setTab] = useState("dashboard");
  const [dataAll, setDataAll] = useState<any>({ perusahaan: [], pengalaman: [], pipeline: [], catatan: [], rekaman: [], rekanan: [] });
  const [loading, setLoading] = useState(false);

  const API_URL = "https://script.google.com/macros/s/AKfycbyvh-_d9WtyupB5Xx1_B_iBRbSHU4RzlHvaWFPiP8MEjcljXyGiFksMgp6rjW18LCNn/exec"; // Pastikan URL ini adalah URL Deploy Apps Script terbaru Anda
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
  const [pipeStatus, setPipeStatus] = useState("Cold");
  const [pipeCatatan, setPipeCatatan] = useState("");

  // State Portofolio (Pengalaman)
  const [editIndexExp, setEditIndexExp] = useState<number | null>(null);
  const [expPerusahaan, setExpPerusahaan] = useState("");
  const [expIndustri, setExpIndustri] = useState("IT & Software");
  const [expPekerjaan, setExpPekerjaan] = useState("");
  const [expTahun, setExpTahun] = useState(new Date().getFullYear().toString());
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

  // State Rekaman & AI
  const [recPerusahaan, setRecPerusahaan] = useState("");
  const [recTopik, setRecTopik] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<any>(null);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);

  // State AI Search
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
    // Akan me-reset status "NEW" menjadi "NO_CHANGE"
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "updateClick", namaPerusahaan })
    });
    setTimeout(fetchData, 2000);
  };

  // HANDLER SIMPAN (Perusahaan, Pipeline, Pengalaman, Rekanan, Catatan)
  const handleSavePerusahaan = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexP !== null ? "edit" : "add";
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Daftar Perusahaan", action: actionType, rowIndex: editIndexP, nama: namaP, jenis: jenisP, url: urlP, statusRekanan: statusRek, pernahProjek: pernahProj }) });
    setNamaP(""); setUrlP(""); setEditIndexP(null); fetchData();
  };

  const handleSavePipeline = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexPipe !== null ? "edit" : "add";
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Pipeline", action: actionType, rowIndex: editIndexPipe, namaPerusahaan: pipePerusahaan, namaProjek: pipeProjek, estimasiNilai: pipeNilai, tanggalTayang: pipeTayang, tahapan: pipeTahapan, status: pipeStatus, logCatatan: pipeCatatan }) });
    setPipeProjek(""); setPipeNilai(""); setPipeTayang(""); setPipeCatatan(""); setPipeStatus("Cold"); setEditIndexPipe(null); fetchData();
  };

  const handleSavePengalaman = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexExp !== null ? "edit" : "add";
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Pengalaman", action: actionType, rowIndex: editIndexExp, namaPerusahaan: expPerusahaan, jenisIndustri: expIndustri, namaPekerjaan: expPekerjaan, tahunPelaksanaan: expTahun, lamaPekerjaan: expLama, nilaiProjek: expNilai, keterangan: expKet }) });
    setExpPerusahaan(""); setExpPekerjaan(""); setExpNilai(""); setExpKet(""); setEditIndexExp(null); fetchData();
  };

  const handleSaveRekanan = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexRekanan !== null ? "edit" : "add";
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Rekanan", action: actionType, rowIndex: editIndexRekanan, namaRekanan: rekNama, produkRekanan: rekProduk, hargaProduk: rekHarga, pic: rekPic, noTelp: rekTelp, terakhirVisit: rekVisit, keterangan: rekKet }) });
    setRekNama(""); setRekProduk(""); setRekHarga(""); setRekPic(""); setRekTelp(""); setRekVisit(""); setRekKet(""); setEditIndexRekanan(null); fetchData();
  };

  const handleSaveCatatan = async (e: any) => {
    e.preventDefault();
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Catatan", action: "add", namaPerusahaan: catPerusahaan, topik: catTopik, isiCatatan: catIsi }) });
    setCatTopik(""); setCatIsi(""); fetchData();
  };

  const handleInlineStatusChange = async (index: number, newTahapan: string, newStatus: string) => {
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Pipeline", action: "updateStatus", rowIndex: index, tahapan: newTahapan, status: newStatus }) });
    fetchData();
  };

  const handleDelete = async (sheetName: string, rowIndex: number, nama: string) => {
    if (!confirm(`Yakin menghapus "${nama}"?`)) return;
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "delete", sheetName, rowIndex, alasan: "Dihapus dari web" }) });
    fetchData();
  };

  // AI SEARCH PINTAR
  const handleSmartSearch = async (e: any) => {
    e.preventDefault();
    if (!aiQuery) return;
    setSearchLoading(true);
    try {
      const ringkasanData = {
        perusahaan: dataAll.perusahaan.map((p:any) => `${p.NamaPerusahaan} (${p.Jenis})`),
        pengalaman: dataAll.pengalaman.map((p:any) => `${p.NamaPekerjaan} di ${p.NamaPerusahaan}`),
        pipeline: dataAll.pipeline.map((p:any) => `${p.NamaProjek} (${p.NamaPerusahaan})`),
        rekanan: dataAll.rekanan.map((r:any) => `${r.NamaRekanan} - ${r.ProdukRekanan}`),
      };
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Kamu adalah asisten tender cerdas. Berdasarkan ringkasan data ini: ${JSON.stringify(ringkasanData)}. Jawab pencarian ini dengan singkat & terstruktur: "${aiQuery}"` }] }]
        })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setAiSearchResult(json.candidates[0].content.parts[0].text);
    } catch (err: any) {
      setAiSearchResult(`Gagal mencari: Pastikan API Key valid atau coba kata kunci lain. (${err.message})`);
    }
    setSearchLoading(false);
  };

  // FITUR REKAMAN & TRANSLATE AI
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
    } catch (err) { alert("Gagal mengakses mikrofon. Pastikan izin browser aktif."); }
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
          contents: [{ parts: [{ text: `Buat ringkasan meeting profesional untuk klien ${recPerusahaan || "Umum"} dengan topik ${recTopik || "Diskusi"}. Format: 1. Pembahasan Utama, 2. Hambatan/Catatan, 3. Action Plan (Tindak Lanjut).` }] }]
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

  // FILTER PORTOFOLIO
  const filteredPengalaman = dataAll.pengalaman.filter((item: any) => {
    const matchIndustri = filterIndustri === "Semua" || item.JenisIndustri === filterIndustri;
    const keyword = filterKeyword.toLowerCase();
    const matchKeyword = !keyword || 
      item.NamaPekerjaan?.toLowerCase().includes(keyword) || 
      item.NamaPerusahaan?.toLowerCase().includes(keyword) || 
      item.Keterangan?.toLowerCase().includes(keyword);
    return matchIndustri && matchKeyword;
  });

  // PERHITUNGAN PIE CHART PIPELINE (HOT, WARM, COLD, GAGAL)
  const totalPipeline = dataAll.pipeline.length || 1; 
  const hotCount = dataAll.pipeline.filter((p: any) => p.Status === "Hot").length;
  const warmCount = dataAll.pipeline.filter((p: any) => p.Status === "Warm").length;
  const coldCount = dataAll.pipeline.filter((p: any) => (!p.Status || p.Status === "Cold" || p.Status === "Aktif")).length; // Default Cold
  const gagalCount = dataAll.pipeline.filter((p: any) => p.Status === "Gagal").length;

  const hotPct = (hotCount / totalPipeline) * 100;
  const warmPct = (warmCount / totalPipeline) * 100;
  const coldPct = (coldCount / totalPipeline) * 100;

  const pieChartStyle = {
    background: `conic-gradient(
      #ef4444 0% ${hotPct}%, 
      #f59e0b ${hotPct}% ${hotPct + warmPct}%, 
      #3b82f6 ${hotPct + warmPct}% ${hotPct + warmPct + coldPct}%, 
      #64748b ${hotPct + warmPct + coldPct}% 100%
    )`
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 text-slate-800 pb-36 font-sans">
      {/* HEADER FULL COLOR */}
      <header className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white shadow-2xl py-8 px-6 mb-8 rounded-b-[3rem]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">⚡ Radar Tender Pro</h1>
            <p className="text-sm text-white/90 font-medium mt-1 tracking-wide">Sistem Monitoring e-Procurement Pintar</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
            <span className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/40 shadow-lg">🏢 Portal: {dataAll.perusahaan.length}</span>
            <span className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/40 shadow-lg">🚀 Peluang: {dataAll.pipeline.length}</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto px-4 space-y-8">
        
        {/* ================= TAB 1: DASHBOARD E-PROC ================= */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white">
              <h2 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-6">{editIndexP !== null ? "✏️ Edit Portal" : "➕ Tambah Portal Baru"}</h2>
              <form onSubmit={handleSavePerusahaan} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Nama Perusahaan / Instansi</label>
                    <input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition" value={namaP} onChange={e => setNamaP(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Jenis Instansi</label>
                    <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition" value={jenisP} onChange={e => setJenisP(e.target.value)}>
                      <option>Pemerintah</option><option>BUMN/BUMD</option><option>Swasta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">URL e-Proc</label>
                  <input type="url" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition" value={urlP} onChange={e => setUrlP(e.target.value)} required />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-violet-200 transition-all">{editIndexP !== null ? "Simpan Perubahan" : "Simpan Portal"}</button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dataAll.perusahaan.map((item: any, i: number) => {
                // LOGIKA ICON UPDATE WEB
                let statusIcon = null;
                if (item.StatusUpdate === "NEW") {
                  statusIcon = <span className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider animate-pulse shadow-lg shadow-rose-300">🔥 NEW TENDER</span>;
                } else if (item.StatusUpdate === "NO_CHANGE") {
                  statusIcon = <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold">✅ Tak Ada Ubahan</span>;
                } else if (item.StatusUpdate === "BLOCKED") {
                  statusIcon = <span className="bg-amber-100 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-xl text-[10px] font-bold">🛡️ Cek Manual</span>;
                }

                return (
                <div key={i} className={`bg-white p-6 rounded-[2rem] border shadow-xl hover:shadow-2xl transition flex flex-col justify-between gap-4 ${item.StatusUpdate === "NEW" ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-extrabold text-lg text-slate-800 leading-tight">{item.NamaPerusahaan}</h3>
                      <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider bg-gradient-to-r from-fuchsia-100 to-pink-100 text-fuchsia-700">{item.Jenis}</span>
                    </div>
                    <div className="space-y-1 text-xs font-medium text-slate-500">
                      <p>Status Rekanan: <strong className="text-violet-600">{item.StatusRekanan}</strong></p>
                      <p>🕒 Terakhir Klik: <strong className="text-slate-700">{item.LastClicked || "Belum"}</strong></p>
                      <p>📊 Frekuensi: <strong className="text-teal-600">{item.FrekuensiBuka || 0} Kali</strong></p>
                    </div>
                  </div>
                  
                  {/* Bagian Tombol dan Indikator Status Cek Bot */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex gap-3 text-xs font-bold">
                        <button onClick={() => { setEditIndexP(i); setNamaP(item.NamaPerusahaan); setJenisP(item.Jenis); setUrlP(item.URL); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-violet-600 hover:text-violet-800">Edit</button>
                        <button onClick={() => handleDelete("Daftar Perusahaan", i, item.NamaPerusahaan)} className="text-rose-500 hover:text-rose-700">Hapus</button>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusIcon}
                      </div>
                    </div>
                    <button onClick={() => handleOpenEproc(item.NamaPerusahaan, item.URL)} className={`w-full text-white px-5 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${item.StatusUpdate === "NEW" ? 'bg-gradient-to-r from-rose-500 to-red-500 shadow-rose-300 hover:from-rose-600 hover:to-red-600' : 'bg-gradient-to-r from-teal-400 to-emerald-500 shadow-emerald-200'}`}>
                      <span>Buka e-Proc ↗</span>
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* ================= TAB 2: PIPELINE DENGAN PIE CHART ================= */}
        {tab === "pipeline" && (
          <div className="space-y-8">
            
            {/* PIE CHART & STATISTIK */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full shadow-inner flex items-center justify-center shrink-0" style={pieChartStyle}>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-slate-800">{dataAll.pipeline.length}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl"><p className="text-xs font-bold text-rose-500 uppercase">🔥 Hot</p><h3 className="text-2xl font-black text-rose-700">{hotCount}</h3></div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl"><p className="text-xs font-bold text-amber-500 uppercase">☀️ Warm</p><h3 className="text-2xl font-black text-amber-700">{warmCount}</h3></div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl"><p className="text-xs font-bold text-blue-500 uppercase">❄️ Cold</p><h3 className="text-2xl font-black text-blue-700">{coldCount}</h3></div>
                <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl"><p className="text-xs font-bold text-slate-500 uppercase">❌ Gagal</p><h3 className="text-2xl font-black text-slate-700">{gagalCount}</h3></div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white">
              <h2 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-6">{editIndexPipe !== null ? "✏️ Edit Pipeline" : "➕ Tambah Pipeline"}</h2>
              <form onSubmit={handleSavePipeline} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={pipePerusahaan} onChange={e => setPipePerusahaan(e.target.value)} required>
                    <option value="">-- Pilih Perusahaan --</option>
                    {dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan}>{p.NamaPerusahaan}</option>)}
                  </select>
                  <input type="text" placeholder="Nama Projek" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={pipeProjek} onChange={e => setPipeProjek(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Nilai (Rp)" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={pipeNilai} onChange={e => setPipeNilai(e.target.value)} />
                  <input type="date" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={pipeTayang} onChange={e => setPipeTayang(e.target.value)} />
                  <select className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={pipeTahapan} onChange={e => setPipeTahapan(e.target.value)}>
                    <option>1. Eksplorasi</option><option>2. Pendekatan</option><option>3. Penawaran</option><option>4. Menunggu Tender</option><option>5. Tender Tayang</option><option>6. Negosiasi</option><option>7. Menang</option>
                  </select>
                  <select className="p-4 bg-blue-50 text-blue-700 font-bold border-2 border-blue-200 rounded-2xl" value={pipeStatus} onChange={e => setPipeStatus(e.target.value)}>
                    <option value="Hot">🔥 Hot</option><option value="Warm">☀️ Warm</option><option value="Cold">❄️ Cold</option><option value="Gagal">❌ Gagal</option>
                  </select>
                </div>
                <textarea placeholder="Catatan singkat..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" rows={3} value={pipeCatatan} onChange={e => setPipeCatatan(e.target.value)} />
                <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200">Simpan Pipeline</button>
              </form>
            </div>

            <div className="space-y-5">
              {dataAll.pipeline.map((p: any, i: number) => {
                const isHot = p.Status === "Hot";
                const isWarm = p.Status === "Warm";
                const isGagal = p.Status === "Gagal";
                return (
                <div key={i} className={`p-6 rounded-[2rem] border shadow-lg flex flex-col gap-4 ${isHot ? 'bg-rose-50 border-rose-100' : isWarm ? 'bg-amber-50 border-amber-100' : isGagal ? 'bg-slate-100 border-slate-200' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{p.NamaPerusahaan}</span>
                      <h3 className="font-extrabold text-lg text-slate-800 leading-tight">{p.NamaProjek}</h3>
                    </div>
                    <div className="flex gap-2">
                      <select className="bg-white border border-slate-200 font-bold text-xs p-2 rounded-xl" value={p.Tahapan || "1. Eksplorasi"} onChange={(e) => handleInlineStatusChange(i, e.target.value, p.Status || "Cold")}>
                        <option>1. Eksplorasi</option><option>2. Pendekatan</option><option>3. Penawaran</option><option>4. Menunggu Tender</option><option>5. Tender Tayang</option><option>6. Negosiasi</option><option>7. Menang</option>
                      </select>
                      <select className={`font-bold text-xs p-2 rounded-xl border ${isHot ? 'bg-rose-100 text-rose-700 border-rose-200' : isWarm ? 'bg-amber-100 text-amber-700 border-amber-200' : isGagal ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700 border-blue-200'}`} value={p.Status || "Cold"} onChange={(e) => handleInlineStatusChange(i, p.Tahapan, e.target.value)}>
                        <option value="Hot">🔥 Hot</option><option value="Warm">☀️ Warm</option><option value="Cold">❄️ Cold</option><option value="Gagal">❌ Gagal</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-white/60 p-4 rounded-2xl">
                    <div>💰 Nilai: <strong className="block text-sm">{p.EstimasiNilaiProjek || "-"}</strong></div>
                    <div>📅 Tayang: <strong className="block">{p.TanggalEstimasiTayangTender || "-"}</strong></div>
                  </div>
                  {p.LogCatatan && <p className="text-xs bg-white p-3 rounded-xl italic text-slate-600">📝 "{p.LogCatatan}"</p>}
                  <div className="flex justify-end gap-4 text-xs font-bold pt-2">
                    <button onClick={() => { setEditIndexPipe(i); setPipePerusahaan(p.NamaPerusahaan); setPipeProjek(p.NamaProjek); setPipeNilai(p.EstimasiNilaiProjek); setPipeTayang(p.TanggalEstimasiTayangTender); setPipeTahapan(p.Tahapan); setPipeStatus(p.Status); setPipeCatatan(p.LogCatatan); window.scrollTo({top:400, behavior:'smooth'}); }} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete("Pipeline", i, p.NamaProjek)} className="text-rose-500 hover:underline">Hapus</button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PORTOFOLIO & FILTER ================= */}
        {tab === "portofolio" && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
               <h2 className="font-extrabold text-xl text-slate-800 mb-6">{editIndexExp !== null ? "✏️ Edit Portofolio" : "➕ Tambah Portofolio Manual"}</h2>
               <form onSubmit={handleSavePengalaman} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nama Klien" className="p-4 bg-slate-50 border border-slate-200 rounded-2xl w-full focus:border-indigo-500" value={expPerusahaan} onChange={e => setExpPerusahaan(e.target.value)} required />
                    <select className="p-4 bg-slate-50 border border-slate-200 rounded-2xl w-full focus:border-indigo-500" value={expIndustri} onChange={e => setExpIndustri(e.target.value)}>
                      <option>IT & Software</option><option>Digital Marketing</option><option>Infrastruktur & Jaringan</option><option>Konsultansi & Audit</option><option>Lainnya</option>
                    </select>
                  </div>
                  <input type="text" placeholder="Judul Projek" className="p-4 bg-slate-50 border border-slate-200 rounded-2xl w-full focus:border-indigo-500" value={expPekerjaan} onChange={e => setExpPekerjaan(e.target.value)} required />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" placeholder="Tahun (2026)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={expTahun} onChange={e => setExpTahun(e.target.value)} />
                    <input type="text" placeholder="Lama (3 Bulan)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={expLama} onChange={e => setExpLama(e.target.value)} />
                    <input type="text" placeholder="Nilai Projek (Rp)" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={expNilai} onChange={e => setExpNilai(e.target.value)} />
                  </div>
                  <textarea placeholder="Deskripsi Projek..." className="p-4 bg-slate-50 border border-slate-200 rounded-2xl w-full focus:border-indigo-500" rows={2} value={expKet} onChange={e => setExpKet(e.target.value)} />
                  <button type="submit" className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold shadow-lg">Simpan Portofolio</button>
               </form>
            </div>

            {/* Filter */}
            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
              <h2 className="font-extrabold text-indigo-900 mb-4">🔍 Filter Portofolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <select className="w-full p-3 bg-white border border-indigo-200 rounded-xl" value={filterIndustri} onChange={e => setFilterIndustri(e.target.value)}>
                  <option value="Semua">Semua Industri</option>
                  <option value="IT & Software">IT & Software</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Infrastruktur & Jaringan">Infrastruktur & Jaringan</option>
                  <option value="Konsultansi & Audit">Konsultansi & Audit</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                <input type="text" placeholder="Cari Klien / Pekerjaan..." className="w-full p-3 bg-white border border-indigo-200 rounded-xl" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} />
              </div>
            </div>
               
            {/* List Portofolio */}
            <div className="space-y-4">
              {filteredPengalaman.map((item:any, i:number)=>(
                <div key={i} className="p-6 bg-white rounded-3xl border shadow-lg flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-black text-slate-800">{item.NamaPekerjaan}</h4>
                    <p className="text-xs font-bold text-indigo-600 mt-1">{item.NamaPerusahaan} • <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded">{item.JenisIndustri}</span></p>
                    <p className="text-xs text-slate-500 mt-2">Nilai: <strong className="text-slate-800">{item.NilaiProjek}</strong> ({item.TahunPelaksanaan}) — Lama: {item.LamaPekerjaan}</p>
                    {item.Keterangan && <p className="text-xs bg-slate-50 p-3 rounded-xl mt-3 text-slate-600">{item.Keterangan}</p>}
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <button onClick={() => { setEditIndexExp(i); setExpPerusahaan(item.NamaPerusahaan); setExpIndustri(item.JenisIndustri); setExpPekerjaan(item.NamaPekerjaan); setExpTahun(item.TahunPelaksanaan); setExpLama(item.LamaPekerjaan); setExpNilai(item.NilaiProjek); setExpKet(item.Keterangan); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-indigo-600">Edit</button>
                    <button onClick={() => handleDelete("Pengalaman", i, item.NamaPekerjaan)} className="text-rose-500">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: REKANAN ================= */}
        {tab === "rekanan" && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
              <h2 className="font-extrabold text-xl text-slate-800 mb-6">{editIndexRekanan !== null ? "✏️ Edit Rekanan" : "➕ Tambah Rekanan Baru"}</h2>
              <form onSubmit={handleSaveRekanan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nama Rekanan" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={rekNama} onChange={e => setRekNama(e.target.value)} required />
                  <input type="text" placeholder="Produk / Layanan" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={rekProduk} onChange={e => setRekProduk(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Harga / Rate" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={rekHarga} onChange={e => setRekHarga(e.target.value)} />
                  <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={rekVisit} onChange={e => setRekVisit(e.target.value)} />
                </div>
                <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100">
                  <label className="block text-xs font-bold text-teal-800 mb-2">👥 PIC (Bisa lebih dari 1, pisahkan dengan koma)</label>
                  <input type="text" placeholder="Contoh: Budi, Siska" className="w-full p-3 bg-white border border-teal-200 rounded-xl mb-3" value={rekPic} onChange={e => setRekPic(e.target.value)} required />
                  <input type="text" placeholder="No Telp: 0812..., 0813..." className="w-full p-3 bg-white border border-teal-200 rounded-xl" value={rekTelp} onChange={e => setRekTelp(e.target.value)} />
                </div>
                <textarea placeholder="Keterangan..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" rows={2} value={rekKet} onChange={e => setRekKet(e.target.value)} />
                <button type="submit" className="w-full bg-teal-600 text-white p-4 rounded-2xl font-bold shadow-lg">Simpan Rekanan</button>
              </form>
            </div>

            <div className="space-y-4">
              {dataAll.rekanan.map((r: any, i: number) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border shadow-lg space-y-3">
                  <div className="flex justify-between font-black text-slate-800 text-lg">
                    <span>{r.NamaRekanan}</span>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">{r.ProdukRekanan || "Umum"}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                    <div>💵 Harga: <strong>{r.HargaProduk || "-"}</strong></div>
                    <div>📅 Visit Terakhir: <strong>{r.TerakhirVisit || "-"}</strong></div>
                    <div className="md:col-span-2">👥 PIC: <strong className="text-teal-700">{r.PIC}</strong> | 📞 No: <strong>{r.NoTelpPIC}</strong></div>
                  </div>
                  {r.Keterangan && <p className="text-xs text-slate-600 italic">💬 {r.Keterangan}</p>}
                  <div className="flex justify-end gap-4 text-xs font-bold pt-2">
                    <button onClick={() => { setEditIndexRekanan(i); setRekNama(r.NamaRekanan); setRekProduk(r.ProdukRekanan); setRekHarga(r.HargaProduk); setRekPic(r.PIC); setRekTelp(r.NoTelpPIC); setRekVisit(r.TerakhirVisit); setRekKet(r.Keterangan); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-teal-600">Edit</button>
                    <button onClick={() => handleDelete("Rekanan", i, r.NamaRekanan)} className="text-rose-500">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: PENCARIAN & AI REKAMAN ================= */}
        {tab === "rekaman" && (
          <div className="space-y-8">
            
            {/* CARI AI (SMART SEARCH) */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <h3 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-cyan-300 mb-2">🔍 AI Data Explorer</h3>
              <p className="text-xs text-indigo-200 mb-6 font-medium">Tanya AI untuk mencari proyek, rekanan, atau portofolio. (Contoh: "Klien BUMN apa saja?")</p>
              
              <form onSubmit={handleSmartSearch} className="flex gap-3 relative z-10">
                <input type="text" placeholder="Tanya sesuatu ke AI..." className="flex-1 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-sm text-white placeholder-indigo-300 outline-none focus:ring-2 focus:ring-fuchsia-400" value={aiQuery} onChange={e => setAiQuery(e.target.value)} required />
                <button type="submit" className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-pink-500/30">{searchLoading ? "Mencari..." : "Cari"}</button>
              </form>
              
              {aiSearchResult && (
                <div className="mt-6 bg-white/5 backdrop-blur-lg p-5 rounded-2xl border border-white/10 text-sm leading-relaxed text-slate-200">
                  <strong className="text-fuchsia-300 block mb-2">✨ Jawaban AI:</strong>
                  <p className="whitespace-pre-line">{aiSearchResult}</p>
                </div>
              )}
            </div>

            {/* PEREKAM MEETING AI */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
              <h2 className="font-extrabold text-xl text-slate-800 mb-5">🎙️ Perekam Meeting Cerdas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={recPerusahaan} onChange={e => setRecPerusahaan(e.target.value)}><option value="">-- Pilih Klien --</option>{dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan}>{p.NamaPerusahaan}</option>)}</select>
                <input type="text" placeholder="Topik Meeting" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={recTopik} onChange={e => setRecTopik(e.target.value)} />
              </div>
              
              <div className="flex gap-4">
                {!isRecording ? (
                  <button onClick={startRecording} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 flex-1">🎙️ Mulai Rekam</button>
                ) : (
                  <button onClick={stopRecording} className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg animate-pulse flex-1">⏹️ Berhenti</button>
                )}
                {audioBlob && !isRecording && (
                  <button onClick={processAudioWithAI} className="bg-violet-600 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg flex-1">{aiLoading ? "Memproses AI..." : "✨ Buat Rangkuman"}</button>
                )}
              </div>

              {aiResult && (
                <div className="mt-6 space-y-4">
                  <textarea className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed" rows={8} value={aiResult} onChange={e => setAiResult(e.target.value)} />
                  <button onClick={saveRekamanToSheet} className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold shadow-lg">💾 Simpan Rangkuman ke Sheets</button>
                </div>
              )}
            </div>

            {/* HISTORY REKAMAN */}
            <div className="space-y-4">
              <h2 className="font-extrabold text-lg text-slate-800">Riwayat Rekaman ({dataAll.rekaman.length})</h2>
              {dataAll.rekaman.map((r: any, i: number) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border shadow-lg space-y-3">
                  <div className="flex justify-between font-bold text-indigo-600">
                    <span>{r.Topik} • <strong className="text-slate-900">{r.NamaPerusahaan}</strong></span>
                    <span className="text-slate-400 text-xs">{r.Tanggal}</span>
                  </div>
                  <p className="text-slate-700 text-xs whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">{r.HasilRangkuman}</p>
                  <div className="flex justify-end"><button onClick={() => handleDelete("Rekaman", i, r.Topik)} className="text-xs text-rose-500 font-bold">Hapus</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: CATATAN ================= */}
        {tab === "catatan" && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
              <h2 className="font-extrabold text-xl text-slate-800 mb-6">📝 Tulis Catatan / Strategi</h2>
              <form onSubmit={handleSaveCatatan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Topik Catatan" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={catTopik} onChange={e => setCatTopik(e.target.value)} required />
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" value={catPerusahaan} onChange={e => setCatPerusahaan(e.target.value)}>
                    <option value="Umum">Umum / Semua</option>
                    {dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan}>{p.NamaPerusahaan}</option>)}
                  </select>
                </div>
                <textarea placeholder="Isi catatan..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs" rows={4} value={catIsi} onChange={e => setCatIsi(e.target.value)} required />
                <button type="submit" className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold shadow-lg">Simpan Catatan</button>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="font-extrabold text-lg text-slate-800">Daftar Catatan ({dataAll.catatan.length})</h2>
              {dataAll.catatan.map((c: any, i: number) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border shadow-lg space-y-2">
                  <div className="flex justify-between font-bold text-xs text-indigo-600"><span>{c.Topik} ({c.NamaPerusahaan})</span><span className="text-slate-400">{c.Tanggal}</span></div>
                  <p className="text-slate-700 text-sm bg-slate-50 p-4 rounded-2xl">{c.IsiCatatan}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION (Glow Effect) */}
      <nav className="fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-2xl border border-white/50 p-2.5 max-w-2xl mx-auto rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] flex justify-around text-[9px] md:text-xs font-bold z-50">
        {[
          { id: 'dashboard', icon: '🏢', label: 'e-Proc' },
          { id: 'pipeline', icon: '🚀', label: 'Pipeline' },
          { id: 'portofolio', icon: '🏆', label: 'Portofolio' },
          { id: 'rekanan', icon: '🤝', label: 'Rekanan' },
          { id: 'rekaman', icon: '🎙️', label: 'AI' },
          { id: 'catatan', icon: '📝', label: 'Catatan' }
        ].map((menu) => (
          <button 
            key={menu.id} 
            onClick={() => setTab(menu.id)} 
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-1.5 px-3 py-2 md:py-3 rounded-full transition-all duration-300 ${tab === menu.id ? 'bg-slate-800 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="text-lg md:text-sm">{menu.icon}</span><span className="">{menu.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
