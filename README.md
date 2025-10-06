# 🤖 Nexa.ai - Advanced AI Assistant Platform

<div align="center">

![Nexa.ai Logo](public/logo.png)

**A comprehensive AI-powered assistant platform with advanced features including voice interaction, computer vision, file processing, and intelligent conversation management.**

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.3-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Pro-4285F4.svg)](https://ai.google.dev/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-API-00D4AA.svg)](https://platform.deepseek.com/)

</div>

## 🌟 Features

### 🧠 **Intelligent AI Chat**
- **Dual AI Engine**: Powered by Google Gemini 1.5 Pro and DeepSeek for optimal performance
- **Context-Aware Conversations**: Smart follow-up detection and conversation history management
- **Code Intelligence**: Advanced code analysis, formatting, and programming assistance
- **Multi-Modal Support**: Text, voice, and visual input processing

### 🎤 **Voice & Speech**
- **Real-time Speech Recognition**: Voice-to-text input with browser compatibility
- **Text-to-Speech**: Natural voice responses with multiple voice options
- **Voice Commands**: Hands-free interaction and control

### 👁️ **Computer Vision & Surveillance**
- **Face Recognition**: Advanced facial recognition using Face-API.js
- **Seat Monitoring**: Real-time monitoring with unauthorized access detection
- **Smart Surveillance**: Body detection and movement tracking
- **WhatsApp Alerts**: Automated notifications for security events

### 📁 **File Processing**
- **Document Summarization**: Upload and summarize various file formats
- **PDF Generation**: Export summaries and conversations as PDFs
- **Multi-format Support**: Text, PDF, and other document types

### 🎥 **YouTube Integration**
- **Video Summarization**: Extract and summarize YouTube video content
- **Multi-language Translation**: Translate summaries to multiple languages
- **Auto-play Integration**: Direct YouTube video playback from chat

### 💬 **Session Management**
- **Persistent Conversations**: Save and manage chat sessions
- **Session History**: Access previous conversations with search
- **Auto-save**: Automatic conversation persistence
- **Session Analytics**: Track conversation patterns and usage

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark Theme**: Eye-friendly dark interface with customizable themes
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with camera/microphone access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nexa-ai.git
   cd nexa-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
   VITE_FIREBASE_CONFIG=your_firebase_config
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library with concurrent features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Styled Components** - CSS-in-JS styling
- **React Icons** - Comprehensive icon library

### AI & ML
- **Google Gemini 1.5 Pro** - Primary AI language model
- **DeepSeek API** - Secondary AI for code and logical reasoning
- **Face-API.js** - Real-time face detection and recognition
- **TensorFlow.js** - Machine learning in the browser

### Backend Services
- **Express.js** - REST API server
- **MongoDB** - Database for session storage
- **Firebase** - Real-time notifications and authentication
- **WhatsApp API** - Alert notifications

### Additional Libraries
- **Axios** - HTTP client
- **jsPDF** - PDF generation
- **React Webcam** - Camera access
- **React Speech Recognition** - Voice input
- **Leaflet** - Interactive maps
- **Prism.js** - Code syntax highlighting

## 📱 Usage Guide

### Basic Chat
1. Type your message in the input field
2. Press Enter or click Send
3. The AI will respond using the most appropriate model

### Voice Interaction
1. Click the microphone icon
2. Speak your message clearly
3. The system will convert speech to text and process

### File Upload
1. Click the file upload icon
2. Select your document
3. Wait for processing and summary generation

### YouTube Summarization
1. Click the YouTube icon
2. Paste a YouTube URL
3. Get instant video summary with translation options

### Session Management
1. Use the sidebar to view all sessions
2. Click on any session to load previous conversations
3. Create new sessions for different topics

## 🔧 Configuration

### API Keys Setup

#### Google Gemini
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env` file

#### DeepSeek
1. Sign up at [DeepSeek Platform](https://platform.deepseek.com/)
2. Generate an API key
3. Add to your `.env` file

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication and Firestore
3. Add configuration to `.env`

## 🏗️ Project Structure

```
nexa-ai/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ChatArea.jsx   # Main chat interface
│   │   ├── SeatMonitor.jsx # Surveillance component
│   │   ├── Sidebar.jsx    # Session management
│   │   └── ...
│   ├── context/           # React context providers
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── styles/            # CSS and styling
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Use TypeScript for new components
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google** for the Gemini AI API
- **DeepSeek** for advanced AI capabilities
- **Face-API.js** for computer vision features
- **React Team** for the amazing framework
- **Vite Team** for the fast build tool

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/nexa-ai/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/nexa-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/nexa-ai/discussions)
- **Email**: support@nexa-ai.com

## 🔮 Roadmap

- [ ] **Mobile App**: React Native version
- [ ] **Plugin System**: Extensible architecture
- [ ] **Advanced Analytics**: Usage insights and metrics
- [ ] **Multi-language Support**: Internationalization
- [ ] **API Documentation**: Comprehensive API docs
- [ ] **Enterprise Features**: Team collaboration tools

---

<div align="center">

**Made with ❤️ by the Nexa.ai Team**

[Website](https://nexa-ai.com) • [Documentation](https://docs.nexa-ai.com) • [Community](https://discord.gg/nexa-ai)

</div>
