"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/Card"; // Cambia la ruta según tu estructura
import { CardContent } from "@/components/ui/CardContent"; // Cambia la ruta según tu estructura
import Link from "next/link";

export default function Leaderboard() {
    const [influencersData, setInfluencersData] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const storedData = localStorage.getItem("searchResults");

        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                const claims = parsedData?.results?.claims; // Acceder correctamente a los claims

                if (!Array.isArray(claims)) {
                    console.error("Expected an array but got:", claims);
                    return;
                }

                const groupedData = groupByInfluencer(claims);
                const influencersWithScores = calculateTrustScores(groupedData);
                setInfluencersData(influencersWithScores);
                console.log("Influencers data:", influencersWithScores);
            } catch (error) {
                console.error("Error parsing influencers data:", error);
            }
        }
    }, []);

    // Función para agrupar claims por influencer
    const groupByInfluencer = (claims) => {
        return claims.reduce((acc, claim) => {
            if (!claim.influencer) return acc; // Evitar errores si falta el nombre del influencer

            if (!acc[claim.influencer]) {
                acc[claim.influencer] = [];
            }

            acc[claim.influencer].push({ ...claim });
            console.log("Claims grouped by influencer:", acc);
            return acc;
        }, {});
    };

    // Función para calcular el trust score y el trend
    const calculateTrustScores = (groupedData) => {
        return Object.keys(groupedData).map((influencer) => {
            const claims = groupedData[influencer];
            const totalClaims = claims.length;
    
            // Calcular el trust score (promedio de confidence_score)
            const trustScore = totalClaims > 0 
                ? claims.reduce((total, claim) => total + claim.confidence_score, 0) / totalClaims 
                : 0;
    
            // Calcular el trend basado en el promedio del confidence score
            const trend = trustScore >= 80 ? "up" : "down";
    
            return {
                influencer,
                trustScore,
                followers: claims[0]?.follower_count || 0,  // Evita errores si no hay claims
                trend,
                totalClaims,
                claims,
            };
        });
    };
    

    const handleRowClick = (influencerData) => {
        localStorage.setItem("selectedInfluencer", JSON.stringify(influencerData));
        router.push(`/leaderboard/${influencerData.influencer.replace(/\s+/g, '')}`);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-6">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                    <Link href="/">
                        <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">
                            ← Back
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold text-teal-300">
                        Leaderboard de Health Influencers
                    </h1>
                </div>
    
                {/* Leaderboard Table */}
                <Card className="bg-gray-800 border border-gray-700 text-gray-400">
                    <CardContent>
                        <div className="overflow-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-teal-700 text-white text-left">
                                        <th className="p-3 text-center">Rank</th>
                                        <th className="p-3">Influencer</th>
                                        <th className="p-3 text-center">Trust Score</th>
                                        <th className="p-3 text-center">Trend</th>
                                        <th className="p-3 text-center">Followers</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {influencersData.length > 0 ? (
                                        [...influencersData]
                                            .sort((a, b) => b.trustScore - a.trustScore) // Ordenar por trustScore descendente
                                            .map((inf, index) => (
                                                <tr
                                                    key={index}
                                                    className="border-t border-gray-700 hover:bg-gray-700 transition cursor-pointer text-gray-500"
                                                    onClick={() => handleRowClick(inf)}
                                                >
                                                    <td className="p-3 text-center font-semibold">{index + 1}</td>
                                                    <td className="p-3 font-semibold">{inf.influencer}</td>
                                                    <td className="p-3 text-center">{Math.round(inf.trustScore)}%</td>
                                                    <td className="p-3 text-center">
                                                        {inf.trend === "up" ? (
                                                            <ArrowUp className="text-green-400" />
                                                        ) : (
                                                            <ArrowDown className="text-red-400" />
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">{inf.followers.toLocaleString()}</td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-3 text-center text-gray-500">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

}
