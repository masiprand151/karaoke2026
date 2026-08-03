import { useEffect, useRef } from "react";

export default function useKaraokeAudio(
  videoRef,
  pitch = 0,
  volume = 50,
  audioChannel = false,
) {
  const contextRef = useRef(null);
  const sourceRef = useRef(null);

  const pitchNodeRef = useRef(null);
  const gainRef = useRef(null);

  const splitterRef = useRef(null);
  const mergerRef = useRef(null);

  const leftGainRef = useRef(null);
  const rightGainRef = useRef(null);

  // Simpan nilai terbaru
  const pitchRef = useRef(pitch);
  const volumeRef = useRef(volume);
  const audioChannelRef = useRef(audioChannel);

  // ==========================================
  // SET CHANNEL
  // ==========================================
  const applyAudioChannel = (channel) => {
    const context = contextRef.current;
    const leftGain = leftGainRef.current;
    const rightGain = rightGainRef.current;

    if (!context || !leftGain || !rightGain) return;

    let left = 1;
    let right = 1;
    // left
    if (!channel) {
      left = 1;
      right = 0;
    }

    leftGain.gain.setTargetAtTime(left, context.currentTime, 0.01);

    rightGain.gain.setTargetAtTime(right, context.currentTime, 0.01);
  };

  // ==========================================
  // AUDIO CHANNEL BERUBAH
  // ==========================================
  useEffect(() => {
    audioChannelRef.current = audioChannel;

    applyAudioChannel(audioChannel);
  }, [audioChannel]);

  // ==========================================
  // PITCH BERUBAH
  // ==========================================
  useEffect(() => {
    pitchRef.current = pitch;

    const pitchNode = pitchNodeRef.current;

    if (!pitchNode) return;

    pitchNode.port.postMessage({
      type: "pitch",
      value: pitch,
    });
  }, [pitch]);

  // ==========================================
  // VOLUME BERUBAH
  // ==========================================
  useEffect(() => {
    volumeRef.current = volume;

    const context = contextRef.current;
    const gain = gainRef.current;

    if (!context || !gain) return;

    gain.gain.setTargetAtTime(volume / 100, context.currentTime, 0.01);
  }, [volume]);

  // ==========================================
  // SETUP AUDIO
  // ==========================================
  const setupAudio = async () => {
    const video = videoRef.current;

    if (!video) return;

    // Sudah pernah setup
    if (contextRef.current) {
      const context = contextRef.current;

      if (context.state === "suspended") {
        await context.resume();
      }

      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      const context = new AudioContextClass();

      contextRef.current = context;

      // ========================================
      // LOAD PITCH PROCESSOR
      // ========================================

      await context.audioWorklet.addModule("/pitch-processor.js");

      // ========================================
      // VIDEO SOURCE
      // ========================================

      const source = context.createMediaElementSource(video);

      sourceRef.current = source;

      // ========================================
      // SPLITTER
      // ========================================

      const splitter = context.createChannelSplitter(2);

      splitterRef.current = splitter;

      // ========================================
      // LEFT / RIGHT GAIN
      // ========================================

      const leftGain = context.createGain();
      const rightGain = context.createGain();

      leftGainRef.current = leftGain;
      rightGainRef.current = rightGain;

      // ========================================
      // MERGER
      // ========================================

      const merger = context.createChannelMerger(2);

      mergerRef.current = merger;

      // ========================================
      // PITCH
      // ========================================

      const pitchNode = new AudioWorkletNode(
        context,
        "karaoke-pitch-processor",
        {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          outputChannelCount: [2],
        },
      );

      pitchNodeRef.current = pitchNode;

      pitchNode.port.postMessage({
        type: "pitch",
        value: pitchRef.current,
      });

      // ========================================
      // MASTER VOLUME
      // ========================================

      const gain = context.createGain();

      gain.gain.value = volumeRef.current / 100;

      gainRef.current = gain;

      // ========================================
      // ROUTING
      // ========================================

      // VIDEO
      // ↓
      // SPLITTER
      source.connect(splitter);

      // ambil channel LEFT
      splitter.connect(leftGain, 0, 0);

      // ambil channel RIGHT
      splitter.connect(rightGain, 1, 0);

      // ========================================
      // MONO LEFT -> L + R speaker
      // ========================================

      leftGain.connect(merger, 0, 0);

      leftGain.connect(merger, 0, 1);

      // ========================================
      // MONO RIGHT -> L + R speaker
      // ========================================

      rightGain.connect(merger, 0, 0);

      rightGain.connect(merger, 0, 1);

      // ========================================
      // MERGER -> PITCH -> VOLUME -> SPEAKER
      // ========================================

      merger.connect(pitchNode);

      pitchNode.connect(gain);

      gain.connect(context.destination);

      // Terapkan channel pertama kali
      applyAudioChannel(audioChannelRef.current);

      if (context.state === "suspended") {
        await context.resume();
      }

      console.log("KARAOKE AUDIO READY:", audioChannelRef.current);
    } catch (error) {
      console.error("KARAOKE AUDIO ERROR:", error);
    }
  };

  return {
    setupAudio,
  };
}
