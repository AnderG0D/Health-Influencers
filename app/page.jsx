"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const [searchType, setSearchType] = useState("specific"); // "specific" o "popular"
  const [influencerName, setInfluencerName] = useState("");
  const [timePeriod, setTimePeriod] = useState("lastWeek");
  const [claimsCount, setClaimsCount] = useState(5);
  const [journals, setJournals] = useState([]);
  const [newJournal, setNewJournal] = useState("");

  const router = useRouter();

  const handleAddJournal = () => {
    if (newJournal && !journals.includes(newJournal)) {
      setJournals([...journals, newJournal]);
      setNewJournal("");
    }
  };

  const handleDeleteJournal = (journal) => {
    setJournals(journals.filter((item) => item !== journal));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const searchParams = {
      influencerName: searchType === "specific" ? influencerName : "",
      timePeriod,
      claimsCount,
      journals,
    };

    console.log("\nSearching with parameters:", searchParams);

    try {
      const response = await axios.post("/api/perplexity", searchParams);

      if (response.status === 200) {
        localStorage.setItem("searchResults", JSON.stringify(response.data));
        console.log("\nSearch results:", response.data);
        router.push("/leaderboard");
      }
    } catch (error) {
      console.error("Error searching influencers:", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-teal-400 mb-6 text-center">
          Health Influencers Admin Panel
        </h1>

        <div className="space-y-6">
          {/* Tipo de búsqueda */}
          <div>
            <label className="block text-sm font-medium text-teal-300">
              Search Type
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="mt-2 block w-full px-4 py-2 border rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="specific">Search by Influencer Name</option>
              <option value="popular">Search Most Popular</option>
            </select>
          </div>

          {/* Nombre del influencer */}
          {searchType === "specific" && (
            <div>
              <label className="block text-sm font-medium text-teal-300">
                Influencer Name
              </label>
              <input
                type="text"
                value={influencerName}
                onChange={(e) => setInfluencerName(e.target.value)}
                className="mt-2 block w-full px-4 py-2 border rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          )}

          {/* Periodo de tiempo */}
          <div>
            <label className="block text-sm font-medium text-teal-300">
              Time Period
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="mt-2 block w-full px-4 py-2 border rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="lastYear">Last Year</option>
              <option value="allTime">All Time</option>
            </select>
          </div>

          {/* Claims a analizar */}
          <div>
            <label className="block text-sm font-medium text-teal-300">
              Claims to Analyze (Min: 5, Max: 50)
            </label>
            <input
              type="number"
              value={claimsCount}
              onChange={(e) => setClaimsCount(Math.max(5, Math.min(50, Number(e.target.value))))}
              className="mt-2 block w-full px-4 py-2 border rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              min="5"
              max="50"
            />
          </div>

          {/* Journals */}
          <div>
            <label className="block text-sm font-medium text-teal-300">
              Journals to Verify Claims
            </label>
            <div className="mt-2 flex space-x-2">
              <input
                type="text"
                value={newJournal}
                onChange={(e) => setNewJournal(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-md bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Enter journal name"
              />
              <button
                onClick={handleAddJournal}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none"
              >
                + Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {journals.map((journal, index) => (
                <div
                  key={index}
                  className="bg-teal-700 text-white px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer hover:bg-teal-800"
                  onClick={() => handleDeleteJournal(journal)}
                >
                  <span>{journal}</span>
                  <span className="text-xl">×</span>
                </div>
              ))}
            </div>
          </div>


          {/* Botón de búsqueda */}
          <div>
            <button
              onClick={handleSearch}
              className="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Search Influencers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}