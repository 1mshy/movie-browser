import React, { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './assets/App.css'; // Add this CSS file for styling
import { Checkbox, IconButton, styled, TextField } from '@mui/material';
import { pink, orange, red, green, blue, purple } from '@mui/material/colors';
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
  } else if (month === 4) {
    return {
      name: 'Easter',
      emoji: '🐰',
      colors: { primary: pink[400], secondary: purple[300], light: pink[200] },
      particles: ['🐰', '🥚', '🐣', '🌷', '🌸', '🌼'],
      gradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee, #ffeaa7)',
      background: '#fff8e7'
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

  const loadShows = async () => {
    if (!parentFolder) {
      alert('Please select a parent folder first!');
      return;
    }
    const showsStructure = await invoke('get_shows_structure', { showsPath: `${parentFolder}/Shows` });
    setShows(showsStructure);
  };

  const handleMediaTypeChange = async (type) => {
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
    setGreeting(`Netflix and Chill ${currentTheme.emoji}`);
    
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
          <ul data-tauri-drag-region>
            {Object.entries(filteredShows).map(([showName, seasons]) => (
              <li key={showName} className="show-item" data-tauri-drag-region>
                <h3 data-tauri-drag-region>{showName}</h3>
                <ul data-tauri-drag-region>
                  {Object.entries(seasons).map(([seasonName, episodes]) => (
                    <li key={seasonName} className="season-item">
                      <h4>{seasonName}</h4>
                      <ul data-tauri-drag-region>
                        {episodes.map((episode) => {
                          const path = `${parentFolder}Shows\\${showName}\\${seasonName}\\${episode}`;
                          return <li key={episode} className="episode-item" >
                            <span onClick={() => {
                              openMedia(path);
                            }}>🎥 {episode}</span>
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
                          </li>
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
