// pages/Rackets.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";

export default function Rackets() {
  const [rackets, setRackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ code: "", naam: "", type: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await base44.entities.Racket.list();
      setRackets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.code || !form.naam) return;
    setSaving(true);
    setError(null);
    try {
      await base44.entities.Racket.create({ ...form, status: "Beschikbaar" });
      setForm({ code: "", naam: "", type: "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Weet je zeker dat je dit racket wilt verwijderen?")) return;
    try {
      await base44.entities.Racket.delete(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleStatus = async (r) => {
    try {
      await base44.entities.Racket.update(r.id, { status: r.status === "Beschikbaar" ? "Verhuurd" : "Beschikbaar" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <AlertCircle className="inline mr-2" /> {error}
          <Button variant="outline" onClick={load} className="ml-4">Opnieuw proberen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Rackets</h1>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Vernieuwen</Button>
        </div>

        {/* Toevoegen */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Racket Toevoegen</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
              <div><Label>Code</Label><Input placeholder="R1" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-24" /></div>
              <div><Label>Naam</Label><Input placeholder="PR Power" value={form.naam} onChange={e => setForm({...form, naam: e.target.value})} className="w-40" /></div>
              <div><Label>Type</Label><Input placeholder="Carbon" value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-32" /></div>
              <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-1" />Toevoegen
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lijst */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {loading ? <div className="p-6 text-gray-400">Laden...</div> : rackets.length === 0 ? (
              <div className="p-6 text-gray-400">Geen rackets gevonden.</div>
            ) : (
              <div className="divide-y">
                {rackets.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <span className="font-semibold text-gray-800">{r.code}</span>
                      <span className="text-gray-600 ml-2">{r.naam}</span>
                      {r.type && <span className="text-gray-400 text-xs ml-2">{r.type}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStatus(r)} className="focus:outline-none">
                        <Badge className={r.status === "Beschikbaar" ? "bg-green-100 text-green-700 border-0 cursor-pointer" : "bg-red-100 text-red-700 border-0 cursor-pointer"}>
                          {r.status}
                        </Badge>
                      </button>
                      <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-500" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}