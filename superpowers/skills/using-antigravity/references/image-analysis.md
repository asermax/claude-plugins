# Image Analysis with Antygravity CLI

Use Antygravity CLI to analyze images, screenshots, diagrams, and photos. Antygravity can describe visual content, extract text (OCR), identify objects, and analyze layouts.

## Critical Requirement

**The image file MUST be in Antygravity's working directory.** Antygravity CLI can only access files within its current working directory or subdirectories.

## Workflow Pattern

1. **Copy image to temporary directory**
2. **Navigate to that directory**
3. **Run agy with simple filename reference**

```bash
# Create temp directory
mkdir -p /tmp/agy-work

# Copy image to temp directory
cp /path/to/your/image.png /tmp/agy-work/

# Navigate and analyze
cd /tmp/agy-work && agy "Describe image.png"
```

## Command Syntax

```bash
cd <directory-with-image> && agy "Your prompt about <filename>"
```

**DO NOT** use absolute paths in the prompt - only the filename.

## Supported Image Formats

- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- WEBP (.webp)
- SVG (.svg)
- BMP (.bmp)

## Prompt Wording Tips

**Important:** Use "content of" or "What is shown in" to avoid Antygravity returning just the file type instead of analyzing the visual content.

```bash
# Good - analyzes visual content
cd /tmp/agy-work && agy "Describe the content of screenshot.png"
cd /tmp/agy-work && agy "What is shown in diagram.jpg?"

# Avoid - may return just "JPEG image"
cd /tmp/agy-work && agy "Describe screenshot.png"
```

**Detail level:**
- Use "in detail" for comprehensive analysis
- Use "briefly" for quick summaries

## Common Use Cases

### Describe Screenshot

```bash
cd /tmp/agy-work && agy "Describe what you see in screenshot.png"
```

### Extract Text (OCR)

```bash
cd /tmp/agy-work && agy "Extract all text from document.png"
```

### Analyze Diagram

```bash
cd /tmp/agy-work && agy "Explain the architecture shown in diagram.png"
```

### Identify UI Elements

```bash
cd /tmp/agy-work && agy "List all UI elements and their layout in mockup.png"
```

### Compare Images

```bash
cd /tmp/agy-work && agy "Compare before.png and after.png - what changed?"
```

## Output Formatting

For clean, parseable output:

```bash
cd /tmp/agy-work && agy "Describe logo.png" --output-format text
```

## Faster Execution

Disable MCP servers for faster startup:

```bash
cd /tmp/agy-work && agy --allowed-mcp-server-names "" "Describe icon.png"
```

## Example Full Workflow

```bash
# 1. Create working directory
mkdir -p /tmp/agy-images

# 2. Copy images
cp ~/Screenshots/error-dialog.png /tmp/agy-images/
cp ~/Downloads/invoice.jpg /tmp/agy-images/

# 3. Analyze first image
cd /tmp/agy-images && agy "Describe the error shown in error-dialog.png"

# 4. Extract data from second image
cd /tmp/agy-images && agy "Extract the invoice number, date, and total from invoice.jpg"

# 5. Clean up
rm -rf /tmp/agy-images
```

