const { spawn } = require('child_process');

let ffmpeg;

// Function to initialize FFmpeg process
const startFFmpeg = () => {
    if (ffmpeg) {
        // Terminate the previous FFmpeg process if it exists
        ffmpeg.kill('SIGINT');
    }

    ffmpeg = spawn('ffmpeg', [
        '-i', 'pipe:0', // Input from stdin
        '-c:v', 'libx264', // Video codec
        '-b:v', '2500k', // Set video bitrate to 2500 kbps
        '-preset', 'ultrafast', // Set the encoding preset
        '-c:a', 'aac', // Audio codec
        '-b:a', '160k', // Set audio bitrate to 160 kbps
        '-f', 'flv', // Output format
        'rtmp://a.rtmp.youtube.com/live2/ker9-mjxy-9f6a-p6at-05fp'
    ]);

    // Set up error handling for stderr
    ffmpeg.stderr.on('data', (data) => {
        // console.error(`stderr: ${data}`);
    });

    // Handle the close event to know when the process finishes
    ffmpeg.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        // Optionally restart FFmpeg if needed
    });

    // Error handling for ffmpeg process
    ffmpeg.on('error', (err) => {
        // console.error(`Error: ${err.message}`);
        // Handle FFmpeg process errors (e.g., restart or alert)
    });

    // Handle the exit event
    ffmpeg.on('exit', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        // Optionally restart FFmpeg if needed
    });
};

// Initialize FFmpeg process
startFFmpeg();

// Handle incoming stream data
const handleIncomingStream = (dataBuffer) => {
    if (ffmpeg && ffmpeg.stdin.writable) {
        try {
            ffmpeg.stdin.write(Buffer.from(dataBuffer));
        } catch (error) {
            console.error('Error writing to ffmpeg stdin:', error);
            // Restart FFmpeg process if needed
            startFFmpeg();
        }
    } else {
        console.error('stdin stream is not writable or ffmpeg is not initialized');
        // Restart FFmpeg process if needed
        startFFmpeg();
    }
};

// Export the function
module.exports = handleIncomingStream;
