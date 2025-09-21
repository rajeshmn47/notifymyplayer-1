import { API, loadUser } from "@/actions/userAction";
import { URL } from "@/constants/userConstants";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";

export default function PlayerSelection() {
  const { user, authLoading, isAuthenticated } = useSelector(state => state.user || {});
  const dispatch = useDispatch();
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [playersList, setPlayersList] = useState([]);
  const [loading, setLoading] = useState(true);   // 👈 Added loading state
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(loadUser());
    const fetchMatchesList = async () => {
      try {
        const res = await API.get(`${URL}/allplayers`);
        let xyz = res.data.player.map((m) => ({ ...m }));
        setPlayersList(xyz || []);
      } catch (error) {
        console.error("Error fetching series list:", error);
      } finally {
        setLoading(false);   // 👈 Stop loader
      }
    };
    fetchMatchesList();
  }, []);

  useEffect(() => {
    const fetchMyPlayers = async () => {
      try {
        const res = await API.get(`${URL}/notify/notify-players/${user?._id}`);
        let xyz = res.data.data.players.map((m) => ({ id: m.player_id, ...m }));
        setSelectedPlayers(xyz || []);
      } catch (error) {
        console.error("Error fetching series list:", error);
      }
    };
    if (user?._id) {
      fetchMyPlayers();
    }
  }, [user]);

  const togglePlayer = (player, role) => {
    setSelectedPlayers(prev => {
      const index = prev.findIndex(p => p.id === player.id);
      if (index === -1) {
        return [...prev, { id: player.id, batting: role === 'batting', bowling: role === 'bowling' }];
      }
      const updatedPlayer = { ...prev[index], [role]: !prev[index][role] };
      if (!updatedPlayer.batting && !updatedPlayer.bowling) {
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((p, i) => (i === index ? updatedPlayer : p));
    });
  };

  const handleSave = async () => {
    try {
      if (user?._id) {
        setLoading(true)
        const res = await API.post(`${URL}/notify/save-players`, {
          user_id: user?._id,
          players: [...selectedPlayers]
        });
        setLoading(false)
        // alert(res.data.message);
        toast.success("Players saved successfully!");
      } else {
        navigate('/register');
      }
    } catch (err) {
      console.error("Error saving players", err);
      alert("Failed to save players.");
    }
  };

  const filteredPlayers = playersList.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Login/Signup Status Header */}
      <div className="bg-white p-4 shadow-md mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Player Selection</h1>

          <div className="flex items-center space-x-4">
            {authLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
                <span className="text-sm text-gray-600">Checking authentication...</span>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  Logged in as {user?.name || user?.email}
                </span>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Profile
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-600 font-medium">Not logged in</span>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-gray-50 mb-4 border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Your Selection</h3>
            <p className="text-sm text-gray-500">Quick overview of chosen players</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            Batting: {selectedPlayers.filter((player) => player.batting).length}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            Bowling: {selectedPlayers.filter((player) => player.bowling).length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredPlayers.filter((p) => (selectedPlayers.find((s) => s.id == p.id))).map(player => (
            <div key={player.id} className="border p-4 rounded shadow">
              <img
                width='40'
                height='40'
                src={`https://firebasestorage.googleapis.com/v0/b/dreamelevenclone.appspot.com/o/images%2F${player.id}.png?alt=media&token=4644f151-3dfd-4883-9398-4191bed34854`}
                alt=""
              />
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

        <h2 className="text-2xl font-bold my-2">Select Players</h2>

        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-4 my-4 border rounded shadow"
        />

        {/* 🔄 Show loader or content */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredPlayers.map(player => (
              <div key={player.id} className="border p-4 rounded shadow">
                <img
                  width='40'
                  height='40'
                  src={`https://firebasestorage.googleapis.com/v0/b/dreamelevenclone.appspot.com/o/images%2F${player.id}.png?alt=media&token=4644f151-3dfd-4883-9398-4191bed34854`}
                  alt=""
                />
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
        )}

        {/* ✅ Selected Summary */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md flex justify-center">
          <button
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg"
            onClick={handleSave}
          >
            Save Selection
          </button>
        </div>
      </div>
    </div>
  );
}
