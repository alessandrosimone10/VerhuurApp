// pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Package, Users, FileText, Plus, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [verhuur, setVerhuur] = useState([]);
  const [rackets, setRackets] = useState([]);
  const [klanten, setKlanten] = useState([]);
  const [facturen, setFacturen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
  setLoading(true);
  setError(null);

  try {
    const [verhuurRes, racketsRes, klantenRes, facturenRes] = await Promise.all([
      supabase
        .from("verhuur")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),

      supabase
        .from("racket")
        .select("*"),

      supabase
        .from("klant")
        .select("*"),

      supabase
        .from("factuur")
        .select("*")
    ]);

    if (verhuurRes.error) throw verhuurRes.error;
    if (racketsRes.error) throw racketsRes.error;
    if (klantenRes.error) throw klantenRes.error;
    if (facturenRes.error) throw facturenRes.error;

    setVerhuur(verhuurRes.data || []);
    setRackets(racketsRes.data || []);
    setKlanten(klantenRes.data || []);
    setFacturen(facturenRes.data || []);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { load(); }, []);

  const now = new Date();
  const actief = verhuur.filter(v => !v.afgewerkt);
  const verlopen = actief.filter(v => v.retourdatum && new Date(v.retourdatum) < now);
  const beschikbaar = rackets.filter(r => r.status === "Beschikbaar");
  const openFacturen = facturen.filter(f => f.status === "Openstaand");

  const stats = [
    { label: "Actieve Verhuringen", value: actief.length, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Verlopen", value: verlopen.length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Rackets Beschikbaar", value: beschikbaar.length, icon: Package, color: "text-green-600", bg: "bg-green-50" },
    { label: "Klanten", value: klanten.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Open Facturen", value: openFacturen.length, icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
  ];

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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎾 Verhuurbeheer</h1>
            <p className="text-gray-500 text-sm mt-1">Racketverhuur Dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="w-4 h-4 mr-1" /> Vernieuwen
            </Button>
            <Link to={createPageUrl("NieuweVerhuur")}>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-1" /> Nieuwe Verhuur
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{loading ? "–" : s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verlopen verhuringen */}
        {verlopen.length > 0 && (
          <Card className="border border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-700 flex items-center gap-2 text-base">
                <AlertTriangle className="w-4 h-4" /> {verlopen.length} Verlopen Verhuringen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {verlopen.slice(0, 5).map(v => {
                  const dagen = Math.floor((now - new Date(v.retourdatum)) / 86400000);
                  return (
                    <div key={v.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm">
                      <div>
                        <span className="font-medium text-sm">{v.voornaam} {v.naam}</span>
                        <span className="text-gray-400 text-xs ml-2">{v.racket} ({v.racketcode})</span>
                      </div>
                      <Badge variant="destructive">{dagen}d te laat</Badge>
                    </div>
                  );
                })}
              </div>
              <Link to={createPageUrl("Verhuringen")}>
                <Button variant="link" className="text-red-700 p-0 mt-2 text-sm">Bekijk alle →</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recente verhuringen */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recente Verhuringen</CardTitle>
            <Link to={createPageUrl("Verhuringen")}>
              <Button variant="ghost" size="sm" className="text-xs">Alles tonen →</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-400 text-sm">Laden...</div>
            ) : verhuur.length === 0 ? (
              <div className="text-gray-400 text-sm">Nog geen verhuringen.</div>
            ) : (
              <div className="divide-y">
                {verhuur.slice(0, 8).map(v => (
                  <div key={v.id} className="flex items-center justify-between py-2">
                    <div>
                      <span className="font-medium text-sm text-gray-800">{v.voornaam} {v.naam}</span>
                      <span className="text-gray-400 text-xs ml-2">{v.racket}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {v.afgewerkt
                        ? <Badge className="bg-gray-100 text-gray-600 border-0">Afgewerkt</Badge>
                        : new Date(v.retourdatum) < now
                          ? <Badge variant="destructive">Verlopen</Badge>
                          : <Badge className="bg-green-100 text-green-700 border-0">Actief</Badge>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Racket overzicht */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Racket Status</CardTitle>
            <Link to={createPageUrl("Rackets")}>
              <Button variant="ghost" size="sm" className="text-xs">Beheer →</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-gray-400 text-sm">Laden...</div> : (
              <div className="flex flex-wrap gap-2">
                {rackets.map(r => (
                  <div key={r.id} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${r.status === "Beschikbaar" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {r.code} · {r.naam}
                  </div>
                ))}
                {rackets.length === 0 && <span className="text-gray-400 text-sm">Geen rackets gevonden.</span>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}