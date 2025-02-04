"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/CardContent";
import Link from "next/link";

export default function InfluencerDetails() {
  const [influencerData, setInfluencerData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedInfluencer = localStorage.getItem("selectedInfluencer");
    if (storedInfluencer) {
      setInfluencerData(JSON.parse(storedInfluencer));
      console.log("Influencer data:", JSON.parse(storedInfluencer));
    } else {
      router.push("/leaderboard");
    }
  }, [router]);

  if (!influencerData) {
    return <p className="text-center text-gray-600">Loading influencer data...</p>;
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto p-4 text-gray-500">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/leaderboard">
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
              ← Back
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white">{influencerData.influencer}</h1>
        </div>
  
        <Card className="bg-gray-800 border border-gray-700 text-gray-600">
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Followers: {influencerData.followers.toLocaleString()}</p>
              <p className="text-lg font-semibold">Trust Score: {Math.round(influencerData.trustScore)}%</p>
              <p className="text-lg font-semibold">Total Claims: {influencerData.totalClaims}</p>
            </div>
          </CardContent>
        </Card>
  
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Claims Analysis</h2>
          <Card className="bg-gray-800 border border-gray-700 text-gray-600">
            <CardContent>
              <ul>
                {influencerData.claims.length > 0 ? (
                  influencerData.claims.map((claim, index) => (
                    <li key={index} className="p-3 border-t border-gray-700">
                      <p><strong>Claim:</strong> {claim.claim}</p>
                      <p><strong>Category:</strong> {claim.category}</p>
                      {claim.original_source ? (
                        <p>
                          <strong>Source:</strong>{" "}
                          <Link
                            href={claim.original_source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-400 underline hover:text-teal-300 transition"
                          >
                            View Source
                          </Link>
                        </p>
                      ) : (
                        <p>
                          <strong className="text-red-400">Source:</strong> Not available
                        </p>
                      )
                    }
                      <p><strong>Confidence Score:</strong> {claim.confidence_score}%</p>
                      <p><strong>Scientific Verification:</strong> {claim.verification}</p>
                      {claim.scientific_studies && claim.scientific_studies.length > 0 && (
                        <div className="mt-2">
                          <strong>Scientific Studies:</strong>
                          <ul className="list-disc pl-5 space-y-2">
                            {claim.scientific_studies.map((study, studyIndex) => (
                              <li key={studyIndex}>
                                <Link
                                  href={study.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal-400 underline hover:text-teal-300 transition"
                                >
                                  {study.title} ({study.year})
                                </Link>
                                <p className="text-sm text-gray-600">{study.authors} - {study.publication}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-600">No claims available</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  
}
