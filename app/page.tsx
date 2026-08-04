"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [tab, setTab] = useState("dashboard");
  const [dataAll, setDataAll] = useState<any>({ perusahaan: [], pengalaman: [], pipeline: [], catatan: [] });
  const [loading, setLoading] = useState(false);

  const API_URL = "https://script.google.com/macros/s/AKfycbyvh-_d9WtyupB5Xx1_B_iBRbSHU4RzlHvaWFPiP8MEjcljXyGiFksMgp6rjW18LCNn/exec";
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  // State Form Perusahaan
  const [namaP, setNamaP] = useState("");
  const [jenisP, setJenisP] = useState("Pemerintah");
  const [urlP, setUrlP] = useState("");
  const [statusRek, setStatusRek] = useState("Belum");
  const [pernahProj, setPernahProj] = useState("Belum");

  // State Form Pipeline
  const [pipePerusahaan, setPipePerusahaan] = useState("");
  const [pipeProjek, setPipeProjek] = useState("");
  const [pipeNilai, setPipeNilai] = useState("");
  const [pipeTayang, setPipeTayang] = useState("");
  const [pipeTahapan, setPipeTahapan] = useState("1. Eksplorasi");
  const [pipeLog, setPipeLog] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getAll`);
      const json = await res.json();
      setDataAll(json);
    } catch (e) {
      console.log("Gagal memuat data");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Tambah Perusahaan
  const handleAddPerusahaan = async (e: any) => {
    e.preventDefault();
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ type: "Daftar Perusahaan", nama: namaP, jenis: jenisP, url: urlP, statusRekanan: statusRek, pernahProjek: pernahProj })
    });
    setNamaP(""); setUrlP("");
    fetchData();
  };

  // Tambah Pipeline
  const handleAddPipeline = async (e: any) => {
    e.preventDefault();
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        type: "Pipeline",
        namaPerusahaan: pipePerusahaan,
        namaProjek: pipeProjek,
        estimasiNilai: pipeNilai,
        tanggalTayang: pipeTayang,
        tahapan: pipeTahapan,
        logVisit: pipeLog
      })
    });
    setPipeProjek(""); setPipeNilai(""); setPipeTayang(""); setPipeLog("");
    fetchData();
  };

  // AI Voice Note / Rapikan Log Visit
  const rapikanLogDenganAI = async () => {
    if (!pipeLog) return;
    setAiLoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Rapikan catatan meeting/visit mentah berikut menjadi laporan profesional (hasil kunjungan, hambatan, rencana lanjutan) dalam bahasa Indonesia yang ringkas: "${pipeLog}"` }] }]
        })
      });
      const json = await res.json();
      setPipeLog(json.candidates[0].content.parts[0].text);
    } catch (e) {
      alert("Gagal merapikan dengan AI");
    }
    setAiLoading(false);
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-white pb-28 shadow-xl flex flex-col justify-between">
      <div className="p-6">
        <h1 className="text-xl font-black text-center text-indigo-600 mb-6">Radar e-Proc & Tender Pro</h1>

        {/* TAB 1: DASHBOARD E-PROC */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-slate-100 p-4 rounded-2xl border">
              <h2 className="font-bold text-sm mb-3 text-slate-700">+ Tambah Portal e-Proc</h2>
              <form onSubmit={handleAddPerusahaan} className="space-y-3 text-sm">
                <input type="text" placeholder="Nama Perusahaan / Instansi" className="w-full p-2 border rounded-xl" value={namaP} onChange={e => setNamaP(e.target.value)} required />
                <select className="w-full p-2 border rounded-xl" value={jenisP} onChange={e => setJenisP(e.target.value)}>
                  <option>Pemerintah</option><option>BUMN/BUMD</option><option>Swasta</option>
                </select>
                <input type="url" placeholder="URL e-Proc (https://...)" className="w-full p-2 border rounded-xl" value={urlP} onChange={e => setUrlP(e.target.value)} required />
                <div className="flex gap-2 text-xs">
                  <label>Rekanan: <select value={statusRek} onChange={e => setStatusRek(e.target.value)} className="p-1 border rounded"><option>Belum</option><option>Sudah</option></select></label>
                  <label>Pernah Projek: <select value={pernahProj} onChange={e => setPernahProj(e.target.value)} className="p-1 border rounded"><option>Belum</option><option>Pernah</option></select></label>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-xl font-bold">Simpan Perusahaan</button>
              </form>
            </div>

            <div>
              <h2 className="font-bold text-slate-700 mb-3">Daftar Portal ({dataAll.perusahaan.length})</h2>
              <div className="space-y-2">
                {dataAll.perusahaan.map((item: any, i: number) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border flex justify-between items-center text-sm shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800">{item.NamaPerusahaan}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.Jenis} • Rekanan: {item.StatusRekanan}</p>
                    </div>
                    <a href={item.URL} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs">Buka</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PIPELINE */}
        {tab === "pipeline" && (
          <div className="space-y-6">
            <div className="bg-slate-100 p-4 rounded-2xl border">
              <h2 className="font-bold text-sm mb-3 text-slate-700">+ Tambah Peluang / Pipeline</h2>
              <form onSubmit={handleAddPipeline} className="space-y-3 text-sm">
                <select className="w-full p-2 border rounded-xl" value={pipePerusahaan} onChange={e => setPipePerusahaan(e.target.value)} required>
                  <option value="">-- Pilih Perusahaan --</option>
                  {dataAll.perusahaan.map((p: any, i: number) => <option key={i} value={p.NamaPerusahaan}>{p.NamaPerusahaan}</option>)}
                </select>
                <input type="text" placeholder="Nama Projek" className="w-full p-2 border rounded-xl" value={pipeProjek} onChange={e => setPipeProjek(e.target.value)} required />
                <input type="text" placeholder="Estimasi Nilai (Rp)" className="w-full p-2 border rounded-xl" value={pipeNilai} onChange={e => setPipeNilai(e.target.value)} />
                <input type="date" placeholder="Estimasi Tayang Tender" className="w-full p-2 border rounded-xl" value={pipeTayang} onChange={e => setPipeTayang(e.target.value)} />
                <select className="w-full p-2 border rounded-xl" value={pipeTahapan} onChange={e => setPipeTahapan(e.target.value)}>
                  <option>1. Eksplorasi</option><option>2. Pendekatan</option><option>3. Penawaran</option><option>4. Menunggu Tender</option><option>5. Tender Tayang</option><option>6. Negosiasi</option><option>7. Menang</option><option>8. Kalah</option>
                </select>
                <div>
                  <textarea placeholder="Log Aktivitas / Hasil Visit (Bisa ketik atau rekam suara via keyboard HP)" className="w-full p-2 border rounded-xl text-xs" rows={3} value={pipeLog} onChange={e => setPipeLog(e.target.value)} />
                  <button type="button" onClick={rapikanLogDenganAI} className="mt-1 bg-violet-600 text-white px-3 py-1 rounded-lg text-xs font-bold">{aiLoading ? "Merapikan..." : "✨ Rapikan dengan AI"}</button>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-xl font-bold">Simpan Pipeline</button>
              </form>
            </div>

            <div>
              <h2 className="font-bold text-slate-700 mb-3">Daftar Pipeline ({dataAll.pipeline.length})</h2>
              <div className="space-y-3">
                {dataAll.pipeline.map((p: any, i: number) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border shadow-sm text-sm space-y-1">
                    <div className="flex justify-between font-bold text-indigo-900">
                      <span>{p.NamaProjek}</span>
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{p.Tahapan}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{p.NamaPerusahaan}</p>
                    <p className="text-xs text-slate-600">💰 {p.EstimasiNilaiProjek || "Belum ada nilai"}</p>
                    {p.LogAktivitasVisit && <p className="text-xs bg-slate-50 p-2 rounded-xl text-slate-700 mt-2">📝 {p.LogAktivitasVisit}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PENGALAMAN */}
        {tab === "pengalaman" && (
          <div>
            <h2 className="font-bold text-slate-700 mb-3">Portofolio & Rekam Jejak ({dataAll.pengalaman.length})</h2>
            <div className="space-y-3">
              {dataAll.pengalaman.map((item: any, i: number) => (
                <div key={i} className="bg-white p-4 rounded-2xl border shadow-sm text-sm space-y-1">
                  <p className="font-bold text-slate-800">{item.NamaPekerjaan}</p>
                  <p className="text-xs text-indigo-600 font-semibold">{item.NamaPerusahaan} • {item.JenisIndustri}</p>
                  <p className="text-xs text-slate-500">Nilai: {item.NilaiProjek} ({item.TahunPelaksanaan})</p>
                </div>
              ))}
              {dataAll.pengalaman.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada data pengalaman (akan terisi otomatis jika pipeline berstatus Menang).</p>}
            </div>
          </div>
        )}

        {/* TAB 4: CATATAN */}
        {tab === "catatan" && (
          <div>
            <h2 className="font-bold text-slate-700 mb-3">Catatan Bebas & Strategi</h2>
            <div className="space-y-3">
              {dataAll.catatan.map((c: any, i: number) => (
                <div key={i} className="bg-white p-4 rounded-2xl border shadow-sm text-sm">
                  <div className="flex justify-between font-bold text-xs text-slate-400 mb-1">
                    <span>{c.Topik}</span>
                    <span>{c.Tanggal}</span>
                  </div>
                  <p className="text-slate-800">{c.IsiCatatan}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t p-3 flex justify-around shadow-lg text-xs font-bold">
        <button onClick={() => setTab("dashboard")} className={tab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}>🏢 e-Proc</button>
        <button onClick={() => setTab("pipeline")} className={tab === 'pipeline' ? 'text-indigo-600' : 'text-slate-400'}>🚀 Pipeline</button>
        <button onClick={() => setTab("pengalaman")} className={tab === 'pengalaman' ? 'text-indigo-600' : 'text-slate-400'}>🏆 Pengalaman</button>
        <button onClick={() => setTab("catatan")} className={tab === 'catatan' ? 'text-indigo-600' : 'text-slate-400'}>📝 Catatan</button>
      </div>
    </main>
  );
}
