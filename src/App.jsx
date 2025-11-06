import React, { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './assets/App.css'; // Add this CSS file for styling
import { Checkbox, IconButton, styled, TextField } from '@mui/material';
import { pink, orange, red, green, blue, purple, yellow, lightBlue, deepPurple, amber } from '@mui/material/colors';
import { CheckBox, Circle } from '@mui/icons-material';
import MovieCreationOutlinedIcon from '@mui/icons-material/MovieCreationOutlined';
import MovieIcon from '@mui/icons-material/Movie';
import { toast } from 'react-toastify';

async function loadMedia(folderPath) {
  const media = await invoke('get_media_structure', { path: folderPath });
  return media.sort((a, b) => a.name.localeCompare(b.name));
}

async function openMedia(filePath) {
  // Open the media file using the default video player
  const complete_path = `${filePath}`;
  console.log(complete_path)
  await invoke("open_video", { filePath: complete_path });
}

function set_watched(title) {
  localStorage.setItem(title, "watched");
}
function unset_watched(title) {
  localStorage.setItem(title, "not watched");
}
function has_watched(title) {
  return localStorage.getItem(title) === "watched";
}
function toggle_watched(title) {
  if (has_watched(title)) {
    unset_watched(title);
  }
  else {
    set_watched(title);
  }
}

function set_parent_folder(folder) {
  localStorage.setItem("parent_folder", folder);
}
function get_parent_folder() {
  return localStorage.getItem("parent_folder");
}

// Get special greeting for Kyra's birthday
function getSpecialGreeting() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  if (month === 4 && day === 3) {
    return "🎂 Happy Birthday Kyra! 🎉 You're the star of today's show! 💖";
  } else if (month === 4 && day === 2) {
    return "✨ Tomorrow is a very special day... Kyra's Birthday! 🎈💕";
  } else if (month === 4 && day === 4) {
    return "🌟 Hope Kyra had the most amazing birthday yesterday! 🎊💝";
  } else if (month === 4 && day === 1) {
    return "🎀 Only 2 days until Kyra's special day! Get ready to celebrate! 🎉";
  } else if (month === 4 && day === 5) {
    return "💫 The birthday celebrations continue for our amazing Kyra! 🎂";
  }
  return null;
}

// Get current holiday theme based on month
function getHolidayTheme() {
  const month = new Date().getMonth() +1 // 1-12
  console.log(month)
  if (month === 10) {
    return {
      name: 'Halloween',
      emoji: '🎃',
      colors: { primary: orange[800], secondary: orange[500], light: orange[300] },
      particles: ['🎃', '👻', '🦇', '🕷️', '🕸️'],
      gradient: 'linear-gradient(135deg, #ff9a00, #ff6600, #2d1b00)',
      background: '#1a1a1a'
    };
  } else if (month === 12) {
    return {
      name: 'Christmas',
      emoji: '🎄',
      colors: { primary: red[700], secondary: green[700], light: red[300] },
      particles: ['🎄', '⛄', '❄️', '🎅', '🎁', '⭐'],
      gradient: 'linear-gradient(135deg, #c41e3a, #0f8a5f, #ffffff)',
      background: '#0d3b2e'
    };
  } else if (month === 1) {
    return {
      name: 'New Year',
      emoji: '🎉',
      colors: { primary: purple[700], secondary: blue[500], light: purple[300] },
      particles: ['🎉', '🎊', '✨', '🥂', '🎆', '🎇'],
      gradient: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
      background: '#1a1a2e'
    };
  } else if (month === 2) {
    return {
      name: 'Carnevale',
      emoji: '🎭',
      colors: { primary: deepPurple[600], secondary: amber[500], light: purple[300] },
      particles: ['🎭', '🎪', '🎨', '🎊', '🃏', '👑'],
      gradient: 'linear-gradient(135deg, #9c27b0, #ffd700, #00c853)',
      background: '#2d1b3d'
    };
  } else if (month === 3) {
    return {
      name: 'Greek Independence',
      emoji: '🇬🇷',
      colors: { primary: blue[700], secondary: lightBlue[300], light: blue[200] },
      particles: ['🏛️', '🕊️', '⚡', '🫒', '🌊', '☀️'],
      gradient: 'linear-gradient(135deg, #0d47a1, #ffffff, #42a5f5)',
      background: '#e3f2fd'
    };
  } else if (month === 4) {
    const day = new Date().getDate();
    // Special birthday theme for Kyra (April 1-5)
    if (day >= 1 && day <= 5) {
      return {
        name: "Kyra's Birthday",
        emoji: '🎂',
        colors: { primary: pink[600], secondary: purple[400], light: pink[300] },
        particles: ['🎂', '🎉', '🎁', '🎈', '💖', '✨', '🌟', '💝', '🎊'],
        gradient: 'linear-gradient(135deg, #ff6ec4, #7873f5, #ffd700)',
        background: '#fff0f8'
      };
    }
    // Default Easter theme for rest of April
    return {
      name: 'Easter',
      emoji: '🐰',
      colors: { primary: pink[400], secondary: purple[300], light: pink[200] },
      particles: ['🐰', '🥚', '🐣', '🌷', '🌸', '🌼'],
      gradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee, #ffeaa7)',
      background: '#fff8e7'
    };
  } else if (month === 6) {
    return {
      name: 'Italian Republic Day',
      emoji: '🇮🇹',
      colors: { primary: green[700], secondary: red[600], light: green[300] },
      particles: ['🇮🇹', '🍕', '🍝', '⭐', '🏛️', '🌿'],
      gradient: 'linear-gradient(135deg, #2e7d32, #ffffff, #c62828)',
      background: '#f1f8e9'
    };
  } else if (month === 8) {
    return {
      name: 'Ferragosto',
      emoji: '☀️',
      colors: { primary: amber[700], secondary: lightBlue[500], light: yellow[300] },
      particles: ['☀️', '🏖️', '🍉', '🍋', '🌊', '🍇'],
      gradient: 'linear-gradient(135deg, #ffa726, #42a5f5, #ffee58)',
      background: '#fff9e6'
    };
  }
  
  // Default pink theme
  return {
    name: 'Chillin',
    emoji: '✨',
    colors: { primary: pink[800], secondary: pink[600], light: pink[300] },
    particles: ['✨', '⭐', '💫', '🌟'],
    gradient: 'linear-gradient(135deg, #ff9a9e, #fad0c4)',
    background: '#fff5f8'
  };
}

const ThemedTextField = ({ theme, ...props }) => {
  const StyledField = styled(TextField)({
    backgroundColor: 'white',
    borderRadius: '5px',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.colors.light,
      },
      '&:hover fieldset': {
        borderColor: theme.colors.secondary,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.colors.primary,
      },
    },
  });
  return <StyledField {...props} />;
};

const positive_messages = [
  "Great choice! Enjoy the show!",
  "This one's a classic! Sit back and relax.",
  "You're in for a treat! 🍿",
  "Excellent pick! Let's dive in!",
  "Lights, camera, action! 🎬",
  "Movie magic coming right up!",
  "You’ve got great taste in movies!",
  "Time to escape into a great story!",
  "This is going to be epic!",
  "Your movie adventure starts now!",
  "Perfect pick for a cozy night!",
  "Grab some snacks, it’s movie time!",
  "You’re going to love this one!",
  "The spotlight's on you – enjoy!",
  "Ready for an unforgettable experience?",
  "This is a fan favorite! You’re in for a good time.",
  "Get comfy, it’s about to get exciting!",
  "Popcorn ready? Let’s go!",
  "A stellar pick for a great mood!",
  "Prepare to be entertained!",
  "The fun begins now – enjoy!",
  "You just picked a masterpiece!",
  "An excellent choice for movie night!",
  "Let the cinematic journey begin!",
  "A perfect escape awaits you!",
  "You’re all set for an amazing time!",
  "This movie is pure gold. Have fun!",
  "Ready to be blown away? Here we go!",
  "You just picked a gem – enjoy!",
  "Time to lose yourself in an amazing story!",
  "A great movie for a great mood – perfect!",
  "The reel magic starts now!",
  "Hope you love surprises because this movie has them!",
  "A wonderful pick for a wonderful viewer!",
  "You’re about to witness something special!",
  "All set for cinematic magic? Let’s begin!",
  "Sit tight, the fun’s about to start!",
  "Excellent choice for a memorable time!",
  "A story worth every minute – enjoy!",
  "Get ready to laugh, cry, and feel inspired!",
  "Your journey into the extraordinary begins now!",
  "This movie is going to leave a mark – enjoy!",
  "Kick back and get ready to be amazed!",
  "An outstanding choice for a chill night!",
  "You’re about to make some unforgettable memories!",
  "This one’s a rollercoaster – hold on tight!",
  "Perfect selection! Let’s make it unforgettable!",
  "The stars are aligned – enjoy the show!",
  "You’ve got movie magic in your hands!",
  "Time for a cinematic adventure – let's roll!",
];

// Generate fake data for debug mode
function generateFakeMovies() {
  return [
    { name: 'The Matrix', path: '/fake/movies/matrix.mp4' },
    { name: 'Inception', path: '/fake/movies/inception.mp4' },
    { name: 'Interstellar', path: '/fake/movies/interstellar.mp4' },
    { name: 'The Dark Knight', path: '/fake/movies/dark-knight.mp4' },
    { name: 'Pulp Fiction', path: '/fake/movies/pulp-fiction.mp4' },
    { name: 'Fight Club', path: '/fake/movies/fight-club.mp4' },
    { name: 'Forrest Gump', path: '/fake/movies/forrest-gump.mp4' },
    { name: 'The Shawshank Redemption', path: '/fake/movies/shawshank.mp4' },
  ];
}

function generateFakeShows() {
  return {
    'Breaking Bad': {
      'Season 1': ['S01E01 - Pilot.mp4', 'S01E02 - Cat in the Bag.mp4', 'S01E03 - And the Bag.mp4'],
      'Season 2': ['S02E01 - Seven Thirty-Seven.mp4', 'S02E02 - Grilled.mp4'],
      'Season 3': ['S03E01 - No Mas.mp4', 'S03E02 - Caballo Sin Nombre.mp4'],
    },
    'Stranger Things': {
      'Season 1': ['S01E01 - Chapter One.mp4', 'S01E02 - Chapter Two.mp4', 'S01E03 - Chapter Three.mp4'],
      'Season 2': ['S02E01 - MADMAX.mp4', 'S02E02 - Trick or Treat.mp4'],
    },
    'The Office': {
      'Season 1': ['S01E01 - Pilot.mp4', 'S01E02 - Diversity Day.mp4'],
      'Season 2': ['S02E01 - The Dundies.mp4', 'S02E02 - Sexual Harassment.mp4'],
      'Season 3': ['S03E01 - Gay Witch Hunt.mp4', 'S03E02 - The Convention.mp4'],
    },
    'Game of Thrones': {
      'Season 1': ['S01E01 - Winter Is Coming.mp4', 'S01E02 - The Kingsroad.mp4'],
      'Season 2': ['S02E01 - The North Remembers.mp4', 'S02E02 - The Night Lands.mp4'],
    },
  };
}

const App = () => {
  const [greeting, setGreeting] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [parentFolder, setParentFolder] = useState(get_parent_folder() || '');
  const [watched, setWatched] = useState(false);
  const [shows, setShows] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filteredShows, setFilteredShows] = useState({});
  const [theme, setTheme] = useState(getHolidayTheme());
  const [particles, setParticles] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  const loadShows = async () => {
    if (debugMode) {
      const fakeShows = generateFakeShows();
      setShows(fakeShows);
      return;
    }
    if (!parentFolder) {
      alert('Please select a parent folder first!');
      return;
    }
    const showsStructure = await invoke('get_shows_structure', { showsPath: `${parentFolder}/Shows` });
    setShows(showsStructure);
  };

  const handleMediaTypeChange = async (type) => {
    if (debugMode) {
      setMediaType(type);
      if (type === 'Shows') {
        const fakeShows = generateFakeShows();
        setShows(fakeShows);
        setFilteredShows(fakeShows);
      } else {
        const fakeMovies = generateFakeMovies();
        setMovieList(fakeMovies);
        setFilteredMovies(fakeMovies);
      }
      return;
    }
    if (!parentFolder) {
      alert('Please select a parent folder first!');
      return;
    }
    setMediaType(type);
    if (type === 'Shows') {
      await loadShows();
    } else {
      const media = await loadMedia(`${parentFolder}/Movies`);
      setMovieList(media);
      setFilteredMovies(media);
    }
  };

  useEffect(() => {
    const currentTheme = getHolidayTheme();
    setTheme(currentTheme);
    
    // Check for special birthday greeting
    const specialGreeting = getSpecialGreeting();
    if (specialGreeting) {
      setGreeting(specialGreeting);
    } else {
      setGreeting(`Netflix and Chill ${currentTheme.emoji}`);
    }
    
    // Set CSS variables for theming
    document.documentElement.style.setProperty('--theme-primary', currentTheme.colors.primary);
    document.documentElement.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
    document.documentElement.style.setProperty('--theme-light', currentTheme.colors.light);
    document.documentElement.style.setProperty('--theme-gradient', currentTheme.gradient);
    document.documentElement.style.setProperty('--theme-background', currentTheme.background);
    
    // Generate magic particles
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 25; i++) {
        newParticles.push({
          id: i,
          emoji: currentTheme.particles[Math.floor(Math.random() * currentTheme.particles.length)],
          left: Math.random() * 100,
          animationDuration: 10 + Math.random() * 15,
          animationDelay: Math.random() * 10,
          size: 1 + Math.random() * 2
        });
      }
      setParticles(newParticles);
    };
    
    generateParticles();
  }, []);

  useEffect(() => {
    // Update filteredMovies based on searchQuery
    if (mediaType === 'Movies') {
      const filtered = movieList.filter((movie) =>
        movie.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMovies(filtered);
    } else if (mediaType === 'Shows') {
      const filtered = Object.fromEntries(
        Object.entries(shows).filter(([showName]) =>
          showName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredShows(filtered);
    }
  }, [searchQuery, movieList, shows, mediaType]);

  return (
    <div className="app-container" data-tauri-drag-region>
      {/* Magic Particles */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDuration: `${particle.animationDuration}s`,
              animationDelay: `${particle.animationDelay}s`,
              fontSize: `${particle.size}rem`
            }}
          >
            {particle.emoji}
          </div>
        ))}
      </div>
      
      <IconButton
        style={{ position: 'fixed', top: '-0.3rem', right: '-0.3rem', zIndex: 1000 }}
        onClick={async () => {
          await invoke('close_window');
        }}
      >
        <Circle fontSize="small" color="error" />
      </IconButton>
      
      {/* Debug Mode Toggle */}
      <button
        className="debug-toggle"
        onClick={() => setDebugMode(!debugMode)}
        style={{
          position: 'fixed',
          top: '0.5rem',
          left: '0.5rem',
          zIndex: 1000,
          padding: '8px 12px',
          borderRadius: '20px',
          border: 'none',
          background: debugMode ? theme.colors.primary : 'rgba(128, 128, 128, 0.3)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
        }}
      >
        🐛 {debugMode ? 'DEBUG ON' : 'DEBUG OFF'}
      </button>
      
      <h1 className="greeting" data-tauri-drag-region>{greeting}</h1>
      <div className="folder-selector" data-tauri-drag-region>
        <ThemedTextField
          theme={theme}
          value={parentFolder}
          onChange={(event) => {
            const folder = event.target.value;
            set_parent_folder(folder);
            setParentFolder(folder);
          }}
          placeholder={`${theme.emoji} Select Parent Folder ${theme.emoji}`}
          variant="outlined"
        />
        {parentFolder && <p className="selected-folder">Selected Folder: <strong>{parentFolder}</strong></p>}
      </div>
      <div className="media-type-buttons" data-tauri-drag-region>
        <button className="btn media-btn" onClick={() => handleMediaTypeChange('Movies')}>🍿 Movies</button>
        <button className="btn media-btn" onClick={() => handleMediaTypeChange('Shows')}>📺 Shows</button>
      </div>
      {mediaType && (
        <div className="search-bar">
          <ThemedTextField
            theme={theme}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search..."
            className="search-input"
          />
        </div>
      )}
      {mediaType === 'Movies' && (
        <div className="media-list" data-tauri-drag-region>
          <h2 className="media-type-title">Movies</h2>
          <ul data-tauri-drag-region>
            {filteredMovies.map((item) => (
              <li key={item.path} data-tauri-drag-region className="media-item">
                <button
                  className="btn media-item-btn"
                  onClick={() => {
                    openMedia(item.path);
                    const randomMessage = positive_messages[Math.floor(Math.random() * positive_messages.length)];
                    toast.success(randomMessage);
                  }}
                >
                  🌟 {item.name}
                </button>
                <Checkbox
                  checkedIcon={<MovieIcon />}
                  icon={<MovieCreationOutlinedIcon />}
                  defaultChecked={has_watched(item.name)}
                  onClick={() => {
                    toggle_watched(item.name);
                    setWatched(has_watched(item.name));
                  }}
                  sx={{
                    color: theme.colors.primary,
                    '&.Mui-checked': {
                      color: theme.colors.secondary,
                    },
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      {mediaType === 'Shows' && (
        <div className="shows-list" data-tauri-drag-region>
          <h2 className="media-type-title">Shows</h2>
          <div className="show-bubbles">
            {Object.keys(filteredShows).map((showName) => (
              <button
                key={showName}
                className="show-bubble"
                onClick={() => setSelectedShow(showName)}
              >
                📺 {showName}
              </button>
            ))}
          </div>

          {/* Season Popup */}
          {selectedShow && (
            <div className="popup-overlay" onClick={() => setSelectedShow(null)}>
              <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={() => setSelectedShow(null)}>✕</button>
                <h2 className="popup-title">{selectedShow}</h2>
                <div className="season-bubbles">
                  {Object.keys(filteredShows[selectedShow] || {}).map((seasonName) => (
                    <button
                      key={seasonName}
                      className="season-bubble"
                      onClick={() => setSelectedSeason(seasonName)}
                    >
                      🎬 {seasonName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Episode Popup */}
          {selectedShow && selectedSeason && (
            <div className="popup-overlay" onClick={() => setSelectedSeason(null)}>
              <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={() => setSelectedSeason(null)}>✕</button>
                <h2 className="popup-title">{selectedShow}</h2>
                <h3 className="popup-subtitle">{selectedSeason}</h3>
                <div className="episode-list">
                  {(filteredShows[selectedShow]?.[selectedSeason] || []).map((episode) => {
                    const path = debugMode ? `/fake/shows/${selectedShow}/${selectedSeason}/${episode}` : `${parentFolder}Shows\\${selectedShow}\\${selectedSeason}\\${episode}`;
                    return (
                      <div key={episode} className="episode-item-bubble">
                        <button
                          className="episode-button"
                          onClick={() => {
                            if (!debugMode) {
                              openMedia(path);
                            }
                            const randomMessage = positive_messages[Math.floor(Math.random() * positive_messages.length)];
                            toast.success(randomMessage);
                          }}
                        >
                          🎥 {episode}
                        </button>
                        <Checkbox
                          checkedIcon={<MovieIcon />}
                          icon={<MovieCreationOutlinedIcon />}
                          defaultChecked={has_watched(path)}
                          onClick={() => {
                            toggle_watched(path);
                            setWatched(has_watched(path));
                          }}
                          sx={{
                            color: theme.colors.primary,
                            '&.Mui-checked': {
                              color: theme.colors.secondary,
                            },
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
