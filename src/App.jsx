import React, { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './assets/App.css'; // Add this CSS file for styling
import { Checkbox, IconButton } from '@mui/material';
import { pink } from '@mui/material/colors';
import { Circle } from '@mui/icons-material';
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
  const [greeting, setGreeting] = React.useState('');
  const [mediaType, setMediaType] = React.useState('');
  const [movieList, setMovieList] = React.useState([]);
  const [parentFolder, setParentFolder] = React.useState(get_parent_folder() || '');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredMovies, setFilteredMovies] = React.useState([]);

  const imageRef = useRef(null);
  const showOpenFileDialog = () => {
    imageRef.current.click();
    console.log(imageRef.current);
  };

  React.useEffect(() => {
    setGreeting('Welcome to Your Magical Movie Browser! ✨');
  }, []);

  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMovies(movieList);
    } else {
      const filtered = movieList.filter((movie) =>
        movie.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  }, [searchQuery, movieList]);

  const handleMediaTypeChange = async (type) => {
    if (!parentFolder) {
      alert('Please select a parent folder first!');
      return;
    }
    setMediaType(type);
    const media = await loadMedia(
      type === 'Movies' ? `${parentFolder}/Movies` : `${parentFolder}/Shows`
    );
    setMovieList(media);
    setFilteredMovies(media);
  };

  return (
    <div className="app-container" data-tauri-drag-region>
      <IconButton
        style={{ position: 'fixed', top: '-0.3rem', right: '-0.3rem' }}
        onClick={async () => {
          await invoke('close_window');
        }}
      >
        <Circle fontSize="small" color="error" />
      </IconButton>
      <h1 className="greeting" data-tauri-drag-region>{greeting}</h1>
      <div className="folder-selector" data-tauri-drag-region>
        <input
          value={parentFolder}
          onChange={(event) => {
            const folder = event.target.value;
            set_parent_folder(folder);
            setParentFolder(folder);
          }}
          placeholder="🌸 Select Parent Folder 🌸"
        />
        {parentFolder && (
          <p className="selected-folder">
            Selected Folder: <strong>{parentFolder}</strong>
          </p>
        )}
      </div>
      <div className="media-type-buttons">
        <button className="btn media-btn" onClick={() => handleMediaTypeChange('Movies')}>
          🍿 Movies
        </button>
        <button className="btn media-btn" onClick={() => handleMediaTypeChange('Shows')}>
          📺 Shows
        </button>
      </div>
      {mediaType === 'Movies' && (
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search for a movie..."
            className="search-input"
          />
        </div>
      )}
      <div className="media-list">
        <h2 className="media-type-title">{mediaType}</h2>
        <ul data-tauri-drag-region>
          {filteredMovies.map((item) => (
            <li key={item.path} data-tauri-drag-region className="media-item">
              <button
                className="btn media-item-btn"
                onClick={() => {
                  openMedia(item.path);
                  const randomMessage =
                    positive_messages[Math.floor(Math.random() * positive_messages.length)];
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
                }}
                sx={{
                  color: pink[800],
                  '&.Mui-checked': {
                    color: pink[600],
                  },
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;