class KaraokePitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // pitch dalam semitone
    this.semitones = 0;
    this.pitchFactor = 1;

    // Buffer per channel
    this.bufferSize = 4096;
    this.hopSize = 128;

    this.buffers = [
      new Float32Array(this.bufferSize),
      new Float32Array(this.bufferSize),
    ];

    this.writeIndex = 0;
    this.readPosition = 0;

    this.port.onmessage = (event) => {
      if (event.data?.type === "pitch") {
        const semitones = Number(event.data.value) || 0;

        this.semitones = Math.max(-6, Math.min(6, semitones));

        // 1 semitone = 2^(1/12)
        this.pitchFactor = Math.pow(2, this.semitones / 12);
      }
    };
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || input.length === 0) {
      return true;
    }

    const frameCount = output[0]?.length || 128;

    // ==========================================
    // NORMAL / PITCH 0
    // ==========================================

    if (Math.abs(this.semitones) < 0.001) {
      for (let channel = 0; channel < output.length; channel++) {
        const inputChannel = input[channel] || input[0];
        const outputChannel = output[channel];

        if (!inputChannel) {
          outputChannel.fill(0);
          continue;
        }

        outputChannel.set(inputChannel);
      }

      return true;
    }

    // ==========================================
    // SIMPAN INPUT KE RING BUFFER
    // ==========================================

    for (let i = 0; i < frameCount; i++) {
      for (let channel = 0; channel < Math.min(output.length, 2); channel++) {
        const inputChannel = input[channel] || input[0];

        if (inputChannel) {
          this.buffers[channel][this.writeIndex] = inputChannel[i] || 0;
        }
      }

      this.writeIndex++;

      if (this.writeIndex >= this.bufferSize) {
        this.writeIndex = 0;
      }
    }

    // ==========================================
    // RESAMPLE
    // ==========================================

    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];

      const buffer = this.buffers[Math.min(channel, 1)];

      let readPosition = this.readPosition;

      for (let i = 0; i < frameCount; i++) {
        const index1 = Math.floor(readPosition) % this.bufferSize;

        const index2 = (index1 + 1) % this.bufferSize;

        const fraction = readPosition - Math.floor(readPosition);

        const sample1 = buffer[index1];
        const sample2 = buffer[index2];

        outputChannel[i] = sample1 + (sample2 - sample1) * fraction;

        readPosition += this.pitchFactor;

        while (readPosition >= this.bufferSize) {
          readPosition -= this.bufferSize;
        }
      }
    }

    this.readPosition += frameCount * this.pitchFactor;

    while (this.readPosition >= this.bufferSize) {
      this.readPosition -= this.bufferSize;
    }

    return true;
  }
}

registerProcessor("karaoke-pitch-processor", KaraokePitchProcessor);
