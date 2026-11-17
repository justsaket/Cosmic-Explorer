import { ScientificDiscovery } from '../types';

export const ACTIVE_SURFACE_DISCOVERIES: ScientificDiscovery[] = [];

export const SCIENTIFIC_DISCOVERIES: ScientificDiscovery[] = [
  // ==========================================
  // MOON DISCOVERIES (8 Records)
  // ==========================================
  {
    id: 'lunar_apollo11_descent',
    name: 'Apollo 11 Lunar Module Descent Stage',
    planetId: 'moon',
    category: 'exploration',
    coordinates: [0, 0, 0],
    headline: 'Humanity\'s First Footprint on Another Celestial World (1969)',
    whatIsIt: 'The lower octagonal chassis of the Apollo 11 Lunar Module "Eagle", which touched down at Mare Tranquillitatis on July 20, 1969.',
    howItWorks: 'It served as a variable-thrust descent rocket and launchpad platform for the ascent stage that returned astronauts Neil Armstrong and Buzz Aldrin to lunar orbit.',
    whatScientistsLearned: 'Proved humans could safely maneuver, land, conduct field geology, and return safely from the lunar surface.',
    whyItMatters: 'Marks the inaugural interplanetary milestone of human civilization and established the baseline for long-duration extraterrestrial exploration.',
    simpleExplanation: 'This is the bottom part of the Apollo 11 spaceship. When astronauts Neil Armstrong and Buzz Aldrin landed on the Moon in 1969, they left this base behind as a launchpad to fly back home!',
    detailedExplanation: 'Constructed by Grumman Aerospace, the Apollo 11 Lunar Module Descent Stage utilised hypergolic propellants (Aerozine 50 and Nitrogen Tetroxide) with a throttleable descent engine. Its four legs incorporated crushable aluminum honeycomb cartridges for shock attenuation upon contact with lunar regolith.',
    audioTranscriptEn: 'You are standing before the Apollo 11 Lunar Module Descent Stage. On July 20th, 1969, Neil Armstrong and Buzz Aldrin touched down at the Sea of Tranquility, leaving this historic platform permanently resting on the lunar regolith.',
    audioTranscriptHi: 'आप अपोलो 11 लूनर मॉड्यूल डिसेंट स्टेज के सामने खड़े हैं। 20 जुलाई 1969 को नील आर्मस्ट्रांग और बज़ एल्ड्रिन चंद्रमा के ट्रैकिलिटी सागर में उतरे थे, और यह ऐतिहासिक मंच हमेशा के लिए यहीं स्थापित है।',
    sources: [
      {
        title: 'Apollo 11 Lunar Module / EASEP',
        publisher: 'NASA Space Science Data Coordinated Archive',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
        missionOrProgram: 'Apollo Program'
      },
      {
        title: 'Apollo 11 Landing Site - LROC',
        publisher: 'Lunar Reconnaissance Orbiter Camera (ASU / NASA)',
        url: 'https://www.lroc.asu.edu/featured_sites/view_site/4',
        missionOrProgram: 'LRO'
      }
    ],
    modelType: 'apollo_descent',
    rarity: 'Pivotal'
  },
  {
    id: 'lunar_laser_reflector',
    name: 'Lunar Laser Ranging Retroreflector Array',
    planetId: 'moon',
    category: 'technology',
    coordinates: [18, 0, -12],
    headline: 'Millimeter-Precision Measurement of the Earth-Moon Distance',
    whatIsIt: 'An array of 100 high-precision fused silica corner-cube prisms placed on the Moon by Apollo 11 astronauts.',
    howItWorks: 'Observatories on Earth fire short laser pulses at the reflector. By timing the two-way transit time of the photons at the speed of light, scientists measure the Moon\'s distance down to millimeter precision.',
    whatScientistsLearned: 'Confirmed that the Moon is spiraling away from Earth at 3.8 cm per year due to tidal friction, and validated Einstein\'s General Theory of Relativity to unprecedented precision.',
    whyItMatters: 'It remains the only Apollo experiment still actively collecting scientific data more than 50 years after deployment, requiring zero electrical power.',
    simpleExplanation: 'This special glass mirror bounces laser beams fired from Earth right back to where they started. By timing how long the light takes to bounce back, scientists know the Moon is moving away by about 3.8 centimeters every year!',
    detailedExplanation: 'The retroreflector array operates purely passively via total internal reflection across three mutually orthogonal surfaces. High-precision laser timing across decades has mapped the lunar core-mantle boundary and placed stringent bounds on the Equivalence Principle and gravitational constant constancy.',
    audioTranscriptEn: 'This is the Lunar Laser Ranging Retroreflector. Earth observatories still fire laser beams at these corner-cube prisms. The photons bounce right back, proving the Moon drifts away from Earth at 3.8 centimeters every year.',
    audioTranscriptHi: 'यह लूनर लेजर रेंजिंग रेट्रोरिफ्लेक्टर है। पृथ्वी की वेधशालाएं आज भी इन प्रिज्मों पर लेजर बीम दागती हैं। इससे साबित हुआ है कि चंद्रमा हर साल 3.8 सेंटीमीटर दूर खिसक रहा है।',
    sources: [
      {
        title: 'Laser Ranging Retroreflector',
        publisher: 'Lunar and Planetary Institute',
        url: 'https://www.lpi.usra.edu/lunar/missions/apollo/apollo_11/experiments/lrr/',
        missionOrProgram: 'Apollo 11 Science Experiments'
      }
    ],
    modelType: 'laser_reflector',
    rarity: 'Rare'
  },
  {
    id: 'lunar_regolith_sample',
    name: 'Impact-Shattered Lunar Regolith & Breccia',
    planetId: 'moon',
    category: 'geology',
    coordinates: [-22, 0, 15],
    headline: 'Glassy, Micro-Meteorite Pulverized Lunar Surface Material',
    whatIsIt: 'A fragment of lunar soil (regolith) formed over billions of years of intense micrometeorite impacts without water or weather.',
    howItWorks: 'Because the Moon lacks an atmosphere, cosmic space rocks strike the bedrock at hypervelocity, shattering basalt into jagged, razor-sharp particles with molten impact glass droplets.',
    whatScientistsLearned: 'Apollo and Chang\'e samples demonstrated that regolith is rich in iron, titanium, and oxygen trapped inside silicate minerals, along with implanted solar wind helium-3.',
    whyItMatters: 'Essential for In-Situ Resource Utilization (ISRU) for Artemis astronauts, who can extract oxygen for breathing and rocket fuel directly from the soil.',
    simpleExplanation: 'Moon dirt is called regolith! Unlike sand on Earth which is rounded by ocean waves, moon dirt is sharp and jagged because tiny space rocks have smashed into it without wind or rain to smooth it down.',
    detailedExplanation: 'Lunar regolith typically possesses a median grain size of 70 micrometers with agglutinates formed by impact melting. Free from terrestrial chemical weathering, it retains primordial isotopic records and presents significant mechanical abrasive challenges for astronaut spacesuits and seals.',
    audioTranscriptEn: 'Examine this lunar regolith specimen. Formed by relentless micro-meteorite strikes over billions of years, it is sharp, glassy, and rich in oxygen locked inside silicate minerals.',
    audioTranscriptHi: 'इस चंद्र रेगोलिथ नमूने को देखें। अरबों वर्षों के उल्कापिंडों के प्रभाव से बनी यह मिट्टी कांच जैसी नुकीली है और इसमें ऑक्सीजन प्रचुर मात्रा में समाई है।',
    sources: [
      {
        title: 'The Lunar Regolith',
        publisher: 'NASA Lunar Sourcebook',
        url: 'https://curator.jsc.nasa.gov/lunar/letss/regolith.pdf',
        missionOrProgram: 'NASA Curation'
      }
    ],
    modelType: 'lunar_regolith',
    rarity: 'Common'
  },
  {
    id: 'lunar_crater_rim',
    name: 'Tycho Impact Crater Ejecta Rim',
    planetId: 'moon',
    category: 'geology',
    coordinates: [35, 0, 25],
    headline: 'Exhumed Deep Crustal Rocks from a 108-Million-Year-Old Impact',
    whatIsIt: 'The raised, chaotic rim of a prominent lunar impact crater, displaying exposed layers of anorthosite crust.',
    howItWorks: 'Kinetic energy from a speeding asteroid impact vaporized projectile material and forcefully overturned the upper kilometers of lunar crust, casting radiant bright rays across thousands of kilometers.',
    whatScientistsLearned: 'Provides a pristine cross-section of deep lunar anorthosite bedrock that formed during the primordial "magma ocean" era 4.5 billion years ago.',
    whyItMatters: 'Calibrates crater-counting chronologies across the entire solar system, allowing scientists to date surface ages on Mercury, Mars, and asteroid belts.',
    simpleExplanation: 'When an asteroid hit the Moon, it blasted a gigantic hole and threw out layers of deep underground rock onto this rim. Looking at these rocks lets us peer deep inside the Moon without digging!',
    detailedExplanation: 'Impact cratering is the dominant geological modification mechanism on airless bodies. The excavation stage inverts pre-existing stratigraphy along the rim, while subsequent central peak rebound brings upper-mantle or lower-crust materials upward into accessible surface exposure.',
    audioTranscriptEn: 'Standing on the crater rim, you observe deep crustal rock thrown upward during an ancient cosmic collision. Impact cratering reveals planetary interiors without requiring deep drilling.',
    audioTranscriptHi: 'क्रेटर के किनारे पर खड़े होकर, आप एक प्राचीन ब्रह्मांडीय टक्कर के दौरान ऊपर फेंकी गई गहरी चट्टानों को देख सकते हैं। गड्ढों के अध्ययन से हम बिना खुदाई किए ग्रहों के अंदरूनी रहस्य जान पाते हैं।',
    sources: [
      {
        title: 'Tycho Crater - Spectacular Lunar Landmark',
        publisher: 'NASA Goddard / LRO',
        url: 'https://www.nasa.gov/mission_pages/LRO/multimedia/lroimages/lroc-20110630-tycho.html',
        missionOrProgram: 'Lunar Reconnaissance Orbiter'
      }
    ],
    modelType: 'crater_rim',
    rarity: 'Common'
  },
  {
    id: 'lunar_water_ice',
    name: 'Permanently Shadowed Crater Cold Trap',
    planetId: 'moon',
    category: 'astrobiology',
    coordinates: [-30, 0, -32],
    headline: 'Cryogenic Water Ice Deposits at the Lunar South Pole',
    whatIsIt: 'Volatile deposits of water ice conserved in perpetual darkness inside deep craters near the lunar poles, where temperatures drop below -240°C.',
    howItWorks: 'Due to the Moon\'s very slight 1.5° axial tilt, low-elevation floors of polar craters never see direct sunlight. Water delivered by comets and solar wind stays trapped in these thermal cold traps for billions of years.',
    whatScientistsLearned: 'LCROSS and Mini-SAR data confirmed over 600 million metric tons of water ice mixed with regolith at the lunar poles.',
    whyItMatters: 'Water is the lifeblood of deep space exploration. It can be purified into drinking water and split into liquid hydrogen and oxygen for rocket propellants.',
    simpleExplanation: 'Deep inside craters near the Moon\'s South Pole, the sun never shines! In the freezing cold of -240°C, billions of tons of water ice delivered by icy comets have stayed frozen for billions of years.',
    detailedExplanation: 'Identified definitively by NASA\'s LCROSS impact mission and the Moon Mineralogy Mapper (M3), these cryogenic volatile deposits include H2O, CO, NH3, and light hydrocarbons. They constitute the strategic backbone for sustainable infrastructure under the Artemis Base Camp initiative.',
    audioTranscriptEn: 'You have located a permanently shadowed cold trap. Inside these dark polar craters, sunlight never reaches the floor, preserving ancient comet water ice that will fuel humanity\'s journey to Mars.',
    audioTranscriptHi: 'आपने चंद्रमा पर बर्फ का स्थायी भंडार खोज लिया है। इन अंधेरे ध्रुवीय गड्ढों में धूप कभी नहीं पहुंचती, जिससे प्राचीन धूमकेतुओं का पानी सुरक्षित है जो भविष्य के अंतरिक्ष मिशनों को ईंधन देगा।',
    sources: [
      {
        title: 'Water on the Moon: LCROSS Mission Results',
        publisher: 'NASA Ames Research Center',
        url: 'https://www.nasa.gov/mission_pages/LCROSS/main/index.html',
        missionOrProgram: 'LCROSS'
      }
    ],
    modelType: 'water_ice_depot',
    rarity: 'Pivotal'
  },
  {
    id: 'lunar_seismometer',
    name: 'Apollo Passive Seismic Experiment Station',
    planetId: 'moon',
    category: 'technology',
    coordinates: [10, 0, 30],
    headline: 'Listening to Deep Moonquakes and Meteoroid Shocks',
    whatIsIt: 'A geophysical seismic station deployed by astronauts to record vibrations traveling through the lunar interior.',
    howItWorks: 'Sensitive spring-mass pendulums measure tiny ground displacements caused by gravitational tidal forces from Earth, thermal expansions, and deep meteorite impacts.',
    whatScientistsLearned: 'Revealed that the Moon has a solid inner core of iron, a fluid outer metallic core, a thick mantle, and a crust 30 to 40 km thick.',
    whyItMatters: 'Demonstrated that the Moon possesses a differentiated interior structure akin to Earth, supporting the Giant Impact Hypothesis for the Moon\'s formation.',
    simpleExplanation: 'This instrument is a Moonquake detector! Apollo astronauts placed it here to listen to rumbles inside the Moon, proving the Moon has its own core and mantle just like Earth.',
    detailedExplanation: 'Apollo seismic data cataloged four distinct moonquake classes: deep moonquakes (~700 km depth induced by Earth\'s tidal pull), shallow tectonic moonquakes (up to magnitude 5.5), thermal diurnal cracking, and artificial/meteoroid impacts. The absence of liquid water causes seismic waves to ring for hours with minimal attenuation.',
    audioTranscriptEn: 'This is an Apollo seismic station. By recording deep moonquakes, it allowed geophysicists to map the core, mantle, and crust of the Moon, proving our celestial neighbor is layered inside just like Earth.',
    audioTranscriptHi: 'यह अपोलो सीस्मोग्राफ स्टेशन है। गहरे चंद्रकंपों को रिकॉर्ड करके, इसने वैज्ञानिकों को चंद्रमा के कोर, मेंटल और क्रस्ट की आंतरिक परतों का नक्शा बनाने में मदद की।',
    sources: [
      {
        title: 'Apollo Passive Seismic Experiment',
        publisher: 'Lunar and Planetary Institute',
        url: 'https://www.lpi.usra.edu/lunar/missions/apollo/apollo_12/experiments/pse/',
        missionOrProgram: 'Apollo ALSEP'
      }
    ],
    modelType: 'lunar_seismometer',
    rarity: 'Rare'
  },
  {
    id: 'lunar_lava_tube',
    name: 'Marius Hills Lava Tube Skylight Collapse',
    planetId: 'moon',
    category: 'geology',
    coordinates: [-38, 0, 5],
    headline: 'Subterranean Cavern for Future Astronaut Habitats',
    whatIsIt: 'A steep-sided collapse pit opening into a massive underground lava conduit formed by ancient volcanic flows.',
    howItWorks: 'Billions of years ago, voluminous rivers of basaltic lava flowed across lunar plains. As the outer crust cooled and solidified into a roof, the molten lava drained out, leaving behind a stable subterranean hollow tunnel.',
    whatScientistsLearned: 'Radar data from the JAXA SELENE (Kaguya) orbiter and NASA LRO showed these tubes span hundreds of meters in diameter—large enough to house entire cities.',
    whyItMatters: 'Naturally shields human explorers from micrometeorites, intense solar cosmic radiation, and brutal 250°C surface temperature swings.',
    simpleExplanation: 'Ancient volcanic lava rivers left behind hollow underground tunnels called lava tubes! This hole is a natural skylight into a cavern big enough to protect human astronaut bases from space radiation.',
    detailedExplanation: 'Because lunar gravity is one-sixth that of Earth, lava tubes can mechanically support widths of several hundred meters without structural collapse. Gravitational anomalies confirmed thick intact basaltic roofs capable of attenuating galactic cosmic rays (GCRs) and solar particle events (SPEs).',
    audioTranscriptEn: 'Before you is a lava tube skylight. When ancient basalt drained away, it carved vast subterranean chambers. These caverns provide natural shielding against harsh space radiation for future lunar colonists.',
    audioTranscriptHi: 'आपके सामने एक लावा ट्यूब का प्रवेश द्वार है। प्राचीन समय में लावा बहने के बाद बनी ये गुफाएं अंतरिक्ष विकिरण से बचने के लिए भविष्य के मानव ठिकानों के लिए आदर्श हैं।',
    sources: [
      {
        title: 'Lunar Lava Tubes Might Be Sturdy Enough to House Cities',
        publisher: 'Purdue University / NASA',
        url: 'https://www.purdue.edu/newsroom/releases/2015/Q1/lunar-lava-tubes-might-be-sturdy-enough-to-house-cities.html',
        missionOrProgram: 'GRAIL / LRO'
      }
    ],
    modelType: 'lava_tube_skylight',
    rarity: 'Rare'
  },
  {
    id: 'lunar_orange_soil',
    name: 'Shorty Crater Pyroclastic Orange Glass',
    planetId: 'moon',
    category: 'geology',
    coordinates: [24, 0, -28],
    headline: 'Explosive Volcanic Fire Fountains of Early Moon History',
    whatIsIt: 'Microscopic volcanic glass beads found by Apollo 17 astronaut Harrison Schmitt, glowing with distinctive orange-tinted minerals.',
    howItWorks: 'Magma rich in volatile gases erupted in violent fire fountains 3.6 billion years ago. Molten droplets sprayed into the lunar vacuum and rapidly quenched into volcanic glass before crystallizing.',
    whatScientistsLearned: 'Recent ion-microprobe testing detected trace water molecules (up to 1,200 ppm) inside these beads, proving the early lunar interior was not completely dry as once believed.',
    whyItMatters: 'Overturned 40 years of scientific consensus, revolutionizing theories on lunar formation and volatile distribution.',
    simpleExplanation: 'Astronauts discovered surprising orange dirt on the Moon! It turned out to be tiny glass beads sprayed out of an explosive volcanic fire fountain billions of years ago, containing trapped ancient water molecules.',
    detailedExplanation: 'Discovered during Apollo 17 at Shorty Crater, sample 74220 consists of titanium-rich basaltic pyroclastic glass droplets. High-sensitivity secondary ion mass spectrometry (SIMS) published in 2008 detected water within the melt inclusions, challenging anhydrous models of the proto-lunar disk.',
    audioTranscriptEn: 'You have identified the famous Apollo 17 orange volcanic glass. Erupted by ancient fire fountains, modern laboratory analysis found water trapped inside these beads, revolutionizing lunar science.',
    audioTranscriptHi: 'आपने अपोलो 17 की प्रसिद्ध नारंगी ज्वालामुखीय कांच की खोज की है। अरबों साल पहले ज्वालामुखी से निकले इन कांच के मोतियों में पानी के अंश पाए गए, जिसने चंद्र विज्ञान को बदल दिया।',
    sources: [
      {
        title: 'Evidence for Water in the Lunar Interior from Pyroclastic Glasses',
        publisher: 'Nature / NASA Astrobiology',
        url: 'https://www.nature.com/articles/nature07047',
        missionOrProgram: 'Apollo 17 Sample Analysis'
      }
    ],
    modelType: 'orange_soil',
    rarity: 'Rare'
  },

  // ==========================================
  // MARS DISCOVERIES (8 Records)
  // ==========================================
  {
    id: 'mars_perseverance_rover',
    name: 'Perseverance Mars 2020 Rover & Mastcam-Z',
    planetId: 'mars',
    category: 'technology',
    coordinates: [0, 0, 0],
    headline: 'NASA\'s Premier Astrobiology Field Geologist in Jezero Crater',
    whatIsIt: 'A 1,025-kilogram car-sized robotic explorer operating on the Martian surface since landing via sky crane on February 18, 2021.',
    howItWorks: 'Powered by a Multi-Mission Radioisotope Thermoelectric Generator (MMRTG), it uses drill corers, spectrometers (PIXL, SHERLOC), radar (RIMFAX), and multispectral cameras to investigate biosignatures.',
    whatScientistsLearned: 'Collected over 20 hermetically sealed rock cores exhibiting biosignature candidate minerals, organic carbon compounds, and ancient river sedimentation.',
    whyItMatters: 'Prepares the first samples from another planet for retrieval and return to Earth via the international Mars Sample Return campaign.',
    simpleExplanation: 'Perseverance is a robotic scientist on wheels! It drives across Mars drilling rock samples and looking for signs of tiny ancient microbial life that might have lived in lakes billions of years ago.',
    detailedExplanation: 'Perseverance carries seven cutting-edge scientific instruments and the Ingenuity helicopter scout. Its primary mission targets the Jezero delta to acquire astrobiologically relevant samples, test in-situ oxygen generation via MOXIE, and characterize environmental dust conditions for future human exploration.',
    audioTranscriptEn: 'Standing before the Perseverance rover, you are looking at NASA\'s most advanced planetary robot. It is currently drilling rock cores in Jezero Crater that will be brought back to Earth to search for ancient life.',
    audioTranscriptHi: 'आप पर्सिवियरेंस रोवर के सामने खड़े हैं, जो नासा का सबसे आधुनिक रोबोट है। यह जेज़ेरो क्रेटर में चट्टानों के नमूने ड्रिल कर रहा है जिन्हें पृथ्वी पर लाकर प्राचीन जीवन के संकेतों की जांच की जाएगी।',
    sources: [
      {
        title: 'Mars 2020 Perseverance Rover Overview',
        publisher: 'NASA Jet Propulsion Laboratory',
        url: 'https://mars.nasa.gov/mars2020/',
        missionOrProgram: 'Mars 2020'
      },
      {
        title: 'Mars 2020 Science Instruments',
        publisher: 'NASA Science',
        url: 'https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/',
        missionOrProgram: 'Mars 2020'
      }
    ],
    modelType: 'perseverance_rover',
    rarity: 'Pivotal'
  },
  {
    id: 'mars_jezero_delta',
    name: 'Jezero Ancient River Delta Deposit',
    planetId: 'mars',
    category: 'geology',
    coordinates: [20, 0, 16],
    headline: 'Fan-Shaped Sedimentary Evidence of a 3.7-Billion-Year-Old Paleolake',
    whatIsIt: 'A preserved geological delta where a catastrophic ancient river emptied into a deep, crater-filling lake approximately 3.7 billion years ago.',
    howItWorks: 'Flowing water transported sediments down Neretva Vallis. As the river met the standing water of Lake Jezero, its velocity plummeted, depositing mud, clay, and sand in stratified layers.',
    whatScientistsLearned: 'Rich in smectite clay minerals and carbonates, which on Earth are among the best preservation matrices for delicate organic carbon and fossilized microbial mats.',
    whyItMatters: 'Proves that early Mars had a thick atmosphere, warmer temperatures, and persistent liquid water cycles capable of sustaining biological life.',
    simpleExplanation: 'Billions of years ago, a rushing river flowed into a deep lake right here! As the river slowed down, it dropped layers of mud and silt that solidified into rock, preserving a snapshot of when Mars had liquid lakes.',
    detailedExplanation: 'Orbital imaging by the CRISM spectrometer on MRO first identified Fe/Mg smectite clays in the delta. Rover in-situ abraded patches verified fine-grained lacustrine mudstones interbedded with coarse conglomerates, signifying episodic high-energy flood phases followed by tranquil standing water deposition.',
    audioTranscriptEn: 'You are inspecting the Jezero ancient river delta. Layer upon layer of sediment settled here when Mars had flowing rivers and deep lakes 3.7 billion years ago, making it prime terrain to seek ancient life.',
    audioTranscriptHi: 'आप जेज़ेरो नदी डेल्टा का निरीक्षण कर रहे हैं। 3.7 अरब साल पहले जब मंगल ग्रह पर बहती नदियां और गहरी झीलें थीं, तब यहां मिट्टी की परतें जमा हुई थीं।',
    sources: [
      {
        title: 'Jezero Crater Delta Deposits',
        publisher: 'NASA / JPL-Caltech',
        url: 'https://mars.nasa.gov/resources/24855/jezero-crater-delta-top-view/',
        missionOrProgram: 'Mars 2020'
      }
    ],
    modelType: 'jezero_delta',
    rarity: 'Pivotal'
  },
  {
    id: 'mars_sedimentary_strata',
    name: 'Mudstone & Cross-Bedded Sandstone Strata',
    planetId: 'mars',
    category: 'geology',
    coordinates: [-22, 0, 20],
    headline: 'Ripples and Layers Carved by Ancient Flowing Water Currents',
    whatIsIt: 'Rock formations displaying distinct laminations, cross-bedding, and mineral veins deposited by fluctuating aquatic environments.',
    howItWorks: 'Subaqueous ripples formed on the lake bottom as water currents shifted. Calcium sulfate mineral veins later precipitated out of groundwater trickling through fractures in the bedrock.',
    whatScientistsLearned: 'Demonstrated habitable aquatic chemical conditions with neutral pH, low salinity, and essential bio-elements (Carbon, Hydrogen, Oxygen, Nitrogen, Phosphorus, Sulfur).',
    whyItMatters: 'Demonstrates that Martian lakes were not transient flashes of acid, but long-lived, biologically benign freshwater bodies.',
    simpleExplanation: 'Notice these wavy lines in the rock! They are fossilized ripples left by water currents at the bottom of an ancient Martian lake, just like the ripples you see at a sandy beach today.',
    detailedExplanation: 'Fine laminations in mudstone indicate settling of suspended clay particles in quiet water. Cross-bedding angles recorded by Mastcam-Z provide vector velocities and flow directions for paleorivers, corroborating multi-million-year lacustrine episodes in early Noachian and Hesperian epochs.',
    audioTranscriptEn: 'Observe the sedimentary strata before you. These stacked ripples were shaped by water currents gently moving silt across a lakebed billions of years ago. Liquid water was once abundant on Mars.',
    audioTranscriptHi: 'इस तलछटी चट्टान की परतों को देखें। ये लहरदार रेखाएं अरबों साल पहले एक झील के तल पर पानी के बहाव से बनी थीं। इससे साबित होता है कि मंगल पर कभी भरपूर पानी था।',
    sources: [
      {
        title: 'Sedimentary Rocks of Mars',
        publisher: 'USGS Astrogeology Science Center',
        url: 'https://www.usgs.gov/news/national-news-release/nasa-rover-finds-active-ancient-water-mars',
        missionOrProgram: 'Curiosity & Perseverance'
      }
    ],
    modelType: 'sedimentary_strata',
    rarity: 'Common'
  },
  {
    id: 'mars_sample_tube',
    name: 'Titanium Hermetic Sample Return Depot Tube',
    planetId: 'mars',
    category: 'exploration',
    coordinates: [15, 0, -18],
    headline: 'Pristine Martian Bedrock Core Awaiting Earth Laboratory Analysis',
    whatIsIt: 'An ultra-clean, sapphire-lined titanium cylinder containing an intact core of Martian delta bedrock, placed carefully on the Three Forks surface depot.',
    howItWorks: 'The rover drilled a cylindrical rock plug, inspected it with cameras, hermetically laser-welded the container cap, and logged its GPS location for recovery by future fetch crafts.',
    whatScientistsLearned: 'Earth instruments (mass spectrometers, synchrotron particle accelerators) have millions of times greater sensitivity than any rover payload, capable of detecting single-molecule fossils.',
    whyItMatters: 'Represents humanity\'s first sample cache placed on another planet, laying the cornerstone for NASA and ESA\'s Mars Sample Return campaign.',
    simpleExplanation: 'This shiny metal tube contains a piece of Martian rock drilled straight from the ground! The rover sealed it airtight and placed it here so a future space mission can pick it up and fly it back to Earth.',
    detailedExplanation: 'Fabricated with extreme cleanliness to satisfy Planetary Protection Category V standards, each tube has fewer than 15 parts per billion organic carbon contaminants. Return to Earth will enable radiometric dating of Martian epochs and isotope systematics impossible on mobile rovers.',
    audioTranscriptEn: 'You have located a titanium sample depot tube. Inside rests a sealed cylinder of Martian rock. Future robotic missions will pick up these cached tubes and bring them back to Earth for microscopic examination.',
    audioTranscriptHi: 'आपने टाइटेनियम सैंपल डिपो ट्यूब खोज ली है। इसके अंदर मंगल की सीलबंद चट्टान का कोर है। भविष्य के अंतरिक्ष यान इसे उठाकर पृथ्वी की प्रयोगशालाओं में लाएंगे।',
    sources: [
      {
        title: 'NASA\'s Perseverance Rover Completes Mars Sample Depot',
        publisher: 'NASA Jet Propulsion Laboratory',
        url: 'https://www.jpl.nasa.gov/news/nasas-perseverance-rover-completes-first-sample-depot-on-mars',
        missionOrProgram: 'Mars Sample Return'
      }
    ],
    modelType: 'mars_sample_tube',
    rarity: 'Pivotal'
  },
  {
    id: 'mars_methane_plume',
    name: 'TLS-SAM Methane Atmospheric Sensor Outcrop',
    planetId: 'mars',
    category: 'atmosphere',
    coordinates: [-18, 0, -25],
    headline: 'Mysterious Seasonal Spikes in Martian Atmospheric Methane',
    whatIsIt: 'A monitoring site where laser spectrometers detect periodic plumes of methane gas (CH4) rising into the carbon dioxide atmosphere.',
    howItWorks: 'Tunable Laser Spectrometers (TLS) sample ambient air, passing laser beams across an optical cell to identify methane absorption lines at parts-per-billion concentrations.',
    whatScientistsLearned: 'Methane levels rise and fall cyclically with Martian seasons, spiking unexpectedly at night. On Earth, 95% of methane is produced by microbial biological organisms, though olivine serpentinization can also release it.',
    whyItMatters: 'Whether biological (subsurface microbes) or geochemical (water reacting with hot rock), methane proves that Mars is not a dead, dormant planet.',
    simpleExplanation: 'Instruments on Mars have sniffed tiny bursts of methane gas that rise and fall with the seasons. Could this gas be coming from microscopic bugs living deep underground, or warm underground rocks? It is one of the greatest space mysteries!',
    detailedExplanation: 'Curiosity\'s SAM instrument recorded background methane baseline levels of 0.4 ppb, with occasional transient spikes reaching 21 ppb. Resolving whether this is biogenic or abiotic (e.g., serpentinization or clathrate degassing) is a primary objective of modern planetary astrobiology.',
    audioTranscriptEn: 'Here, scientific sensors detect mysterious plumes of methane gas. Because methane is destroyed quickly by solar ultraviolet light, something active on Mars—either subterranean geology or microbial life—must be continuously replenishing it.',
    audioTranscriptHi: 'यहाँ वैज्ञानिक सेंसरों ने मीथेन गैस के रहस्यमयी बादलों का पता लगाया है। चूंकि सूर्य का प्रकाश मीथेन को नष्ट कर देता है, इसलिए मंगल की जमीन के नीचे कोई सक्रिय स्रोत इसे लगातार बना रहा है।',
    sources: [
      {
        title: 'Curiosity Rover Detects Unusually High Methane Levels on Mars',
        publisher: 'NASA Goddard Space Flight Center',
        url: 'https://www.nasa.gov/feature/goddard/2019/curiosity-detects-unusually-high-methane-levels',
        missionOrProgram: 'Curiosity / SAM'
      }
    ],
    modelType: 'methane_detector',
    rarity: 'Rare'
  },
  {
    id: 'mars_ancient_riverbed',
    name: 'Inverted River Channel & Boulder Conglomerate',
    planetId: 'mars',
    category: 'geology',
    coordinates: [30, 0, -5],
    headline: 'Vigorous Torrents Capable of Moving Heavy Boulders',
    whatIsIt: 'An ancient fluvial channel filled with rounded pebbles and cobbles cemented together into conglomerate rock.',
    howItWorks: 'Energetic, fast-flowing water tumble angular rocks against one another, grinding smooth edges over kilometers of travel before cementing into place.',
    whatScientistsLearned: 'Calculations based on pebble sizes indicated ancient Martian streams flowed at ankle-to-hip depth at speeds of roughly 1 meter per second.',
    whyItMatters: 'Provides unambiguous empirical proof of sustained hydrological cycles on early Mars rather than transient, instant ice melt.',
    simpleExplanation: 'These round river stones look just like pebbles you would skip across a stream on Earth! Only long-lasting, fast-moving rivers can roll and polish rocks until they are smooth.',
    detailedExplanation: 'Sedimentological analysis of rounded gravels (pebbles up to several centimeters) within the Link and Hottah outcrops established sustained fluvial transport. The roundedness index necessitates sustained abrasion under liquid water, indicating Mars had an active hydrosphere in the Noachian era.',
    audioTranscriptEn: 'You are walking along an ancient river channel. Look at the smooth, rounded stones. They were tumbled by fast-rushing river currents for miles, proving Mars once had energetic freshwater rivers.',
    audioTranscriptHi: 'आप एक प्राचीन नदी के सूखे तल पर चल रहे हैं। इन चिकने पत्थरों को देखें। इन्हें मीलों तक तेज बहाव वाले पानी ने घिसकर गोल किया था, जो साबित करता है कि मंगल पर कभी नदियां बहती थीं।',
    sources: [
      {
        title: 'NASA Rover Finds Old Streambed on Martian Surface',
        publisher: 'NASA Jet Propulsion Laboratory',
        url: 'https://www.jpl.nasa.gov/news/nasa-rover-finds-old-streambed-on-martian-surface',
        missionOrProgram: 'Curiosity Rover'
      }
    ],
    modelType: 'ancient_riverbed',
    rarity: 'Common'
  },
  {
    id: 'mars_dust_devil',
    name: 'Martian Dust Devil Track & Meteorological Station',
    planetId: 'mars',
    category: 'atmosphere',
    coordinates: [-8, 0, 32],
    headline: 'Whirling Atmospheric Vortices Sweeping the Martian Plains',
    whatIsIt: 'A localized thermal whirlwind track where rotating updrafts have lifted the bright surface dust, leaving dark serpentine trails.',
    howItWorks: 'Intense midday solar heating warms the ground faster than the thin atmosphere above. Buoyant warm air rises quickly through a cooler layer, spinning into a tall convective vortex reaching up to 8 kilometers high.',
    whatScientistsLearned: 'Dust devils generate static electric charges, lift immense volumes of fine dust into the high atmosphere, and periodically cleaned solar panels on the Spirit and Opportunity rovers.',
    whyItMatters: 'Understanding Martian atmospheric dynamics and electrostatic charging is vital for securing human landers, habitat airlocks, and space suits.',
    simpleExplanation: 'On warm afternoons, spinning mini-tornadoes called dust devils dance across Mars! They can reach 8 kilometers high, scooping up red dust and swirling it high into the thin Martian sky.',
    detailedExplanation: 'Martian convective vortices are driven by strong near-surface thermal gradients. Electric fields of tens of kilovolts per meter have been inferred from triboelectric charging of lifted dust grains, which may contribute to photochemical peroxide production in the Martian soil.',
    audioTranscriptEn: 'Notice the swirling patterns on the red soil. Martian dust devils are towering vortex columns that lift oxidized dust high into the carbon dioxide atmosphere, generating electrostatic fields in the dry desert air.',
    audioTranscriptHi: 'लाल मिट्टी पर इन घुमावदार निशानों को देखें। मंगल के बवंडर विशालकाय धूल भरे खंभे होते हैं जो लाल धूल को वायुमंडल में ऊंचा उड़ाते हैं और स्थिर विद्युत उत्पन्न करते हैं।',
    sources: [
      {
        title: 'Martian Dust Devils Observed by Orbiters and Rovers',
        publisher: 'NASA / JPL Mars Exploration Program',
        url: 'https://mars.nasa.gov/multimedia/images/2020/dust-devil-on-mars',
        missionOrProgram: 'Mars Reconnaissance Orbiter'
      }
    ],
    modelType: 'dust_devil_sensor',
    rarity: 'Common'
  },
  {
    id: 'mars_meteorite_shergottite',
    name: 'Martian Volcanic Shergottite Outcrop',
    planetId: 'mars',
    category: 'geology',
    coordinates: [32, 0, 28],
    headline: 'Young Basaltic Lava from Ancient Volcanic Mantle Upwelling',
    whatIsIt: 'A dark, dense igneous rock crystallized from mantle-derived magma, representing volcanic provinces on Mars.',
    howItWorks: 'Internal heat caused partial melting of the Martian mantle. The magma rose through conduits in the crust, solidifying into pyroxene- and olivine-rich igneous rock.',
    whatScientistsLearned: 'Matching gas bubbles trapped inside glass veins of Earth-recovered "SNC meteorites" (such as ALH84001) with Viking atmospheric data confirmed their Martian origin.',
    whyItMatters: 'Demonstrates that Mars had active volcanism far later into its geological history than the Moon, cooling more gradually due to its larger planetary mass.',
    simpleExplanation: 'This dark rock was formed by cooling volcanic magma! Tiny gas pockets trapped inside rocks just like this matched the Martian atmosphere measured by Viking landers, proving space rocks found on Earth actually came from Mars!',
    detailedExplanation: 'Shergottites are mafic to ultramafic igneous rocks consisting predominantly of clinopyroxene and maskelynite (shock-vitrified plagioclase feldspar). Argon-argon and samarium-neodymium isotopic systematics show some volcanic rocks formed as recently as 180 million years ago, indicating geologically recent thermal activity in Tharsis.',
    audioTranscriptEn: 'You are studying a volcanic basalt formation. Tiny bubbles of atmosphere trapped inside rocks like this proved that meteorites discovered in Antarctica originated right here on Mars.',
    audioTranscriptHi: 'आप एक ज्वालामुखीय बेसाल्ट चट्टान का अध्ययन कर रहे हैं। इस जैसी चट्टानों में फंसी गैस के बुलबुलों से यह साबित हुआ कि अंटार्कटिका में पाए गए उल्कापिंड वास्तव में मंगल ग्रह से आए थे।',
    sources: [
      {
        title: 'Martian Meteorites',
        publisher: 'NASA Johnson Space Center Astromaterials',
        url: 'https://curator.jsc.nasa.gov/antmet/marsmets/',
        missionOrProgram: 'NASA Meteorite Program'
      }
    ],
    modelType: 'martian_meteorite',
    rarity: 'Rare'
  },
  // ==========================================
  // EARTH HOME BASE DISCOVERIES (4 Records)
  // ==========================================
  {
    id: 'earth_pad39b',
    name: 'Launch Complex 39B & Mobile Launcher',
    planetId: 'earth',
    category: 'technology',
    coordinates: [0, 0, 8],
    headline: 'Humanity\'s Gateway for Deep Space Lunar & Martian Missions',
    whatIsIt: 'The heavy-lift launch pad at Kennedy Space Center, Florida, configured for the Space Launch System (SLS) and Orion spacecraft.',
    howItWorks: 'The 380-foot Mobile Launcher tower provides propellant loading (Liquid Hydrogen and Liquid Oxygen), power, data, and environmental control right up to T-0 ignition.',
    whatScientistsLearned: 'Modern multi-engine launch platforms require advanced sound suppression systems—spraying 450,000 gallons of water in 30 seconds to mitigate acoustic shock waves.',
    whyItMatters: 'Serves as the primary operational departure point for the NASA Artemis missions returning humans to the Moon and venturing onward to Mars.',
    simpleExplanation: 'This is Pad 39B at Kennedy Space Center! Giant rockets like the Artemis Space Launch System blast off from this pad to send astronauts into deep space!',
    detailedExplanation: 'Constructed originally for Apollo and modified for the Space Shuttle, Pad 39B was extensively transformed for Artemis. It features three 600-foot lightning towers, cryogenic LH2/LOX storage spheres, and a flame trench designed for SLS\'s 8.8 million pounds of thrust.',
    audioTranscriptEn: 'You are standing on Launch Pad 39B at NASA\'s Kennedy Space Center. From this historic platform, the Artemis Space Launch System generates 8.8 million pounds of thrust to send astronauts to the Moon and Mars.',
    audioTranscriptHi: 'आप नासा के कैनेडी स्पेस सेंटर के लॉन्च पैड 39B पर खड़े हैं। इस ऐतिहासिक मंच से आर्टेमिस रॉकेट 88 लाख पाउंड का थ्रस्ट उत्पन्न करके अंतरिक्ष यात्रियों को चंद्रमा और मंगल के सफर पर भेजता है।',
    sources: [
      {
        title: 'Launch Complex 39B - Exploration Ground Systems',
        publisher: 'NASA Kennedy Space Center',
        url: 'https://www.nasa.gov/exploration/systems/ground/padb.html',
        missionOrProgram: 'Artemis Program'
      }
    ],
    modelType: 'launch_complex',
    rarity: 'Pivotal'
  },
  {
    id: 'earth_flight_ops',
    name: 'Mission Control Flight Operations Center',
    planetId: 'earth',
    category: 'exploration',
    coordinates: [-26, 0, 12],
    headline: 'Real-Time Telemetry & Planetary Mission Command',
    whatIsIt: 'The centralized flight operations complex coordinating communications, trajectories, life support, and science payloads across interplanetary missions.',
    howItWorks: 'Teams of flight controllers (FLIGHT, CAPCOM, FDO, EECOM, GNC) monitor spacecraft telemetry via satellite uplinks 24 hours a day.',
    whatScientistsLearned: 'Interplanetary missions require rigorous orbital mechanics modeling and automated contingency protocols due to light-speed communication delays (up to 22 minutes each way to Mars).',
    whyItMatters: 'Guarantees the safety, navigation, and mission success of astronauts exploring distant worlds beyond Low Earth Orbit.',
    simpleExplanation: 'Mission Control is where flight engineers watch over every heartbeat of the astronauts and every system on the spaceship in real time!',
    detailedExplanation: 'Flight operations utilize redundant mainframe compute clusters connected to the Deep Space Network and TDRS tracking satellites. Telemetry protocols ingest millions of real-time sensor parameters to ensure mission safety.',
    audioTranscriptEn: 'Welcome to Earth Mission Control. Flight directors and planetary scientists here monitor every heartbeat, oxygen sensor, and orbital maneuver of our astronauts across the solar system.',
    audioTranscriptHi: 'पृथ्वी मिशन कंट्रोल में आपका स्वागत है। यहां फ्लाइट डायरेक्टर्स और वैज्ञानिक अंतरिक्ष यात्रियों के हर दिल की धड़कन, ऑक्सीजन स्तर और कक्षीय चाल पर नजर रखते हैं।',
    sources: [
      {
        title: 'Mission Control Center Houston',
        publisher: 'NASA Johnson Space Center',
        url: 'https://www.nasa.gov/centers/johnson/about/resources/jscfact/mission_control.html',
        missionOrProgram: 'NASA Human Spaceflight'
      }
    ],
    modelType: 'flight_ops',
    rarity: 'Common'
  },
  {
    id: 'earth_dsn_antenna',
    name: 'Deep Space Network (DSN) 70-Meter Parabolic Antenna',
    planetId: 'earth',
    category: 'technology',
    coordinates: [26, 0, -12],
    headline: 'High-Gain Microwave Gateway to Interplanetary Space',
    whatIsIt: 'A massive 70-meter steerable parabolic reflector antenna linking Earth to robotic rovers and crewed spacecraft throughout the Solar System.',
    howItWorks: 'Utilizes cryogenically cooled ruby maser amplifiers and high-power X-band and Ka-band transmitters capable of detecting radio signals weaker than a billionth of a watt from deep space.',
    whatScientistsLearned: 'By stationing three DSN antenna complexes equidistant around the globe (Goldstone California, Madrid Spain, Canberra Australia), Earth maintains 100% uninterrupted communication as the planet rotates.',
    whyItMatters: 'Without the Deep Space Network, no images, telemetry, or science data could return from the Moon, Mars, or the outer planets.',
    simpleExplanation: 'This giant 70-meter dish antenna is Earth\'s giant space telephone! It can hear radio whispers from spacecraft billions of kilometers away across the Solar System!',
    detailedExplanation: 'The 70-meter parabolic reflector focuses incoming microwaves onto a Cassegrain sub-reflector. Cryogenic low-noise amplifiers cooled to 4 Kelvin minimize thermal noise, enabling data rates sufficient for 4K video from lunar distances and science telemetry from Mars.',
    audioTranscriptEn: 'You are inspecting the 70-meter Deep Space Network antenna dish. Positioned around the globe, these massive reflectors allow Earth to communicate with rovers and astronauts across interplanetary space.',
    audioTranscriptHi: 'आप 70 मीटर वाले डीप स्पेस नेटवर्क एंटीना को देख रहे हैं। यह विशाल डिश दुनिया भर में फैले केंद्रों की मदद से हमारे अंतरिक्ष यानों से हर समय संपर्क बनाए रखती है।',
    sources: [
      {
        title: 'NASA Deep Space Network (DSN)',
        publisher: 'Jet Propulsion Laboratory / Caltech',
        url: 'https://www.jpl.nasa.gov/missions/deep-space-network-dsn',
        missionOrProgram: 'Deep Space Network'
      }
    ],
    modelType: 'dsn_array',
    rarity: 'Rare'
  },
  {
    id: 'earth_gravity_station',
    name: 'Standard Terrestrial Gravity Baseline Station',
    planetId: 'earth',
    category: 'geology',
    coordinates: [0, 0, -18],
    headline: 'Standard 1.00g (9.81 m/s²) Gravitational Reference',
    whatIsIt: 'A geodetic absolute gravimeter station calibrating Earth\'s reference surface gravitational acceleration.',
    howItWorks: 'Measures the acceleration of a free-falling test mass inside a high-vacuum chamber using laser interferometry down to micro-Gal precision.',
    whatScientistsLearned: 'Earth\'s gravity is not uniform—it varies from 9.78 m/s² at the equator to 9.83 m/s² at the poles due to Earth\'s oblate rotation and subsurface crustal density differences.',
    whyItMatters: 'Serves as the scientific baseline benchmark for comparing lunar gravity (1/6th g) and Martian gravity (38% g) across our planetary physics simulations.',
    simpleExplanation: 'This station measures Earth\'s normal gravity of 9.81 meters per second squared! It is the standard benchmark scientists use to compare how light and bouncy you feel on the Moon and Mars!',
    detailedExplanation: 'Absolute gravimeters like the FG5 utilize stabilized helium-neon lasers and rubidium atomic clocks to measure the position versus time of a falling corner-cube prism. This establishes the 9.80665 m/s² standard acceleration of gravity adopted internationally.',
    audioTranscriptEn: 'This station measures Earth\'s standard gravitational acceleration of 9.81 meters per second squared. Notice how firmly your boots stay grounded here compared to the floaty leaps of the Moon and Mars.',
    audioTranscriptHi: 'यह स्टेशन पृथ्वी के सामान्य 9.81 मीटर प्रति सेकंड स्क्वायर गुरुत्वाकर्षण को मापता है। ध्यान दें कि चंद्रमा और मंगल की तुलना में यहां आपके कदम कितने स्थिर रहते हैं।',
    sources: [
      {
        title: 'National Geodetic Survey - Absolute Gravity Program',
        publisher: 'NOAA / NGS',
        url: 'https://www.ngs.noaa.gov/GRAV-D/',
        missionOrProgram: 'Earth Geodesy'
      }
    ],
    modelType: 'gravity_station',
    rarity: 'Common'
  }
];

export function getDiscoveriesByPlanet(planetId: 'earth' | 'moon' | 'mars'): ScientificDiscovery[] {
  return SCIENTIFIC_DISCOVERIES.filter(d => d.planetId === planetId);
}

export function getDiscoveryById(id: string): ScientificDiscovery | undefined {
  return SCIENTIFIC_DISCOVERIES.find(d => d.id === id);
}

export const ALL_DISCOVERIES = SCIENTIFIC_DISCOVERIES;

