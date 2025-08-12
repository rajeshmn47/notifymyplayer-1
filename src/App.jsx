import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Login from './pages/Login';
import PlaylistsPage from './pages/PlayLists';
import Register from './pages/Register';
import { useSelector } from 'react-redux';
import { requestNotificationPermission, onMessageListener } from './firebase';
import { useEffect } from 'react';
import { URL } from './constants/userConstants';
import { API } from './actions/userAction';

function App() {

  const { user } = useSelector(state => state.user || {});

  useEffect(() => {
    // Request notification permission on app load
    const getTokenAndSave = async () => {
      const token = await requestNotificationPermission();
      if (token && user?._id) {
        console.log('FCM Token:', token);
        // Save the token to your backend
        await API.post(`${URL}/auth/save-token`,
          {
            userId: user?._id, // Replace with actual user ID
            token,
          },
        );
      }
    }
    getTokenAndSave();
    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        console.log('Message received: ', payload);
        toast.info(`Notification: ${payload.notification.title}`);
      })
      .catch((err) => console.error('Failed to receive message: ', err));
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

