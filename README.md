# On-Device Video Segmenter

A simple web application to cut video files into smaller segments of a specified duration or extract the audio track.

## Key Features

-   **On-Device Processing**: All video processing happens directly in your browser. No files are ever uploaded to a server.
-   **Privacy-Focused**: Your video files never leave your computer, ensuring your data remains private.
-   **Custom Segment Length**: Define the exact length in minutes and seconds for each video chunk. Any remaining portion of the video shorter than the segment length will be saved as a final, shorter clip.
-   **Audio Extraction**: Easily export only the audio track from your video as an MP3 file.
-   **Powered by FFmpeg**: Utilizes the power and speed of FFmpeg compiled for the web (`ffmpeg.wasm`) to handle video and audio manipulation.
-   **No AI Needed**: This tool performs its tasks using direct media processing and does not rely on any AI or cloud-based services.

## How to Use

1.  **Open the HTML file**: Simply open the `index.html` file in your web browser.
2.  **Upload**: Drag and drop a video file onto the designated area, or click to browse and select a file from your device.
3.  **Configure**: Set your desired segment length using the minute and second input fields.
4.  **Choose Output**: If you only want the audio, check the "Export Audio Only (.mp3)" box.
5.  **Process**: Click the "Process and Split Video" button to begin. A modal will show the progress.
6.  **Download**: Once processing is complete, a list of downloadable video or audio files will appear in the "Results" section.
