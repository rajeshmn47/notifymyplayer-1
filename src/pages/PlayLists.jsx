import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust this path if needed
import { useNavigate } from "react-router-dom";
import { Trash2, PlayCircle, Download } from "lucide-react";
import { NEW_URL } from "./../constants/userConstants"; // Adjust this import based on your project structure

const PlaylistsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [playlists, setPlaylists] = useState({});
    const [expandedPlaylist, setExpandedPlaylist] = useState(null);
    const [selectedClips, setSelectedClips] = useState([]);
    const [selectedQuality, setSelectedQuality] = useState('240p');
    const [isEditing, setIsEditing] = useState(false);
    const [editingPlaylistTitle, setEditingPlaylistTitle] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [editableClips, setEditableClips] = useState([]);
    const [showMobileModal, setShowMobileModal] = useState(false);

    const videoSrc = `${NEW_URL}/${selectedQuality == '240p' ? 'mockvideos' : selectedQuality == '360p' ? '360p' : '720p'}`;

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

    const handleMergeAndDownload = async () => {
        setLoading(true)
        const response = await fetch(`${NEW_URL}/auth/merge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clips: selectedClips, quality: selectedQuality }),
        });
        console.log(response, 'res');
        const res = await response.json()
        console.log(res, 'res');
        const downloadUrl = `${videoSrc}/${res.file}`;
        const a = document.createElement('a');
        a.target = '_blank';
        a.href = downloadUrl;
        a.download = res.file;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setLoading(false)
    };

    const handleSave = () => {
        if (newTitle !== editingPlaylistTitle) {
            localStorage.removeItem(editingPlaylistTitle);
        }
        localStorage.setItem(
            newTitle,
            JSON.stringify([...editableClips])
        );
    }

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
                                                  if (window.innerWidth < 640) {
    // sm breakpoint
    setShowMobileModal(true);
  }
                                            }}
                                            className="text-sm px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition"
                                            title="View playlist clips"
                                        >
                                            👁️ View
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleMergeAndDownload()
                                            }}
                                            className="text-sm px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition"
                                            title="Download all clips"
                                        >
                                            📥 Download
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(true);
                                                setEditingPlaylistTitle(title);
                                                setNewTitle(title);
                                                setEditableClips([...clips]);
                                            }}
                                            className="text-sm px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md transition"
                                        >
                                            ✏️ Edit
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
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl space-y-4 relative">
                        <h2 className="text-xl font-bold text-blue-800">Edit Playlist</h2>

                        {/* Playlist Title Rename */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Rename Playlist</label>
                            <input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>

                        {/* Clip List */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {editableClips.map((clip, index) => (
                                <div key={index} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-700 truncate">{clip}</span>
                                    <button
                                        onClick={() => {
                                            setEditableClips(editableClips.filter((_, i) => i !== index));
                                        }}
                                        className="text-xs text-red-500 hover:underline"
                                    >
                                        ❌ Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const updated = { ...playlists };
                                    delete updated[editingPlaylistTitle];
                                    updated[newTitle] = editableClips;
                                    setPlaylists(updated);
                                    setIsEditing(false);
                                    handleSave()
                                }}
                                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            >
                                ✅ Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showMobileModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="bg-white w-full max-w-md rounded-xl p-4 space-y-4 relative shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-blue-800">🎥 {expandedPlaylist}</h2>
                            <button
                                onClick={() => setShowMobileModal(false)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                ✖️
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {selectedClips.map((clipUrl, i) => (
                                <video
                                    key={i}
                                    src={`${NEW_URL}/mockvideos/${clipUrl}`}
                                    controls
                                    className="rounded-lg shadow"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PlaylistsPage;
