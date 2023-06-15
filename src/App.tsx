import { Component, createSignal } from "solid-js";
import * as Pitchfinder from "pitchfinder";

import styles from "./App.module.css";

const noteStrings = [
    'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
] as const;

function noteNameFromPitch(frequency: number | null): string | null {
    if (frequency === null) {
        return null;
    }

    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return noteStrings[(Math.round(noteNum) + 69) % 12];
}

const App: Component = () => {
    const [note, setNote] = createSignal<string | null>(null);
    const [pitch, setPitch] = createSignal<number | null>(null);

    function startAudioProcessing() {
        const fftSize = 4096;
        let audioContext = new window.AudioContext();
        const detector = Pitchfinder.AMDF({
            sampleRate: audioContext.sampleRate
        });

        let array = new Float32Array(fftSize);
        let source: MediaStreamAudioSourceNode;
        console.log(audioContext.sampleRate);
        let analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;

        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                setInterval(() => {
                    analyser.getFloatTimeDomainData(array);
                    const frequency = detector(array);
                    setPitch(frequency);
                    const detectedNote = noteNameFromPitch(frequency);
                    setNote(detectedNote);
                }, 16);
            });
    }

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <p class={styles.link}>{note()}</p>
                <p class={styles.link}>{pitch()}</p>
                <button onClick={startAudioProcessing}>Start Tuning</button>
            </header>
        </div>
    );
};

export default App;
