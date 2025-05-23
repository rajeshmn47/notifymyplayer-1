import React from 'react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">About Cricket Clips Dashboard</h1>
      <p className="text-gray-700 text-lg">
        Cricket Clips Dashboard is a powerful tool designed for cricket analysts, content creators, fans, and developers. Our platform helps you view, filter, manage, and download short cricket video highlights, enabling fast access to impactful moments like sixes, wickets, and signature shots.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800">Key Features</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>🎯 Advanced filters for events, shot types, durations, and player names.</li>
        <li>📽️ Preview and trim videos easily within the dashboard.</li>
        <li>🧠 AI tagging & semantic search for shot detection and commentary matching.</li>
        <li>🖥️ Admin controls for bulk delete, edit, and video quality settings (360p, 480p, HD).</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-800">Who Is It For?</h2>
      <p className="text-gray-700 text-lg">
        Whether you're a YouTuber, cricket strategist, fantasy league developer, or a fan creating montages, our dashboard provides you with a rich, searchable database of high-quality cricket moments.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800">Why Use It?</h2>
      <p className="text-gray-700 text-lg">
        Forget long match rewatches. With our intelligent clip system, you can instantly access every hook shot, cover drive, or dismissal—categorized, compressed, and ready for download or sharing.
      </p>

      <h2 className="text-2xl font-semibold text-gray-800">Get in Touch</h2>
      <p className="text-gray-700 text-lg">
        Have feedback, partnership ideas, or want to integrate your own clips? Reach out to us at <a href="mailto:support@cricketclips.ai" className="text-blue-600 underline">support@cricketclips.ai</a>
      </p>
    </div>
  );
}
