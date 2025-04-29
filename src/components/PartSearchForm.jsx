// File: src/components/PartSearchForm.jsx
import React, { useState } from "react";
import {DocumentArrowDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function PartSearchForm({ onSearch }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-4 p-4 bg-white shadow-sm border-2 border-gray-100 rounded mb-4"
    >
      <div className="flex-1">
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Part Number
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-2 border rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter part number"
        />
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md flex hover:bg-blue-700 shadow"
      >
        <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-white" />
        Search
      </button>
    </form>
  );
}



// import React, { useState } from "react";
// import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// export default function PartSearchForm({ onSearch }) {
//   const [partNumber, setPartNumber] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (partNumber.trim()) {
//       onSearch(partNumber.trim());
//     }
//   };

//   return (
//     <div className="mb-6">
//       <form onSubmit={handleSubmit} className="flex">
//         <div className="relative flex-grow">
//           <input
//             type="text"
//             className="w-full rounded-l-md border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none"
//             placeholder="Enter part number..."
//             value={partNumber}
//             onChange={(e) => setPartNumber(e.target.value)}
//           />
//           <button
//             type="submit"
//             className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
//           >
//             <MagnifyingGlassIcon className="h-5 w-5" />
//           </button>
//         </div>
//         <button
//           type="submit"
//           className="rounded-r-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
//         >
//           Search
//         </button>
//       </form>
//     </div>
//   );
// }