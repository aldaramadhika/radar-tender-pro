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
  const [pipeStatus, setPipeStatus] = useState("Cold");
  const [pipeCatatan, setPipeCatatan] = useState("");

  // State Portofolio
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

  // State AI Studio (Ceklist & File Upload)
  const [aiQuery, setAiQuery] = useState("");
  const [optBedahRks, setOptBedahRks] = useState(false);
  const [optCekTypo, setOptCekTypo] = useState(false);
  const [optAnalisaProp, setOptAnalisaProp] = useState(false);
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
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
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Daftar Perusahaan", action: actionType, rowIndex: editIndexP, nama: namaP, jenis: jenisP, url: urlP, statusRekanan: statusRek, pernahProjek: pernahProj }) });
    setNamaP(""); setUrlP(""); setStatusRek("Belum"); setPernahProj("Belum"); setEditIndexP(null); fetchData();
  };

  const handleSavePipeline = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexPipe !== null ? "edit" : "add";
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Pipeline", action: actionType, rowIndex: editIndexPipe, namaPerusahaan: pipePerusahaan, namaProjek: pipeProjek, estimasiNilai: pipeNilai, tanggalTayang: pipeTayang, tahapan: pipeTahapan, status: pipeStatus, logCatatan: pipeCatatan }) });
    setPipePerusahaan(""); setPipeProjek(""); setPipeNilai(""); setPipeTayang(""); setPipeCatatan(""); setPipeStatus("Cold"); setEditIndexPipe(null); fetchData();
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

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setUploadedFileBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleAdvancedAI = async (e: any) => {
    e.preventDefault();
    if (!aiQuery && !uploadedFileBase64 && !optBedahRks && !optCekTypo && !optAnalisaProp) {
      alert("Masukkan perintah atau pilih minimal satu opsi ceklist AI!");
      return;
    }

    setSearchLoading(true);
    try {
      let instruksiKhusus = "";
      if (optBedahRks) instruksiKhusus += "\n- Lakukan BEDAH RKS secara mendalam: Ekstrak ringkasan projek, persyaratan kualifikasi/administrasi wajib, sertifikasi (ISO/TKDN), tenaga ahli yang dibutuhkan, dan strategi menang.";
      if (optCekTypo) instruksiKhusus += "\n- Lakukan CEK TYPO & PERBAIKAN BAHASA: Periksa tata bahasa, ejaan, dan buat kalimatnya menjadi sangat profesional dan persuasif.";
      if (optAnalisaProp) instruksiKhusus += "\n- Lakukan ANALISA PROPOSAL: Bandingkan isi dokumen dengan ketentuan KAK untuk memastikan tidak ada syarat krusial yang terlewat.";

      const ringkasanData = {
        perusahaanTerkait: dataAll.perusahaan.map((p:any) => p.NamaPerusahaan),
        portofolioKami: dataAll.pengalaman.map((p:any) => `${p.NamaPekerjaan} (${p.NilaiProjek})`)
      };

      const promptText = `Bertindaklah sebagai Konsultan Tender Senior. Konteks data internal kami: ${JSON.stringify(ringkasanData)}. 
      Pertanyaan/Catatan Pengguna: "${aiQuery}". 
      Instruksi Tambahan Berdasarkan Ceklist:${instruksiKhusus}`;

      const contentsPart: any[] = [{ text: promptText }];
      if (uploadedFileBase64) {
        contentsPart.push({
          inline_data: {
            mime_type: "application/pdf",
            data: uploadedFileBase64
          }
        });
      }

      // Menggunakan model terbaru gemini-3.6-flash
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: contentsPart }] })
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setAiSearchResult(json.candidates[0].content.parts[0].text);

      if (optBedahRks) {
        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({
            type: "Bedah RKS",
            namaPerusahaan: "Analisis AI",
            namaProjek: uploadedFileName || aiQuery.slice(0, 30),
            hasilBedahRks: json.candidates[0].content.parts[0].text,
            keterangan: "Otomatis dari AI Studio"
          })
        });
      }

    } catch (err: any) {
      setAiSearchResult(`Gagal memproses AI: ${err.message}`);
    }
    setSearchLoading(false);
  };

  const parseRupiah = (val: string) => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9]/g, "");
    return Number(clean) || 0;
  };

  const formatRupiah = (num: number) => {
    return "Rp " + num.toLocaleString("id-ID");
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

  let totalNilaiPipeline = 0;
  let hotVal = 0, warmVal = 0, coldVal = 0, gagalVal = 0;

  dataAll.pipeline.forEach((p: any) => {
    const val = parseRupiah(p.EstimasiNilaiProjek);
    totalNilaiPipeline += val;
    const status = p.Status || "Cold";
    if (status === "Hot") hotVal += val;
    else if (status === "Warm") warmVal += val;
    else if (status === "Gagal") gagalVal += val;
    else coldVal += val;
  });

  const safeTotal = totalNilaiPipeline || 1;
  const hotPct = (hotVal / safeTotal) * 100;
  const warmPct = (warmVal / safeTotal) * 100;
  const coldPct = (coldVal / safeTotal) * 100;

  const pieChartStyle = {
    background: `conic-gradient(
      #ef4444 0% ${hotPct}%, 
      #f59e0b ${hotPct}% ${hotPct + warmPct}%, 
      #3b82f6 ${hotPct + warmPct}% ${hotPct + warmPct + coldPct}%, 
      #64748b ${hotPct + warmPct + coldPct}% 100%
    )`
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-100 text-slate-800 pb-36 font-sans">
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
        
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white">
              <h2 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-6">{editIndexP !== null ? "✏️ Edit Portal e-Proc" : "➕ Tambah Portal e-Proc Baru"}</h2>
              <form onSubmit={handleSavePerusahaan} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="text" placeholder="Nama Perusahaan" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition" value={namaP} onChange={e => setNamaP(e.target.value)} required />
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition" value={jenisP} onChange={e => setJenisP(e.target.value)}>
                    <option>Pemerintah</option><option>BUMN/BUMD</option><option>Swasta</option>
                  </select>
                </div>
                <input type="url" placeholder="URL e-Proc (https://...)" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition" value={urlP} onChange={e => setUrlP(e.target.value)} required />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Status Rekanan / Vendor:</label>
                    <select value={statusRek} onChange={e => setStatusRek(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl font-medium">
                      <option value="Belum">Belum Terdaftar</option>
                      <option value="Sudah">Sudah Rekanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Riwayat Projek:</label>
                    <select value={pernahProj} onChange={e => setPernahProj(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl font-medium">
                      <option value="Belum">Belum Ada</option>
                      <option value="Pernah">Sudah Tender / Pernah</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-violet-200">{editIndexP !== null ? "Simpan Perubahan" : "Simpan Portal"}</button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dataAll.perusahaan.map((item: any, i: number) => {
                let statusIcon = null;
                if (item.StatusUpdate === "NEW") {
                  statusIcon = <span className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider animate-pulse shadow-lg shadow-rose-300">🔥 NEW TENDER</span>;
                } else if (item.StatusUpdate === "NO_CHANGE") {
                  statusIcon = <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold">✅ Stabil</span>;
                } else if (item.StatusUpdate === "BLOCKED") {
                  statusIcon = <span className="bg-amber-100 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-xl text-[10px] font-bold">🛡️ Cek Manual</span>;
                }

                return (
                <div key={i} className={`bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border shadow-xl transition flex flex-col justify-between gap-4 ${item.StatusUpdate === "NEW" ? 'border-rose-400 ring-4 ring-rose-50' : 'border-white'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-extrabold text-lg text-slate-800 leading-tight">{item.NamaPerusahaan}</h3>
                      <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase bg-gradient-to-r from-fuchsia-100 to-pink-100 text-fuchsia-700">{item.Jenis}</span>
                    </div>
                    <div className="space-y-1 text-xs font-medium text-slate-500">
                      <p>Status Rekanan: <strong className="text-violet-600">{item.StatusRekanan || "Belum"}</strong></p>
                      <p>Riwayat Projek: <strong className="text-indigo-600">{item.PernahAdaProjek || "Belum"}</strong></p>
                      <p>🕒 Terakhir Klik: <strong className="text-slate-700">{item.LastClicked || "Belum"}</strong></p>
                      <p>📊 Frekuensi: <strong className="text-teal-600">{item.FrekuensiBuka || 0} Kali</strong></p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex gap-3 text-xs font-bold">
                        <button onClick={() => { setEditIndexP(i); setNamaP(item.NamaPerusahaan); setJenisP(item.Jenis); setUrlP(item.URL); setStatusRek(item.StatusRekanan || "Belum"); setPernahProj(item.PernahAdaProjek || "Belum"); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-violet-600">Edit</button>
                        <button onClick={() => handleDelete("Daftar Perusahaan", i, item.NamaPerusahaan)} className="text-rose-500">Hapus</button>
                      </div>
                      <div>{statusIcon}</div>
                    </div>
                    <button onClick={() => handleOpenEproc(item.NamaPerusahaan, item.URL)} className={`w-full text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-lg transition ${item.StatusUpdate === "NEW" ? 'bg-gradient-to-r from-rose-500 to-red-500 shadow-rose-300' : 'bg-gradient-to-r from-teal-400 to-emerald-500 shadow-emerald-200'}`}>
                      <span>Buka e-Proc ↗</span>
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {tab === "pipeline" && (
          <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full shadow-inner flex items-center justify-center shrink-0" style={pieChartStyle}>
                <div className="w-22 h-22 md:w-26 md:h-26 bg-white rounded-full flex flex-col items-center justify-center shadow-lg p-2 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Nilai</span>
                  <span className="text-xs md:text-sm font-black text-slate-800 tracking-tight">{formatRupiah(totalNilaiPipeline)}</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 w-full text-xs">
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl"><p className="font-bold text-rose-500 uppercase">🔥 Hot Value</p><h3 className="text-sm md:text-base font-black text-rose-700 mt-1">{formatRupiah(hotVal)}</h3></div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl"><p className="font-bold text-amber-500 uppercase">☀️ Warm Value</p><h3 className="text-sm md:text-base font-black text-amber-700 mt-1">{formatRupiah(warmVal)}</h3></div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl"><p className="font-bold text-blue-500 uppercase">❄️ Cold Value</p><h3 className="text-sm md:text-base font-black text-blue-700 mt-1">{formatRupiah(coldVal)}</h3></div>
                <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl"><p className="font-bold text-slate-500 uppercase">❌ Gagal Value</p><h3 className="text-sm md:text-base font-black text-slate-700 mt-1">{formatRupiah(gagalVal)}</h3></div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white">
              <h2 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-6">➕ Tambah Pipeline</h2>
              <form onSubmit={handleSavePipeline} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Perusahaan / Klien:</label>
                    <input 
                      type="text" 
                      list="daftar-perusahaan" 
                      placeholder="Pilih atau ketik nama klien bebas..." 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500" 
                      value={pipePerusahaan} 
                      onChange={e => setPipePerusahaan(e.target.value)} 
                      required 
                    />
                    <datalist id="daftar-perusahaan">
                      {dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Projek / Pengadaan:</label>
                    <input type="text" placeholder="Contoh: Pengadaan Server" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={pipeProjek} onChange={e => setPipeProjek(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Estimasi Nilai (Rp)" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={pipeNilai} onChange={e => setPipeNilai(e.target.value)} />
                  <input type="date" className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={pipeTayang} onChange={e => setPipeTayang(e.target.value)} />
                  <select className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" value={pipeTahapan} onChange={e => setPipeTahapan(e.target.value)}>
                    <option>1. Eksplorasi</option><option>3. Penawaran</option><option>5. Tender Tayang</option><option>7. Menang</option>
                  </select>
                  <select className="p-4 bg-blue-50 text-blue-700 font-bold border-2 border-blue-200 rounded-2xl" value={pipeStatus} onChange={e => setPipeStatus(e.target.value)}>
                    <option value="Hot">🔥 Hot</option><option value="Warm">☀️ Warm</option><option value="Cold">❄️ Cold</option><option value="Gagal">❌ Gagal</option>
                  </select>
                </div>
                <textarea placeholder="Catatan singkat..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" rows={3} value={pipeCatatan} onChange={e => setPipeCatatan(e.target.value)} />
                <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white p-4 rounded-2xl font-bold shadow-lg">Simpan Pipeline</button>
              </form>
            </div>

            <div className="space-y-5">
              {dataAll.pipeline.map((p: any, i: number) => {
                const isHot = p.Status === "Hot"; const isWarm = p.Status === "Warm"; const isGagal = p.Status === "Gagal";
                return (
                <div key={i} className={`p-6 rounded-[2rem] border shadow-lg flex flex-col gap-4 ${isHot ? 'bg-rose-50 border-rose-100' : isWarm ? 'bg-amber-50 border-amber-100' : isGagal ? 'bg-slate-100 border-slate-200' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase">{p.NamaPerusahaan}</span>
                      <h3 className="font-extrabold text-lg text-slate-800">{p.NamaProjek}</h3>
                    </div>
                    <div className="flex gap-2">
                      <select className="bg-white border text-xs p-2 rounded-xl font-bold" value={p.Tahapan || "1. Eksplorasi"} onChange={(e) => handleInlineStatusChange(i, e.target.value, p.Status || "Cold")}>
                        <option>1. Eksplorasi</option><option>3. Penawaran</option><option>5. Tender Tayang</option><option>7. Menang</option>
                      </select>
                      <select className="bg-white border text-xs p-2 rounded-xl font-bold" value={p.Status || "Cold"} onChange={(e) => handleInlineStatusChange(i, p.Tahapan, e.target.value)}>
                        <option value="Hot">🔥 Hot</option><option value="Warm">☀️ Warm</option><option value="Cold">❄️ Cold</option><option value="Gagal">❌ Gagal</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white/60 p-3 rounded-xl">
                    <div>💰 Nilai: <strong className="text-emerald-700">{p.EstimasiNilaiProjek || "-"}</strong></div>
                    <div>📅 Tayang: <strong>{p.TanggalEstimasiTayangTender || "-"}</strong></div>
                  </div>
                  {p.LogCatatan && <p className="text-xs bg-white p-3 rounded-xl italic text-slate-600">📝 "{p.LogCatatan}"</p>}
                  <div className="flex justify-end gap-3 text-xs font-bold pt-1">
                    <button onClick={() => handleDelete("Pipeline", i, p.NamaProjek)} className="text-rose-500">Hapus</button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {tab === "portofolio" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border">
               <h2 className="font-extrabold text-xl text-slate-800 mb-4">➕ Tambah Portofolio Manual</h2>
               <form onSubmit={handleSavePengalaman} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nama Perusahaan Klien" className="p-4 bg-slate-50 border rounded-2xl w-full" value={expPerusahaan} onChange={e => setExpPerusahaan(e.target.value)} required />
                    <select className="p-4 bg-slate-50 border rounded-2xl w-full" value={expIndustri} onChange={e => setExpIndustri(e.target.value)}>
                      <option>IT & Software</option><option>Digital Marketing</option><option>Infrastruktur & Jaringan</option><option>Konsultansi & Audit</option><option>Lainnya</option>
                    </select>
                  </div>
                  <input type="text" placeholder="Judul / Jenis Pekerjaan" className="p-4 bg-slate-50 border rounded-2xl w-full" value={expPekerjaan} onChange={e => setExpPekerjaan(e.target.value)} required />
                  
                  <div className="grid grid-cols-3 gap-3">
                    <input type="text" placeholder="Tahun (2026)" className="p-3 bg-slate-50 border rounded-xl" value={expTahun} onChange={e => setExpTahun(e.target.value)} />
                    <input type="text" placeholder="Lama (3 Bulan)" className="p-3 bg-slate-50 border rounded-xl" value={expLama} onChange={e => setExpLama(e.target.value)} />
                    <input type="text" placeholder="Nilai Projek (Rp)" className="p-3 bg-slate-50 border rounded-xl" value={expNilai} onChange={e => setExpNilai(e.target.value)} />
                  </div>

                  <textarea placeholder="Keterangan / Deskripsi Projek..." className="p-4 bg-slate-50 border rounded-2xl w-full" rows={2} value={expKet} onChange={e => setExpKet(e.target.value)} />
                  <button type="submit" className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold shadow">Simpan Portofolio</button>
               </form>
            </div>

            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 space-y-3">
              <h3 className="font-extrabold text-indigo-900 text-sm">🔍 Filter Portofolio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <select className="w-full p-3 bg-white border rounded-xl" value={filterIndustri} onChange={e => setFilterIndustri(e.target.value)}>
                  <option value="Semua">Semua Industri</option>
                  <option value="IT & Software">IT & Software</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Infrastruktur & Jaringan">Infrastruktur & Jaringan</option>
                  <option value="Konsultansi & Audit">Konsultansi & Audit</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                <input type="text" placeholder="Cari keyword (klien / pekerjaan)..." className="w-full p-3 bg-white border rounded-xl" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              {filteredPengalaman.map((item:any, i:number)=>(
                <div key={i} className="p-6 bg-white/90 rounded-3xl border shadow flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-black text-slate-800 text-base">{item.NamaPekerjaan}</h4>
                    <p className="text-xs font-bold text-indigo-600 mt-1">{item.NamaPerusahaan} • <span className="bg-indigo-50 px-2 py-0.5 rounded">{item.JenisIndustri}</span></p>
                    <p className="text-xs text-slate-500 mt-2">Nilai: <strong className="text-emerald-700">{item.NilaiProjek || "-"}</strong> ({item.TahunPelaksanaan}) — Lama: {item.LamaPekerjaan}</p>
                    {item.Keterangan && <p className="text-xs bg-slate-50 p-2.5 rounded-xl mt-2 text-slate-600">{item.Keterangan}</p>}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <button onClick={() => handleDelete("Pengalaman", i, item.NamaPekerjaan)} className="text-rose-500">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rekanan" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border">
              <h2 className="font-extrabold text-xl text-slate-800 mb-4">➕ Tambah Rekanan / Partner</h2>
              <form onSubmit={handleSaveRekanan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nama Rekanan / Partner" className="w-full p-4 bg-slate-50 border rounded-2xl" value={rekNama} onChange={e => setRekNama(e.target.value)} required />
                  <input type="text" placeholder="Produk Rekanan" className="w-full p-4 bg-slate-50 border rounded-2xl" value={rekProduk} onChange={e => setRekProduk(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Harga Produk (Rp)" className="w-full p-4 bg-slate-50 border rounded-2xl" value={rekHarga} onChange={e => setRekHarga(e.target.value)} />
                  <input type="date" placeholder="Terakhir Visit" className="w-full p-4 bg-slate-50 border rounded-2xl" value={rekVisit} onChange={e => setRekVisit(e.target.value)} />
                </div>
                <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 space-y-2">
                  <label className="block text-xs font-bold text-teal-900">👥 Data PIC (Bisa lebih dari 1):</label>
                  <input type="text" placeholder="Contoh: Budi, Siska" className="w-full p-3 bg-white border rounded-xl text-xs" value={rekPic} onChange={e => setRekPic(e.target.value)} required />
                  <input type="text" placeholder="No Telp PIC: 0812..., 0813..." className="w-full p-3 bg-white border rounded-xl text-xs" value={rekTelp} onChange={e => setRekTelp(e.target.value)} />
                </div>
                <textarea placeholder="Keterangan partner..." className="w-full p-4 bg-slate-50 border rounded-2xl text-xs" rows={2} value={rekKet} onChange={e => setRekKet(e.target.value)} />
                <button type="submit" className="w-full bg-teal-600 text-white p-4 rounded-2xl font-bold shadow">Simpan Rekanan</button>
              </form>
            </div>

            <div className="space-y-4">
              {dataAll.rekanan.map((r: any, i: number) => (
                <div key={i} className="bg-white/90 p-6 rounded-[2rem] border shadow space-y-3">
                  <div className="flex justify-between font-bold text-slate-800 text-base">
                    <span>{r.NamaRekanan}</span>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">Produk: {r.ProdukRekanan || "-"}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 p-4 rounded-2xl border">
                    <div>💵 Harga: <strong className="text-emerald-700">{r.HargaProduk || "-"}</strong></div>
                    <div>📅 Terakhir Visit: <strong>{r.TerakhirVisit || "-"}</strong></div>
                    <div className="md:col-span-2">👥 PIC: <strong className="text-teal-800">{r.PIC}</strong> | 📞 No: <strong>{r.NoTelpPIC}</strong></div>
                  </div>
                  {r.Keterangan && <p className="text-xs text-slate-600 italic">💬 {r.Keterangan}</p>}
                  <div className="flex justify-end gap-3 text-xs font-bold pt-1">
                    <button onClick={() => handleDelete("Rekanan", i, r.NamaRekanan)} className="text-rose-500">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rekaman" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-8 rounded-[2rem] shadow-2xl space-y-6">
              <div>
                <h3 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-cyan-300">✨ AI Tender Assistant Studio</h3>
                <p className="text-xs text-indigo-200 mt-1">Unggah dokumen tender (PDF KAK/RKS/Proposal) dan centang kebutuhan analisis Anda di bawah ini.</p>
              </div>

              <form onSubmit={handleAdvancedAI} className="space-y-5">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs">
                    <span className="font-bold block text-fuchsia-300">📁 Unggah Dokumen PDF (Opsional):</span>
                    <span className="text-slate-300">{uploadedFileName ? `Terpilih: ${uploadedFileName}` : "Belum ada file dipilih"}</span>
                  </div>
                  <input type="file" accept="application/pdf" onChange={handleFileUpload} className="text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-fuchsia-600 file:text-white hover:file:bg-fuchsia-700 cursor-pointer" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-2">💬 Catatan atau Pertanyaan Tambahan untuk AI:</label>
                  <textarea 
                    rows={3}
                    placeholder="Contoh: Fokuskan pada persyaratan sertifikasi ISO atau periksa apakah ada typo di pasal 4..." 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-xs text-white placeholder-indigo-300 outline-none focus:ring-2 focus:ring-fuchsia-400" 
                    value={aiQuery} 
                    onChange={e => setAiQuery(e.target.value)} 
                  />
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                  <span className="font-bold block text-cyan-300">⚙️ Pilih Kebutuhan Analisis (Bisa dicentang lebih dari satu):</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <label className="flex items-center gap-2.5 bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/20 transition">
                      <input type="checkbox" checked={optBedahRks} onChange={e => setOptBedahRks(e.target.checked)} className="w-4 h-4 accent-fuchsia-500" />
                      <span className="font-bold">🔍 Bedah RKS</span>
                    </label>
                    <label className="flex items-center gap-2.5 bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/20 transition">
                      <input type="checkbox" checked={optCekTypo} onChange={e => setOptCekTypo(e.target.checked)} className="w-4 h-4 accent-fuchsia-500" />
                      <span className="font-bold">📝 Cek Typo & Bahasa</span>
                    </label>
                    <label className="flex items-center gap-2.5 bg-white/10 p-3 rounded-xl cursor-pointer hover:bg-white/20 transition">
                      <input type="checkbox" checked={optAnalisaProp} onChange={e => setOptAnalisaProp(e.target.checked)} className="w-4 h-4 accent-fuchsia-500" />
                      <span className="font-bold">⚖️ Analisa Proposal</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white p-4 rounded-2xl font-bold text-sm shadow-lg shadow-fuchsia-500/30">
                  {searchLoading ? "🤖 AI Sedang Menganalisis..." : "✨ Jalankan AI Analisis"}
                </button>
              </form>

              {aiSearchResult && (
                <div className="mt-6 bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 text-xs leading-relaxed text-slate-100 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <strong className="text-fuchsia-300 text-sm">📋 Hasil Analisis AI:</strong>
                    <button onClick={() => { navigator.clipboard.writeText(aiSearchResult); alert("Hasil disalin ke clipboard!"); }} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-[10px] font-bold">Copy Hasil</button>
                  </div>
                  <p className="whitespace-pre-line">{aiSearchResult}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "catatan" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border">
              <h2 className="font-extrabold text-xl text-slate-800 mb-4">📝 Tulis Catatan / Strategi</h2>
              <form onSubmit={handleSaveCatatan} className="space-y-4 text-sm">
                <input type="text" placeholder="Topik Catatan" className="w-full p-4 bg-slate-50 border rounded-2xl" value={catTopik} onChange={e => setCatTopik(e.target.value)} required />
                <textarea placeholder="Isi catatan..." className="w-full p-4 bg-slate-50 border rounded-2xl text-xs" rows={3} value={catIsi} onChange={e => setCatIsi(e.target.value)} required />
                <button type="submit" className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold shadow">Simpan Catatan</button>
              </form>
            </div>
            <div className="space-y-3">
              {dataAll.catatan.map((c: any, i: number) => (
                <div key={i} className="bg-white/90 p-5 rounded-2xl border shadow space-y-1">
                  <div className="flex justify-between font-bold text-xs text-indigo-600"><span>{c.Topik} ({c.NamaPerusahaan})</span><span className="text-slate-400">{c.Tanggal}</span></div>
                  <p className="text-slate-700 text-xs">{c.IsiCatatan}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <nav className="fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-2xl border border-white/50 p-2.5 max-w-2xl mx-auto rounded-full shadow-2xl flex justify-around text-[9px] md:text-xs font-bold z-50">
        {[
          { id: 'dashboard', icon: '🏢', label: 'e-Proc' },
          { id: 'pipeline', icon: '🚀', label: 'Pipeline' },
          { id: 'portofolio', icon: '🏆', label: 'Portofolio' },
          { id: 'rekanan', icon: '🤝', label: 'Rekanan' },
          { id: 'rekaman', icon: '✨', label: 'AI Studio' },
          { id: 'catatan', icon: '📝', label: 'Catatan' }
        ].map((menu) => (
          <button key={menu.id} onClick={() => setTab(menu.id)} className={`flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-full transition ${tab === menu.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}>
            <span className="text-base">{menu.icon}</span><span>{menu.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
