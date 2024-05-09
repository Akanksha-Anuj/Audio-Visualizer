import React, { Fragment, useState, useEffect } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import "./AudioSelector.css"; // Import CSS file

const AudioSelector = () => {
  const [selectedAudio, setSelectedAudio] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const canvasRef = React.createRef();

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    let file = event.dataTransfer.files[0];
    setSelectedAudio(file);
    setIsPlaying(false);
  };

  const handleOnChange = (event) => {
    let file = event.target.files[0];
    setSelectedAudio(file);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audioElement) return;
    if (isPlaying) audioElement.pause();
    else audioElement.play();
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioElement && isPlaying) {
      audioElement.play();
    } else if (audioElement) {
      audioElement.pause();
    }
  }, [isPlaying, audioElement]);

  useEffect(() => {
    if (!audioElement) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyserNode = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioElement);

    source.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);

    setAnalyser(analyserNode);

    return () => {
      audioCtx.close();
    };
  }, [audioElement]);

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const draw = () => {
      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];

        ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
        ctx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    };

    draw();
  };

  useEffect(() => {
    if (isPlaying && analyser) {
      drawVisualizer();
    }
  }, [isPlaying, analyser]);

  return (
    <Fragment>
      <div className="centered-container">
        <div
          className="drop-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <label htmlFor="audio-file" className="drop-label">
            Drag & Drop Audio File Here
          </label>
          <input
            type="file"
            accept="audio/*"
            id="audio-file"
            onChange={handleOnChange}
            className="file-input"
          />
        </div>
        {selectedAudio && (
          <div className="audio-info">
            <div className="audio-details">
              <h2>File selected:</h2>
              <p>Name: {selectedAudio.name}</p>
              <p>Size: {selectedAudio.size} bytes</p>
            </div>
            <div className="audio-controls">
              <button className="play-button" onClick={togglePlay}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </button>
            </div>
            {isPlaying && (
              <canvas ref={canvasRef} className="visualizer"></canvas>
            )}
            <audio
              ref={(audio) => setAudioElement(audio)}
              src={URL.createObjectURL(selectedAudio)}
            />
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default AudioSelector;
