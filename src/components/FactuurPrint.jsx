// src/components/FactuurPrint.jsx
import React from "react";

export default function FactuurPrint({ factuur, onSave }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={onSave}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          ← Terug
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🖨️ Print factuur
        </button>
      </div>

      <div className="border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Factuur {factuur.factuurnr}</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Klant</p>
            <p className="font-medium">
              {factuur.voornaam} {factuur.naam}
            </p>
            <p className="text-sm">{factuur.email}</p>
            <p className="text-sm">{factuur.telefoon}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Factuurgegevens</p>
            <p className="text-sm">Factuurnr: {factuur.factuurnr}</p>
            <p className="text-sm">Verhuurnr: {factuur.verhuurnr}</p>
            <p className="text-sm">Datum: {factuur.datum}</p>
            <p className="text-sm">Status: {factuur.status || "Openstaand"}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">Gehuurde rackets</p>
          <table className="w-full text-sm border-t">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Racket</th>
                <th className="text-right py-1">Bedrag</th>
              </tr>
            </thead>
            <tbody>
              {factuur.regels?.map((regel, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1">
                    {regel.naam} ({regel.code})
                  </td>
                  <td className="text-right py-1">
                    €{regel.bedrag.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-2 font-bold">Totaal</td>
                <td className="text-right pt-2 font-bold">
                  €{factuur.bedrag.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {factuur.huurDagen && (
          <p className="text-sm text-gray-500 mt-4">
            Aantal huurdagen: {factuur.huurDagen}
          </p>
        )}
        {factuur.retourdatum && (
          <p className="text-sm text-gray-500">
            Retourdatum:{" "}
            {new Date(factuur.retourdatum).toLocaleDateString("nl-BE")}
          </p>
        )}
      </div>
    </div>
  );
}