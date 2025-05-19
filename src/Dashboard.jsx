import { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Filter, Search } from 'lucide-react';
import Filters from './Filters';
import { Switch } from './components/ui/switch';
import { API } from './actions/userAction';
import { HTTPS_URL, URL } from './constants/userConstants';
import axios from 'axios';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import VideoTrimmer from './VideoTrimmer';

const filters = [
  'Match', 'Player', 'Shot Type', 'Over', 'Ball', 'Batting Team', 'Bowler', 'Striker', 'Non-Striker',
  'Fielder', 'Wicket', 'Runs', 'Boundary', 'Sixes', 'Powerplay', 'Match Type', 'Pitch Type',
  'Weather', 'Match Date', 'League'
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filterValues, setFilterValues] = useState({ batsman: "virat kohli" });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Simulating super admin status
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedClip, setSelectedClip] = useState(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [isEditClipOpen, setIsEditClipOpen] = useState(false);
  const [selectedClips, setSelectedClips] = useState([]);
  const [trimmingClip, setTrimmingClip] = useState(null);
  const editClipForm = useRef(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClips = async () => {
      try {
        const res = await axios.get(`${URL}/auth/allclips`);
        //const clipsWithDuration = await Promise.all(
        //  res.data.map((clip) => getClipWithDuration(clip))
        //);
        setClips(res.data);
        //setClips(clipsWithDuration);
      } catch (err) {
        console.error("Error fetching clips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClips();
  }, []);

  const getClipWithDuration = (clip) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = `${URL}/mockvideos/${clip.clip}`;
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({ ...clip, duration: video.duration });
      };
      video.onerror = () => {
        // fallback in case video fails to load
        resolve({ ...clip, duration: 0 });
      };
    });
  };

  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
  }

  const videos = Array.from({ length: 10 }).map((_, idx) => ({
    id: idx,
    title: `Clip ${idx + 1}`,
    videoUrl: `https://www.example.com/clip${idx + 1}.mp4`,
  }));

  const handleEditSave = (updatedClip) => {
    // Mock request delay
    setTimeout(() => {
      setClipList(prev =>
        prev.map(c => c.clip === updatedClip.clip ? updatedClip : c)
      )
      alert("Clip updated (mock)")
    }, 300)
  }

  const toggleSelect = (clipName) => {
    setSelectedClips(prev =>
      prev.includes(clipName)
        ? prev.filter(name => name !== clipName)
        : [...prev, clipName]
    )
  }

  const deleteSelected = async () => {
    if (!confirm("Delete all selected clips?")) return
    setTimeout(() => {
      setClips(prev => prev.filter(c => !selectedClips.includes(c.clip)))
      setSelectedClips([])
    }, 300)
    await axios.post(`${URL}/auth/delete-multiple`, { clips: selectedClips })
  }

  const handleDelete = async (clip) => {
    //if (!confirm("Delete all selected clips?")) return
    await axios.delete(`${URL}/auth/delete-clip/${clip._id}`);
    setClips(prev => prev.filter(c => c._id !== clip._id));
  }

  const filteredClips = clips.filter((clip) => {
    return Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true; // Skip empty filters
      const clipValue = clip[key];
      if (key === 'isWicket') return clip.event === 'WICKET';
      if (key === 'isFour') return clip.event === 'FOUR';
      if (key === 'isSix') return clip.event === 'SIX';
      const duration = clip.duration;
      if (key === 'durationRange') {
        if (value === '0-2') return duration >= 0 && duration < 2;
        if (value === '2-5') return duration >= 2 && duration < 5;
        if (value === '5-10') return duration >= 5 && duration < 10;
        if (value === '10+') return duration >= 10;
        return true;
      }
      // Case-insensitive partial match
      return clipValue && String(clipValue).toLowerCase().includes(String(value).toLowerCase());
      //if((!duration)&&clip?.batsman) return true;
    });
  });

  console.log(filterValues, 'filterValues');
  console.log(filteredClips, 'filteredClips');

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Cricket Clips Dashboard</h1>
        <div className="flex items-center gap-2 w-full md:w-full">
          <Search className="text-muted-foreground" />
          <Input
            placeholder="Search clips or players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Filters values={filterValues} onChange={handleFilterChange} clips={clips} />
      {isSuperAdmin && selectedClips.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            className="text-black border border-gray-200"
            onClick={deleteSelected}
          >
            Delete Selected ({selectedClips.length})
          </Button>
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-2">
        {filteredClips.length} item{filteredClips.length !== 1 && "s"} selected
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
        {filteredClips.map(clip => (
          <Card key={clip._id} className="relative">
            <video controls className="w-full rounded-t-xl">
              <source src={`${URL}/mockvideos/${clip.clip}`} type="video/mp4" />
            </video>
            <CardContent className='relative'>
              <p className="font-semibold">{clip.batsman}</p>
              <p className="font-semibold">{clip.bowler}</p>
              <p className="font-semibold">{clip.event}</p>
              <p className="font-semibold">{clip.duration}</p>
              {isSuperAdmin && (
                <Checkbox
                  checked={selectedClips.includes(clip.clip)}
                  onCheckedChange={() => toggleSelect(clip.clip)}
                  className="absolute top-2 right-2 border border-red-500"
                />
              )}
              {isSuperAdmin && (
                <div className="flex gap-2 mt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <EditClipForm clip={clip} onSave={handleEditSave} />
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="sm"
                    className='text-black border border-gray-200'
                    onClick={() => handleDelete(clip)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTrimmingClip(clip)}
                  >
                    ✂️ Trim
                  </Button>

                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {trimmingClip && (
        <Dialog open={!!trimmingClip} onOpenChange={() => setTrimmingClip(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Trim Clip</DialogTitle>
              <DialogDescription>Adjust the start and end time before trimming.</DialogDescription>
            </DialogHeader>

            <VideoTrimmer
              videoFileUrl={`${URL}/mockvideos/${trimmingClip.clip}`}
              onClose={() => setTrimmingClip(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function EditClipForm({ clip, onSave }) {
  const [form, setForm] = useState({ ...clip })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSave = () => {
    onSave(form)
  }

  return (
    <div className="space-y-4">
      <Input name="batsman" value={form.batsman} onChange={handleChange} placeholder="Batsman" />
      <Input name="bowler" value={form.bowler} onChange={handleChange} placeholder="Bowler" />
      <Input name="event" value={form.event} onChange={handleChange} placeholder="Event" />
      <Input name="over" value={form.over} onChange={handleChange} placeholder="Over" />
      <Button onClick={handleSave}>Save</Button>
    </div>
  )
}
