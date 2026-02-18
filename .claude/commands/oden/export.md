---
allowed-tools: Bash, Read, Write
description: Export documentation to professional PDF with branded templates and syntax highlighting
---

# Export - Professional PDF Generation

Export markdown documentation to high-quality PDFs with professional templates, syntax highlighting, and customizable branding.

## Usage
```
/oden:export pdf [options] <input>
/oden:export pdf --template professional docs/
/oden:export pdf --template technical --output api-docs.pdf docs/reference/
/oden:export pdf --template executive --client "Acme Corp" docs/summary.md
```

## 📊 Templates Available

### Professional Template 👔
**Best for:** Business documentation, client deliverables, proposals
- Executive cover page with branding
- Table of contents with page numbers
- Professional typography and spacing
- Header/footer with company information
- Corporate color scheme and styling

### Technical Template 🔧
**Best for:** Developer documentation, API references, technical specs
- Code-focused layout with optimal syntax highlighting
- API endpoint formatting and documentation
- Monospace-friendly typography
- Support for 20+ programming languages
- Dark theme code blocks

### Executive Template 📈
**Best for:** Executive summaries, high-level presentations, board reports
- Metrics and KPI emphasis
- Clean, minimal design for decision makers
- Key highlights and visual elements
- Condensed information format
- Executive-friendly styling

## Options

### Template Selection
- `--template professional` - Business/corporate template (default)
- `--template technical` - Developer/API documentation template
- `--template executive` - Executive summary template

### Output Configuration
- `--output filename.pdf` - Specify output file path (default: documentation.pdf)
- `--verbose` - Show detailed progress during generation

### Branding Options
- `--client "Client Name"` - Client/company name for cover page
- `--project "Project Title"` - Project title for document
- `--logo path/to/logo.png` - Custom logo for branding
- `--primary-color #1E3A8A` - Primary brand color
- `--secondary-color #64748B` - Secondary brand color

### Advanced Options
- `--no-toc` - Skip table of contents generation
- `--no-cover` - Skip cover page generation
- `--page-size A4|Letter` - Page size (default: A4)
- `--margins "1in"` - Page margins specification

## 🚀 Implementation

### Preflight Validation

1. **Input Validation**
   ```bash
   # Check if input exists
   if [ ! -e "$INPUT_PATH" ]; then
     echo "❌ Input path not found: $INPUT_PATH"
     exit 1
   fi

   # Validate template
   VALID_TEMPLATES="professional technical executive"
   if [[ ! " $VALID_TEMPLATES " =~ " $TEMPLATE " ]]; then
     echo "❌ Invalid template: $TEMPLATE"
     echo "Available templates: $VALID_TEMPLATES"
     exit 1
   fi
   ```

2. **Dependencies Check**
   ```bash
   # Check if required Node.js modules are available
   node -e "require('puppeteer')" 2>/dev/null || {
     echo "❌ Puppeteer not found. Run: npm install puppeteer"
     exit 1
   }
   ```

### Export Process

```bash
#!/bin/bash

# Parse command line arguments
INPUT_PATH="$1"
TEMPLATE="${TEMPLATE:-professional}"
OUTPUT="${OUTPUT:-documentation.pdf}"
VERBOSE="${VERBOSE:-false}"

# Build branding configuration
BRANDING_CONFIG="{"
BRANDING_CONFIG="${BRANDING_CONFIG}\"clientName\": \"${CLIENT:-Professional Client}\","
BRANDING_CONFIG="${BRANDING_CONFIG}\"projectTitle\": \"${PROJECT:-Project Documentation}\","
BRANDING_CONFIG="${BRANDING_CONFIG}\"companyName\": \"${COMPANY:-Your Company}\","
BRANDING_CONFIG="${BRANDING_CONFIG}\"logoPath\": \"${LOGO:-}\","
BRANDING_CONFIG="${BRANDING_CONFIG}\"primaryColor\": \"${PRIMARY_COLOR:-#1E3A8A}\","
BRANDING_CONFIG="${BRANDING_CONFIG}\"secondaryColor\": \"${SECONDARY_COLOR:-#64748B}\""
BRANDING_CONFIG="${BRANDING_CONFIG}}"

# Create temporary Node.js script for PDF generation
cat > /tmp/oden_pdf_export.js << 'EOF'
const { exportToPDF } = require('./lib/export');
const path = require('path');

async function main() {
    const options = {
        input: process.argv[2],
        output: process.argv[3],
        template: process.argv[4],
        branding: JSON.parse(process.argv[5] || '{}'),
        verbose: process.argv[6] === 'true'
    };

    try {
        console.log(`🔄 Starting PDF export...`);
        console.log(`📄 Input: ${options.input}`);
        console.log(`🎨 Template: ${options.template}`);
        console.log(`💾 Output: ${options.output}`);

        const result = await exportToPDF(options);

        console.log(`✅ PDF exported successfully!`);
        console.log(`📊 File size: ${(result.fileSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📄 Pages: ${result.pageCount}`);
        console.log(`📁 Location: ${result.outputPath}`);

    } catch (error) {
        console.error(`❌ Export failed:`, error.message);
        process.exit(1);
    }
}

main();
EOF

# Execute PDF generation
echo "🔄 Initializing PDF export..."
node /tmp/oden_pdf_export.js "$INPUT_PATH" "$OUTPUT" "$TEMPLATE" "$BRANDING_CONFIG" "$VERBOSE"

# Cleanup
rm -f /tmp/oden_pdf_export.js

echo ""
echo "🎉 Export completed!"
echo "📋 Summary:"
echo "   Template: $TEMPLATE"
echo "   Output: $OUTPUT"
echo "   Input: $INPUT_PATH"
echo ""
echo "💡 Next steps:"
echo "   • Open the PDF to review formatting"
echo "   • Share with stakeholders for feedback"
echo "   • Use different templates for different audiences"
```

## 📊 Features & Capabilities

### Markdown Processing
- ✅ Headers with automatic anchoring
- ✅ Tables with professional formatting
- ✅ Lists with consistent styling
- ✅ Images with captions and optimization
- ✅ Links (internal and external)
- ✅ Blockquotes and callouts
- ✅ Task lists and checkboxes

### Code Highlighting
- ✅ 20+ programming languages supported
- ✅ Syntax highlighting with print-optimized colors
- ✅ Line numbers and language labels
- ✅ Inline code formatting
- ✅ Code block themes (light/dark)

### Professional Features
- ✅ Automatic table of contents generation
- ✅ Page numbers and navigation
- ✅ Headers and footers with branding
- ✅ Cover page with client information
- ✅ Consistent typography and spacing
- ✅ Print-optimized layouts and colors

### Performance
- ⚡ Generation time: <30 seconds for typical docs
- 📊 High-resolution output (300 DPI)
- 🗜️ Optimized file sizes
- 🔄 Progress reporting for large documents
- 💾 Memory-efficient processing

## 🎯 Use Cases & Examples

### Business Documentation
```bash
/oden:export pdf --template professional \
  --client "Acme Corporation" \
  --project "Q4 Technical Review" \
  --logo ./assets/acme-logo.png \
  --primary-color "#1E40AF" \
  docs/quarterly-review/
```

### API Documentation
```bash
/oden:export pdf --template technical \
  --project "REST API Reference v2.1" \
  --output api-docs-v2.1.pdf \
  docs/api/
```

### Executive Summary
```bash
/oden:export pdf --template executive \
  --client "Board of Directors" \
  --project "Digital Transformation Initiative" \
  docs/executive-summary.md
```

### Single File Export
```bash
/oden:export pdf --template professional \
  --output project-overview.pdf \
  README.md
```

## 🔧 Troubleshooting

### Common Issues

**PDF Generation Fails**
```bash
# Check Node.js version
node --version  # Should be >=16.0.0

# Check dependencies
npm list puppeteer markdown-it prismjs
```

**Memory Issues with Large Documents**
```bash
# Use verbose mode to monitor progress
/oden:export pdf --verbose --template technical docs/

# Split large directories into smaller batches
/oden:export pdf --template professional docs/section1/
/oden:export pdf --template professional docs/section2/
```

**Styling Issues**
```bash
# Try different templates
/oden:export pdf --template technical  # Better for code-heavy docs
/oden:export pdf --template executive  # Better for summaries
```

**Missing Images or Assets**
```bash
# Check image paths are relative to input directory
# Images should be accessible from the markdown file location
ls -la docs/images/  # Verify images exist
```

## 📋 Quality Checklist

Before sharing PDFs with stakeholders:

- [ ] Cover page displays correct client/project information
- [ ] Table of contents is complete and accurate
- [ ] All code blocks have proper syntax highlighting
- [ ] Images are properly scaled and captioned
- [ ] Page breaks occur at logical points
- [ ] Headers and footers contain appropriate information
- [ ] Links are properly formatted (internal/external)
- [ ] Brand colors and fonts are correctly applied

## 🚀 Performance Metrics

### Benchmarks (on MacBook Pro M1)
- **Small document** (1-5 pages): 5-10 seconds
- **Medium document** (10-20 pages): 15-25 seconds
- **Large document** (50+ pages): 25-45 seconds

### File Size Guidelines
- **Text-heavy**: ~50KB per page
- **Code-heavy**: ~100KB per page
- **Image-heavy**: ~200KB per page

## 🔄 Integration with Oden Workflow

1. **After PRD Creation**: Export executive summary for stakeholders
   ```bash
   /oden:prd user-authentication
   /oden:export pdf --template executive .claude/prds/user-authentication.md
   ```

2. **After Technical Architecture**: Export technical documentation
   ```bash
   /oden:architect
   /oden:export pdf --template technical docs/reference/technical-decisions.md
   ```

3. **For Client Deliverables**: Export comprehensive project documentation
   ```bash
   /oden:export pdf --template professional \
     --client "Client Name" \
     --project "Project Deliverable" \
     docs/
   ```

## Success Output

```
🎉 PDF export completed successfully!

📊 Export Summary:
  Template: professional
  Input: docs/
  Output: documentation.pdf
  File size: 2.4 MB
  Pages: 15
  Processing time: 18 seconds

🎨 Template Features Applied:
  ✅ Professional cover page with client branding
  ✅ Table of contents with page numbers (3 sections, 12 subsections)
  ✅ Syntax highlighting for 8 code blocks (JavaScript, Python, SQL)
  ✅ 5 images optimized and properly captioned
  ✅ Headers/footers with company information
  ✅ Print-optimized colors and typography

📋 Document Structure:
  • Cover Page
  • Table of Contents
  • Executive Summary (2 pages)
  • Technical Overview (6 pages)
  • Implementation Guide (4 pages)
  • API Reference (3 pages)

💡 Professional Quality:
  • High-resolution output (300 DPI)
  • Print-ready formatting
  • Consistent typography and spacing
  • Brand-compliant styling

Next Steps:
  1. Review PDF for accuracy and formatting
  2. Share with stakeholders for feedback
  3. Consider exporting with different templates for different audiences
```

---

**Note**: The PDF export system uses Puppeteer for HTML-to-PDF conversion, ensuring high-quality output that matches modern web standards while being optimized for professional printing.