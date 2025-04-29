// File: src/components/SearchResults.jsx
// import React from 'react';

// export default function SearchResults({ results }) {
//   if (!results.length) return null;

//   return (
//     <table className="w-full table-auto border-t text-sm">
//   <thead>
//     <tr className="text-left bg-gray-100 text-sm font-semibold text-gray-700">
//       <th className="p-3 border">Part Number</th>
//       <th className="p-3 border">Brand</th>
//       <th className="p-3 border">Description</th>
//       <th className="p-3 border">Price</th>
//     </tr>
//   </thead>
//   <tbody>
//     {results.map((row, idx) => (
//       <tr key={idx} className={idx % 2 === 1 ? 'bg-blue-50' : ''}>
//         <td className="p-3 border">{row.partNumber}</td>
//         <td className="p-3 border">{row.brand}</td>
//         <td className="p-3 border">{row.description}</td>
//         <td className="p-3 border">{row.price}</td>
//       </tr>
//     ))}
//   </tbody>
// </table>
//   );
// }

import React from "react";
import { ShoppingCartIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export default function SearchResults({ results }) {
  if (!results.length) return null;

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        Found {results.length} results
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-blue-600">{item.partNumber}</h3>
              <span className={`rounded-full px-2 py-1 text-xs ${
                item.stock > 10 
                  ? "bg-green-100 text-green-800" 
                  : item.stock > 0 
                    ? "bg-yellow-100 text-yellow-800" 
                    : "bg-red-100 text-red-800"
              }`}>
                {item.stock} in stock
              </span>
            </div>
            <p className="mb-2 text-sm text-gray-700">{item.description}</p>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">${item.price.toFixed(2)}</div>
              <div className="flex gap-2">
                <button className="rounded bg-gray-100 p-1 text-gray-600 hover:bg-gray-200">
                  <InformationCircleIcon className="h-5 w-5" />
                </button>
                <button className="rounded bg-blue-600 p-1 text-white hover:bg-blue-700">
                  <ShoppingCartIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}