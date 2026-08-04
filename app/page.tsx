"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [tab, setTab] = useState("dashboard");
  const [dataAll, setDataAll] = useState<any>({ perusahaan: [], pengalaman: [], pipeline: [], catatan: [] });
  const [loading, setLoading] = useState(false);

  const API_URL = "https://script.google.com/macros/s/AKfycbyvh-_d9WtyupB5Xx1_B_iBRbSHU4RzlHvaWFPiP8MEjcljXyGiFksMgp6rjW18LCNn/exec";
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  // State Form Perusahaan
  const [editIndexP, setEditIndexP] = useState<number | null>(null);
  const [namaP, setNamaP] = useState("");
  const [jenisP, setJenisP] = useState("Pemerintah");
  const [urlP, setUrlP] = useState("");
  const [statusRek, setStatusRek] = useState("Belum");
  const [pernahProj, setPernahProj] = useState("Belum");

  // State Form Pipeline
  const [editIndexPipe, setEditIndexPipe] = useState<number | null>(null);
  const [pipePerusahaan, setPipePerusahaan] = useState("");
  const [pipeProjek, setPipeProjek] = useState("");
  const [pipeNilai, setPipeNilai] = useState("");
  const [pipeTayang, setPipeTayang] = useState("");
  const [pipeTahapan, setPipeTahapan] = useState("1. Eksplorasi");
  const [pipeStatus, setPipeStatus] = useState("Aktif");
  const [pipeAlasanKalah, setPipeAlasanKalah] = useState("");
  const [pipeProb, setPipeProb] = useState("50%");
  const [pipeKompetitor, setPipeKompetitor] = useState("");
  const [pipeSumber, setPipeSumber] = useState("");
  const [pipeLog, setPipeLog] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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

  // Handle Klik Link e-Proc (Update Last Clicked)
  const handleOpenEproc = async (namaPerusahaan: string, url: string) => {
    window.open(url, "_blank");
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "updateClick", namaPerusahaan })
    });
    fetchData();
  };

  // Simpan Perusahaan (Add / Edit)
  const handleSavePerusahaan = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexP !== null ? "edit" : "add";
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        type: "Daftar Perusahaan",
        action: actionType,
        rowIndex: editIndexP,
        nama: namaP, jenis: jenisP, url: urlP, statusRekanan: statusRek, pernahProjek: pernahProj
      })
    });
    setNamaP(""); setUrlP(""); setEditIndexP(null);
    fetchData();
  };

  // Simpan Pipeline (Add / Edit)
  const handleSavePipeline = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexPipe !== null ? "edit" : "add";
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        type: "Pipeline",
        action: actionType,
        rowIndex: editIndexPipe,
        namaPerusahaan: pipePerusahaan, namaProjek: pipeProjek, estimasiNilai: pipeNilai,
        tanggalTayang: pipeTayang, tahapan: pipeTahapan, status: pipeStatus, alasanKalah: pipeAlasanKalah,
        probabilitas: pipeProb, kompetitor: pipeKompetitor, sumber: pipeSumber, logVisit: pipeLog
      })
    });
    setPipeProjek(""); setPipeNilai(""); setPipeTayang(""); setPipeLog(""); setPipeKompetitor(""); setPipeSumber(""); setEditIndexPipe(null);
    fetchData();
  };

  // Update Status Instan dari List Pipeline
  const handleInlineStatusChange = async (index: number, newTahapan: string, newStatus: string) => {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Pipeline", action: "updateStatus", rowIndex: index, tahapan: newTahapan, status: newStatus })
    });
    fetchData();
  };

  // Hapus Data (Pindah ke Sampah)
  const handleDelete = async (sheetName: string, rowIndex: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus "${nama}" dan memindahkannya ke Sampah?`)) return;
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "delete", sheetName, rowIndex, alasan: "Dihapus manual dari web" })
    });
    fetchData();
  };

  // Simpan Catatan
  const handleSaveCatatan = async (e: any) => {
    e.preventDefault();
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Catatan", action: "add", namaPerusahaan: catPerusahaan, topik: catTopik, isiCatatan: catIsi })
    });
    setCatTopik(""); setCatIsi("");
    fetchData();
  };

  // AI Voice Note & Rapikan dengan AI
  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung Speech-to-Text. Silakan ketik langsung atau gunakan mikrofon keyboard HP.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setPipeLog((prev) => (prev ? prev + " " + speechToText : speechToText));
    };

    recognition.start();
  };

  const rapikanLogDenganAI = async () => {
    if (!pipeLog) return;
    setAiLoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Rapikan catatan meeting/visit mentah berikut menjadi laporan profesional (Hasil Kunjungan, Hambatan, Rencana Lanjutan) dalam bahasa Indonesia yang ringkas dan rapi: "${pipeLog}"` }] }]
        })
      });
      const json = await res.json();
      setPipeLog(json.candidates[0].content.parts[0].text);
    } catch (e) {
      alert("Gagal merapikan dengan AI");
    }
    setAiLoading(false);
  };

  // Kalkulasi Dashboard Pipeline (Hot, Cold, Gagal)
  const totalPipeline = dataAll.pipeline.length;
  const hotCount = dataAll.pipeline.filter((p: any) => p.Tahapan?.includes("5.") || p.Tahapan?.includes("6.") || p.Tahapan?.includes("7.")).length;
  const coldCount = dataAll.pipeline.filter((p: any) => p.Tahapan?.includes("1.") || p.Tahapan?.includes("2.") || p.Tahapan?.includes("3.") || p.Tahapan?.includes("4.")).length;
  const failedCount = dataAll.pipeline.filter((p: any) => p.Tahapan?.includes("8.")).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 pb-32 flex flex-col items-center">
      {/* HEADER UTAMA */}
      <header className="w-full bg-gradient-to-r from-indigo-700 to-blue-600 text-white shadow-md py-5 px-6 mb-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-wide">⚡ Radar e-Proc & Tender Pro</h1>
            <p className="text-xs text-indigo-200">Sistem Monitoring e-Procurement & CRM Tender Pintar</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="bg-indigo-800/60 px-3 py-1.5 rounded-xl border border-indigo-500 font-semibold">🏢 Portal: {dataAll.perusahaan.length}</span>
            <span className="bg-blue-800/60 px-3 py-1.5 rounded-xl border border-blue-400 font-semibold">🚀 Pipeline: {totalPipeline}</span>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <div className="w-full max-w-4xl px-4 space-y-6">

        {/* TAB 1: DASHBOARD E-PROC */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            {/* Form Tambah/Edit Portal */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
              <h2 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-2">
                <span>{editIndexP !== null ? "✏️ Edit Portal e-Proc" : "➕ Tambah Portal e-Proc Baru"}</span>
              </h2>
              <form onSubmit={handleSavePerusahaan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Perusahaan / Instansi</label>
                    <input type="text" placeholder="Contoh: PT Telkom Indonesia" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500" value={namaP} onChange={e => setNamaP(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Jenis Instansi</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl" value={jenisP} onChange={e => setJenisP(e.target.value)}>
                      <option>Pemerintah</option><option>BUMN/BUMD</option><option>Swasta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">URL / Link e-Proc</label>
                  <input type="url" placeholder="https://eproc.telkom.co.id" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl" value={urlP} onChange={e => setUrlP(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Status Rekanan</label>
                    <select value={statusRek} onChange={e => setStatusRek(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl">
                      <option>Belum</option><option>Sudah</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Riwayat Projek</label>
                    <select value={pernahProj} onChange={e => setPernahProj(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl">
                      <option>Belum</option><option>Pernah</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl font-bold shadow-md transition">{editIndexP !== null ? "Simpan Perubahan" : "Simpan Portal"}</button>
                  {editIndexP !== null && (
                    <button type="button" onClick={() => { setEditIndexP(null); setNamaP(""); setUrlP(""); }} className="bg-slate-300 px-4 py-3 rounded-2xl font-bold text-slate-700">Batal</button>
                  )}
                </div>
              </form>
            </div>

            {/* List Portal */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
              <h2 className="font-bold text-base text-slate-800 mb-4">Daftar Portal Terdaftar ({dataAll.perusahaan.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataAll.perusahaan.map((item: any, i: number) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 text-base">{item.NamaPerusahaan}</h3>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${item.Jenis === 'BUMN/BUMD' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{item.Jenis}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Status Rekanan: <strong className="text-slate-700">{item.StatusRekanan}</strong></p>
                      <p className="text-[11px] text-slate-400 mt-0.5">🕒 Terakhir diklik: {item.LastClicked || "Belum pernah"}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditIndexP(i); setNamaP(item.NamaPerusahaan); setJenisP(item.Jenis); setUrlP(item.URL); setStatusRek(item.StatusRekanan); setPernahProj(item.PernahAdaProjek); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-xs text-indigo-600 font-bold hover:underline">Edit</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => handleDelete("Daftar Perusahaan", i, item.NamaPerusahaan)} className="text-xs text-rose-600 font-bold hover:underline">Hapus</button>
                      </div>
                      <button onClick={() => handleOpenEproc(item.NamaPerusahaan, item.URL)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow transition flex items-center gap-1">
                        <span>Buka e-Proc ↗</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PIPELINE & DASHBOARD GRAFIK */}
        {tab === "pipeline" && (
          <div className="space-y-6">
            {/* DASHBOARD ANALITIK & PIE / STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-3xl shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-100 uppercase tracking-wider font-bold">🔥 Hot Deals (Mendekati Deal)</p>
                  <h3 className="text-3xl font-black mt-1">{hotCount} <span className="text-xs font-normal">Peluang</span></h3>
                </div>
                <div className="text-4xl bg-white/20 p-3 rounded-2xl">⚡</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-3xl shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-100 uppercase tracking-wider font-bold">❄️ Cold Deals (Eksplorasi/Awal)</p>
                  <h3 className="text-3xl font-black mt-1">{coldCount} <span className="text-xs font-normal">Peluang</span></h3>
                </div>
                <div className="text-4xl bg-white/20 p-3 rounded-2xl">🌱</div>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-red-600 text-white p-5 rounded-3xl shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-100 uppercase tracking-wider font-bold">❌ Gagal / Kalah</p>
                  <h3 className="text-3xl font-black mt-1">{failedCount} <span className="text-xs font-normal">Peluang</span></h3>
                </div>
                <div className="text-4xl bg-white/20 p-3 rounded-2xl">📋</div>
              </div>
            </div>

            {/* Form Tambah/Edit Pipeline */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
              <h2 className="font-bold text-base text-slate-800 mb-4">{editIndexPipe !== null ? "✏️ Edit Peluang / Pipeline" : "➕ Tambah Peluang / Pipeline Baru"}</h2>
              <form onSubmit={handleSavePipeline} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Perusahaan / Instansi</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl" value={pipePerusahaan} onChange={e => setPipePerusahaan(e.target.value)} required>
                      <option value="">-- Pilih Perusahaan --</option>
                      {dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan}>{p.NamaPerusahaan}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Projek / Pengadaan</label>
                    <input type="text" placeholder="Contoh: Pemutakhiran DRP & Infrastruktur" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl" value={pipeProjek} onChange={e => setPipeProjek(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Estimasi Nilai (Rp)</label>
                    <input type="text" placeholder="Rp 500.000.000" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl" value={pipeNilai} onChange={e => setPipeNilai(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Estimasi Tayang Tender</label>
                    <input type="date" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl" value={pipeTayang} onChange={e => setPipeTayang(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Tahapan Saat Ini</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl" value={pipeTahapan} onChange={e => setPipeTahapan(e.target.value)}>
                      <option>1. Eksplorasi</option><option>2. Pendekatan</option><option>3. Penawaran</option><option>4. Menunggu Tender</option><option>5. Tender Tayang</option><option>6. Negosiasi</option><option>7. Menang</option><option>8. Kalah</option>
                    </select>
                  </div>
                </div>

                {/* LOG VISIT & TOMBOL REKAM SUARA + AI */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700">📝 Log Aktivitas / Hasil Kunjungan / Catatan Meeting</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={startVoiceRecognition} className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 shadow transition ${isRecording ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                        <span>{isRecording ? "🔴 Mendengarkan..." : "🎤 Rekam Percakapan"}</span>
                      </button>
                      <button type="button" onClick={rapikanLogDenganAI} className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow transition flex items-center gap-1">
                        <span>{aiLoading ? " ✨ Merapikan..." : "✨ Rapikan dengan AI"}</span>
                      </button>
                    </div>
                  </div>
                  <textarea placeholder="Ketik atau gunakan Rekam Percakapan (Voice-to-Text), lalu klik Rapikan dengan AI..." className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs leading-relaxed" rows={4} value={pipeLog} onChange={e => setPipeLog(e.target.value)} />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl font-bold shadow-md transition">{editIndexPipe !== null ? "Simpan Perubahan Pipeline" : "Simpan Pipeline Baru"}</button>
                  {editIndexPipe !== null && (
                    <button type="button" onClick={() => { setEditIndexPipe(null); setPipeProjek(""); setPipeLog(""); }} className="bg-slate-300 px-4 py-3 rounded-2xl font-bold text-slate-700">Batal</button>
                  )}
                </div>
              </form>
            </div>

            {/* List Pipeline dengan Dropdown Instan */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
              <h2 className="font-bold text-base text-slate-800 mb-4">Daftar Pipeline & Status Aktif ({dataAll.pipeline.length})</h2>
              <div className="space-y-4">
                {dataAll.pipeline.map((p: any, i: number) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">{p.NamaPerusahaan}</span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{p.NamaProjek}</h3>
                      </div>
                      {/* DROPDOWN TAHAPAN NYALA TERUS (LANGSUNG GANTI DI SHEET) */}
                      <div className="flex items-center gap-2">
                        <select 
                          className="bg-white border-2 border-indigo-200 text-indigo-700 font-bold text-xs p-2 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500"
                          value={p.Tahapan || "1. Eksplorasi"}
                          onChange={(e) => handleInlineStatusChange(i, e.target.value, p.Status || "Aktif")}
                        >
                          <option>1. Eksplorasi</option>
                          <option>2. Pendekatan</option>
                          <option>3. Penawaran</option>
                          <option>4. Menunggu Tender</option>
                          <option>5. Tender Tayang</option>
                          <option>6. Negosiasi</option>
                          <option>7. Menang</option>
                          <option>8. Kalah</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                      <div>💰 Estimasi: <strong className="text-slate-800">{p.EstimasiNilaiProjek || "-"}</strong></div>
                      <div>📅 Tayang: <strong className="text-slate-800">{p.TanggalEstimasiTayangTender || "-"}</strong></div>
                      <div>🎯 Peluang: <strong className="text-slate-800">{p.ProbabilitasKemenangan || "50%"}</strong></div>
                      <div>🚀 Mulai: <strong className="text-slate-800">{p.TanggalMulaiPeluang || "-"}</strong></div>
                    </div>

                    {p.LogAktivitasVisit && (
                      <div className="text-xs bg-indigo-50/60 p-3 rounded-xl text-slate-700 border border-indigo-100">
                        <span className="font-bold block text-indigo-900 mb-1">📝 Log & Hasil Visit AI:</span>
                        <p className="whitespace-pre-line leading-relaxed">{p.LogAktivitasVisit}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                      <div className="flex gap-2">
                        <button onClick={() => { 
                          setEditIndexPipe(i); setPipePerusahaan(p.NamaPerusahaan); setPipeProjek(p.NamaProjek); 
                          setPipeNilai(p.EstimasiNilaiProjek); setPipeTayang(p.TanggalEstimasiTayangTender); 
                          setPipeTahapan(p.Tahapan); setPipeLog(p.LogAktivitasVisit); window.scrollTo({top:200, behavior:'smooth'}); 
                        }} className="text-indigo-600 font-bold hover:underline">Edit Detail</button>
                        <span>|</span>
                        <button onClick={() => handleDelete("Pipeline", i, p.NamaProjek)} className="text-rose-600 font-bold hover:underline">Hapus</button>
                      </div>
                      <span className="text-slate-400 text-[11px]">Status: {p.Status || "Aktif"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PENGALAMAN & PORTOFOLIO */}
        {tab === "pengalaman" && (
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 space-y-4">
            <h2 className="font-bold text-base text-slate-800">🏆 Portofolio & Rekam Jejak Projek ({dataAll.pengalaman.length})</h2>
            <p className="text-xs text-slate-500">Data berikut otomatis masuk ketika status pipeline Anda diubah menjadi <strong className="text-emerald-600">7. Menang</strong>.</p>
            <div className="space-y-3">
              {dataAll.pengalaman.map((item: any, i: number) => (
                <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{item.NamaPekerjaan}</h3>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">{item.NamaPerusahaan} • Industri: {item.JenisIndustri}</p>
                    <p className="text-xs text-slate-500 mt-1">Nilai: <strong className="text-slate-700">{item.NilaiProjek}</strong> ({item.TahunPelaksanaan}) — Lama: {item.LamaPekerjaan}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">Dimenangkan 🏆</span>
                </div>
              ))}
              {dataAll.pengalaman.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">Belum ada portofolio. Ubah status pipeline ke "7. Menang" untuk mengisi otomatis.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CATATAN & STRATEGI */}
        {tab === "catatan" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
              <h2 className="font-bold text-base text-slate-800 mb-4">➕ Tulis Catatan / Strategi Baru</h2>
              <form onSubmit={handleSaveCatatan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Topik Catatan</label>
                    <input type="text" placeholder="Contoh: Strategi Pendekatan BUMN" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl" value={catTopik} onChange={e => setCatTopik(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Terkait Perusahaan (Opsional)</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl" value={catPerusahaan} onChange={e => setCatPerusahaan(e.target.value)}>
                      <option value="Umum">Umum / Semua</option>
                      {dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan}>{p.NamaPerusahaan}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Isi Catatan</label>
                  <textarea placeholder="Tulis ide, strategi, atau poin penting..." className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs" rows={4} value={catIsi} onChange={e => setCatIsi(e.target.value)} required />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl font-bold shadow-md transition">Simpan Catatan</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
              <h2 className="font-bold text-base text-slate-800 mb-4">Daftar Catatan Tersimpan ({dataAll.catatan.length})</h2>
              <div className="space-y-3">
                {dataAll.catatan.map((c: any, i: number) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm text-sm space-y-1">
                    <div className="flex justify-between font-bold text-xs text-indigo-600">
                      <span>{c.Topik} ({c.NamaPerusahaan})</span>
                      <span className="text-slate-400">{c.Tanggal}</span>
                    </div>
                    <p className="text-slate-700 text-xs mt-1 leading-relaxed">{c.IsiCatatan}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION (RESPONSIF / MOBILE FRIENDLY) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-3 max-w-lg mx-auto rounded-t-3xl shadow-2xl flex justify-around text-xs font-bold z-50">
        <button onClick={() => setTab("dashboard")} className={`flex flex-col items-center gap-1 transition ${tab === 'dashboard' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
          <span className="text-lg">🏢</span><span>e-Proc</span>
        </button>
        <button onClick={() => setTab("pipeline")} className={`flex flex-col items-center gap-1 transition ${tab === 'pipeline' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
          <span className="text-lg">🚀</span><span>Pipeline</span>
        </button>
        <button onClick={() => setTab("pengalaman")} className={`flex flex-col items-center gap-1 transition ${tab === 'pengalaman' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
          <span className="text-lg">🏆</span><span>Portofolio</span>
        </button>
        <button onClick={() => setTab("catatan")} className={`flex flex-col items-center gap-1 transition ${tab === 'catatan' ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
          <span className="text-lg">📝</span><span>Catatan</span>
        </button>
      </nav>
    </main>
  );
}
