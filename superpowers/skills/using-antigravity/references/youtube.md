# YouTube Video Analysis with Antygravity CLI

Use Antygravity CLI to summarize YouTube videos, extract key points, and get information from video content without watching.

## Critical Requirement

**MUST use `--yolo` mode.** YouTube access requires web_fetch tool, which needs automatic approval via `--yolo`.

## Command Syntax

```bash
agy --yolo "Your prompt about https://youtube.com/watch?v=VIDEO_ID"
```

## Common Use Cases

### Summarize Video

```bash
agy --yolo "Summarize this YouTube video: https://youtube.com/watch?v=dQw4w9WgXcQ"
```

### Extract Key Points

```bash
agy --yolo "List the main points from https://youtube.com/watch?v=abc123"
```

### Get Specific Information

```bash
agy --yolo "What is the main thesis of the video at https://youtube.com/watch?v=xyz789?"
```

### Technical Content

```bash
agy --yolo "Summarize the tutorial at https://youtube.com/watch?v=tutorial123 and list the steps covered"
```

### Compare Videos

```bash
agy --yolo "Compare these two videos: https://youtube.com/watch?v=vid1 and https://youtube.com/watch?v=vid2"
```

## Output Formatting

For clean, parseable output:

```bash
agy --yolo "Summarize https://youtube.com/watch?v=abc" --output-format text
```

## Faster Execution

Disable MCP servers for faster startup:

```bash
agy --yolo --allowed-mcp-server-names "" "Summarize https://youtube.com/watch?v=abc"
```

## What Antygravity Accesses

Antygravity fetches the YouTube page via web_fetch and can access:
- Video title
- Video description
- Metadata (upload date, channel, etc.)
- Page content

**Note:** Antygravity accesses the YouTube page metadata, not the actual video frames or audio. Summaries are based on title, description, and available text content.

## Prompt Wording Tips

**Detail level:**
- Use "in detail" or "detailed summary" for more comprehensive information
- Use "briefly" for quick summaries
- Different wording produces similar results - the content is limited by available metadata

**Limitation - No Transcriptions:**
Antygravity **cannot provide video transcriptions** with timestamps. It only accesses page metadata (title, description, chapters) via web_fetch, not the actual audio/video content.

```bash
# Works - uses available metadata
agy --yolo "Summarize https://youtube.com/watch?v=abc"

# Does NOT work - cannot transcribe
agy --yolo "Give me a transcription with timestamps of https://youtube.com/watch?v=abc"
```

## URL Formats Supported

All standard YouTube URL formats work:

```bash
# Standard format
https://www.youtube.com/watch?v=VIDEO_ID

# Short format
https://youtu.be/VIDEO_ID

# Mobile format
https://m.youtube.com/watch?v=VIDEO_ID
```

## Example Full Workflow

```bash
# Get quick summary
agy --yolo "Give me a 2-sentence summary of https://youtube.com/watch?v=abc123"

# Extract detailed information
agy --yolo "From https://youtube.com/watch?v=tutorial456, extract: 1) main topic, 2) key tools mentioned, 3) target audience" --output-format text

# Research workflow
agy --yolo "I'm researching JavaScript frameworks. Summarize these videos and identify common themes: https://youtube.com/watch?v=react123, https://youtube.com/watch?v=vue456, https://youtube.com/watch?v=angular789"
```


## Best Practices

1. **Be specific in prompts** - Ask for particular information rather than generic summaries
2. **Use --output-format text** - For cleaner output when parsing results
3. **Combine with other tasks** - Chain YouTube analysis with other Antygravity operations
4. **Verify critical info** - Summaries are based on metadata; verify important details

## Limitations

- Antygravity accesses page metadata, not actual video content
- Transcripts may not be available for all videos
- Recent uploads may have limited metadata
- Private or age-restricted videos may not be accessible
