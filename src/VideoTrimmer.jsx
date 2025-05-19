import React, { useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

export default function VideoTrimmer() {
  const [videoFile, setVideoFile] = useState(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [trimmedUrl, setTrimmedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  const loadFFmpeg = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm";
    await ffmpegRef.current.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
    });
  };

  const handleTrim = async () => {
    if (!videoFile) return;
    const ffmpeg = ffmpegRef.current;
    console.log("before input.mp4");
    if (!ffmpeg.loaded) {
      setLoading(true);
      await loadFFmpeg();
    }
    console.log("middle input.mp4");
    setLoading(true);
    ffmpeg.on("log", ({ type, message }) => {
      console.log(type, message)
    });
    await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
    console.log("input.mp4");
    await ffmpeg.exec([
      "-ss",
      `${start}`,
      "-t",
      `${end - start}`,
      "-i",
      "input.mp4",
      "-c",
      "copy",
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    const blob = new Blob([data.buffer], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    setTrimmedUrl(url);
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Trim Video</h2>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files?.[0])}
      />
      <br />
      <label>
        Start Time (seconds):
        <input
          type="number"
          value={start}
          onChange={(e) => setStart(Number(e.target.value))}
        />
      </label>
      <br />
      <label>
        End Time (seconds):
        <input
          type="number"
          value={end}
          onChange={(e) => setEnd(Number(e.target.value))}
        />
      </label>
      <br />
      <button onClick={handleTrim} disabled={loading}>
        {loading ? "Trimming..." : "Trim"}
      </button>
      <br />
      {trimmedUrl && (
        <>
          <h3>Trimmed Video:</h3>
          <video controls src={trimmedUrl} width="480" />
        </>
      )}
    </div>
  );
}

