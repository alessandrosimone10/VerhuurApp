// pages/Verhuringen.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Search, RefreshCw, Trash2, Download, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default function Verhuringen() {
  const [verhuur, setVerhuur] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("alle"); // "alle" | "actief" | "verlopen" | "afgewerkt"

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await base44.entities.Verhuur.list("-created_date", 500);
      setVerhuur(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const now = new Date();

  const handleDelete = async (v) => {
    if (!confirm(`Verhuur #${v.verhuurnr} van ${v.voornaam} ${v.naam} verwijderen?`)) return;
    try {
      await base44.entities.Verhuur.delete(v.id);
      if (!v.afgewerkt) {
        const rackets = await base44.entities.Racket.filter({ code: v.racketcode });
        if (rackets.length > 0) {
          await base44.entities.Racket.update(rackets[0].id, { status: "Beschikbaar" });
        }
      }
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReturn = async (v) => {
    try {
      const nuDatum = new Date().toISOString();
      await base44.entities.Verhuur.update(v.id, { afgewerkt: true, status: "Afgewerkt", retourdatum: nuDatum });
      const rackets = await base44.entities.Racket.filter({ code: v.racketcode });
      if (rackets.length > 0) {
        await base44.entities.Racket.update(rackets[0].id, { status: "Beschikbaar" });
      }
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatus = (v) => {
    if (v.afgewerkt) return "afgewerkt";
    if (v.retourdatum && new Date(v.retourdatum) < now) return "verlopen";
    return "actief";
  };

  const filtered = verhuur.filter(v => {
    const s = getStatus(v);
    if (filter !== "alle" && s !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.voornaam?.toLowerCase().includes(q) ||
        v.naam?.toLowerCase().includes(q) ||
        v.racket?.toLowerCase().includes(q) ||
        v.racketcode?.toLowerCase().includes(q) ||
        v.klantnr?.toLowerCase().includes(q) ||
        v.verhuurnr?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusBadge = (v) => {
    const s = getStatus(v);
    if (s === "afgewerkt") return <Badge className="bg-gray-100 text-gray-600 border-0">Afgewerkt</Badge>;
    if (s === "verlopen") return <Badge variant="destructive">Verlopen</Badge>;
    return <Badge className="bg-green-100 text-green-700 border-0">Actief</Badge>;
  };

  const exportCSV = () => {
    const headers = ["Verhuurnr","Klantnr","Voornaam","Naam","Email","Telefoon","Racket","Racketcode","Huurdatum","Retourdatum","Status","Bedrag","Factuurnr"];
    const rows = filtered.map(v => [
      v.verhuurnr, v.klantnr, v.voornaam, v.naam, v.email, v.telefoon,
      v.racket, v.racketcode,
      v.huurdatum ? format(new Date(v.huurdatum), "dd/MM/yyyy") : "",
      v.retourdatum ? format(new Date(v.retourdatum), "dd/MM/yyyy") : "",
      getStatus(v), "", v.factuurnr
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ""}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `verhuringen_${format(new Date(), "yyyyMM")}.csv`;
    a.click();
  };

  const fmtDate = (d) => {
    if (!d) return "–";
    try { return format(new Date(d), "dd-MM-yyyy HH:mm"); } catch { return d; }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <AlertCircle className="inline mr-2" /> {error}
          <Button variant="outline" onClick={load} className="ml-4">Opnieuw proberen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Verhuringen</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />Export CSV</Button>
            <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Vernieuwen</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9" placeholder="Zoek op naam, racket, klantnr..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {["alle","actief","verlopen","afgewerkt"].map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)} className="capitalize">
              {f}
            </Button>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Laden...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Geen verhuringen gevonden.</div>
            ) : (
              <div className="divide-y">
                {filtered.map(v => {
                  const s = getStatus(v);
                  const dagen = s === "verlopen" ? Math.floor((now - new Date(v.retourdatum)) / 86400000) : null;
                  return (
                    <div key={v.id} className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${s === "verlopen" ? "bg-red-50" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-800">{v.voornaam} {v.naam}</span>
                          {statusBadge(v)}
                          {dagen !== null && <span className="text-xs text-red-600 font-medium">({dagen}d te laat)</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-3">
                          <span>🎾 {v.racket} ({v.racketcode})</span>
                          {v.klantnr && <span>👤 {v.klantnr}</span>}
                          {v.verhuurnr && <span>#{v.verhuurnr}</span>}
                          <span>Ophalen: {fmtDate(v.huurdatum)}</span>
                          <span>Retour: {fmtDate(v.retourdatum)}</span>
                          {v.teamplayer && <span>TP: {v.teamplayer}</span>}
                        </div>
                        {v.notitie && <div className="text-xs text-gray-400 mt-0.5 italic">"{v.notitie}"</div>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!v.afgewerkt && (
                          <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => handleReturn(v)}>
                            <CheckCircle className="w-4 h-4 mr-1" />Retour
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(v)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <p className="text-xs text-gray-400 text-right">{filtered.length} resultaten</p>
      </div>
    </div>
  );
}