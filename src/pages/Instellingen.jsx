// pages/Instellingen.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Instellingen() {
  const [dagprijs, setDagprijs] = useState("");
  const [instellingId, setInstellingId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.entities.Instelling.filter({ sleutel: "dagprijs" });
        if (res.length > 0) {
          setDagprijs(res[0].waarde);
          setInstellingId(res[0].id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setError(null);
    try {
      if (instellingId) {
        await base44.entities.Instelling.update(instellingId, { waarde: dagprijs });
      } else {
        const res = await base44.entities.Instelling.create({
          sleutel: "dagprijs",
          waarde: dagprijs,
          label: "Vaste prijs per dag (€)",
        });
        setInstellingId(res.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 p-6 text-center">Laden...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Instellingen</h1>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Tarieven</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Vaste prijs per dag (€)</Label>
              <p className="text-xs text-gray-400 mb-1">Dit is de standaard dagprijs voor racketverhuur. Laat leeg voor gratis verhuur.</p>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={dagprijs}
                onChange={e => setDagprijs(e.target.value)}
                placeholder="bv. 5.00"
                className="w-40"
              />
            </div>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              {saved ? <><CheckCircle className="w-4 h-4 mr-2" />Opgeslagen!</> : "Opslaan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}