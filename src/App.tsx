import { Component, createSignal } from 'solid-js';
import * as Pitchfinder from "pitchfinder";

import styles from './App.module.css';

const App: Component = () => {
    const [pitch, setPitch] = createSignal<number | null>(null);

    function startAudioProcessing() {
        const fftSize = 2048;
        const detector = Pitchfinder.AMDF();

        let array = new Float32Array(2048);
        let source: MediaStreamAudioSourceNode;
        let audioContext = new window.AudioContext();
        let analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                setInterval(() => {
                    analyser.getFloatTimeDomainData(array);
                    setPitch(detector(array));
                }, 16)
            })
    }

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <p class={styles.link}>
          {pitch()}
        </p>
        <button onClick={startAudioProcessing}>
          Start Tuning
        </button>
      </header>
    </div>
  );
};

export default App;
