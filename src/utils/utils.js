const dismissalKeywords = {
  isLBW: ["lbw", "leg before", "trapped in front"],
  isCleanBowled: ["bowled", "clean bowled", "chopped on", "through the gate"],
  isStumping: ["stumped", "misses and out of the crease", "quick hands"],
  isCatch: ["caught", "taken", "edge and gone", "simple catch", "nick", "snagged"],
  isRunout: ["run out", "direct hit", "unlucky", "brilliant fielding"],
}

export function inferDismissals(event,commentary) {
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
