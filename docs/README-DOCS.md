# MediaSoup Video Conferencing Service Documentation

## Overview

This directory contains comprehensive documentation for the MediaSoup Video Conferencing Service, built using [Docsify](https://docsify.js.org/). The documentation provides detailed information about the service architecture, API reference, deployment guides, and troubleshooting.

## Quick Start

### Prerequisites

- **Node.js**: v16 or higher
- **npm**: Package manager
- **Git**: Version control

### Starting the Documentation Server

#### Option 1: Using the provided scripts

**Windows:**
```cmd
start-docs.bat
```

**Linux/macOS:**
```bash
./start-docs.sh
```

#### Option 2: Manual installation

1. **Install Docsify globally:**
   ```bash
   npm install -g docsify-cli
   ```

2. **Start the documentation server:**
   ```bash
   docsify serve docs 3000
   ```

3. **Access the documentation:**
   Open your browser and navigate to `http://localhost:3000`

## Documentation Structure

```
docs/
├── README.md                    # Main documentation page
├── _sidebar.md                  # Navigation sidebar
├── index.html                   # Docsify configuration
├── getting-started.md           # Installation and setup guide
├── mediasoup-overview.md        # MediaSoup technology overview
├── api-reference.md             # Complete API documentation
├── configuration.md             # Configuration guide
├── architecture.md              # System architecture
├── deployment.md                # Deployment instructions
├── development.md               # Development guide
└── troubleshooting.md           # Troubleshooting guide
```

## Documentation Features

### 🔍 Search
- Full-text search across all documentation
- Real-time search results
- Search highlighting

### 📱 Responsive Design
- Mobile-friendly interface
- Adaptive layout for different screen sizes
- Touch-friendly navigation

### 📋 Code Examples
- Syntax highlighting for multiple languages
- Copy-to-clipboard functionality
- Interactive code blocks

### 🧭 Navigation
- Sidebar navigation with collapsible sections
- Breadcrumb navigation
- Previous/Next page navigation

### 🎨 Custom Styling
- Modern, clean design
- Consistent color scheme
- Professional typography

## Documentation Sections

### 1. Getting Started
- Prerequisites and system requirements
- Step-by-step installation guide
- Quick test procedures
- Development workflow

### 2. MediaSoup Overview
- What is MediaSoup?
- How MediaSoup works
- Core components and architecture
- Performance and scalability

### 3. API Reference
- Complete Socket.IO events documentation
- Client-side API reference
- Error handling and best practices
- Security considerations

### 4. Configuration
- Server configuration options
- MediaSoup configuration
- Environment-based configuration
- Performance tuning

### 5. Architecture
- System overview and components
- Data flow diagrams
- Security architecture
- Scalability considerations

### 6. Deployment
- Development deployment
- Production deployment
- Docker deployment
- Kubernetes deployment

### 7. Development
- Development environment setup
- Code organization and structure
- Testing strategies
- Debugging tools

### 8. Troubleshooting
- Common issues and solutions
- Debugging tools and techniques
- Performance optimization
- Getting help

## Customization

### Modifying Documentation

1. **Edit Markdown files** in the `docs/` directory
2. **Update navigation** by editing `_sidebar.md`
3. **Customize styling** by modifying `index.html`
4. **Add new sections** by creating new `.md` files

### Adding New Content

1. **Create a new markdown file** in the `docs/` directory
2. **Add it to the sidebar** in `_sidebar.md`
3. **Follow the existing format** and style
4. **Test your changes** by refreshing the documentation

### Styling Customization

The documentation uses custom CSS for styling. You can modify the styles in the `<style>` section of `index.html`:

```css
:root {
  --theme-color: #3eaf7c;        /* Primary theme color */
  --sidebar-width: 18rem;        /* Sidebar width */
}
```

## Contributing to Documentation

### Guidelines

1. **Use clear, concise language**
2. **Include code examples** where appropriate
3. **Add screenshots** for complex procedures
4. **Keep content up-to-date** with code changes
5. **Test all code examples** before publishing

### Markdown Formatting

```markdown
# Main heading
## Section heading
### Subsection heading

**Bold text**
*Italic text*
`inline code`

```javascript
// Code block
function example() {
  return 'Hello World';
}
```

> Blockquote for important notes

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

### Code Examples

- Use syntax highlighting for code blocks
- Include file paths in code block headers
- Provide complete, runnable examples
- Add comments to explain complex code

## Building Static Documentation

### Generate Static Site

If you need to generate a static version of the documentation:

```bash
# Install docsify-cli if not already installed
npm install -g docsify-cli

# Generate static site
docsify generate docs ./static-docs
```

### Deploying Static Documentation

The generated static site can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## Troubleshooting Documentation

### Common Issues

1. **Documentation not loading**
   - Check if docsify-cli is installed
   - Verify you're in the correct directory
   - Check for JavaScript errors in browser console

2. **Search not working**
   - Ensure search plugin is loaded
   - Check browser compatibility
   - Clear browser cache

3. **Styling issues**
   - Check CSS file paths
   - Verify CDN links are accessible
   - Test in different browsers

### Getting Help

- Check the [Docsify documentation](https://docsify.js.org/)
- Review the [Docsify GitHub repository](https://github.com/docsifyjs/docsify)
- Search for existing issues in the project repository

## Browser Compatibility

The documentation is compatible with:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Performance

- Documentation loads quickly with CDN resources
- Search is optimized for large documentation sets
- Responsive design ensures good performance on mobile devices

## Security

- Documentation is served over HTTP (for local development)
- No sensitive information is included in the documentation
- External links are clearly marked

## License

This documentation is part of the MediaSoup Video Conferencing Service project and follows the same license terms. 