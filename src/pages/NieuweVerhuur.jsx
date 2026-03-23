// pages/NieuweVerhuur.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import FactuurPrint from "@/components/FactuurPrint";

export default function NieuweVerhuur() {
  const navigate = useNavigate();
  const [rackets, setRackets] = useState([]);
  const [dagprijs, setDagprijs] = useState(null);
  const [form, setForm] = useState({
    voornaam: "", naam: "", email: "", klantnr: "", telefoon: "",
    teamplayer: "", opmerking: "", huurDagen: 3
  });
  const [selectedRackets, setSelectedRackets] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [huurHistorie, setHuurHistorie] = useState([]);
  const [factuurData, setFactuurData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [racks, inst] = await Promise.all([
          base44.entities.Racket.filter({ status: "Beschikbaar" }),
          base44.entities.Instelling.filter({ sleutel: "dagprijs" }),
        ]);
        setRackets(racks);
        if (inst.length > 0 && inst[0].waarde && parseFloat(inst[0].waarde) > 0) {
          setDagprijs(parseFloat(inst[0].waarde));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const checkKlantHistorie = async (klantnr, email) => {
    if (!klantnr && !email) {
      setHuurHistorie([]);
      return;
    }
    try {
      const all = await base44.entities.Verhuur.list("-created_date", 500);
      const hist = all.filter(v =>
        (klantnr && v.klantnr === klantnr) ||
        (email && v.email === email)
      );
      setHuurHistorie(hist);
    } catch (err) {
      console.error("Fout bij ophalen historie:", err);
    }
  };

  const zoekKlantOpNummer = async (klantnr) => {
    if (!klantnr) return;
    try {
      const klanten = await base44.entities.Klant.filter({ klantnr });
      if (klanten.length > 0) {
        const k = klanten[0];
        setForm(f => ({ ...f, voornaam: k.voornaam, naam: k.naam, email: k.email || "", telefoon: k.telefoon || "" }));
      }
      await checkKlantHistorie(klantnr, form.email);
    } catch (err) {
      console.error("Fout bij zoeken klant:", err);
    }
  };

  const toggleRacket = (r) => {
    if (selectedRackets.find(s => s.id === r.id)) {
      setSelectedRackets(selectedRackets.filter(s => s.id !== r.id));
    } else if (selectedRackets.length < 2) {
      setSelectedRackets([...selectedRackets, r]);
    }
  };

  const calcBedrag = () => {
    if (!dagprijs) return 0;
    return selectedRackets.reduce((sum) => sum + dagprijs * Number(form.huurDagen), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (selectedRackets.length === 0) { setError("Selecteer minstens 1 racket."); return; }
    if (!form.voornaam || !form.naam) { setError("Voornaam en naam zijn verplicht."); return; }

    setSaving(true);
    try {
      const retourDatum = new Date();
      retourDatum.setDate(retourDatum.getDate() + Number(form.huurDagen));
      const verhuurnr = `VR${Date.now().toString().slice(-6)}`;
      const factuurnr = `FA${Date.now().toString().slice(-6)}`;
      const bedrag = calcBedrag();

      // Klant aanmaken of updaten op basis van klantnr of email
      if (form.voornaam && form.naam && form.email) {
        const bestaande = await base44.entities.Klant.filter({ email: form.email });
        if (bestaande.length === 0) {
          await base44.entities.Klant.create({
            klantnr: form.klantnr,
            voornaam: form.voornaam,
            naam: form.naam,
            email: form.email,
            telefoon: form.telefoon,
            status: "Actief",
          });
        }
      }

      for (const r of selectedRackets) {
        await base44.entities.Verhuur.create({
          verhuurnr,
          voornaam: form.voornaam,
          naam: form.naam,
          email: form.email,
          klantnr: form.klantnr,
          telefoon: form.telefoon,
          racket: r.naam,
          racketcode: r.code,
          teamplayer: form.teamplayer,
          huurdatum: new Date().toISOString(),
          retourdatum: retourDatum.toISOString(),
          afgewerkt: false,
          status: "Goedgekeurd",
          notitie: form.opmerking,
          factuurnr,
        });
        await base44.entities.Racket.update(r.id, { status: "Verhuurd" });
      }

      if (bedrag > 0) {
        await base44.entities.Factuur.create({
          factuurnr,
          verhuurnr,
          klantnr: form.klantnr,
          bedrag,
          datum: new Date().toISOString().split("T")[0],
          status: "Openstaand",
        });
      }

      setFactuurData({
        factuurnr,
        verhuurnr,
        klantnr: form.klantnr,
        voornaam: form.voornaam,
        naam: form.naam,
        email: form.email,
        telefoon: form.telefoon,
        huurDagen: form.huurDagen,
        retourdatum: retourDatum.toISOString(),
        bedrag,
        datum: new Date().toISOString().split("T")[0],
        status: bedrag > 0 ? "Openstaand" : null,
        regels: selectedRackets.map(r => ({
          naam: r.naam,
          code: r.code,
          bedrag: dagprijs ? dagprijs * Number(form.huurDagen) : 0,
        })),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 text-center">Laden...</div>;
  }

  if (factuurData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Factuur Afdrukken</h1>
          </div>
          <FactuurPrint
            factuur={factuurData}
            onSave={() => navigate(createPageUrl("Verhuringen"))}
          />
        </div>
      </div>
    );
  }

  const eerderGehuurd = [...new Set(huurHistorie.map(v => v.racketcode).filter(Boolean))];
  const geselecteerdeMatch = selectedRackets.filter(r => eerderGehuurd.includes(r.code));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nieuwe Verhuur</h1>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <AlertCircle className="w-5 h-5" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Klantgegevens */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Klantgegevens</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div><Label>Voornaam *</Label><Input value={form.voornaam} onChange={e => setForm({...form, voornaam: e.target.value})} /></div>
              <div><Label>Naam *</Label><Input value={form.naam} onChange={e => setForm({...form, naam: e.target.value})} /></div>
              <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div>
                <Label>Klantnummer</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.klantnr}
                    onChange={e => setForm({...form, klantnr: e.target.value})}
                    onBlur={e => zoekKlantOpNummer(e.target.value)}
                    placeholder="Zoek klant..."
                  />
                </div>
              </div>
              <div><Label>Telefoon</Label><Input value={form.telefoon} onChange={e => setForm({...form, telefoon: e.target.value})} /></div>
              <div><Label>Teamplayer</Label><Input value={form.teamplayer} onChange={e => setForm({...form, teamplayer: e.target.value})} /></div>
            </CardContent>
          </Card>

          {/* Verhuurhistorie waarschuwing */}
          {huurHistorie.length > 0 && (
            <Card className="border border-amber-300 bg-amber-50">
              <CardContent className="p-4 space-y-2">
                <div className="font-semibold text-amber-800 text-sm">⚠️ Klant heeft al {huurHistorie.length} verhuring(en)</div>
                <div className="text-xs text-amber-700">Eerder gehuurde rackets: <span className="font-medium">{eerderGehuurd.join(", ")}</span></div>
                {geselecteerdeMatch.length > 0 && (
                  <div className="text-xs text-red-700 font-medium bg-red-50 rounded px-2 py-1">
                    🚨 Let op: {geselecteerdeMatch.map(r => r.code).join(", ")} werd al eerder gehuurd door deze klant!
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Racket selectie */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Racket kiezen (max. 2)</CardTitle>
            </CardHeader>
            <CardContent>
              {rackets.length === 0 ? (
                <p className="text-gray-400 text-sm">Geen beschikbare rackets.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {rackets.map(r => {
                    const sel = !!selectedRackets.find(s => s.id === r.id);
                    const disabled = !sel && selectedRackets.length >= 2;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => !disabled && toggleRacket(r)}
                        className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${sel ? "bg-green-600 text-white border-green-600" : disabled ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed" : "bg-white text-gray-700 border-gray-300 hover:border-green-400"}`}
                      >
                        {r.code} · {r.naam}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Aantal huurdagen (max 14)</Label>
                <Input type="number" min={1} max={14} value={form.huurDagen} onChange={e => setForm({...form, huurDagen: e.target.value})} className="w-32" />
              </div>
              <div><Label>Opmerking</Label><Textarea value={form.opmerking} onChange={e => setForm({...form, opmerking: e.target.value})} rows={2} /></div>
              {selectedRackets.length > 0 && dagprijs && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="font-medium text-gray-700">Samenvatting</div>
                  {selectedRackets.map(r => (
                    <div key={r.id} className="text-gray-500">• {r.naam}: €{(dagprijs * Number(form.huurDagen)).toFixed(2)}</div>
                  ))}
                  <div className="font-bold text-gray-900 mt-1">Totaal: €{calcBedrag().toFixed(2)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full bg-green-600 hover:bg-green-700 h-12 text-base">
            {saving ? "Opslaan..." : "Verhuur Opslaan"}
          </Button>
        </form>
      </div>
    </div>
  );
}