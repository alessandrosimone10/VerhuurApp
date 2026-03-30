import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ArrowLeft, Loader2, History } from "lucide-react";
import FactuurPrint from "@/components/FactuurPrint";

export default function NieuweVerhuur() {
  const navigate = useNavigate();
  const [rackets, setRackets] = useState<any[]>([]);
  const [dagprijs, setDagprijs] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    voornaam: "", naam: "", email: "", klantnr: "", telefoon: "",
    teamplayer: "", opmerking: "", huurDagen: 3
  });
  
  const [selectedRackets, setSelectedRackets] = useState<any[]>([]);
  const [huurHistorie, setHuurHistorie] = useState<any[]>([]);
  const [factuurData, setFactuurData] = useState<any>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const [racksRes, settingsRes] = await Promise.all([
          supabase.from('rackets').select('*').eq('status', 'Beschikbaar'),
          supabase.from('settings').select('value').eq('key', 'dagprijs').single()
        ]);
        
        if (racksRes.data) setRackets(racksRes.data);
        if (settingsRes.data) setDagprijs(parseFloat(settingsRes.data.value));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const zoekKlant = async (val: string) => {
    if (!val) return;
    const { data } = await supabase
      .from('customers')
      .select('*, rentals(*)')
      .or(`customer_nr.eq.${val},email.eq.${val}`)
      .maybeSingle();

    if (data) {
      setForm(f => ({
        ...f,
        voornaam: data.first_name || "",
        naam: data.last_name || "",
        email: data.email || "",
        telefoon: data.phone || "",
        klantnr: data.customer_nr || val
      }));
      setHuurHistorie(data.rentals || []);
    }
  };

  const toggleRacket = (r: any) => {
    const isSel = selectedRackets.find(s => s.id === r.id);
    if (isSel) setSelectedRackets(selectedRackets.filter(s => s.id !== r.id));
    else if (selectedRackets.length < 2) setSelectedRackets([...selectedRackets, r]);
  };

  const calcBedrag = () => (dagprijs || 0) * selectedRackets.length * Number(form.huurDagen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRackets.length === 0) return setError("Kies een racket.");
    setSaving(true);

    try {
      // 1. Klant Upsert (Zoeken op email of klantnr)
      const { data: klant, error: kErr } = await supabase
        .from('customers')
        .upsert({
          customer_nr: form.klantnr,
          first_name: form.voornaam,
          last_name: form.naam,
          email: form.email,
          phone: form.telefoon,
          status: "Actief"
        }, { onConflict: 'email' })
        .select()
        .single();

      if (kErr) throw kErr;

      const verhuurnr = `VR${Date.now().toString().slice(-6)}`;
      const factuurnr = `FA${Date.now().toString().slice(-6)}`;
      const bedrag = calcBedrag();

      // 2. Verhuringen aanmaken & Rackets updaten
      for (const r of selectedRackets) {
        await supabase.from('rentals').insert({
          customer_id: klant.id,
          racket_id: r.id,
          rental_date: new Date().toISOString(),
          is_finished: false,
          notes: form.opmerking
        });
        await supabase.from('rackets').update({ status: 'Verhuurd' }).eq('id', r.id);
      }

      // 3. Factuur aanmaken
      if (bedrag > 0) {
        await supabase.from('invoices').insert({
          invoice_nr: factuurnr,
          customer_id: klant.id,
          amount: bedrag,
          status: 'Openstaand'
        });
      }

      setFactuurData({
        factuurnr,
        voornaam: form.voornaam,
        naam: form.naam,
        bedrag,
        regels: selectedRackets.map(r => ({ name: r.name, code: r.code }))
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  if (factuurData) return <FactuurPrint factuur={factuurData} onSave={() => navigate("/verhuringen")} />;

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
          <h1 className="text-2xl font-bold">Nieuwe Verhuur</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm font-bold uppercase text-gray-500">Klant</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Klantnr of Email (Snelle zoek)</Label>
                <Input onBlur={(e) => zoekKlant(e.target.value)} placeholder="Typ en klik buiten vak..." />
              </div>
              <Input placeholder="Voornaam" value={form.voornaam} onChange={e => setForm({...form, voornaam: e.target.value})} />
              <Input placeholder="Naam" value={form.naam} onChange={e => setForm({...form, naam: e.target.value})} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <Input placeholder="Telefoon" value={form.telefoon} onChange={e => setForm({...form, telefoon: e.target.value})} />
            </CardContent>
          </Card>

          {huurHistorie.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex gap-3">
              <History className="shrink-0" />
              <div>
                <p className="font-bold">Let op: Deze klant huurde al {huurHistorie.length} keer eerder.</p>
              </div>
            </div>
          )}

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm font-bold uppercase text-gray-500">Rackets (Max 2)</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {rackets.map(r => (
                <Button
                  key={r.id}
                  type="button"
                  variant={selectedRackets.find(s => s.id === r.id) ? "default" : "outline"}
                  onClick={() => toggleRacket(r)}
                  className="rounded-full"
                >
                  {r.code} - {r.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
             <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Aantal dagen</Label>
                  <Input type="number" value={form.huurDagen} onChange={e => setForm({...form, huurDagen: Number(e.target.value)})} className="w-24" />
                </div>
                <div className="p-4 bg-gray-100 rounded-lg flex justify-between items-center">
                  <span className="font-bold">Totaal bedrag:</span>
                  <span className="text-xl font-black">€{calcBedrag().toFixed(2)}</span>
                </div>
             </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full h-12 bg-green-600 hover:bg-green-700">
            {saving ? "Bezig met opslaan..." : "Verhuur Bevestigen"}
          </Button>
        </form>
      </div>
    </div>
  );
}