import { API, loadUser } from "@/actions/userAction";
import { URL } from "@/constants/userConstants";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const playersList = [
  { id: 1, name: "Virat Kohli" },
  { id: 2, name: "Jasprit Bumrah" },
  { id: 3, name: "Rohit Sharma" },
  { id: 4, name: "Ravindra Jadeja" },
  { id: 5, name: "KL Rahul" },
  { id: 6, name: "MS Dhoni" },
  // Add more players...
];

export default function PlayerSelection() {
  const { user } = useSelector(state => state.user || {});
  const dispatch = useDispatch();
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [playersList, setPlayersList] = useState([]);

  useEffect(() => {
    dispatch(loadUser());
    const fetchMatchesList = async () => {
      try {
        const res = await API.get(`https://mangogames.fun/api/allplayers`);
        let xyz = res.data.player.map((m) => { return { ...m } })
        console.log(xyz, 'xyz')
        setPlayersList(xyz || []);
      } catch (error) {
        console.error("Error fetching series list:", error);
      }
    };
    fetchMatchesList();
  }, []);

  useEffect(() => {
    const fetchMyPlayers = async () => {
      try {
        const res = await API.get(`${URL}/notify/notify-players/${user?._id}`);
        console.log(res.data, 'data')
        let xyz = res.data.data.players.map((m) => { return { id: m.player_id, ...m } })
        console.log(xyz, 'wxyz')
        setSelectedPlayers(xyz || []);
      } catch (error) {
        console.error("Error fetching series list:", error);
      }
    };
    if (user?._id) {
      fetchMyPlayers();
    }
  }, [user]);

  console.log(selectedPlayers, user, 'selected players')

  const togglePlayer = (player, role) => {
    setSelectedPlayers(prev => {
      const index = prev.findIndex(p => p.id === player.id);

      if (index === -1) {
        // Player not in list — add new with the role set to true
        return [...prev, { id: player.id, batting: role === 'batting', bowling: role === 'bowling' }];
      }

      const updatedPlayer = { ...prev[index], [role]: !prev[index][role] };

      // If both batting & bowling become false, remove the player
      if (!updatedPlayer.batting && !updatedPlayer.bowling) {
        return prev.filter((_, i) => i !== index);
      }

      // Otherwise, update the player's role
      return prev.map((p, i) => (i === index ? updatedPlayer : p));
    });
  };

  // Inside PlayerSelection component
  const handleSave = async () => {
    try {
      const res = await API.post(`${URL}/notify/save-players`, {
        user_id: user?._id,
        players: [...selectedPlayers]
      });
      alert(res.data.message);
    } catch (err) {
      console.error("Error saving players", err);
      alert("Failed to save players.");
    }
  };


  const filteredPlayers = playersList.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Select Players</h2>

      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search players..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded shadow"
      />



      {/* 🧍 Player Cards */}
      <div className="grid grid-cols-2 gap-4">
        {filteredPlayers.map(player => (
          <div key={player.id} className="border p-4 rounded shadow">
            <p className="font-medium">{player.name}</p>
            <div className="flex space-x-2 mt-2">
              <button
                className={`px-2 py-1 text-sm rounded ${selectedPlayers?.find((p) => p.id == player.id && p.batting)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
                  }`}
                onClick={() => togglePlayer(player, "batting")}
              >
                Batting
              </button>
              <button
                className={`px-2 py-1 text-sm rounded ${selectedPlayers?.find((p) => p.id == player.id && p.bowling)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
                  }`}
                onClick={() => togglePlayer(player, "bowling")}
              >
                Bowling
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Selected Summary */}
      <div>
        <h3 className="text-lg font-semibold">Selected:</h3>
        <p>Batting: {selectedPlayers.filter((player) => player.batting).length}</p>
        <p>Bowling: {selectedPlayers.filter((player) => player.bowling).length}</p>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md flex justify-center">
        <button
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg"
          onClick={handleSave}
        >
          Save Selection
        </button>
      </div>

    </div>
  );
}
