import React from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css'; // Add this CSS file for styling

async function loadMedia(folderPath) {
  return await invoke('get_media_structure', { path: folderPath });
}

async function openMedia(filePath) {
  // Open the media file using the default video player
  // await open(filePath);
}

const App = () => {
  const [greeting, setGreeting] = React.useState('');
  const [mediaType, setMediaType] = React.useState('');
  const [mediaList, setMediaList] = React.useState([]);
  const [parentFolder, setParentFolder] = React.useState('/Volumes/My Passport/KYRA');

  React.useEffect(() => {
    setGreeting('Welcome to Your Magical Movie Browser! ✨');
  }, []);

  const selectParentFolder = async () => {
    const folder = await invoke('select_folder');
    if (folder) {
      setParentFolder(folder);
    }
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
    <div className="app-container">
      <h1 className="greeting">{greeting}</h1>
      <div className="folder-selector">
        <button className="btn select-folder" onClick={selectParentFolder}>🌸 Select Parent Folder 🌸</button>
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;