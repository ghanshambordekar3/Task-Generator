# AI Notes

## What AI Was Used For

### Code Generation
- **Initial project structure**: Used AI to scaffold React and Flask applications
- **Component logic**: Generated form handling, state management, and API integration
- **PDF export functionality**: AI helped implement html2pdf.js integration
- **Styling**: Generated CSS animations and responsive design

### Problem Solving
- **PDF encoding issues**: AI suggested switching from jsPDF to html2pdf.js to fix character encoding
- **Dynamic user stories**: AI helped create logic to extract action verbs from goals
- **Input validation**: AI generated validation logic for form inputs

## What I Checked/Verified Myself

### Functionality Testing
- ✅ Tested form submission with various inputs
- ✅ Verified PDF export renders correctly on A4 paper
- ✅ Confirmed task editing and reordering works properly
- ✅ Validated history feature stores last 5 specs
- ✅ Tested status page shows correct health information

### Code Quality
- ✅ Reviewed all generated code for security issues
- ✅ Ensured proper error handling in API calls
- ✅ Verified CORS configuration is correct
- ✅ Checked that all dependencies are properly installed

### User Experience
- ✅ Tested responsive design on different screen sizes
- ✅ Verified animations work smoothly
- ✅ Confirmed all buttons and interactions are intuitive
- ✅ Validated export formats (Markdown and PDF) are readable

## LLM and Provider

**LLM Used**: Amazon Q Developer (Claude-based)
**Provider**: AWS

### Why This Choice?
- **Integrated IDE support**: Direct integration with development environment
- **Context awareness**: Understands project structure and file relationships
- **Code quality**: Generates production-ready, well-structured code
- **Security focus**: Built-in security best practices
- **No external API keys needed**: Works within AWS ecosystem

## Generation Approach

This app uses **rule-based generation** (not LLM) for task creation:
- User stories are generated using template strings with dynamic goal insertion
- Tasks are predefined templates customized with user inputs
- No external LLM API calls during runtime
- Fast, predictable, and cost-effective

This approach was chosen for:
- **Simplicity**: No API keys or external dependencies
- **Speed**: Instant generation without API latency
- **Cost**: Zero runtime costs
- **Reliability**: No API rate limits or downtime
