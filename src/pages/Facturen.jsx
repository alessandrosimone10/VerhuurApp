// pages/Facturen.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";

export default function Facturen() {
  const [facturen, setFacturen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await base44.entities.Factuur.list("-created_date", 500);
      setFacturen(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (f) => {
    try {
      const newStatus = f.status === "Openstaand" ? "Betaald" : "Openstaand";
      await base44.entities.Factuur.update(f.id, { status: newStatus });
      await load(); // herlaad na update
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = facturen.filter(f => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.factuurnr?.toLowerCase().includes(q) || f.klantnr?.toLowerCase().includes(q) || f.verhuurnr?.toLowerCase().includes(q);
  });

  const totalOpen = facturen.filter(f => f.status === "Openstaand").reduce((s, f) => s + (f.bedrag || 0), 0);
  const totalBetaald = facturen.filter(f => f.status === "Betaald").reduce((s, f) => s + (f.bedrag || 0), 0);

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
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Facturen</h1>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Vernieuwen</Button>
        </div>

        {/* Totalen */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm bg-orange-50">
            <CardContent className="p-4">
              <div className="text-xs text-orange-600 font-medium uppercase tracking-wide">Openstaand</div>
              <div className="text-2xl font-bold text-orange-700 mt-1">€{totalOpen.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4">
              <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Betaald</div>
              <div className="text-2xl font-bold text-green-700 mt-1">€{totalBetaald.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Zoek */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="Zoek op factuurnr, klantnr, verhuurnr..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? <div className="p-8 text-center text-gray-400">Laden...</div> : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Geen facturen gevonden.</div>
            ) : (
              <div className="divide-y">
                {filtered.map(f => (
                  <div key={f.id} className="px-4 py-3 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">{f.factuurnr || "–"}</span>
                        <Badge className={f.status === "Betaald" ? "bg-green-100 text-green-700 border-0" : "bg-orange-100 text-orange-700 border-0"}>
                          {f.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-3">
                        {f.verhuurnr && <span>Verhuur: {f.verhuurnr}</span>}
                        {f.klantnr && <span>Klant: {f.klantnr}</span>}
                        {f.datum && <span>{format(new Date(f.datum), "dd-MM-yyyy")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-gray-800">€{(f.bedrag || 0).toFixed(2)}</span>
                      <Button size="sm" variant="outline" onClick={() => toggleStatus(f)} className={f.status === "Openstaand" ? "text-green-700 border-green-300" : "text-orange-700 border-orange-300"}>
                        {f.status === "Openstaand" ? "Markeer Betaald" : "Zet Open"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <p className="text-xs text-gray-400 text-right">{filtered.length} facturen</p>
      </div>
    </div>
  );
}