"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [tab, setTab] = useState("dashboard");
  const [dataAll, setDataAll] = useState<any>({ 
    perusahaan: [], pengalaman: [], pipeline: [], catatan: [], rekaman: [], rekanan: [], tenagaAhli: [], riwayatAi: [], sampah: [], bedahRks: [] 
  });
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

  // State Tenaga Ahli
  const [ahliNama, setAhliNama] = useState("");
  const [ahliPosisi, setAhliPosisi] = useState("");
  const [ahliSertif, setAhliSertif] = useState("");
  const [ahliPengalaman, setAhliPengalaman] = useState("");
  const [ahliKontak, setAhliKontak] = useState("");
  const [ahliKet, setAhliKet] = useState("");
  const [selectedAhliForCv, setSelectedAhliForCv] = useState("");
  const [tenderReqForAhli, setTenderReqForAhli] = useState("");
  const [cvResult, setCvResult] = useState("");
  const [cvLoading, setCvLoading] = useState(false);

  // State AI Chat Sessions (Cloud Synchronized)
  const [chatSessions, setChatSessions] = useState<{ id: string; title: string; messages: { role: string; content: string }[] }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // State AI Studio
  const [aiQuery, setAiQuery] = useState("");
  const [optBedahRks, setOptBedahRks] = useState(false);
  const [optCekTypo, setOptCekTypo] = useState(false);
  const [optAnalisaProp, setOptAnalisaProp] = useState(false);
  const [optPitchDeck, setOptPitchDeck] = useState(false);
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

      if (json.riwayatAi && json.riwayatAi.length > 0) {
        const parsedSessions = json.riwayatAi.map((row: any) => ({
          id: row.SessionID?.toString() || Date.now().toString(),
          title: row.JudulSesi || "Sesi Tanpa Judul",
          messages: row.MessagesJSON ? JSON.parse(row.MessagesJSON) : []
        }));
        
        parsedSessions.sort((a:any, b:any) => Number(b.id) - Number(a.id));
        setChatSessions(parsedSessions);
        if (!currentSessionId) setCurrentSessionId(parsedSessions[0].id);
      } else {
        if(chatSessions.length === 0) createNewChatSession();
      }

    } catch (e) { console.log("Gagal memuat data dari Sheets"); }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatSessions, currentSessionId, chatLoading]);

  const saveSessionToCloud = async (sessionId: string, title: string, messages: any[]) => {
    await fetch(API_URL, { 
      method: "POST", 
      body: JSON.stringify({ 
        type: "Riwayat AI", 
        action: "saveSession", 
        sessionID: sessionId, 
        title: title, 
        messagesJSON: JSON.stringify(messages) 
      }) 
    });
  };

  const createNewChatSession = () => {
    const newId = Date.now().toString();
    const newTitle = `Diskusi ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})} - ${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}`;
    const initialMsg = [{ role: 'model', content: 'Halo! Saya AI Tender Assistant PT Millennia Solusi Informatika. Ada dokumen tender atau strategi yang ingin didiskusikan hari ini?' }];
    
    const newSession = { id: newId, title: newTitle, messages: initialMsg };
    setChatSessions([newSession, ...chatSessions]);
    setCurrentSessionId(newId);
    saveSessionToCloud(newId, newTitle, initialMsg);
  };

  const deleteChatSession = async (id: string, e: any) => {
    e.stopPropagation();
    if (!confirm("Hapus riwayat obrolan ini dari server Cloud?")) return;

    const filtered = chatSessions.filter(s => s.id !== id);
    setChatSessions(filtered);
    if (currentSessionId === id && filtered.length > 0) {
      setCurrentSessionId(filtered[0].id);
    } else if (filtered.length === 0) {
      createNewChatSession();
    }

    await fetch(API_URL, { 
      method: "POST", 
      body: JSON.stringify({ type: "Riwayat AI", action: "deleteSession", sessionID: id }) 
    });
  };

  const handleOpenEproc = async (namaPerusahaan: string, url: string) => {
    window.open(url, "_blank");
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateClick", namaPerusahaan }) });
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

  const handleUpdatePipelineInline = async (index: number, tahapan: string, status: string) => {
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Pipeline", action: "updateStatus", rowIndex: index, tahapan, status }) });
    fetchData();
    alert("Status pipeline diperbarui!");
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

  const handleSaveTenagaAhli = async (e: any) => {
    e.preventDefault();
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Tenaga Ahli", action: "add", nama: ahliNama, posisi: ahliPosisi, sertifikasi: ahliSertif, pengalaman: ahliPengalaman, kontak: ahliKontak, keterangan: ahliKet }) });
    setAhliNama(""); setAhliPosisi(""); setAhliSertif(""); setAhliPengalaman(""); setAhliKontak(""); setAhliKet(""); fetchData();
    alert("Data Tenaga Ahli berhasil disimpan!");
  };

  const handleGenerateCvAi = async (e: any) => {
    e.preventDefault();
    if (!selectedAhliForCv) { alert("Pilih tenaga ahli terlebih dahulu!"); return; }
    setCvLoading(true);
    try {
      const targetAhli = dataAll.tenagaAhli.find((a: any) => a.Nama === selectedAhliForCv);
      const promptText = `Bertindaklah sebagai Senior HR & Proposal Tender Specialist PT Millennia Solusi Informatika. Buatkan CV Profesional untuk tender:
      - Nama: ${targetAhli?.Nama}, Posisi: ${targetAhli?.PosisiUtama}, Sertifikasi: ${targetAhli?.Sertifikasi}, Pengalaman: ${targetAhli?.Pengalaman}
      Target Kebutuhan Tender: "${tenderReqForAhli || 'Standar Proyek IT'}"`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setCvResult(json.candidates[0].content.parts[0].text);
    } catch (err: any) { setCvResult(`Gagal generate CV: ${err.message}`); }
    setCvLoading(false);
  };

  const handleSendChat = async (e: any) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");

    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;

    const updatedMessages = [...currentSession.messages, { role: 'user', content: userMsg }];
    const updatedSessions = chatSessions.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages } : s);
    setChatSessions(updatedSessions);
    setChatLoading(true);

    saveSessionToCloud(currentSession.id, currentSession.title, updatedMessages);

    try {
      const historyContext = updatedMessages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join("\n");
      const promptText = `Anda adalah Asisten Tender Senior PT Millennia Solusi Informatika. Riwayat percakapan:\n${historyContext}\nJawab secara profesional dan jika diminta, buatkan struktur Pitch Deck atau Proposal Tender yang komprehensif.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      const aiReply = json.candidates[0].content.parts[0].text;

      const finalMessages = [...updatedMessages, { role: 'model', content: aiReply }];
      const finalSessions = chatSessions.map(s => s.id === currentSessionId ? { ...s, messages: finalMessages } : s);
      setChatSessions(finalSessions);
      saveSessionToCloud(currentSession.id, currentSession.title, finalMessages);

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiReply.replace(/[#_*`-]/g, "").slice(0, 300));
        utterance.lang = 'id-ID';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      alert(`Gagal mengirim pesan: ${err.message}`);
    }
    setChatLoading(false);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung Voice Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => setVoiceActive(true);
    recognition.onresult = (event: any) => {
      setChatInput(event.results[0][0].transcript);
      setVoiceActive(false);
    };
    recognition.onerror = () => setVoiceActive(false);
    recognition.onend = () => setVoiceActive(false);
    recognition.start();
  };

  const handleSaveCatatan = async (e: any) => {
    e.preventDefault();
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Catatan", action: "add", namaPerusahaan: catPerusahaan, topik: catTopik, isiCatatan: catIsi }) });
    setCatTopik(""); setCatIsi(""); fetchData();
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
    reader.onload = () => setUploadedFileBase64((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  };

  const handleAdvancedAI = async (e: any) => {
    e.preventDefault();
    if (!aiQuery && !uploadedFileBase64 && !optBedahRks && !optCekTypo && !optAnalisaProp && !optPitchDeck) {
      alert("Masukkan perintah atau pilih minimal satu opsi ceklist AI!");
      return;
    }

    setSearchLoading(true);
    try {
      let instruksiKhusus = "";
      if (optBedahRks) instruksiKhusus += "\n- Lakukan BEDAH RKS mendalam: Ekstrak ringkasan, syarat kualifikasi, sertifikasi, dan strategi menang.";
      if (optCekTypo) instruksiKhusus += "\n- Lakukan CEK TYPO & PERBAIKAN BAHASA persuasif.";
      if (optAnalisaProp) instruksiKhusus += "\n- Lakukan ANALISA PROPOSAL terhadap KAK.";
      if (optPitchDeck) instruksiKhusus += "\n- Buat STRUKTUR PITCH DECK/PROPOSAL (Slide per slide mulai dari profil hingga penawaran nilai).";

      const promptText = `Anda Konsultan Tender Senior. Perintah: "${aiQuery}". Tambahan:${instruksiKhusus}`;
      const contentsPart: any[] = [{ text: promptText }];
      if (uploadedFileBase64) contentsPart.push({ inline_data: { mime_type: "application/pdf", data: uploadedFileBase64 } });

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: contentsPart }] })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      
      const hasilAi = json.candidates[0].content.parts[0].text;
      setAiSearchResult(hasilAi);

      if (optBedahRks) {
        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({
            type: "Bedah RKS",
            action: "add",
            namaPerusahaan: "Analisis AI Studio",
            namaProjek: uploadedFileName || aiQuery.slice(0, 30),
            hasilBedahRks: hasilAi,
            keterangan: "Otomatis dari AI Generator"
          })
        });
      }

    } catch (err: any) { setAiSearchResult(`Gagal memproses: ${err.message}`); }
    setSearchLoading(false);
  };

  const parseRupiah = (val: string) => {
    if (!val) return 0;
    return Number(val.replace(/[^0-9]/g, "")) || 0;
  };
  const formatRupiah = (num: number) => "Rp " + num.toLocaleString("id-ID");

  const filteredPengalaman = dataAll.pengalaman.filter((item: any) => {
    const matchIndustri = filterIndustri === "Semua" || item.JenisIndustri === filterIndustri;
    const matchKeyword = !filterKeyword || item.NamaPekerjaan?.toLowerCase().includes(filterKeyword.toLowerCase()) || item.NamaPerusahaan?.toLowerCase().includes(filterKeyword.toLowerCase());
    return matchIndustri && matchKeyword;
  });

  let totalNilaiPipeline = 0, hotVal = 0, warmVal = 0, coldVal = 0, gagalVal = 0;
  dataAll.pipeline.forEach((p: any) => {
    const val = parseRupiah(p.EstimasiNilaiProjek);
    totalNilaiPipeline += val;
    const status = p.Status || "Cold";
    if (status === "Hot") hotVal += val; else if (status === "Warm") warmVal += val; else if (status === "Gagal") gagalVal += val; else coldVal += val;
  });

  const safeTotal = totalNilaiPipeline || 1;
  const pieChartStyle = { background: `conic-gradient(#ef4444 0% ${(hotVal/safeTotal)*100}%, #f59e0b ${(hotVal/safeTotal)*100}% ${((hotVal+warmVal)/safeTotal)*100}%, #3b82f6 ${((hotVal+warmVal)/safeTotal)*100}% ${((hotVal+warmVal+coldVal)/safeTotal)*100}%, #64748b ${((hotVal+warmVal+coldVal)/safeTotal)*100}% 100%)` };

  const currentActiveSession = chatSessions.find(s => s.id === currentSessionId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-100 text-slate-800 pb-40 font-sans">
      <header className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white shadow-2xl py-8 px-6 mb-8 rounded-b-[3rem]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">⚡ Radar Tender Pro</h1>
            <p className="text-sm text-white/90 font-medium mt-1 tracking-wide">Sistem Monitoring e-Procurement Pintar</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
            <span className="bg-white/25 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow">🏢 Portal: {dataAll.perusahaan.length}</span>
            <span className="bg-white/25 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow">🚀 Peluang: {dataAll.pipeline.length}</span>
            <span className="bg-white/25 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow">👨‍💻 Ahli: {dataAll.tenagaAhli?.length || 0}</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto px-4 space-y-8">
        
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-white">
              <h2 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-6">{editIndexP !== null ? "✏️ Edit Portal e-Proc" : "➕ Tambah Portal e-Proc Baru"}</h2>
              <form onSubmit={handleSavePerusahaan} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="text" placeholder="Nama Perusahaan" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={namaP} onChange={e => setNamaP(e.target.value)} required />
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={jenisP} onChange={e => setJenisP(e.target.value)}>
                    <option>Pemerintah</option><option>BUMN/BUMD</option><option>Swasta</option>
                  </select>
                </div>
                <input type="url" placeholder="URL e-Proc (https://...)" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={urlP} onChange={e => setUrlP(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Status Rekanan:</label>
                    <select value={statusRek} onChange={e => setStatusRek(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl font-medium">
                      <option value="Belum">Belum Terdaftar</option><option value="Sudah">Sudah Rekanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Riwayat Projek:</label>
                    <select value={pernahProj} onChange={e => setPernahProj(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl font-medium">
                      <option value="Belum">Belum Ada</option><option value="Pernah">Pernah</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg">{editIndexP !== null ? "Simpan Perubahan" : "Simpan Portal"}</button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dataAll.perusahaan.map((item: any, i: number) => {
                let statusIcon = null;
                if (item.StatusUpdate === "NEW") statusIcon = <span className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black animate-pulse shadow-lg">🔥 NEW TENDER</span>;
                else if (item.StatusUpdate === "NO_CHANGE") statusIcon = <span className="bg-slate-100 text-slate-500 border px-3 py-1.5 rounded-xl text-[10px] font-bold">✅ Stabil</span>;
                else if (item.StatusUpdate === "BLOCKED") statusIcon = <span className="bg-amber-100 text-amber-600 border px-3 py-1.5 rounded-xl text-[10px] font-bold">🛡️ Cek Manual</span>;

                return (
                <div key={i} className={`bg-white/90 p-6 rounded-[2rem] border shadow-xl flex flex-col justify-between gap-4 ${item.StatusUpdate === "NEW" ? 'border-rose-400 ring-4 ring-rose-50' : 'border-white'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-extrabold text-lg text-slate-800">{item.NamaPerusahaan}</h3>
                      <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase bg-fuchsia-100 text-fuchsia-700">{item.Jenis}</span>
                    </div>
                    <div className="space-y-1 text-xs font-medium text-slate-500">
                      <p>Status Rekanan: <strong className="text-violet-600">{item.StatusRekanan || "Belum"}</strong></p>
                      <p>Riwayat Projek: <strong className="text-indigo-600">{item.PernahAdaProjek || "Belum"}</strong></p>
                      <p>🕒 Terakhir Klik: <strong className="text-slate-700">{item.LastClicked || "Belum"}</strong></p>
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
                    <button onClick={() => handleOpenEproc(item.NamaPerusahaan, item.URL)} className={`w-full text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-lg ${item.StatusUpdate === "NEW" ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`}>
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
            <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full shadow-inner flex items-center justify-center shrink-0" style={pieChartStyle}>
                <div className="w-22 h-22 md:w-26 md:h-26 bg-white rounded-full flex flex-col items-center justify-center shadow-lg p-2 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Nilai</span>
                  <span className="text-xs md:text-sm font-black text-slate-800">{formatRupiah(totalNilaiPipeline)}</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 w-full text-xs">
                <div className="bg-rose-50 border p-4 rounded-2xl"><p className="font-bold text-rose-500 uppercase">🔥 Hot Value</p><h3 className="text-sm md:text-base font-black text-rose-700 mt-1">{formatRupiah(hotVal)}</h3></div>
                <div className="bg-amber-50 border p-4 rounded-2xl"><p className="font-bold text-amber-500 uppercase">☀️ Warm Value</p><h3 className="text-sm md:text-base font-black text-amber-700 mt-1">{formatRupiah(warmVal)}</h3></div>
                <div className="bg-blue-50 border p-4 rounded-2xl"><p className="font-bold text-blue-500 uppercase">❄️ Cold Value</p><h3 className="text-sm md:text-base font-black text-blue-700 mt-1">{formatRupiah(coldVal)}</h3></div>
                <div className="bg-slate-100 border p-4 rounded-2xl"><p className="font-bold text-slate-500 uppercase">❌ Gagal Value</p><h3 className="text-sm md:text-base font-black text-slate-700 mt-1">{formatRupiah(gagalVal)}</h3></div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border">
              <h2 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-6">➕ Tambah Pipeline</h2>
              <form onSubmit={handleSavePipeline} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Klien:</label>
                    <input type="text" list="daftar-perusahaan" placeholder="Pilih atau ketik klien..." className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={pipePerusahaan} onChange={e => setPipePerusahaan(e.target.value)} required />
                    <datalist id="daftar-perusahaan">{dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan} />)}</datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nama Projek / Pengadaan:</label>
                    <input type="text" placeholder="Contoh: Pengadaan Server" className="w-full p-4 bg-slate-50 border rounded-2xl" value={pipeProjek} onChange={e => setPipeProjek(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Estimasi Nilai (Rp)" className="p-4 bg-slate-50 border rounded-2xl" value={pipeNilai} onChange={e => setPipeNilai(e.target.value)} />
                  <input type="date" className="p-4 bg-slate-50 border rounded-2xl" value={pipeTayang} onChange={e => setPipeTayang(e.target.value)} />
                  <select className="p-4 bg-slate-50 border rounded-2xl" value={pipeTahapan} onChange={e => setPipeTahapan(e.target.value)}>
                    <option>1. Eksplorasi</option><option>3. Penawaran</option><option>5. Tender Tayang</option><option>7. Menang</option>
                  </select>
                  <select className="p-4 bg-blue-50 text-blue-700 font-bold border rounded-2xl" value={pipeStatus} onChange={e => setPipeStatus(e.target.value)}>
                    <option value="Hot">🔥 Hot</option><option value="Warm">☀️ Warm</option><option value="Cold">❄️ Cold</option><option value="Gagal">❌ Gagal</option>
                  </select>
                </div>
                <textarea placeholder="Catatan singkat..." className="w-full p-4 bg-slate-50 border rounded-2xl" rows={3} value={pipeCatatan} onChange={e => setPipeCatatan(e.target.value)} />
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
                    <div className="flex flex-wrap gap-2 items-center">
                      <select id={`tahapan-${i}`} className="bg-white border text-xs p-2 rounded-xl font-bold" defaultValue={p.Tahapan || "1. Eksplorasi"}>
                        <option>1. Eksplorasi</option><option>3. Penawaran</option><option>5. Tender Tayang</option><option>7. Menang</option>
                      </select>
                      <select id={`status-${i}`} className="bg-white border text-xs p-2 rounded-xl font-bold" defaultValue={p.Status || "Cold"}>
                        <option value="Hot">🔥 Hot</option><option value="Warm">☀️ Warm</option><option value="Cold">❄️ Cold</option><option value="Gagal">❌ Gagal</option>
                      </select>
                      <button 
                        onClick={() => handleUpdatePipelineInline(i, (document.getElementById(`tahapan-${i}`) as HTMLSelectElement).value, (document.getElementById(`status-${i}`) as HTMLSelectElement).value)} 
                        className="bg-blue-600 text-white text-xs px-3 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition"
                      >
                        💾 Update
                      </button>
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
            <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border">
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
                    <input type="text" placeholder="Tahun" className="p-3 bg-slate-50 border rounded-xl" value={expTahun} onChange={e => setExpTahun(e.target.value)} />
                    <input type="text" placeholder="Lama" className="p-3 bg-slate-50 border rounded-xl" value={expLama} onChange={e => setExpLama(e.target.value)} />
                    <input type="text" placeholder="Nilai (Rp)" className="p-3 bg-slate-50 border rounded-xl" value={expNilai} onChange={e => setExpNilai(e.target.value)} />
                  </div>
                  <textarea placeholder="Keterangan..." className="p-4 bg-slate-50 border rounded-2xl w-full" rows={2} value={expKet} onChange={e => setExpKet(e.target.value)} />
                  <button type="submit" className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold shadow">Simpan Portofolio</button>
               </form>
            </div>
            <div className="space-y-4">
              {filteredPengalaman.map((item:any, i:number)=>(
                <div key={i} className="p-6 bg-white/90 rounded-3xl border shadow flex justify-between gap-4">
                  <div>
                    <h4 className="font-black text-slate-800 text-base">{item.NamaPekerjaan}</h4>
                    <p className="text-xs font-bold text-indigo-600 mt-1">{item.NamaPerusahaan}</p>
                    <p className="text-xs text-slate-500 mt-2">Nilai: <strong className="text-emerald-700">{item.NilaiProjek || "-"}</strong> ({item.TahunPelaksanaan})</p>
                  </div>
                  <button onClick={() => handleDelete("Pengalaman", i, item.NamaPekerjaan)} className="text-xs font-bold text-rose-500">Hapus</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "tenagaAhli" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border">
              <h2 className="font-extrabold text-xl text-slate-800 mb-4">👨‍💻 Tambah Database Tenaga Ahli</h2>
              <form onSubmit={handleSaveTenagaAhli} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nama Lengkap & Gelar" className="p-4 bg-slate-50 border rounded-2xl w-full" value={ahliNama} onChange={e => setAhliNama(e.target.value)} required />
                  <input type="text" placeholder="Posisi Utama" className="p-4 bg-slate-50 border rounded-2xl w-full" value={ahliPosisi} onChange={e => setAhliPosisi(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Sertifikasi" className="p-4 bg-slate-50 border rounded-2xl w-full" value={ahliSertif} onChange={e => setAhliSertif(e.target.value)} required />
                  <input type="text" placeholder="No Kontak" className="p-4 bg-slate-50 border rounded-2xl w-full" value={ahliKontak} onChange={e => setAhliKontak(e.target.value)} />
                </div>
                <textarea placeholder="Ringkasan Pengalaman Projek & Keahlian..." className="p-4 bg-slate-50 border rounded-2xl w-full" rows={3} value={ahliPengalaman} onChange={e => setAhliPengalaman(e.target.value)} required />
                <button type="submit" className="w-full bg-violet-600 text-white p-4 rounded-2xl font-bold shadow">Simpan Tenaga Ahli</button>
              </form>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl space-y-6">
              <div>
                <h3 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300">📄 Generator CV Tender AI</h3>
              </div>
              <form onSubmit={handleGenerateCvAi} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" value={selectedAhliForCv} onChange={e => setSelectedAhliForCv(e.target.value)} required>
                    <option value="" className="text-slate-800">-- Pilih Personil --</option>
                    {dataAll.tenagaAhli?.map((a: any, idx: number) => <option key={idx} value={a.Nama} className="text-slate-800">{a.Nama} ({a.PosisiUtama})</option>)}
                  </select>
                  <input type="text" placeholder="Syarat Tender (opsional)..." className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" value={tenderReqForAhli} onChange={e => setTenderReqForAhli(e.target.value)} />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-2xl font-bold text-xs shadow-lg">{cvLoading ? "🤖 Menyusun CV..." : "✨ Generate CV"}</button>
              </form>
              {cvResult && (
                <div className="bg-white/10 p-6 rounded-2xl text-xs leading-relaxed">
                   <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                    <strong className="text-cyan-300">Hasil CV:</strong>
                    <button onClick={() => navigator.clipboard.writeText(cvResult)} className="bg-white/20 px-3 py-1.5 rounded-lg">Copy</button>
                  </div>
                  <p className="whitespace-pre-line">{cvResult}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataAll.tenagaAhli?.map((a: any, i: number) => (
                <div key={i} className="bg-white/90 p-6 rounded-[2rem] border shadow space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-base">{a.Nama}</h4>
                      <p className="text-xs font-bold text-violet-600">{a.PosisiUtama}</p>
                    </div>
                    <button onClick={() => handleDelete("Tenaga Ahli", i, a.Nama)} className="text-xs font-bold text-rose-500">Hapus</button>
                  </div>
                  <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border">
                    <p>🏆 Sertifikasi: <strong className="text-slate-700">{a.Sertifikasi}</strong></p>
                    <p>💼 Pengalaman: <span className="text-slate-600">{a.Pengalaman}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rekanan" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border">
              <h2 className="font-extrabold text-xl text-slate-800 mb-4">➕ Tambah Rekanan</h2>
              <form onSubmit={handleSaveRekanan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nama Rekanan" className="w-full p-4 bg-slate-50 border rounded-2xl" value={rekNama} onChange={e => setRekNama(e.target.value)} required />
                  <input type="text" placeholder="Produk Rekanan" className="w-full p-4 bg-slate-50 border rounded-2xl" value={rekProduk} onChange={e => setRekProduk(e.target.value)} />
                </div>
                <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100">
                  <label className="block text-xs font-bold text-teal-900 mb-2">👥 PIC & No Telp:</label>
                  <input type="text" placeholder="Nama PIC" className="w-full p-3 bg-white border rounded-xl text-xs mb-2" value={rekPic} onChange={e => setRekPic(e.target.value)} required />
                  <input type="text" placeholder="No Telp PIC" className="w-full p-3 bg-white border rounded-xl text-xs" value={rekTelp} onChange={e => setRekTelp(e.target.value)} />
                </div>
                <button type="submit" className="w-full bg-teal-600 text-white p-4 rounded-2xl font-bold shadow">Simpan Rekanan</button>
              </form>
            </div>
            <div className="space-y-4">
              {dataAll.rekanan.map((r: any, i: number) => (
                <div key={i} className="bg-white/90 p-6 rounded-[2rem] border shadow">
                  <div className="flex justify-between font-bold text-slate-800 text-base mb-2">
                    <span>{r.NamaRekanan}</span>
                    <button onClick={() => handleDelete("Rekanan", i, r.NamaRekanan)} className="text-xs text-rose-500">Hapus</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 p-4 rounded-2xl border">
                    <div>💵 Harga: <strong className="text-emerald-700">{r.HargaProduk || "-"}</strong></div>
                    <div>👥 PIC: <strong className="text-teal-800">{r.PIC}</strong> ({r.NoTelpPIC})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rekaman" && (
          <div className="space-y-6">
            {/* Sesi Chat AI */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-cyan-300">✨ AI Tender Chat</h3>
                  <p className="text-xs text-indigo-200 mt-1">Chat tersinkronisasi otomatis ke Google Sheets!</p>
                </div>
                <button onClick={createNewChatSession} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5">
                  <span>➕ Buat Sesi Baru</span>
                </button>
              </div>

              {/* Daftar Sesi */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {chatSessions.map((session) => (
                  <div key={session.id} onClick={() => setCurrentSessionId(session.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition ${session.id === currentSessionId ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}>
                    <span>💬 {session.title}</span>
                    <button onClick={(e) => deleteChatSession(session.id, e)} className="text-white/60 hover:text-rose-300 ml-1">✕</button>
                  </div>
                ))}
              </div>

              {/* Chat Area */}
              <div ref={chatContainerRef} className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl border border-white/20 space-y-4 max-h-[400px] overflow-y-auto">
                {currentActiveSession?.messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-indigo-300 mb-1 font-bold">{msg.role === 'user' ? 'Anda' : 'AI Consultant'}</span>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-line ${msg.role === 'user' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow' : 'bg-white/20 text-slate-100 border border-white/10'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="text-xs text-fuchsia-300 animate-pulse">🤖 AI sedang mengetik...</div>}
              </div>

              {/* Input Chat */}
              <form onSubmit={handleSendChat} className="flex gap-2 items-center">
                <button type="button" onClick={startVoiceInput} className={`p-4 rounded-2xl text-white font-bold text-sm shadow shrink-0 ${voiceActive ? 'bg-rose-500 animate-bounce' : 'bg-indigo-600 hover:bg-indigo-700'}`}>🎙️</button>
                <input type="text" placeholder="Ketik pesan..." className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-xs text-white outline-none focus:ring-2 focus:ring-fuchsia-400" value={chatInput} onChange={e => setChatInput(e.target.value)} />
                <button type="submit" className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white px-6 py-4 rounded-2xl font-bold text-xs shadow-lg shrink-0">Kirim</button>
              </form>
            </div>

            {/* Generator Pitch Deck */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl space-y-6">
              <div>
                <h3 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-cyan-300">📊 Dokumen Generator AI</h3>
              </div>
              <form onSubmit={handleAdvancedAI} className="space-y-5">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs">
                    <span className="font-bold block text-fuchsia-300">📁 Unggah PDF KAK/RKS (Opsional):</span>
                  </div>
                  <input type="file" accept="application/pdf" onChange={handleFileUpload} className="text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-fuchsia-600 file:text-white cursor-pointer" />
                </div>
                <textarea rows={3} placeholder="Instruksi tambahan..." className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-xs text-white outline-none" value={aiQuery} onChange={e => setAiQuery(e.target.value)} />
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                  <span className="font-bold block text-cyan-300 text-xs">⚙️ Pilih Kebutuhan:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={optBedahRks} onChange={e => setOptBedahRks(e.target.checked)} className="w-4 h-4" /><span>🔍 Bedah RKS</span></label>
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={optPitchDeck} onChange={e => setOptPitchDeck(e.target.checked)} className="w-4 h-4" /><span>📊 Buat Pitch Deck</span></label>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white p-4 rounded-2xl font-bold text-sm shadow-lg">Jalankan Generator AI</button>
              </form>
              {aiSearchResult && (
                <div className="mt-6 bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 text-xs leading-relaxed text-slate-100">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                    <strong className="text-fuchsia-300">Hasil Output:</strong>
                    <button onClick={() => navigator.clipboard.writeText(aiSearchResult)} className="bg-white/20 px-3 py-1.5 rounded-lg text-[10px] font-bold">Copy</button>
                  </div>
                  <p className="whitespace-pre-line">{aiSearchResult}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "catatan" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border">
              <h2 className="font-extrabold text-xl text-slate-800 mb-4">📝 Catatan</h2>
              <form onSubmit={handleSaveCatatan} className="space-y-4 text-sm">
                <input type="text" placeholder="Topik" className="w-full p-4 bg-slate-50 border rounded-2xl" value={catTopik} onChange={e => setCatTopik(e.target.value)} required />
                <textarea placeholder="Isi..." className="w-full p-4 bg-slate-50 border rounded-2xl text-xs" rows={3} value={catIsi} onChange={e => setCatIsi(e.target.value)} required />
                <button type="submit" className="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold">Simpan</button>
              </form>
            </div>
            <div className="space-y-3">
              {dataAll.catatan.map((c: any, i: number) => (
                <div key={i} className="bg-white/90 p-5 rounded-2xl border shadow space-y-1">
                  <div className="flex justify-between font-bold text-xs text-indigo-600"><span>{c.Topik}</span><span className="text-slate-400">{c.Tanggal}</span></div>
                  <p className="text-slate-700 text-xs">{c.IsiCatatan}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <nav className="fixed bottom-4 left-3 right-3 bg-white/95 backdrop-blur-2xl border border-white/60 p-2 max-w-3xl mx-auto rounded-full shadow-2xl flex items-center gap-1 overflow-x-auto scrollbar-none z-50">
        {[
          { id: 'dashboard', icon: '🏢', label: 'e-Proc' },
          { id: 'pipeline', icon: '🚀', label: 'Pipeline' },
          { id: 'portofolio', icon: '🏆', label: 'Portofolio' },
          { id: 'tenagaAhli', icon: '👨‍💻', label: 'Ahli' },
          { id: 'rekanan', icon: '🤝', label: 'Rekanan' },
          { id: 'rekaman', icon: '✨', label: 'AI Studio' },
          { id: 'catatan', icon: '📝', label: 'Catatan' }
        ].map((menu) => (
          <button key={menu.id} onClick={() => setTab(menu.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition ${tab === menu.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>{menu.icon}</span><span>{menu.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
