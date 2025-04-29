// File: src/App.jsx
import React, { useState } from "react";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import PartSearchForm from "./components/PartSearchForm";
import RecentSearches from "./components/RecentSearches";
import SearchResults from "./components/SearchResults";
import mockData from "./data/mockData";

export default function App() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const [results, setResults] = useState([]);

  const handleSearch = (partNumber) => {
    setQuery(partNumber);
    if (!recent.includes(partNumber)) {
      setRecent([partNumber, ...recent.slice(0, 4)]);
    }
    const filtered = mockData.filter((item) =>
      item.partNumber.includes(partNumber)
    );
    setResults(filtered);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Spare parts search</h1>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:shadow-sm flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
          Import Excel
        </button>
      </div>
      <PartSearchForm onSearch={handleSearch} />
      <RecentSearches items={recent} onSelect={handleSearch} />
      <SearchResults results={results} />
    </div>
  );
}
