const dismissalKeywords = {
  isLBW: ["lbw", "leg before", "trapped in front"],
  isCleanBowled: ["bowled!", "clean bowled", "chopped on", "through the gate"],
  isStumping: ["stumped", "misses and out of the crease", "quick hands"],
  isCatch: ["caught", "taken", "edge and gone", "simple catch", "nick", "snagged"],
  isRunout: ["run out", "direct hit", "unlucky", "brilliant fielding"],
}

export function inferDismissals(event, commentary) {
  const result = {
    isLBW: false,
    isCleanBowled: false,
    isStumping: false,
    isCatch: false,
    isRunout: false,
  }

  const lowerCaseCommentary = commentary.toLowerCase()

  for (const [key, phrases] of Object.entries(dismissalKeywords)) {
    if (phrases.some((phrase) => lowerCaseCommentary.includes(phrase))) {
      result[key] = true
    }
  }

  return result
}


import cricketSynonyms from "./cricket_synonyms.json";

export function filterClips(clips, filterValues, searchTerm) {
  return clips.filter((clip) => {
    return Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true;
      const clipValue = clip[key];

      // Semantic matching for shotType, direction, ballType
      if (["shotType", "direction", "ballType", "isCleanBowled"].includes(key)) {
        if (key == "isCleanBowled") {
          value = "a";
        }
        return (
          matchesWithSynonyms(clip.commentary, value, key)
        );
      }
      if (searchTerm) {
        if (clip?.commentary?.toLowerCase().includes(searchTerm)) {
          return true;
        } else {
          return false;
        }
      }
      // Keeper Catch filter logic
      if (key === 'isKeeperCatch') {
        const commentary = clip.commentary?.toLowerCase() || "";
        const keeperCatchSynonyms = cricketSynonyms.keeperCatch?.keeper_catch || [];
        const catches = keeperCatchSynonyms.some(syn =>
          commentary.includes(syn.toLowerCase())
        );
        if (clip?.event?.toLowerCase() == "wicket") {
          return catches;
        } else {
          return false;
        }
      }
      if (key === 'caughtBy') {
        let values = value?.split(" ");
        if (
          clip?.commentary?.toLowerCase().includes(`caught by ${values[1]?.toLowerCase()}`) ||
          clip?.commentary?.toLowerCase().includes(`caught by ${values[0]?.toLowerCase()}`)
        ) {
          if (clip?.batsman?.toLowerCase() == value?.toLowerCase()) {
            return false;
          }
          if (clip?.bowler?.toLowerCase() == value?.toLowerCase()) {
            return false;
          }
          return true;
        } else {
          return false;
        }
      }
      if (key === 'isWicket') return clip.event === 'WICKET';
      if (key === 'isFour') return clip.event.includes('FOUR');
      if (key === 'isSix') return clip.event === 'SIX';
      if (key === 'isLofted') {
        if (!value) return true;
        const comm = clip.commentary?.toLowerCase() || "";
        const shotType = clip.shotType?.toLowerCase() || "";
        const loftedSynonyms = cricketSynonyms.shotType?.lofted || [];
        return (
          loftedSynonyms.some(syn => comm.includes(syn) || shotType.includes(syn))
        );
      }
      if (key === 'isGrounded') {
        if (!value) return true;
        const comm = clip.commentary?.toLowerCase() || "";
        const shotType = clip.shotType?.toLowerCase() || "";
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
        const loftedSynonyms = cricketSynonyms.shotType?.lofted || [];
        return (
          groundedSynonyms.some(syn => comm.includes(syn) || shotType.includes(syn)) ||
          !loftedSynonyms.some(syn => comm.includes(syn) || shotType.includes(syn))
        );
      }
      if (key === 'durationRange') {
        const duration = clip.duration;
        if (value === '0-2') return duration >= 0 && duration < 2;
        if (value === '2-5') return duration >= 2 && duration < 5;
        if (value === '5-10') return duration >= 5 && duration < 10;
        if (value === '10+') return duration >= 10;
        return true;
      }
      if (key === 'runOutBy') {
        if (!filterValues.isRunout) return true;
        let values = value?.split(" ");
        const runOutByValue = values[1]?.toLowerCase();
        if (clip.commentary?.toLowerCase().includes(`direct hit by ${runOutByValue}`)) return true;
        if (clip.commentary?.toLowerCase().includes(`direct-hit from ${runOutByValue}`)) return true;
        return false;
      }
      if (key === 'isDropped') {
        return clip.event?.includes('DROPPED');
      }
      if (key === 'droppedBy') {
        if (!filterValues.isDropped) return true;
        const droppedByValue = value?.split(" ")?.[0]?.toLowerCase();
        const droppedByValue2 = value?.split(" ")?.[1]?.toLowerCase();
        if (clip.commentary?.toLowerCase().includes(`${droppedByValue}`)) return true;
        if (clip.commentary?.toLowerCase().includes(droppedByValue)) return true;
        if (clip.commentary?.toLowerCase().includes(`${droppedByValue2}`)) return true;
        if (clip.commentary?.toLowerCase().includes(droppedByValue2)) return true;
        return false;
      }
      // Default: string includes (case-insensitive)
      return clipValue && String(clipValue).toLowerCase().includes(String(value).toLowerCase());
    });
  });
}

// Dummy implementation for matchesWithSynonyms, replace with your actual logic
function matchesWithSynonyms(commentary, value, key) {
  if (!commentary || !value) return false;
  return commentary.toLowerCase().includes(String(value).toLowerCase());
}