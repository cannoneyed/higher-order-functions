module.exports = [
  {
    title: 'higher order',
    index: '01',
    bpm: 126,
    prefix: '0',
  },
  {
    title: 'hearts',
    index: '02',
    bpm: 124,
    prefix: '1',
  },
  {
    title: 'ants army',
    index: '03',
    bpm: 128,
    prefix: '2',
  },
  {
    title: 'frog song',
    index: '04',
    bpm: bar => (bar < 81 ? 128 : 120),
    prefix: '3',
  },
  {
    title: 'functions',
    index: '05',
    bpm: 108,
    prefix: '4',
  },
  {
    title: 'hush',
    index: '06',
    bpm: 115,
    prefix: '5',
  },
  {
    title: 'inner planets',
    index: '07',
    bpm: 128,
    prefix: '6',
  },
  {
    title: 'from the stars',
    index: '08',
    bpm: 128,
    prefix: '8',
  },
  {
    title: 'level 9',
    index: '09',
    bpm: 140,
    prefix: '7',
    offset: 238, // There are 238 submixes for Inner Planets, with which Level 9 shares a color
  },
  {
    title: 'never never',
    index: '10',
    bpm: 116,
    prefix: '9',
  },
  {
    title: 'radio hanoi',
    index: '11',
    bpm: 90,
    prefix: 'A',
  },
  {
    title: 'sayonara princess',
    index: '12',
    bpm: bar => (bar < 97 ? 128 : 120),
    prefix: 'B',
  },
  {
    title: 'vs',
    index: '13',
    bpm: 122,
    beats: 5,
    prefix: 'C',
  },
  {
    title: 'sweetlights',
    index: '14',
    bpm: 126,
    prefix: 'D',
  },
]
