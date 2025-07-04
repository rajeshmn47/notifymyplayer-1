import { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Filter, Search } from 'lucide-react';
import Filters from '../components/Filters';
import { Switch } from '../components/ui/switch';
import { API } from '../actions/userAction';
import { HTTPS_URL, NEW_URL, URL } from '../constants/userConstants';
import axios from 'axios';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import VideoTrimmer from '../VideoTrimmer';
import { inferDismissals } from '../utils/utils';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../actions/userAction';
import cricketSynonyms from '../utils/cricket_synonyms.json';
import exclusionMap from '../utils/exclusion_map.json';

const filters = [
  'Match', 'Player', 'Shot Type', 'Over', 'Ball', 'Batting Team', 'Bowler', 'Striker', 'Non-Striker',
  'Fielder', 'Wicket', 'Runs', 'Boundary', 'Sixes', 'Powerplay', 'Match Type', 'Pitch Type',
  'Weather', 'Match Date', 'League'
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState();
  const [filterValues, setFilterValues] = useState({});
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
  const [selectedQuality, setSelectedQuality] = useState('720p');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const filteredClips = clips
    .filter((clip) => {
      return Object.entries(filterValues).every(([key, value]) => {
        if (!value) return true;
        const clipValue = clip[key];

        // Semantic matching for shotType, direction, ballType
        if (["shotType", "direction", "ballType", "isCleanBowled","connection"].includes(key)) {
          if (key == "isCleanBowled") {
            value = "bowled"
          }
          return (
            matchesWithSynonyms(clip.commentary, value, key)
          );
        }
        if (searchTerm) {
          if (clip?.commentary?.includes(searchTerm)) {
            return true;
          }
          else {
            return false;
          }
        }
        // Keeper Catch filter logic
        if (key === 'isKeeperCatch') {
          const commentary = clip.commentary?.toLowerCase() || "";
          const keeperCatchSynonyms = cricketSynonyms.keeperCatch?.keeper_catch || [];
          const catches = keeperCatchSynonyms.some(syn =>
            clip.commentary?.toLowerCase().includes(syn.toLowerCase())
          );
          if (clip?.event?.toLowerCase() == "wicket") {
            console.log(catches, clip?.commentary, 'catches');
            return catches;
          }
          else {
            return false;
          }
        }
        if (key === 'caughtBy') {
          console.log('caught by is selected')
          let values = value?.split(" ")
          if (clip?.commentary?.toLowerCase().includes(`caught by ${values[1]?.toLowerCase()}`) || clip?.commentary?.toLowerCase().includes(`caught by ${values[0]?.toLowerCase()}`)) {
            if (clip?.batsman?.toLowerCase() == value?.toLowerCase()) {
              return false;
            }
            if (clip?.bowler?.toLowerCase() == value?.toLowerCase()) {
              return false;
            }
            const fieldersNamedSame = fiel.filter(player =>
              player.toLowerCase().includes(values[0]?.toLowerCase()) || player.toLowerCase().includes(values[1]?.toLowerCase())
            );
            let droppedByValue = value?.split(" ")?.[0]?.toLowerCase();
            let droppedByValue2 = value?.split(" ")?.[1]?.toLowerCase();
            console.log(values, values?.length, droppedByValue, droppedByValue2, 'testValue');
            if (values?.length == 3) {
              let values = value?.split(" ")
              droppedByValue2 = [values[1], values[2]]?.join(" ")?.toLowerCase();
              if (clip?.commentary?.toLowerCase().includes(`caught by ${droppedByValue2.toLowerCase()}`)) {
                return true;
              }
            }
            else {
              return true;
            }
          }
          else {
            return false;
          }
        }
        if (key === 'isWicket') return clip.event?.includes('WICKET');
        if (key === 'isFour') return clip.event?.includes('FOUR');
        if (key === 'isSix') return clip.event?.includes('SIX');
        if (key === 'isLofted') {
          // Only filter if isLofted is true
          if (!value) return true;
          const comm = clip.commentary?.toLowerCase() || "";
          const shotType = clip.shotType?.toLowerCase() || "";
          // Synonyms for lofted
          const loftedSynonyms = cricketSynonyms.shotType?.lofted || [];
          // Match in commentary or shotType
          return (
            loftedSynonyms.some(syn => comm.includes(syn) || shotType.includes(syn))
          );
        }
        if (key === 'isGrounded') {
          if (!value) return true;
          const comm = clip.commentary?.toLowerCase() || "";
          const shotType = clip.shotType?.toLowerCase() || "";
          // Synonyms for grounded shots
          const groundedSynonyms = [
            "along the ground",
            "kept it down",
            "keeps it down",
            "kept on the ground",
            "along ground",
            "grounded",
            "kept low",
            "keeps it low"
          ];
          // Should NOT match any lofted synonyms
          const loftedSynonyms = cricketSynonyms.shotType?.lofted || [];
          // Must match a grounded synonym and NOT a lofted synonym
          return (
            groundedSynonyms.some(syn => comm.includes(syn) || shotType.includes(syn)) ||
            !loftedSynonyms.some(syn => comm.includes(syn) || shotType.includes(syn))
          );
        }

        // Example for duration range (adjust as per your data)
        if (key === 'durationRange') {
          const duration = clip.duration;
          if (value === '0-2') return duration >= 0 && duration < 2;
          if (value === '2-5') return duration >= 2 && duration < 5;
          if (value === '5-10') return duration >= 5 && duration < 10;
          if (value === '10+') return duration >= 10;
          return true;
        }

        // Additional semantic matching for runOutBy
        if (key === 'runOutBy') {
          // Only filter if isRunout is also selected
          if (!filterValues.isRunout) return true;
          let values = value?.split(" ");
          let droppedByValue = value?.split(" ")?.[0]?.toLowerCase();
          let droppedByValue2 = value?.split(" ")?.[1]?.toLowerCase();
          console.log(values, values?.length, droppedByValue, droppedByValue2, 'testValue');
          if (values?.length == 3) {
            let values = value?.split(" ")
            droppedByValue2 = [values[1], values[2]]?.join(" ")?.toLowerCase();
          }
          const runOutByValue = values[1]?.toLowerCase();
          // Try to match in a dedicated runOutBy field if present
          //if (clip.runOutBy && clip.runOutBy.toLowerCase().includes(runOutByValue)) return true;
          // Fallback: try to match in commentary
          if (clip?.batsman?.toLowerCase().includes(runOutByValue)) {
            return false;
          }
          if (clip?.bowler?.toLowerCase().includes(runOutByValue)) {
            return false;
          }
          if (clip.commentary?.toLowerCase().includes(`direct hit by ${runOutByValue}`)) return true;
          if (clip.commentary?.toLowerCase().includes(`direct-hit from ${runOutByValue}`)) return true;
          if (clip.commentary?.toLowerCase().includes(`${runOutByValue}`)) return true;
          // Optionally, match just the name if commentary is inconsistent
          //if (clip.commentary?.toLowerCase().includes(runOutByValue)) return true;
          return false;
        }
        if (key === 'isDropped') {
          return clip.event?.includes('DROPPED');
        }
        if (key === 'droppedBy') {
          if (!filterValues.isDropped) return true;
          let droppedByValue = value?.split(" ")?.[0]?.toLowerCase();
          let droppedByValue2 = value?.split(" ")?.[1]?.toLowerCase();
          let testValue = value?.split(" ")
          console.log(testValue, testValue?.length, droppedByValue, droppedByValue2, 'testValue');
          if (testValue?.length == 3) {
            let values = value?.split(" ")
            droppedByValue2 = [values[1], values[2]]?.join(" ")?.toLowerCase();
          }
          console.log(testValue, testValue?.length, droppedByValue, droppedByValue2, 'testValue');
          // Try to match in a dedicated droppedBy field if present
          //if (clip.droppedBy && clip.droppedBy.toLowerCase().includes(droppedByValue)) return true;
          // Fallback: try to match in commentary
          if (clip.batsman?.toLowerCase().includes(droppedByValue)) return false;
          if (clip.batsman?.toLowerCase().includes(droppedByValue2)) return false;
          if (clip.bowler?.toLowerCase().includes(droppedByValue)) return false;
          //if (clip.commentary?.toLowerCase().includes(`${droppedByValue}`)) return true;
          // Optionally, match just the name if commentary is inconsistent
          if (clip.commentary?.toLowerCase().includes(droppedByValue)) return true;
          if (clip.commentary?.toLowerCase().includes(droppedByValue2)) return true;
          // Optionally, match just the name if commentary is inconsistent
          //if (clip.commentary?.toLowerCase().includes(droppedByValue2)) return true;
          return false;
        }
        if (key == "connection") {
          //if (clip.commentary?.toLowerCase().includes(value)) return true;
        }

        // Default: string includes (case-insensitive)
        return clipValue && String(clipValue).toLowerCase().includes(String(value).toLowerCase());
      });
    });

  // Calculate paginated clips
  const paginatedClips = filteredClips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredClips.length / itemsPerPage);

  // Only show admin controls if user is logged in and user.role is 'admin'
  const isAdmin = user && user.role === "user";
  console.log(user, 'user')
  useEffect(() => {
    dispatch(loadUser());
    const fetchClips = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${URL}/auth/allclips`);
        //const clipsWithDuration = await Promise.all(
        //  res.data.map((clip) => getClipWithDuration(clip))
        //);
        const enhancedClips = res.data.map((clip) => {
          const inferred = inferDismissals(clip?.event, clip.commentary || "")
          return { ...clip, ...inferred }
        })
        setClips(enhancedClips);
        //setClips(clipsWithDuration);
      } catch (err) {
        console.error("Error fetching clips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClips();
  }, [dispatch]);

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

  const handleDownloadSelected = () => {
    selectedClips.forEach((clip) => {
      const link = document.createElement("a");
      link.href = `${URL}/mockvideos/${clip}`;
      link.download = clip;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleMergeAndDownload = async () => {
    setLoading(true)
    const response = await fetch(`${URL}/auth/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clips: selectedClips }),
    });
    console.log(response, 'res');
    const res = await response.json()
    console.log(res, 'res');
    const downloadUrl = `${VIDEO_URL}/mockvideos/${res.file}`;
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = downloadUrl;
    a.download = res.file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setLoading(false)
  };

  const videos = Array.from({ length: 10 }).map((_, idx) => ({
    id: idx,
    title: `Clip ${idx + 1}`,
    videoUrl: `https://www.example.com/clip${idx + 1}.mp4`,
  }));

  const handleEditSave = (updatedClip) => {
    // Mock request delay
    setTimeout(() => {
      setClips(prev =>
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

  console.log(filterValues, 'filterValues');
  //console.log(filteredClips, 'filteredClips');

  return (
    <div className="p-3 sm:p-4 space-y-4 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-2 sm:px-4 rounded-xl bg-gradient-to-r from-blue-100/80 to-white/80 shadow-md border border-blue-100 mb-2">
        <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 drop-shadow-sm text-center sm:text-left tracking-tight leading-tight mb-1">Cricket Clips Dashboard</h1>
          <span className="text-xs sm:text-sm text-blue-700 font-medium tracking-wide opacity-80">AI-powered search &amp; video management</span>
        </div>
        <form className="flex items-center w-full sm:w-auto max-w-lg bg-white/90 rounded-lg shadow-sm border border-blue-200 px-2 py-1 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
          <Search className="text-blue-400 mr-2 w-5 h-5" />
          <Input
            placeholder="Search clips, players, events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm sm:text-base placeholder:text-blue-300"
            aria-label="Search clips or players"
          />
        </form>
      </div>
      {/* Video Quality Selector */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-4 flex-1">
          <label className="text-xs sm:text-sm font-medium text-gray-700">Video Quality:</label>
          <select
            className="p-2 border border-gray-300 rounded bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm w-full xs:w-auto"
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
          >
            <option value="720p">High (720p)</option>
            <option value="360p">Low (360p)</option>
          </select>
        </div>
        <div className="flex flex-col xs:flex-row flex-wrap gap-2 flex-1 justify-end">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedClips.length === filteredClips.length) {
                  setSelectedClips([]); // Deselect all
                } else {
                  setSelectedClips(filteredClips.map((clip) => clip.clip)); // Select all visible
                }
              }}
              className="border-blue-300 hover:bg-blue-50 text-xs sm:text-base w-full xs:w-auto"
            >
              {selectedClips.length === filteredClips.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <Button
            variant="secondary"
            disabled={selectedClips.length === 0}
            onClick={handleDownloadSelected}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs sm:text-base w-full xs:w-auto"
          >
            📥 Download Selected
          </Button>
          <Button
            variant="default"
            disabled={selectedClips.length === 0}
            onClick={handleMergeAndDownload}
            className="bg-blue-500 text-white hover:bg-blue-600 text-xs sm:text-base w-full xs:w-auto"
          >
            🎞️ Combine & Download
          </Button>
        </div>
      </div>
      <Filters values={filterValues} onChange={handleFilterChange} clips={clips} />
      {isAdmin && selectedClips.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="destructive"
            className="text-white bg-red-500 border border-red-300 hover:bg-red-600 text-xs sm:text-base"
            onClick={deleteSelected}
          >
            Delete Selected ({selectedClips.length})
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-4 justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {filteredClips.length} item{filteredClips.length !== 1 && "s"} selected
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-700 font-medium">Items per page:</label>
          <select
            id="itemsPerPage"
            className="p-1 border border-gray-300 rounded bg-white/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 text-xs sm:text-base"
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page on change
            }}
          >
            {[6, 12, 24, 48, 100].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-4">
        {paginatedClips.map(clip => (
          <Card key={clip._id} className="relative shadow-lg hover:shadow-2xl transition-shadow bg-white/90 border-blue-100">
            {/*<a
              target='__blank'
              href={`${URL}/mockvideos/${clip.clip}`}
              className="underline text-blue-700 hover:text-blue-900 break-all"
              style={{ wordBreak: 'break-all' }}
            >
              {`${URL}/mockvideos/${clip.clip}`}
            </a>*/}
            <video controls className="w-full rounded-t-xl aspect-video bg-black min-h-[180px] sm:min-h-[220px] md:min-h-[240px]">
              <source src={`${NEW_URL}/mockvideos/${clip.clip}`} type="video/mp4" />
            </video>
            <CardContent className='relative space-y-1 pt-2'>
              <p className="font-semibold text-base sm:text-lg text-blue-900">{clip.batsman}</p>
              <p className="text-xs sm:text-sm text-gray-600">vs {clip.bowler}</p>
              <p className="text-xs sm:text-sm font-medium text-blue-600">{clip.event}</p>
              <p className="text-xs sm:text-sm text-gray-500">{clip?.commentary}</p>
              {/*<p className="font-semibold">{clip.duration}</p>*/}
              <Checkbox
                checked={selectedClips.includes(clip.clip)}
                onCheckedChange={() => toggleSelect(clip.clip)}
                className="absolute top-2 right-2 border border-blue-400 bg-white/80"
              />
              {isAdmin && (
                <div className="flex gap-2 mt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-blue-300 text-xs sm:text-base">Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <EditClipForm clip={clip} onSave={handleEditSave} />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    className='text-white bg-red-500 border border-red-300 hover:bg-red-600 text-xs sm:text-base'
                    onClick={() => handleDelete(clip)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs sm:text-base"
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
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            className="px-2 sm:px-3 py-1 text-xs sm:text-base"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-blue-900 font-semibold text-xs sm:text-base">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            className="px-2 sm:px-3 py-1 text-xs sm:text-base"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
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

function matchesWithSynonyms(clipValue, filterValue, key) {
  console.log(clipValue, filterValue, key)
  if (key == "isCleanBowled") {
    return clipValue?.toLowerCase().includes("bowled!")
  }
  if (!clipValue || !filterValue) return false;
  const normalizedClip = String(clipValue).toLowerCase();
  const normalizedFilter = String(filterValue).toLowerCase();

  // Exclusion logic for specific keys/values

  // Exclude if any exclusion phrase is present
  if (exclusionMap[key] && exclusionMap[key][filterValue]) {
    const exclusions = exclusionMap[key][filterValue];
    for (const phrase of exclusions) {
      if (normalizedClip.includes(phrase?.toLowerCase())) return false;
    }
  }

  // Whole word/phrase match
  const wordRegex = new RegExp(`\\b${normalizedFilter}\\b`, 'i');
  if (wordRegex.test(normalizedClip)) return true;

  // Synonym match (whole word/phrase)
  const synonyms = cricketSynonyms[key]?.[filterValue] || [];
  return synonyms.some(syn => {
    // Exclude if synonym is part of an exclusion phrase
    if (exclusionMap[key] && exclusionMap[key][filterValue]) {
      const exclusions = exclusionMap[key][filterValue];
      for (const phrase of exclusions) {
        if (normalizedClip.includes(phrase)) return false;
      }
    }
    const synRegex = new RegExp(`\\b${syn.toLowerCase()}\\b`, 'i');
    return synRegex.test(normalizedClip);
  });
}
