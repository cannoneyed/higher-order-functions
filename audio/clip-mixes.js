const _ = require('lodash')
const Combinatorics = require('js-combinatorics')
const addHashes = require('./add-hashes')

const { getClipsByType, makeSlug } = require('./helpers')

const maxClipInstances = 4
const maxPixelCount = 2194

module.exports.getMixes = function getMixes(bars) {
  // Iterate over all mapped bars, creating all mix slugs: each clip is mixed
  // solo, with a maximum number of instances, and then we begin creating
  // submixes:
  const mixes = {}
  const getNSlugs = () => Object.keys(mixes).length

  // Keep track of the mix's index position - we'll want the earliest added mixes to have first
  // priority to be recorded
  let index = 0
  const addClips = (slug, clips) => {
    if (!mixes[slug]) {
      mixes[slug] = { count: 0, clips: [], index }
      index++
    }

    if (mixes[slug].count < maxClipInstances) {
      mixes[slug].clips = clips
      mixes[slug].count++
    }
  }

  // Create the solo mix slugs, as well as group submix and full mix clips for each bar
  let biggestClipGroup = 0
  _.map(bars, (clips, bar) => {
    // Create the solo mix clips
    _.map(clips, clip => {
      const { name } = clip
      clip.bar = bar

      addClips(name, [clip])
    })

    if (clips.length < 2) {
      return
    }

    // Make sure we track the largest group of clips
    if (clips.length > biggestClipGroup) {
      biggestClipGroup = clips.length
    }

    // Create submix based on the entire mix
    const allClipsSlug = makeSlug(clips)
    addClips(allClipsSlug, clips)

    // Now, create submixes starting with each clip type
    const clipsByType = getClipsByType(clips)
    _.map(clipsByType, (clipGroup, type) => {
      const groupSlug = makeSlug(clipGroup)
      addClips(groupSlug, clipGroup)
    })
  })

  // Now we'll create submixes based on making combinations of n clips, starting with 1 less than
  // the clip group size and decreasing until we reach the maximum number of clips
  let n = 1
  while (getNSlugs() < maxPixelCount && n < biggestClipGroup) {
    // Iterate over each bar
    _.map(bars, (clips, bar) => {
      // Get the clips grouped by type, as well as all clips (the full submix),
      const clipsToProcess = getClipsByType(clips)
      clipsToProcess.all = clips

      // Now, iterate over each group, creating combinations of group.length-n and n+1 size,
      // adding the mix slugs to the map
      _.map(clipsToProcess, clipGroup => {
        const nLarge = clipGroup.length - n
        const nSmall = n + 1

        if (nLarge >= 2 && nLarge >= nSmall) {
          makeGroupCombinations(clipGroup, nLarge)
        }
        if (nSmall < clipGroup.length && nSmall < nLarge) {
          makeGroupCombinations(clipGroup, nSmall)
        }
      })
    })
    n++
  }

  function makeGroupCombinations(clipGroup, length) {
    const comb = Combinatorics.combination(clipGroup, length)
    let clipsCombination
    while ((clipsCombination = comb.next())) {
      const slug = makeSlug(clipsCombination)
      addClips(slug, clipsCombination)
    }
  }

  // First, sort the submixes by their index
  const sorted = _.map(mixes, (entry, slug) => {
    entry.slug = slug
    return entry
  }).sort((a, b) => {
    return a.index - b.index
  })

  // Take the array of many submixes, which may be repeated n times, and flatten those repeats into
  // individual entries
  const flattened = []
  _.map(sorted, entry => {
    if (flattened.length >= maxPixelCount) {
      return
    }
    for (let i = 0; i < entry.count; i++) {
      flattened.push(entry)
    }
  })

  // Now, assign the hash to the submix based on its index position in the output array
  const output = addHashes(flattened)

  console.log(`🍒 grouped into ${output.length} submixes`)

  return output
}
