import React, { useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css'; // Add this CSS file for styling
import { Checkbox } from '@mui/material';
import { pink } from '@mui/material/colors';


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

class MyComponent extends React.Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
  }

  render() {
    return <input type="text" ref={this.inputRef} />;
  }

  componentDidMount() {
    this.inputRef.current.focus();
  }
}
const App = () => {
  const [greeting, setGreeting] = React.useState('');
  const [mediaType, setMediaType] = React.useState('');
  const [mediaList, setMediaList] = React.useState([]);
  const [parentFolder, setParentFolder] = React.useState(get_parent_folder() || '');
  const [watched, setWatched] = React.useState(false);

  const imageRef = useRef(null);
  const showOpenFileDialog = () => {
    imageRef.current.click();
    console.log(imageRef.current)
  };

  React.useEffect(() => {
    setGreeting('Welcome to Your Magical Movie Browser! ✨');
  }, []);

  const selectParentFolder = async () => {
    // const folder = await invoke('select_folder');
    // if (folder) {
    //   setParentFolder(folder);
    // }
  };

  const handleMediaTypeChange = async (type) => {
    if (!parentFolder) {
      alert('Please select a parent folder first!');
      return;
    }
    setMediaType(type);
    const media = await loadMedia(
      type === 'Movies' ? `${parentFolder}/Movies` : `${parentFolder}/Shows`
    );
    setMediaList(media);
  };

  return (
    <div className="app-container" data-tauri-drag-region>
      <button
        style={{ position: 'absolute', top: '-0.6rem', right: '-0.6rem' }}
        onClick={async () => {
          await invoke("close_window");
        }}
      >o</button>
      <h1 className="greeting" data-tauri-drag-region>{greeting}</h1>
      <div className="folder-selector" data-tauri-drag-region>
        {/* <button className="btn select-folder" onClick={showOpenFileDialog}></button> */}
        <input value={parentFolder} onChange={(event) => {
          const folder = event.target.value;
          set_parent_folder(folder)
          setParentFolder(folder)
        }} placeholder='🌸 Select Parent Folder 🌸' />
        {parentFolder && <p className="selected-folder">Selected Folder: <strong>{parentFolder}</strong></p>}
      </div>
      <div className="media-type-buttons">
        <button className="btn media-btn" onClick={() => handleMediaTypeChange('Movies')}>🍿 Movies</button>
        <button className="btn media-btn" onClick={() => handleMediaTypeChange('Shows')}>📺 Shows</button>
      </div>
      <div className="media-list">
        <h2 className="media-type-title">{mediaType}</h2>

        <ul>
          {mediaList.map((item) => (
            <li key={item.path} className="media-item">
              <button className="btn media-item-btn" onClick={() => openMedia(item.path)}>
                🌟 {item.name}
              </button>
              <Checkbox
                defaultChecked={has_watched(item.name)}
                onClick={() => {
                  toggle_watched(item.name)
                  setWatched(has_watched(item.name))
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