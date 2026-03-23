// src/components/FactuurList.jsx
import React, { useState } from 'react';
import { useFacturen } from '../hooks/useFacturen';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'; // pas het importpad aan naar jouw situatie

export function FactuurList() {
  const [statusFilter, setStatusFilter] = useState('');
  const { facturen, loading, error, updateFactuurStatus, reload } = useFacturen(
    statusFilter ? { status: statusFilter } : {}
  );

  if (loading) return <div className="p-4">Laden...</div>;
  if (error) return <div className="p-4 text-red-600">Fout: {error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Facturen</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Alle statussen</option>
          <option value="Openstaand">Openstaand</option>
          <option value="Betaald">Betaald</option>
          <option value="Geannuleerd">Geannuleerd</option>
        </select>
      </div>

      <Accordion type="multiple" className="w-full">
        {facturen.map((factuur) => (
          <AccordionItem key={factuur.factuurnr} value={factuur.factuurnr}>
            <AccordionTrigger>
              <div className="flex justify-between w-full pr-4">
                <span>Factuur {factuur.factuurnr}</span>
                <span className="text-sm text-muted-foreground">
                  {factuur.klantnr} | € {factuur.bedrag}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-sm font-medium">Klantnummer</p>
                  <p>{factuur.klantnr}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Verhuurnummer</p>
                  <p>{factuur.verhuurnr}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Bedrag</p>
                  <p>€ {factuur.bedrag}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Datum</p>
                  <p>{factuur.datum || 'n.v.t.'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p>{factuur.status}</p>
                </div>
                <div className="col-span-2">
                  {factuur.status === 'Openstaand' && (
                    <button
                      onClick={() => updateFactuurStatus(factuur.factuurnr, 'Betaald')}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Markeer als betaald
                    </button>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}