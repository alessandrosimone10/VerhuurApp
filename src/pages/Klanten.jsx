// pages/Klanten.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, RefreshCw, Search, ChevronDown, ChevronUp, History } from "lucide-react";

export default function Klanten() {
  const [klanten, setKlanten] = useState([]);
  const [verhuur, setVerhuur] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, v] = await Promise.all([
        base44.entities.Klant.list("-created_date", 500),
        base44.entities.Verhuur.list("-created_date", 1000),
      ]);
      setKlanten(k);
      setVerhuur(v);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Weet je zeker dat je deze klant wilt verwijderen?")) return;
    try {
      await base44.entities.Klant.delete(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const getHistory = (k) =>
    verhuur.filter(v =>
      (k.klantnr && v.klantnr === k.klantnr) ||
      (k.email && v.email === k.email)
    );

  const getHuurdeRackets = (k) => {
    const hist = getHistory(k);
    const codes = [...new Set(hist.map(v => v.racketcode).filter(Boolean))];
    return codes;
  };

  const filtered = klanten.filter(k => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      k.voornaam?.toLowerCase().includes(q) ||
      k.naam?.toLowerCase().includes(q) ||
      k.email?.toLowerCase().includes(q) ||
      k.klantnr?.toLowerCase().includes(q)
    );
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Fout bij laden: {error}
          <Button variant="outline" onClick={load} className="ml-4">Opnieuw proberen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Klanten</h1>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Vernieuwen</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="Zoek op naam, email, klantnr..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? <div className="p-8 text-center text-gray-400">Laden...</div> :
            filtered.length === 0 ? <div className="p-8 text-center text-gray-400">Geen klanten gevonden.</div> : (
              <div className="divide-y">
                {filtered.map(k => {
                  const hist = getHistory(k);
                  const huurdeRackets = getHuurdeRackets(k);
                  const isOpen = expanded === k.id;
                  return (
                    <div key={k.id}>
                      <div className="px-4 py-3 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800">{k.voornaam} {k.naam}</span>
                            {k.klantnr && <span className="text-xs text-gray-400">#{k.klantnr}</span>}
                            <Badge className={k.status === "Actief" ? "bg-green-100 text-green-700 border-0" : "bg-gray-100 text-gray-500 border-0"}>{k.status}</Badge>
                            {hist.length > 0 && (
                              <Badge className="bg-blue-50 text-blue-700 border-0 flex items-center gap-1">
                                <History className="w-3 h-3" />{hist.length} verhuring{hist.length !== 1 ? "en" : ""}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-3">
                            {k.email && <span>{k.email}</span>}
                            {k.telefoon && <span>{k.telefoon}</span>}
                            {huurdeRackets.length > 0 && (
                              <span className="text-amber-600 font-medium">🎾 Eerder gehuurd: {huurdeRackets.join(", ")}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hist.length > 0 && (
                            <Button size="sm" variant="ghost" onClick={() => setExpanded(isOpen ? null : k.id)}>
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-500" onClick={() => handleDelete(k.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="px-4 pb-3 bg-gray-50">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Verhuurhistorie</div>
                          <div className="space-y-1.5">
                            {hist.map(v => (
                              <div key={v.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm shadow-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-700">🎾 {v.racket}</span>
                                  <span className="text-gray-400 text-xs">({v.racketcode})</span>
                                  {v.verhuurnr && <span className="text-gray-400 text-xs">#{v.verhuurnr}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-xs">
                                    {v.huurdatum ? new Date(v.huurdatum).toLocaleDateString("nl-BE") : "–"}
                                  </span>
                                  <Badge className={v.afgewerkt ? "bg-gray-100 text-gray-500 border-0 text-xs" : "bg-green-100 text-green-700 border-0 text-xs"}>
                                    {v.afgewerkt ? "Afgewerkt" : "Actief"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <p className="text-xs text-gray-400 text-right">{filtered.length} klanten</p>
      </div>
    </div>
  );
}