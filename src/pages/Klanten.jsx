import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, RefreshCw, Search, ChevronDown, ChevronUp, History, Loader2 } from "lucide-react";

export default function Klanten() {
  const [klanten, setKlanten] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    // Haal klanten op + hun rentals gesorteerd op nieuwste datum
    const { data, error } = await supabase
      .from('customers')
      .select('*, rentals(*, rackets(name))')
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setKlanten(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Klant verwijderen?")) return;
    await supabase.from('customers').delete().eq('id', id);
    load();
  };

  const filtered = klanten.filter(k => {
    const q = search.toLowerCase();
    return (
      k.first_name?.toLowerCase().includes(q) ||
      k.last_name?.toLowerCase().includes(q) ||
      k.email?.toLowerCase().includes(q) ||
      k.customer_nr?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Klanten</h1>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Vernieuwen</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9 bg-white" placeholder="Zoek op naam, email, klantnr..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-gray-300" /></div> :
            filtered.length === 0 ? <div className="p-12 text-center text-gray-400">Geen klanten gevonden.</div> : (
              <div className="divide-y">
                {filtered.map(k => {
                  const isOpen = expanded === k.id;
                  const hist = k.rentals || [];
                  return (
                    <div key={k.id}>
                      <div className="px-4 py-4 flex items-center justify-between gap-2 hover:bg-gray-50/50 transition">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-800">{k.first_name} {k.last_name}</span>
                            {k.customer_nr && <span className="text-xs text-gray-400">#{k.customer_nr}</span>}
                            <Badge className={`border-0 ${k.status === "Actief" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{k.status}</Badge>
                            {hist.length > 0 && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
                                <History size={12} /> {hist.length} verhuringen
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex gap-4">
                            <span>{k.email}</span>
                            <span>{k.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setExpanded(isOpen ? null : k.id)}>
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </Button>
                          <Button size="icon" variant="ghost" className="hover:text-red-500" onClick={() => handleDelete(k.id)}>
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-2">Verhuurhistorie</div>
                          <div className="space-y-2">
                            {hist.length === 0 ? <p className="text-xs text-gray-400 italic">Nog geen verhuringen.</p> : 
                            hist.map((v: any) => (
                              <div key={v.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">🎾 {v.rackets?.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] text-gray-400">{new Date(v.rental_date).toLocaleDateString("nl-BE")}</span>
                                  <Badge className={`text-[10px] border-0 ${v.is_finished ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                                    {v.is_finished ? "Afgewerkt" : "Actief"}
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
      </div>
    </div>
  );
}