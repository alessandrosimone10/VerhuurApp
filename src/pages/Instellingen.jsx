import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

export default function Instellingen() {
  const [dagprijs, setDagprijs] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'dagprijs').maybeSingle();
      if (data) setDagprijs(data.value);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    await supabase.from('settings').upsert({ key: 'dagprijs', value: dagprijs, label: 'Standaard Dagprijs' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Instellingen</h1>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm font-bold text-gray-500 uppercase">Tarieven</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Prijs per dag (€)</Label>
              <Input type="number" value={dagprijs} onChange={e => setDagprijs(e.target.value)} className="w-40 mt-1" />
            </div>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              {saved ? <CheckCircle className="mr-2" /> : null} {saved ? "Opgeslagen" : "Opslaan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}