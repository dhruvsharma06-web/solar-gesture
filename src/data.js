// All sizes/distances are scaled for viewing, not to true scale.
// period: days (planets/moons) · secs: seconds per orbit on screen (satellites)

export const SUN = {
  name: 'The Sun', kind: 'Star', r: 16,
  info: 'A 4.6-billion-year-old star holding 99.8% of the solar system\'s mass.',
  facts: ['5,500 °C surface', '1.39 million km wide', '8 min light-travel to Earth'],
};

export const PLANETS = [
  { name: 'Mercury', r: 1.4, d: 34, period: 88, tex: 'mercury', color: 0x9a9088,
    info: 'The smallest planet. Days swing from 430 °C to −180 °C.', facts: ['88-day year', '0 moons', '4,879 km wide'] },
  { name: 'Venus', r: 2.4, d: 50, period: 225, tex: 'venus', color: 0xe8c98a,
    info: 'Wrapped in toxic CO₂ clouds, it is the hottest planet in the solar system.', facts: ['465 °C surface', 'Spins backwards', '0 moons'] },
  { name: 'Earth', r: 2.8, d: 70, period: 365, tex: 'earth', color: 0x4c8dff, tilt: 0.41, atmosphere: 0x4da3ff,
    info: 'Our home. One Moon and thousands of active satellites circling overhead.', facts: ['1 moon', '12,742 km wide', '71% ocean'],
    moons: [
      { name: 'The Moon', r: 0.75, d: 7, period: 27.3, tex: 'moon', info: 'Earth\'s only natural satellite, 384,400 km away. Twelve people have walked on it.' },
    ],
    sats: [
      { name: 'ISS', d: 3.15, secs: 24, incl: 0.9, color: 0xffcc33, big: 1.4, info: 'International Space Station, about 420 km up. It circles Earth every 92 minutes.' },
      { name: 'Tiangong', d: 3.12, secs: 23, incl: 0.72, color: 0xff5555, info: 'China\'s space station, orbiting about 390 km above Earth.' },
      { name: 'Hubble', d: 3.25, secs: 26, incl: 0.5, color: 0x66ccff, info: 'Hubble Space Telescope, about 540 km up and observing since 1990.' },
      { name: 'Starlink', d: 3.2, secs: 25, incl: 0.93, color: 0xeeeeee, info: 'SpaceX internet megaconstellation, thousands of satellites at about 550 km.' },
      { name: 'Landsat 9', d: 3.35, secs: 27, incl: 1.71, color: 0x99ff66, info: 'Polar-orbiting Earth imager at about 705 km, mapping forests, crops and cities.' },
      { name: 'GPS', d: 4.6, secs: 40, incl: 0.96, color: 0x88ff88, info: 'Navigation constellation about 20,200 km up. It circles Earth twice a day.' },
      { name: 'NavIC', d: 5.4, secs: 60, incl: 0.5, color: 0xff9933, info: 'ISRO\'s Indian regional navigation system, about 36,000 km up.' },
      { name: 'Geostationary Sat', d: 5.5, secs: 60, incl: 0, color: 0xff66aa, info: 'At 35,786 km it orbits once a day, so it hovers over one spot on Earth.' },
      { name: 'Chandrayaan-2', d: 6.6, secs: 45, incl: 1.55, color: 0xffbb33, big: 1.2, info: 'ISRO\'s lunar orbiter, mapping the Moon since 2019.' },
      { name: 'James Webb', d: 10, secs: 120, incl: 0.15, color: 0xffd700, big: 2, info: 'JWST sits 1.5 million km away at the L2 point, seeing the first galaxies.' },
    ] },
  { name: 'Mars', r: 1.9, d: 92, period: 687, tex: 'mars', color: 0xd0703f, tilt: 0.44,
    info: 'The red planet, home to Olympus Mons, the tallest volcano in the solar system.', facts: ['2 moons', '−63 °C average', '687-day year'],
    moons: [
      { name: 'Phobos', r: 0.28, d: 3.4, period: 4, tex: 'rock', info: 'A lumpy moon spiralling toward Mars. It will break apart in about 50 million years.' },
      { name: 'Deimos', r: 0.2, d: 4.8, period: 6, tex: 'rock', info: 'Mars\'s smaller, outer moon, only 12 km across.' },
    ],
    sats: [
      { name: 'Mars Recon Orbiter', d: 2.3, secs: 22, incl: 1.5, color: 0xffaa55, big: 3, info: 'NASA MRO. Its HiRISE camera can spot objects the size of a desk on Mars.' },
      { name: 'MAVEN', d: 2.9, secs: 30, incl: 1.3, color: 0x66aaff, big: 3, info: 'NASA MAVEN studies how Mars lost its atmosphere to space.' },
    ] },
  { name: 'Jupiter', r: 8, d: 140, period: 4333, tex: 'jupiter', color: 0xd8b48a,
    info: 'The giant. 1,300 Earths would fit inside, and the Great Red Spot is a storm wider than Earth.', facts: ['90+ moons', '11× Earth\'s width', '10-hour day'],
    moons: [
      { name: 'Io', r: 0.95, d: 12, period: 5, tex: 'io', info: 'The most volcanic world known, with over 400 active volcanoes.' },
      { name: 'Europa', r: 0.85, d: 15, period: 7, tex: 'europa', info: 'An ice shell over a global ocean, one of the best places to search for life.' },
      { name: 'Ganymede', r: 1.3, d: 19, period: 10, tex: 'ice', info: 'The largest moon in the solar system, bigger than Mercury.' },
      { name: 'Callisto', r: 1.2, d: 24, period: 14, tex: 'rock', info: 'A heavily cratered surface about 4 billion years old.' },
    ],
    sats: [{ name: 'Juno', d: 10.5, secs: 30, incl: 1.4, color: 0x55ffdd, big: 2.5, info: 'NASA Juno, in a polar orbit, looks beneath Jupiter\'s clouds.' }] },
  { name: 'Saturn', r: 7, d: 190, period: 10759, tex: 'saturn', color: 0xe8d4a2, tilt: 0.47, rings: true,
    info: 'The jewel of the solar system. Its rings span 280,000 km but are only about 10 m thick.', facts: ['270+ known moons', 'Less dense than water', '29-year orbit'],
    moons: [
      { name: 'Titan', r: 1.25, d: 20, period: 12, tex: 'titan', info: 'The only moon with a thick atmosphere, with lakes of liquid methane.' },
      { name: 'Enceladus', r: 0.4, d: 17.5, period: 4, tex: 'ice', info: 'Sprays water geysers from a hidden ocean out into space.' },
    ],
    sats: [{ name: 'Cassini', d: 12, secs: 30, incl: 0.3, color: 0xffff88, big: 2.5, info: 'NASA/ESA Cassini explored Saturn for 13 years and ended its mission in 2017.' }] },
  { name: 'Uranus', r: 4.4, d: 235, period: 30687, tex: 'uranus', color: 0x9fe0e8, tilt: 1.71,
    info: 'An ice giant knocked on its side. Each pole gets 42 years of sunlight, then 42 of darkness.', facts: ['25+ moons', '98° tilt', '84-year orbit'],
    moons: [{ name: 'Titania', r: 0.55, d: 8, period: 8, tex: 'ice', info: 'The largest moon of Uranus, scarred by huge canyons.' }] },
  { name: 'Neptune', r: 4.3, d: 275, period: 60190, tex: 'neptune', color: 0x4a6fe8, tilt: 0.49,
    info: 'The windiest world, with supersonic storms of 2,000 km/h.', facts: ['15+ moons', '165-year orbit', '−214 °C'],
    moons: [{ name: 'Triton', r: 0.65, d: 8, period: -7, tex: 'ice', info: 'It orbits backwards, so it is probably a captured dwarf planet.' }] },
];
