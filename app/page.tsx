"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [tab, setTab] = useState("dashboard");
  const [dataAll, setDataAll] = useState<any>({ 
    perusahaan: [], pengalaman: [], pipeline: [], catatan: [], rekaman: [], rekanan: [], tenagaAhli: [], riwayatAi: [], sampah: [], bedahRks: [], voiceProfiles: [] 
  });
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState("Alda");

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
  const [pipePerusahaan, setPipePerusahaan] = useState("");
  const [pipeProjek, setPipeProjek] = useState("");
  const [pipeNilai, setPipeNilai] = useState("");
  const [pipeTayang, setPipeTayang] = useState("");
  const [pipeTahapan, setPipeTahapan] = useState("1. Eksplorasi");
  const [pipeStatus, setPipeStatus] = useState("Cold");
  const [pipeCatatan, setPipeCatatan] = useState("");

  // State Portofolio
  const [expPerusahaan, setExpPerusahaan] = useState("");
  const [expIndustri, setExpIndustri] = useState("IT Masterplan / EA");
  const [expPekerjaan, setExpPekerjaan] = useState("");
  const [expTglMulai, setExpTglMulai] = useState(new Date().toISOString().split('T')[0]);
  const [expDurasi, setExpDurasi] = useState("3 Bulan");
  const [expNilai, setExpNilai] = useState("");
  const [expKet, setExpKet] = useState("");
  const [filterIndustri, setFilterIndustri] = useState("Semua");
  const [filterKeyword, setFilterKeyword] = useState("");

  // State Rekanan
  const [rekNama, setRekNama] = useState("");
  const [rekProduk, setRekProduk] = useState("");
  const [rekHarga, setRekHarga] = useState("");
  const [rekPic, setRekPic] = useState("");
  const [rekTelp, setRekTelp] = useState("");
  const [rekKet, setRekKet] = useState("");

  // State Tenaga Ahli & CV Generator
  const [editIndexAhli, setEditIndexAhli] = useState<number | null>(null);
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

  // State Catatan
  const [editIndexCatatan, setEditIndexCatatan] = useState<number | null>(null);
  const [catPerusahaan, setCatPerusahaan] = useState("Umum");
  const [catTopik, setCatTopik] = useState("");
  const [catIsi, setCatIsi] = useState("");

  // State AI Chat & Voice
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getAll`);
      const json = await res.json();
      
      setDataAll({
        perusahaan: json.perusahaan || [],
        pengalaman: json.pengalaman || [],
        pipeline: json.pipeline || [],
        catatan: json.catatan || [],
        rekaman: json.rekaman || [],
        rekanan: json.rekanan || [],
        tenagaAhli: json.tenagaAhli || [],
        riwayatAi: json.riwayatAi || [],
        sampah: json.sampah || [],
        bedahRks: json.bedahRks || [],
        voiceProfiles: json.voiceProfiles || []
      });

      if (json.riwayatAi && json.riwayatAi.length > 0) {
        const parsedSessions = json.riwayatAi.map((row: any) => ({
          id: row.SessionID?.toString() || row.sessionid || Date.now().toString(),
          title: row.JudulSesi || row.judulsesi || "Sesi Tanpa Judul",
          messages: row.MessagesJSON ? JSON.parse(row.MessagesJSON) : (row.messagesjson ? JSON.parse(row.messagesjson) : [])
        }));
        parsedSessions.sort((a:any, b:any) => Number(b.id) - Number(a.id));
        setChatSessions(parsedSessions);
        if (!currentSessionId && parsedSessions.length > 0) setCurrentSessionId(parsedSessions[0].id);
      } else {
        if(chatSessions.length === 0) createNewChatSession();
      }
    } catch (e) { console.log("Gagal memuat data dari Sheets"); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatSessions, currentSessionId, chatLoading]);

  const saveSessionToCloud = async (sessionId: string, title: string, messages: any[]) => {
    await fetch(API_URL, { 
      method: "POST", 
      body: JSON.stringify({ type: "Riwayat AI", action: "saveSession", sessionID: sessionId, title: title, messagesJSON: JSON.stringify(messages) }) 
    });
  };

  const createNewChatSession = () => {
    const newId = Date.now().toString();
    const newTitle = `Diskusi ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})} - ${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}`;
    const initialMsg = [{ role: 'model', content: `Halo Kak ${activeUser}, ada yang bisa LISA bantu hari ini?` }];
    
    const newSession = { id: newId, title: newTitle, messages: initialMsg };
    setChatSessions([newSession, ...chatSessions]);
    setCurrentSessionId(newId);
    saveSessionToCloud(newId, newTitle, initialMsg);
  };

  const deleteChatSession = async (id: string, e: any) => {
    e.stopPropagation();
    if (!confirm("Hapus obrolan ini? (Data akan dipindahkan ke sheet Sampah)")) return;
    const filtered = chatSessions.filter(s => s.id !== id);
    setChatSessions(filtered);
    if (currentSessionId === id && filtered.length > 0) setCurrentSessionId(filtered[0].id);
    else if (filtered.length === 0) createNewChatSession();
    
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "delete", sheetName: "Riwayat AI", rowIndex: chatSessions.findIndex(s => s.id === id) }) });
    alert("Obrolan dipindahkan ke Sampah!");
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
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Pipeline", action: "add", namaPerusahaan: pipePerusahaan, namaProjek: pipeProjek, estimasiNilai: pipeNilai, tanggalTayang: pipeTayang, tahapan: pipeTahapan, status: pipeStatus, logCatatan: pipeCatatan }) });
    setPipePerusahaan(""); setPipeProjek(""); setPipeNilai(""); setPipeTayang(""); setPipeCatatan(""); setPipeStatus("Cold"); fetchData();
  };

  const handleUpdatePipelineInline = async (index: number, tahapan: string, status: string) => {
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Pipeline", action: "updateStatus", rowIndex: index, tahapan, status }) });
    fetchData();
    alert("Status pipeline berhasil diperbarui!");
  };

  const handleSavePengalaman = async (e: any) => {
    e.preventDefault();
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Pengalaman", action: "add", namaPerusahaan: expPerusahaan, jenisIndustri: expIndustri, namaPekerjaan: expPekerjaan, tanggalMulai: expTglMulai, durasiPekerjaan: expDurasi, nilaiProjek: expNilai, keterangan: expKet }) });
    setExpPerusahaan(""); setExpPekerjaan(""); setExpNilai(""); setExpKet(""); fetchData();
  };

  const handleSaveRekanan = async (e: any) => {
    e.preventDefault();
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Rekanan", action: "add", namaRekanan: rekNama, produkRekanan: rekProduk, hargaProduk: rekHarga, pic: rekPic, noTelp: rekTelp, keterangan: rekKet }) });
    setRekNama(""); setRekProduk(""); setRekHarga(""); setRekPic(""); setRekTelp(""); setRekKet(""); fetchData();
  };

  const handleSaveTenagaAhli = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexAhli !== null ? "edit" : "add";
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Tenaga Ahli", action: actionType, rowIndex: editIndexAhli, nama: ahliNama, posisi: ahliPosisi, sertifikasi: ahliSertif, pengalaman: ahliPengalaman, kontak: ahliKontak, keterangan: ahliKet }) });
    setAhliNama(""); setAhliPosisi(""); setAhliSertif(""); setAhliPengalaman(""); setAhliKontak(""); setAhliKet(""); setEditIndexAhli(null); fetchData();
    alert("Data Tenaga Ahli berhasil disimpan!");
  };

  const handleSaveCatatan = async (e: any) => {
    e.preventDefault();
    const actionType = editIndexCatatan !== null ? "edit" : "add";
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ type: "Catatan", action: actionType, rowIndex: editIndexCatatan, namaPerusahaan: catPerusahaan, topik: catTopik, isiCatatan: catIsi }) });
    setCatTopik(""); setCatIsi(""); setEditIndexCatatan(null); fetchData();
  };

  const handleGenerateCvAi = async (e: any) => {
    e.preventDefault();
    if (!selectedAhliForCv) { alert("Pilih tenaga ahli terlebih dahulu!"); return; }
    setCvLoading(true);
    try {
      const targetAhli = dataAll.tenagaAhli.find((a: any) => (a.Nama || a.nama) === selectedAhliForCv);
      const promptText = `Bertindaklah sebagai Senior HR & Proposal Tender Specialist. Buatkan CV Profesional yang elegan dan persuasif untuk tender:\n- Nama: ${targetAhli?.Nama || targetAhli?.nama}, Posisi: ${targetAhli?.PosisiUtama || targetAhli?.posisiutama}, Sertifikasi: ${targetAhli?.Sertifikasi || targetAhli?.sertifikasi}, Pengalaman: ${targetAhli?.Pengalaman || targetAhli?.pengalaman}\nTarget Kebutuhan Tender: "${tenderReqForAhli || 'Standar Proyek IT'}"`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setCvResult(json.candidates[0].content.parts[0].text);
    } catch (err: any) { setCvResult(`Gagal generate CV: ${err.message}`); }
    setCvLoading(false);
  };

  // Logika Perintah e-Proc & Cek Database
  const checkAndExecuteEprocCommand = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("buka eproc") || lower.includes("buka e-proc") || lower.includes("buka portal")) {
      // Cari nama perusahaan setelah kata perintah
      const foundComp = dataAll.perusahaan.find((p: any) => {
        const name = (p.NamaPerusahaan || p.namaperusahaan || "").toLowerCase();
        return lower.includes(name);
      });

      if (foundComp) {
        const url = foundComp.URL || foundComp.url;
        const name = foundComp.NamaPerusahaan || foundComp.namaperusahaan;
        window.open(url, "_blank");
        return `Membuka portal e-Proc ${name} untuk Kak ${activeUser}.`;
      } else {
        return "e-Proc tersebut belum ada di database.";
      }
    }
    return null;
  };

  const processAndSendChat = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Cek perintah buka e-proc via suara/teks
    const eprocReply = checkAndExecuteEprocCommand(textToSend);
    if (eprocReply) {
      const currentSession = chatSessions.find(s => s.id === currentSessionId);
      if (currentSession) {
        const updatedMessages = [...currentSession.messages, { role: 'user', content: textToSend }, { role: 'model', content: eprocReply }];
        const updatedSessions = chatSessions.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages } : s);
        setChatSessions(updatedSessions);
        saveSessionToCloud(currentSession.id, currentSession.title, updatedMessages);
        
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(eprocReply);
          utterance.lang = 'id-ID';
          utterance.pitch = 1.3;
          window.speechSynthesis.speak(utterance);
        }
      }
      return;
    }

    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;

    const updatedMessages = [...currentSession.messages, { role: 'user', content: textToSend }];
    const updatedSessions = chatSessions.map(s => s.id === currentSessionId ? { ...s, messages: updatedMessages } : s);
    setChatSessions(updatedSessions);
    setChatLoading(true);

    saveSessionToCloud(currentSession.id, currentSession.title, updatedMessages);

    try {
      const historyContext = updatedMessages.map(m => `${m.role === 'user' ? 'User' : 'LISA'}: ${m.content}`).join("\n");
      const promptText = `Anda adalah LISA, asisten AI sales profesional berkarakter feminin, cerdas, elegan, dan santun. Panggil pengguna dengan sapaan "Kak ${activeUser}". Berikan jawaban SINGKAT, PADAT, dan ELEGAN (maksimal 1-2 kalimat). Riwayat:\n${historyContext}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
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
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiReply.replace(/[#_*`-]/g, "").slice(0, 250));
        utterance.lang = 'id-ID';
        utterance.pitch = 1.3; 
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      alert(`Gagal mengirim pesan: ${err.message}`);
    }
    setChatLoading(false);
  };

  const handleSendChat = (e: any) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput("");
    processAndSendChat(text);
  };

  // Push-to-Talk Voice (Klik sekali bicara, klik lagi untuk bicara berikutnya)
  const startSingleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung Voice Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setVoiceActive(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceActive(false);
      if (transcript) {
        processAndSendChat(transcript);
      }
    };

    recognition.onerror = () => {
      setVoiceActive(false);
    };

    recognition.onend = () => {
      setVoiceActive(false);
    };

    try {
      recognition.start();
    } catch(e) {
      setVoiceActive(false);
    }
  };

  const handleDelete = async (sheetName: string, rowIndex: number, nama: string) => {
    if (!confirm(`Yakin menghapus "${nama}"? (Data akan masuk ke Sampah)`)) return;
    await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "delete", sheetName, rowIndex }) });
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
      if (optBedahRks) instruksiKhusus += "\n- BEDAH RKS: Ekstrak ringkasan, persyaratan kualifikasi, sertifikasi, dan strategi menang.";
      if (optCekTypo) instruksiKhusus += "\n- CEK TYPO & BAHASA: Perbaiki ejaan dan buat kalimat menjadi sangat profesional, elegan, dan persuasif.";
      if (optAnalisaProp) instruksiKhusus += "\n- ANALISA PROPOSAL: Bandingkan isi proposal dengan ketentuan KAK untuk memastikan tidak ada syarat krusial yang terlewat.";
      if (optPitchDeck) instruksiKhusus += "\n- BUAT PITCH DECK / PROPOSAL: Buat struktur slide presentasi penawaran tender yang memukau klien.";

      const promptText = `Anda LISA (Lead Intelligence & Sales Assistant). Perintah: "${aiQuery}". Instruksi:${instruksiKhusus}`;
      const contentsPart: any[] = [{ text: promptText }];
      if (uploadedFileBase64) contentsPart.push({ inline_data: { mime_type: "application/pdf", data: uploadedFileBase64 } });

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: contentsPart }] })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      
      const hasilAi = json.candidates[0].content.parts[0].text;
      setAiSearchResult(hasilAi);

      if (optBedahRks) {
        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ type: "Bedah RKS", action: "add", namaPerusahaan: "Analisis LISA", namaProjek: uploadedFileName || aiQuery.slice(0, 30), hasilBedahRks: hasilAi, keterangan: "Otomatis dari LISA AI" })
        });
      }
    } catch (err: any) { setAiSearchResult(`Gagal memproses: ${err.message}`); }
    setSearchLoading(false);
  };

  const parseRupiah = (val: string) => {
    if (!val) return 0;
    return Number(val.toString().replace(/[^0-9]/g, "")) || 0;
  };
  const formatRupiah = (num: number) => "Rp " + num.toLocaleString("id-ID");

  const filteredPengalaman = dataAll.pengalaman.filter((item: any) => {
    const jenis = item.JenisIndustri || item.jenisindustri || "";
    const matchIndustri = filterIndustri === "Semua" || jenis === filterIndustri;
    const keyword = filterKeyword.toLowerCase();
    const pekerjaan = item.NamaPekerjaan || item.namapekerjaan || "";
    const perusahaan = item.NamaPerusahaan || item.namaperusahaan || "";
    const ket = item.Keterangan || item.keterangan || "";
    const matchKeyword = !keyword || 
      pekerjaan.toLowerCase().includes(keyword) || 
      perusahaan.toLowerCase().includes(keyword) || 
      ket.toLowerCase().includes(keyword);
    return matchIndustri && matchKeyword;
  });

  let totalNilaiPipeline = 0, hotVal = 0, warmVal = 0, coldVal = 0, gagalVal = 0;
  dataAll.pipeline.forEach((p: any) => {
    const val = parseRupiah(p.EstimasiNilaiProjek || p.estimasinilaiprojek || p.EstimasiNilai || p.estimasinilai || 0);
    totalNilaiPipeline += val;
    const status = (p.Status || p.status || "Cold").toString().trim();
    if (status === "Hot") hotVal += val; 
    else if (status === "Warm") warmVal += val; 
    else if (status === "Gagal") gagalVal += val; 
    else coldVal += val;
  });

  const safeTotal = totalNilaiPipeline || 1;
  const pieChartStyle = { background: `conic-gradient(#ef4444 0% ${(hotVal/safeTotal)*100}%, #f59e0b ${(hotVal/safeTotal)*100}% ${((hotVal+warmVal)/safeTotal)*100}%, #3b82f6 ${((hotVal+warmVal)/safeTotal)*100}% ${((hotVal+warmVal+coldVal)/safeTotal)*100}%, #64748b ${((hotVal+warmVal+coldVal)/safeTotal)*100}% 100%)` };

  const currentActiveSession = chatSessions.find(s => s.id === currentSessionId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-slate-100 pb-40 font-sans">
      <header className="w-full bg-gradient-to-r from-pink-900 via-purple-900 to-indigo-950 text-white shadow-2xl py-8 px-6 mb-8 rounded-b-[3rem] border-b border-pink-500/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-pink-500/20 border-2 border-pink-400/50 flex items-center justify-center shadow-2xl shrink-0 backdrop-blur-md overflow-hidden p-1">
              <svg viewBox="0 0 100 100" className="w-12 h-12 fill-pink-300 drop-shadow-md">
                <path d="M50 10 C35 10 25 22 25 38 C25 45 28 52 33 58 L30 75 C30 82 38 88 50 88 C62 88 70 82 70 75 L67 58 C72 52 75 45 75 38 C75 22 65 10 50 10 Z M42 22 C45 22 47 25 47 28 C47 31 45 34 42 34 C39 34 37 31 37 28 C37 25 39 22 42 22 Z M58 22 C61 22 63 25 63 28 C63 31 61 34 58 34 C55 34 53 31 53 28 C53 25 55 22 58 22 Z M50 42 C54 42 57 45 57 49 C57 53 54 55 50 55 C46 55 43 53 43 49 C43 45 46 42 50 42 Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-white">LISA</h1>
              <p className="text-xs text-pink-300 font-bold mt-1 tracking-widest uppercase">Lead Intelligence & Sales Assistant • Aktif: <span className="text-white">{activeUser}</span></p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-pink-500/30 shadow">🏢 Portal: {dataAll.perusahaan.length}</span>
            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-pink-500/30 shadow">🚀 Peluang: {dataAll.pipeline.length}</span>
            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-pink-500/30 shadow">👨‍💻 Ahli: {dataAll.tenagaAhli?.length || 0}</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto px-4 space-y-8">
        
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20">
              <h2 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-6">{editIndexP !== null ? "✏️ Edit Portal e-Proc" : "➕ Tambah Portal e-Proc Baru"}</h2>
              <form onSubmit={handleSavePerusahaan} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input type="text" placeholder="Nama Perusahaan" className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl outline-none" value={namaP} onChange={e => setNamaP(e.target.value)} required />
                  <select className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl outline-none" value={jenisP} onChange={e => setJenisP(e.target.value)}>
                    <option>Pemerintah</option><option>BUMN/BUMD</option><option>Swasta</option>
                  </select>
                </div>
                <input type="url" placeholder="URL e-Proc (https://...)" className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl outline-none" value={urlP} onChange={e => setUrlP(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Status Rekanan:</label>
                    <select value={statusRek} onChange={e => setStatusRek(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl font-medium">
                      <option value="Belum">Belum Terdaftar</option><option value="Sudah">Sudah Rekanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Riwayat Projek:</label>
                    <select value={pernahProj} onChange={e => setPernahProj(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl font-medium">
                      <option value="Belum">Belum Ada</option><option value="Pernah">Pernah</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 rounded-2xl font-bold shadow-lg">{editIndexP !== null ? "Simpan Perubahan" : "Simpan Portal"}</button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dataAll.perusahaan.map((item: any, i: number) => {
                const namaComp = item.NamaPerusahaan || item.namaperusahaan || "";
                const jenisComp = item.Jenis || item.jenis || "";
                const statusR = item.StatusRekanan || item.statusrekanan || "Belum";
                const pernahP = item.PernahAdaProjek || item.pernahadaprojek || "Belum";
                const urlComp = item.URL || item.url || "#";

                return (
                <div key={i} className="bg-slate-900/90 p-6 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-extrabold text-lg text-white">{namaComp}</h3>
                      <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase bg-pink-950 text-pink-300 border border-pink-500/30">{jenisComp}</span>
                    </div>
                    <div className="space-y-1 text-xs font-medium text-slate-400">
                      <p>Status Rekanan: <strong className="text-pink-400">{statusR}</strong></p>
                      <p>Riwayat Projek: <strong className="text-purple-400">{pernahP}</strong></p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex gap-3 text-xs font-bold">
                        <button onClick={() => { setEditIndexP(i); setNamaP(namaComp); setJenisP(jenisComp); setUrlP(urlComp); setStatusRek(statusR); setPernahProj(pernahP); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-pink-400">Edit</button>
                        <button onClick={() => handleDelete("Daftar Perusahaan", i, namaComp)} className="text-rose-400">Hapus</button>
                      </div>
                    </div>
                    <button onClick={() => handleOpenEproc(namaComp, urlComp)} className="w-full text-white px-5 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg flex items-center justify-center gap-2">
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
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20 flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full shadow-inner flex items-center justify-center shrink-0" style={pieChartStyle}>
                <div className="w-22 h-22 md:w-26 md:h-26 bg-slate-950 rounded-full flex flex-col items-center justify-center shadow-lg p-2 text-center border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Nilai</span>
                  <span className="text-xs md:text-sm font-black text-white">{formatRupiah(totalNilaiPipeline)}</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 w-full text-xs">
                <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl"><p className="font-bold text-rose-400 uppercase">🔥 Hot Value</p><h3 className="text-sm md:text-base font-black text-rose-200 mt-1">{formatRupiah(hotVal)}</h3></div>
                <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl"><p className="font-bold text-amber-400 uppercase">☀️ Warm Value</p><h3 className="text-sm md:text-base font-black text-amber-200 mt-1">{formatRupiah(warmVal)}</h3></div>
                <div className="bg-blue-950/40 border border-blue-500/30 p-4 rounded-2xl"><p className="font-bold text-blue-400 uppercase">❄️ Cold Value</p><h3 className="text-sm md:text-base font-black text-blue-200 mt-1">{formatRupiah(coldVal)}</h3></div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl"><p className="font-bold text-slate-400 uppercase">❌ Gagal Value</p><h3 className="text-sm md:text-base font-black text-slate-200 mt-1">{formatRupiah(gagalVal)}</h3></div>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20">
              <h2 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 mb-6">➕ Tambah Pipeline</h2>
              <form onSubmit={handleSavePipeline} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Nama Klien:</label>
                    <input type="text" list="daftar-perusahaan" placeholder="Pilih atau ketik klien..." className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl outline-none" value={pipePerusahaan} onChange={e => setPipePerusahaan(e.target.value)} required />
                    <datalist id="daftar-perusahaan">{dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan || p.namaperusahaan} />)}</datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Nama Projek / Pengadaan:</label>
                    <input type="text" placeholder="Contoh: Pengadaan Server" className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl" value={pipeProjek} onChange={e => setPipeProjek(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Estimasi Nilai (Rp)" className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl" value={pipeNilai} onChange={e => setPipeNilai(e.target.value)} />
                  <input type="date" className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl" value={pipeTayang} onChange={e => setPipeTayang(e.target.value)} />
                  <select className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl" value={pipeTahapan} onChange={e => setPipeTahapan(e.target.value)}>
                    <option>1. Eksplorasi</option><option>3. Penawaran</option><option>5. Tender Tayang</option><option>7. Menang</option>
                  </select>
                  <select className="p-4 bg-slate-800 border border-slate-700 text-blue-400 font-bold rounded-2xl" value={pipeStatus} onChange={e => setPipeStatus(e.target.value)}>
                    <option value="Hot">🔥 Hot</option><option value="Warm">☀️ Warm</option><option value="Cold">❄️ Cold</option><option value="Gagal">❌ Gagal</option>
                  </select>
                </div>
                <textarea placeholder="Catatan singkat..." className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl" rows={3} value={pipeCatatan} onChange={e => setPipeCatatan(e.target.value)} />
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 rounded-2xl font-bold shadow-lg">Simpan Pipeline</button>
              </form>
            </div>

            <div className="space-y-5">
              {dataAll.pipeline.map((p: any, i: number) => {
                const pComp = p.NamaPerusahaan || p.namaperusahaan || "";
                const pProjek = p.NamaProjek || p.namaprojek || "";
                const pNilai = p.EstimasiNilaiProjek || p.estimasinilaiprojek || p.EstimasiNilai || p.estimasinilai || "-";
                const pTayang = p.TanggalEstimasiTayangTender || p.tanggalestimasitayangtender || "-";
                const pTahap = p.Tahapan || p.tahapan || "1. Eksplorasi";
                const pStat = p.Status || p.status || "Cold";

                return (
                <div key={i} className="p-6 rounded-[2rem] border border-slate-800 shadow-lg flex flex-col gap-4 bg-slate-900/90">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{pComp}</span>
                      <h3 className="font-extrabold text-lg text-white">{pProjek}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <select id={`tahapan-${i}`} className="bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded-xl font-bold" defaultValue={pTahap}>
                        <option>1. Eksplorasi</option><option>3. Penawaran</option><option>5. Tender Tayang</option><option>7. Menang</option>
                      </select>
                      <select id={`status-${i}`} className="bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded-xl font-bold" defaultValue={pStat}>
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
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                    <div>💰 Nilai: <strong className="text-emerald-400">{pNilai}</strong></div>
                    <div>📅 Tayang: <strong>{pTayang}</strong></div>
                  </div>
                  <div className="flex justify-end gap-3 text-xs font-bold pt-1">
                    <button onClick={() => handleDelete("Pipeline", i, pProjek)} className="text-rose-400">Hapus</button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {tab === "portofolio" && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20">
               <h2 className="font-extrabold text-xl text-white mb-4">➕ Tambah Portofolio Baru</h2>
               <form onSubmit={handleSavePengalaman} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nama Perusahaan Klien" className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl w-full" value={expPerusahaan} onChange={e => setExpPerusahaan(e.target.value)} required />
                    <select className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl w-full" value={expIndustri} onChange={e => setExpIndustri(e.target.value)}>
                      <option>IT Masterplan / EA</option><option>IT Governance</option><option>IT audit / asesment</option><option>IT security</option><option>ISO</option><option>IT Custom Dev</option><option>AI / Machine learning</option><option>Big Data / KMS / PAM</option><option>Hardware</option><option>Lisensi</option>
                    </select>
                  </div>
                  <input type="text" placeholder="Judul / Jenis Pekerjaan" className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl w-full" value={expPekerjaan} onChange={e => setExpPekerjaan(e.target.value)} required />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Tanggal Mulai:</label>
                      <input type="date" className="p-3 bg-slate-800 border border-slate-700 text-white rounded-xl w-full text-xs" value={expTglMulai} onChange={e => setExpTglMulai(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Durasi Pekerjaan:</label>
                      <input type="text" placeholder="Contoh: 3 Bulan" className="p-3 bg-slate-800 border border-slate-700 text-white rounded-xl w-full text-xs" value={expDurasi} onChange={e => setExpDurasi(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Nilai Projek (Rp):</label>
                      <input type="text" placeholder="Contoh: 150000000" className="p-3 bg-slate-800 border border-slate-700 text-white rounded-xl w-full text-xs" value={expNilai} onChange={e => setExpNilai(e.target.value)} />
                    </div>
                  </div>
                  <textarea placeholder="Keterangan & Hashtag (Misal: #ISO #Security)..." className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl w-full text-xs" rows={2} value={expKet} onChange={e => setExpKet(e.target.value)} />
                  <button type="submit" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl font-bold shadow">Simpan Portofolio</button>
               </form>
            </div>

            <div className="bg-pink-950/30 p-6 rounded-[2rem] border border-pink-500/20 space-y-3">
              <h3 className="font-extrabold text-pink-300 text-sm">🔍 Filter & Hashtag Search</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <select className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl" value={filterIndustri} onChange={e => setFilterIndustri(e.target.value)}>
                  <option value="Semua">Semua Kategori</option>
                  <option value="IT Masterplan / EA">IT Masterplan / EA</option><option value="IT Governance">IT Governance</option><option value="IT audit / asesment">IT audit / asesment</option><option value="IT security">IT security</option><option value="ISO">ISO</option><option value="IT Custom Dev">IT Custom Dev</option><option value="AI / Machine learning">AI / Machine learning</option><option value="Big Data / KMS / PAM">Big Data / KMS / PAM</option><option value="Hardware">Hardware</option><option value="Lisensi">Lisensi</option>
                </select>
                <input type="text" placeholder="Cari keyword atau #hashtag..." className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              {filteredPengalaman.map((item:any, i:number)=>{
                const ePekerjaan = item.NamaPekerjaan || item.namapekerjaan || "";
                const ePerusahaan = item.NamaPerusahaan || item.namaperusahaan || "";
                const eJenis = item.JenisIndustri || item.jenisindustri || "";
                const eMulai = item.TanggalMulai || item.tanggalmulai || "-";
                const eDurasi = item.DurasiPekerjaan || item.durasipekerjaan || "-";
                const eNilai = item.NilaiProjek || item.nilaiprojek || "-";
                const eKet = item.Keterangan || item.keterangan || "";

                return (
                <div key={i} className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 shadow flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h4 className="font-black text-white text-base">{ePekerjaan}</h4>
                    <p className="text-xs font-bold text-pink-400 mt-1">{ePerusahaan} • <span className="bg-pink-950 px-2 py-0.5 rounded text-pink-300 border border-pink-500/30">{eJenis}</span></p>
                    <p className="text-xs text-slate-400 mt-2">Mulai: <strong>{eMulai}</strong> | Durasi: <strong>{eDurasi}</strong> | Nilai: <strong className="text-emerald-400">{eNilai}</strong></p>
                    {eKet && <p className="text-xs bg-slate-800/60 p-2.5 rounded-xl mt-2 text-slate-300">💬 {eKet}</p>}
                  </div>
                  <button onClick={() => handleDelete("Pengalaman", i, ePekerjaan)} className="text-xs font-bold text-rose-400 self-start">Hapus</button>
                </div>
              )})}
            </div>
          </div>
        )}

        {tab === "tenagaAhli" && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20">
              <h2 className="font-extrabold text-xl text-white mb-4">{editIndexAhli !== null ? "✏️ Edit Tenaga Ahli" : "👨‍💻 Tambah Database Tenaga Ahli"}</h2>
              <form onSubmit={handleSaveTenagaAhli} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nama Lengkap & Gelar" className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl w-full" value={ahliNama} onChange={e => setAhliNama(e.target.value)} required />
                  <input type="text" placeholder="Posisi Utama" className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl w-full" value={ahliPosisi} onChange={e => setAhliPosisi(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Sertifikasi" className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl w-full" value={ahliSertif} onChange={e => setAhliSertif(e.target.value)} required />
                  <input type="text" placeholder="No Kontak" className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl w-full" value={ahliKontak} onChange={e => setAhliKontak(e.target.value)} />
                </div>
                <textarea placeholder="Ringkasan Pengalaman..." className="p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl w-full" rows={3} value={ahliPengalaman} onChange={e => setAhliPengalaman(e.target.value)} required />
                <button type="submit" className="w-full bg-pink-600 text-white p-4 rounded-2xl font-bold shadow">{editIndexAhli !== null ? "Simpan Perubahan" : "Simpan Tenaga Ahli"}</button>
              </form>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20 space-y-6">
              <div>
                <h3 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-cyan-300">📄 Generator CV Tender AI</h3>
              </div>
              <form onSubmit={handleGenerateCvAi} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" value={selectedAhliForCv} onChange={e => setSelectedAhliForCv(e.target.value)} required>
                    <option value="" className="text-slate-800">-- Pilih Personil --</option>
                    {dataAll.tenagaAhli?.map((a: any, idx: number) => {
                      const aNama = a.Nama || a.nama || "";
                      const aPosisi = a.PosisiUtama || a.posisiutama || "";
                      return <option key={idx} value={aNama} className="text-white">{aNama} ({aPosisi})</option>;
                    })}
                  </select>
                  <input type="text" placeholder="Syarat Tender (opsional)..." className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" value={tenderReqForAhli} onChange={e => setTenderReqForAhli(e.target.value)} />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-2xl font-bold text-xs shadow-lg">{cvLoading ? "🤖 Menyusun CV..." : "✨ Generate CV"}</button>
              </form>
              {cvResult && (
                <div className="bg-slate-800/80 p-6 rounded-2xl text-xs leading-relaxed border border-slate-700">
                   <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3">
                    <strong className="text-pink-300">Hasil CV:</strong>
                    <button onClick={() => navigator.clipboard.writeText(cvResult)} className="bg-slate-700 px-3 py-1.5 rounded-lg">Copy</button>
                  </div>
                  <p className="whitespace-pre-line">{cvResult}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataAll.tenagaAhli?.map((a: any, i: number) => {
                const aNama = a.Nama || a.nama || "";
                const aPosisi = a.PosisiUtama || a.posisiutama || "";
                const aSertif = a.Sertifikasi || a.sertifikasi || "";
                const aPengalaman = a.Pengalaman || a.pengalaman || "";

                return (
                <div key={i} className="bg-slate-900/90 p-6 rounded-[2rem] border border-slate-800 shadow space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-white text-base">{aNama}</h4>
                      <p className="text-xs font-bold text-pink-400">{aPosisi}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditIndexAhli(i); setAhliNama(aNama); setAhliPosisi(aPosisi); setAhliSertif(aSertif); setAhliPengalaman(aPengalaman); setAhliKontak(a.NoKontak || a.nokontak || ""); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-xs font-bold text-pink-400">Edit</button>
                      <button onClick={() => handleDelete("Tenaga Ahli", i, aNama)} className="text-xs font-bold text-rose-400">Hapus</button>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                    <p>🏆 Sertifikasi: <strong className="text-white">{aSertif}</strong></p>
                    <p>💼 Pengalaman: <span className="text-slate-300">{aPengalaman}</span></p>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {tab === "rekanan" && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20">
              <h2 className="font-extrabold text-xl text-white mb-4">➕ Tambah Rekanan</h2>
              <form onSubmit={handleSaveRekanan} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nama Rekanan" className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl" value={rekNama} onChange={e => setRekNama(e.target.value)} required />
                  <input type="text" placeholder="Produk Rekanan" className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl" value={rekProduk} onChange={e => setRekProduk(e.target.value)} />
                </div>
                <div className="bg-pink-950/40 p-4 rounded-2xl border border-pink-500/20">
                  <label className="block text-xs font-bold text-pink-300 mb-2">👥 PIC & No Telp:</label>
                  <input type="text" placeholder="Nama PIC" className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs mb-2" value={rekPic} onChange={e => setRekPic(e.target.value)} required />
                  <input type="text" placeholder="No Telp PIC" className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs" value={rekTelp} onChange={e => setRekTelp(e.target.value)} />
                </div>
                <button type="submit" className="w-full bg-pink-600 text-white p-4 rounded-2xl font-bold shadow">Simpan Rekanan</button>
              </form>
            </div>
            <div className="space-y-4">
              {dataAll.rekanan.map((r: any, i: number) => {
                const rNama = r.NamaRekanan || r.namarekanan || "";
                const rHarga = r.HargaProduk || r.hargaproduk || "-";
                const rPic = r.PIC || r.pic || "";
                const rTelp = r.NoTelp || r.notelp || "-";

                return (
                <div key={i} className="bg-slate-900/90 p-6 rounded-[2rem] border border-slate-800 shadow">
                  <div className="flex justify-between font-bold text-white text-base mb-2">
                    <span>{rNama}</span>
                    <button onClick={() => handleDelete("Rekanan", i, rNama)} className="text-xs text-rose-400">Hapus</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                    <div>💵 Harga: <strong className="text-emerald-400">{rHarga}</strong></div>
                    <div>👥 PIC: <strong className="text-pink-300">{rPic}</strong> ({rTelp})</div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {tab === "rekaman" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-cyan-300">✨ LISA - Voice Assistant (Aktif: {activeUser})</h3>
                  <p className="text-xs text-pink-200 mt-1">Katakan perintah seperti: &quot;Buka e-Proc Telkom&quot;.</p>
                </div>
                <button onClick={createNewChatSession} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition">
                  <span>➕ Buat Sesi Baru</span>
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {chatSessions.map((session) => (
                  <div key={session.id} onClick={() => setCurrentSessionId(session.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition ${session.id === currentSessionId ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'bg-slate-800 text-pink-200 border border-slate-700'}`}>
                    <span>💬 {session.title}</span>
                    <button onClick={(e) => deleteChatSession(session.id, e)} className="text-white/60 hover:text-rose-300 ml-1">✕</button>
                  </div>
                ))}
              </div>

              <div ref={chatContainerRef} className="bg-slate-950/60 backdrop-blur-lg p-5 rounded-2xl border border-slate-800 space-y-4 max-h-[400px] overflow-y-auto">
                {currentActiveSession?.messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-pink-300 mb-1 font-bold">{msg.role === 'user' ? activeUser : 'LISA'}</span>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-line ${msg.role === 'user' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow' : 'bg-slate-800 text-slate-100 border border-slate-700'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && <div className="text-xs text-pink-300 animate-pulse">👩🏻‍🦰 LISA sedang merespon...</div>}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2 items-center">
                <button 
                  type="button" 
                  onClick={startSingleVoiceInput} 
                  title="Klik untuk Bicara"
                  className={`p-4 rounded-2xl text-white font-bold text-sm shadow shrink-0 transition ${voiceActive ? 'bg-rose-600 ring-4 ring-rose-400/50 animate-bounce' : 'bg-pink-600 hover:bg-pink-700'}`}
                >
                  {voiceActive ? "🎙️..." : "🎙️"}
                </button>
                <input type="text" placeholder="Ketik pesan atau perintah (misal: Buka e-Proc Telkom)..." className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white outline-none focus:ring-2 focus:ring-pink-400" value={chatInput} onChange={e => setChatInput(e.target.value)} />
                <button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-4 rounded-2xl font-bold text-xs shadow-lg shrink-0">Kirim</button>
              </form>
            </div>

            <div className="bg-slate-900/90 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20 space-y-6">
              <div>
                <h3 className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-cyan-300">📊 LISA - Dokumen & Proposal Generator</h3>
              </div>
              <form onSubmit={handleAdvancedAI} className="space-y-5">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs">
                    <span className="font-bold block text-pink-300">📁 Unggah PDF KAK/RKS (Opsional):</span>
                  </div>
                  <input type="file" accept="application/pdf" onChange={handleFileUpload} className="text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-pink-600 file:text-white cursor-pointer" />
                </div>
                <textarea rows={3} placeholder="Instruksi tambahan untuk LISA..." className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white outline-none" value={aiQuery} onChange={e => setAiQuery(e.target.value)} />
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 space-y-3">
                  <span className="font-bold block text-cyan-300 text-xs">⚙️ Pilih Kebutuhan:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={optBedahRks} onChange={e => setOptBedahRks(e.target.checked)} className="w-4 h-4 accent-pink-500" /><span>🔍 Bedah RKS Mendalam</span></label>
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={optCekTypo} onChange={e => setOptCekTypo(e.target.checked)} className="w-4 h-4 accent-pink-500" /><span>📝 Cek Typo & Perbaikan Bahasa</span></label>
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={optAnalisaProp} onChange={e => setOptAnalisaProp(e.target.checked)} className="w-4 h-4 accent-pink-500" /><span>⚖️ Analisa Proposal vs KAK</span></label>
                    <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={optPitchDeck} onChange={e => setOptPitchDeck(e.target.checked)} className="w-4 h-4 accent-pink-500" /><span>📊 Buat Pitch Deck / Proposal</span></label>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-2xl font-bold text-sm shadow-lg">Jalankan LISA AI Generator</button>
              </form>
              {aiSearchResult && (
                <div className="mt-6 bg-slate-950 backdrop-blur-lg p-6 rounded-2xl border border-slate-800 text-xs leading-relaxed text-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                    <strong className="text-pink-300">Hasil Output LISA:</strong>
                    <button onClick={() => navigator.clipboard.writeText(aiSearchResult)} className="bg-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold">Copy</button>
                  </div>
                  <p className="whitespace-pre-line">{aiSearchResult}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "catatan" && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-pink-500/20">
              <h2 className="font-extrabold text-xl text-white mb-4">{editIndexCatatan !== null ? "✏️ Edit Catatan" : "📝 Buat Catatan Baru"}</h2>
              <form onSubmit={handleSaveCatatan} className="space-y-4 text-sm">
                <input type="text" placeholder="Topik Catatan" className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl" value={catTopik} onChange={e => setCatTopik(e.target.value)} required />
                <textarea placeholder="Isi catatan..." className="w-full p-4 bg-slate-800 border border-slate-700 text-white rounded-2xl text-xs" rows={3} value={catIsi} onChange={e => setCatIsi(e.target.value)} required />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl font-bold">{editIndexCatatan !== null ? "Simpan Perubahan" : "Simpan Catatan"}</button>
                  {editIndexCatatan !== null && <button type="button" onClick={() => { setEditIndexCatatan(null); setCatTopik(""); setCatIsi(""); }} className="bg-slate-800 px-6 rounded-2xl font-bold text-slate-300">Batal</button>}
                </div>
              </form>
            </div>
            <div className="space-y-3">
              {dataAll.catatan.map((c: any, i: number) => {
                const cTopik = c.Topik || c.topik || "";
                const cTanggal = c.Tanggal || c.tanggal || "";
                const cIsi = c.IsiCatatan || c.isicatatan || "";

                return (
                <div key={i} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow space-y-2">
                  <div className="flex justify-between items-center font-bold text-xs text-pink-400">
                    <span>{cTopik}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{cTanggal}</span>
                      <button onClick={() => { setEditIndexCatatan(i); setCatTopik(cTopik); setCatIsi(cIsi); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-pink-400">Edit</button>
                      <button onClick={() => handleDelete("Catatan", i, cTopik)} className="text-rose-400">Hapus</button>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs">{cIsi}</p>
                </div>
              )})}
            </div>
          </div>
        )}

      </div>

      <nav className="fixed bottom-4 left-3 right-3 bg-slate-900/95 backdrop-blur-2xl border border-pink-500/30 p-2 max-w-3xl mx-auto rounded-full shadow-2xl flex items-center gap-1 overflow-x-auto scrollbar-none z-50">
        {[
          { id: 'dashboard', icon: '🏢', label: 'e-Proc' },
          { id: 'pipeline', icon: '🚀', label: 'Pipeline' },
          { id: 'portofolio', icon: '🏆', label: 'Portofolio' },
          { id: 'tenagaAhli', icon: '👨‍💻', label: 'Ahli' },
          { id: 'rekanan', icon: '🤝', label: 'Rekanan' },
          { id: 'rekaman', icon: '👩🏻‍🦰', label: 'LISA AI' },
          { id: 'catatan', icon: '📝', label: 'Catatan' }
        ].map((menu) => (
          <button key={menu.id} onClick={() => setTab(menu.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold shrink-0 transition ${tab === menu.id ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <span>{menu.icon}</span><span>{menu.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
