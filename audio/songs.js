module.exports = [
  {
    title: 'higher order',
    index: '01',
    bpm: 126,
  },
  {
    title: 'hearts',
    index: '02',
    bpm: 124,
  },
  {
    title: 'ants army',
    index: '03',
    bpm: 128,
  },
  {
    title: 'frog song',
    index: '04',
    bpm: bar => (bar < 81 ? 128 : 120),
  },
  {
    title: 'functions',
    index: '05',
    bpm: 108,
  },
  {
    title: 'hush',
    index: '06',
    bpm: 115,
  },
  {
    title: 'inner planets',
    index: '07',
    bpm: 128,
  },
  {
    title: 'from the stars',
    index: '08',
    bpm: 128,
  },
  {
    title: 'level 9',
    index: '09',
    bpm: 140,
  },
  {
    title: 'never never',
    index: '10',
    bpm: 116,
  },
  {
    title: 'radio hanoi',
    index: '11',
    bpm: 90,
  },
  {
    title: 'sayonara princess',
    index: '12',
    bpm: bar => (bar < 97 ? 128 : 120),
  },
  {
    title: 'vs',
    index: '13',
    bpm: 122,
    beats: 5,
  },
  {
    title: 'sweetlights',
    index: '14',
    bpm: 126,
  },
]
