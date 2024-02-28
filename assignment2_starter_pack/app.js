// Initialize Tone.js synthesizer for playing notes
const synth = new Tone.Synth().toDestination();

// Function to play a note
const playNote = (note, duration = "8n") => {
  synth.triggerAttackRelease(note, duration);
};

// Event listeners for piano keys (mouse interaction)
document.querySelectorAll('.whitebtn, .blackbtn').forEach(key => {
  key.addEventListener('click', () => {
    const note = key.id.toUpperCase(); // Get the note from the button's id
    playNote(note); // Play the selected note
    if (isRecording) {
      recordedNotes.push({ note: note, time: Date.now() - recordingStartTime }); // Record the played note
    }
  });
});

// Keyboard to piano key mapping and event listener for keyboard interaction
const keyboardToNoteMap = {
  'KeyA': 'C4',
  'KeyW': 'C#4',
  'KeyS': 'D4',
  'KeyE': 'D#4',
  'KeyD': 'E4',
  'KeyF': 'F4',
  'KeyT': 'F#4',
  'KeyG': 'G4',
  'KeyY': 'G#4',
  'KeyH': 'A4',
  'KeyU': 'Bb4',
  'KeyJ': 'B4',
  'KeyK': 'C5',
  'KeyO': 'C#5',
  'KeyL': 'D5',
  'KeyP': 'D#5',
  'Semicolon': 'E5',
};

document.addEventListener('keydown', event => {
  if (keyboardToNoteMap[event.code]) {
    const note = keyboardToNoteMap[event.code];
    playNote(note); // Play the selected note
    if (isRecording) {
      recordedNotes.push({ note: note, time: Date.now() - recordingStartTime }); // Record the played note
    }
  }
});

// Recording functionality
let isRecording = false;
let recordedNotes = [];
let recordingStartTime;

document.getElementById('recordbtn').addEventListener('click', () => {
  isRecording = true;
  recordedNotes = [];
  recordingStartTime = Date.now();
  document.getElementById('stopbtn').disabled = false;
  document.getElementById('recordbtn').disabled = true;
});

document.getElementById('stopbtn').addEventListener('click', async () => {
  isRecording = false;
  document.getElementById('stopbtn').disabled = true;
  document.getElementById('recordbtn').disabled = false;
  const tuneName = document.getElementById('recordName').value || 'No-name Tune';
  try {
    // Send recorded notes to the backend for storage
    await axios.post('http://localhost:3000/api/v1/tunes', {
      name: tuneName,
      notes: recordedNotes
    });
    fetchTunes(); // Refresh the list of tunes
  } catch (error) {
    console.error('Error saving tune:', error);
  }
});

// Function to fetch tunes from the backend and populate the dropdown menu
const fetchTunes = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/tunes');
    const tunes = response.data;
    const tunesDrop = document.getElementById('tunesDrop');
    // Clear existing options first
    tunesDrop.innerHTML = '<option value="">Select a tune</option>';
    tunes.forEach(tune => {
      const option = new Option(tune.name, tune.id);
      tunesDrop.add(option);
    });
  } catch (error) {
    console.error('Failed to fetch tunes:', error);
  }
};

// Call fetchTunes when the page loads
document.addEventListener('DOMContentLoaded', fetchTunes);

// Playing selected tunes
document.getElementById('tunebtn').addEventListener('click', async () => {
  const selectedTuneId = document.getElementById('tunesDrop').value;
  if (!selectedTuneId) return;
  
  try {
    // Fetch the selected tune details from the backend
    const response = await axios.get(`http://localhost:3000/api/v1/tunes/${selectedTuneId}`);
    const tune = response.data;
    tune.notes.forEach(noteObj => {
      playNote(noteObj.note, noteObj.duration); // Play each note of the selected tune
    });
  } catch (error) {
    console.error('Error fetching tune details:', error);
  }
});