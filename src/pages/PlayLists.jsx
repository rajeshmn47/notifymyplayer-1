import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust this path if needed
import { useNavigate } from "react-router-dom";
import { Trash2, PlayCircle, Download } from "lucide-react";
import { NEW_URL } from "./../constants/userConstants"; // Adjust this import based on your project structure

const PlaylistsPage = () => {
    const [playlists, setPlaylists] = useState({});
    const [expandedPlaylist, setExpandedPlaylist] = useState(null);
    const [selectedClips, setSelectedClips] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const allKeys = Object.keys(localStorage);
        const loaded = {};

        allKeys.forEach((key) => {
            try {
                const value = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(value)) {
                    loaded[key] = value;
                }
            } catch (e) {
                console.warn(`Skipping invalid JSON in localStorage key "${key}":`, e.message);
            }
        });

        setPlaylists(loaded);

    }, []);

    const handleDelete = (playlistName) => {
        if (window.confirm(`Delete playlist "${playlistName}"?`)) {
            localStorage.removeItem(playlistName);
            setPlaylists((prev) => {
                const copy = { ...prev };
                delete copy[playlistName];
                return copy;
            });
        }
    };

    const handleDownloadAll = (clips) => {
        // Simulated download – replace with actual download logic
        clips.forEach((clip) => {
            console.log("Downloading", clip);
        });
        alert("Download started (simulated).");
    };

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-blue-50 to-white space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">🎬 Your Playlists</h1>
                <Button onClick={() => navigate(-1)} className="text-sm">
                    🔙 Back
                </Button>
            </div>

            {Object.keys(playlists).length === 0 ? (
                <p className="text-gray-500 text-center">No playlists found.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 p-4 min-h-screen bg-gradient-to-br from-blue-50 to-white">
                {/* Left Sidebar: Playlists */}
                <div className="sm:w-1/3 w-full space-y-4">
                    {Object.entries(playlists).map(([title, clips]) => (
                        <div
                            key={title}
                            className="border border-blue-200 rounded-xl p-4 shadow-md bg-white hover:shadow-lg transition duration-200"
                        >
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base sm:text-lg font-semibold text-blue-800 truncate max-w-[180px]">
                                        🎬 {title}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setExpandedPlaylist(title);
                                                setSelectedClips(clips);
                                            }}
                                            className="text-sm px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition"
                                            title="View playlist clips"
                                        >
                                            👁️ View
                                        </button>
                                        <button
                                            onClick={() => {
                                                clips.forEach((clipUrl) => {
                                                    const a = document.createElement("a");
                                                    a.href = `${NEW_URL}/mockvideos/${clipUrl}`;
                                                    a.download = clipUrl.split("/").pop();
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                });
                                            }}
                                            className="text-sm px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition"
                                            title="Download all clips"
                                        >
                                            📥 Download
                                        </button>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {clips.length} clip{clips.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                    ))}


                </div>

                {/* Right Panel: Clips */}
                <div className="sm:w-2/3 w-full border border-blue-200 rounded-lg p-4 bg-white shadow-sm">
                    {expandedPlaylist ? (
                        <>
                            <h3 className="text-lg font-bold text-blue-700 mb-3">
                                🎥 Clips in "{expandedPlaylist}"
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {selectedClips.map((clipUrl, i) => (
                                    <video
                                        key={i}
                                        src={`${NEW_URL}/mockvideos/${clipUrl}`}
                                        controls
                                        className="rounded-lg shadow-md"
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-600 italic">
                            Click a playlist to view its clips.
                        </p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default PlaylistsPage;
