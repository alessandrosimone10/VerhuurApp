import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

export default function Rackets() {
  const [rackets, setRackets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", name: "", type: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('rackets').select('*').order('code');
    if (error) setError(error.message);
    else setRackets(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) return;
    setSaving(true);
    
    // Check op dubbele code
    if (rackets.some(r => r.code.toLowerCase() === form.code.toLowerCase())) {
      setError(`Code "${form.code}" bestaat al.`);
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('rackets').insert([{ ...form, status: "Beschikbaar" }]);
    if (error) setError(error.message);
    else {
      setForm({ code: "", name: "", type: "" });
      load();
    }
    setSaving(false);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Beschikbaar" ? "Verhuurd" : "Beschikbaar";
    await supabase.from('rackets').update({ status: newStatus }).eq('id', id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit racket wilt verwijderen?")) return;
    await supabase.from('rackets').delete().eq('id', id);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Rackets</h1>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Vernieuwen</Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nieuw Racket</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
              <div><Label>Code</Label><Input placeholder="R1" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-24" /></div>
              <div className="flex-1"><Label>Naam</Label><Input placeholder="PR Power" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>Type</Label><Input placeholder="Carbon" value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-32" /></div>
              <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-1" /> Toevoegen
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? <div className="p-8 text-center text-gray-400"><Loader2 className="animate-spin mx-auto" /></div> :
            rackets.length === 0 ? <div className="p-8 text-center text-gray-400">Geen rackets gevonden.</div> : (
              <div className="divide-y">
                {rackets.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">
                    <div>
                      <span className="font-bold text-gray-800">{r.code}</span>
                      <span className="text-gray-600 ml-3">{r.name}</span>
                      {r.type && <span className="text-gray-400 text-xs ml-2 italic">{r.type}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        onClick={() => toggleStatus(r.id, r.status)}
                        className={`cursor-pointer border-0 ${r.status === "Beschikbaar" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {r.status}
                      </Badge>
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