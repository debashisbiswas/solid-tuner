import { Component, createSignal, Show } from "solid-js";
import * as Pitchfinder from "pitchfinder";

import styles from "./App.module.css";

const FFT_SIZE = 4096;

const NOTE_NAMES = [
    'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
] as const;

function noteNameFromPitch(frequency: number | null): string | null {
    if (frequency === null) {
        return null;
    }

    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return NOTE_NAMES[(Math.round(noteNum) + 69) % 12];
}

const App: Component = () => {
    const [note, setNote] = createSignal<string | null>(null);
    const [pitch, setPitch] = createSignal<number | null>(null);
    const [currentIntervalId, setCurrentIntervalId] = createSignal<number | null>(null);

    function startAudioProcessing() {
        let audioContext = new window.AudioContext();
        const pitchDetector = Pitchfinder.AMDF({
            sampleRate: audioContext.sampleRate
        });

        let analyser = audioContext.createAnalyser();
        analyser.fftSize = FFT_SIZE;

        let fftArray = new Float32Array(FFT_SIZE);
        let source: MediaStreamAudioSourceNode;
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                const intervalId = setInterval(() => {
                    analyser.getFloatTimeDomainData(fftArray);
                    const frequency = pitchDetector(fftArray);
                    const detectedNote = noteNameFromPitch(frequency);

                    setPitch(frequency);
                    setNote(detectedNote);
                }, 16);

                setCurrentIntervalId(intervalId);
            });
    }

    function stopAudioProcessing() {
        const id = currentIntervalId();
        if (id !== null) {
            clearInterval(id);
            setPitch(null);
            setNote(null);
            setCurrentIntervalId(null);
        }
    }

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <p class={styles.link}>{note()}</p>
                <p class={styles.link}>{pitch()}</p>
                <Show
                    when={currentIntervalId() === null}
                    fallback={<button onClick={stopAudioProcessing}>Stop Tuning</button>}
                >
                    <button onClick={startAudioProcessing}>Start Tuning</button>
                </Show>
            </header>
        </div>
    );
};

export default App;
