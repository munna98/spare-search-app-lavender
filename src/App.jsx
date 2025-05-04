import React, { useState } from "react";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import PartSearchForm from "./components/PartSearchForm";
import RecentSearches from "./components/RecentSearches";
import SearchResults from "./components/SearchResults";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (partNumber, searchMode = 'contains') => {
    setQuery(partNumber);
    setLoading(true);
    
    try {
      // Add to recent searches if not already there
      if (!recent.includes(partNumber)) {
        setRecent([partNumber, ...recent.slice(0, 4)]);
      }

      // Use the electronAPI to search parts in the database
      const response = await window.electronAPI.searchParts({ 
        term: partNumber,
        mode: searchMode
      });

      if (response.success) {
        setResults(response.results);
      } else {
        toast.error(`Search error: ${response.message}`);
        setResults([]);
      }
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = async () => {
    try {
      // Open file dialog
      const fileResponse = await window.electronAPI.openFile();
      
      if (!fileResponse.success) return;
      
      // Import the selected file
      const importResponse = await window.electronAPI.importFile(fileResponse.filePath);
      
      if (importResponse.success) {
        toast.success(importResponse.message);
      } else {
        toast.error(`Import failed: ${importResponse.message}`);
      }
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center mb-6 ">
        <h1 className="text-3xl font-bold text-gray-900">Spare parts search</h1>
        <button 
          onClick={handleImportFile}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:shadow-sm flex items-center"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
          Import Excel
        </button>
      </div>
      
      <PartSearchForm onSearch={handleSearch} />
      <RecentSearches items={recent} onSelect={handleSearch} />
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <SearchResults results={results} query={query} />
      )}
    </div>
  );
}