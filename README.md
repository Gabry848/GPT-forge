# 🤖 GPT Forge
### *The Ultimate AI Assistant Creation Platform*

<div align="center">

![GPT Forge](https://img.shields.io/badge/GPT-Forge-blue?style=for-the-badge&logo=openai&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

*Create, customize, and deploy specialized AI assistants with advanced voice capabilities*

</div>

---

## ✨ What is GPT Forge?

**GPT Forge** is a powerful desktop application that empowers you to create and customize specialized AI assistants for any domain. Built with cutting-edge technologies like Electron, React, and TypeScript, it provides an intuitive platform for crafting intelligent conversational agents with advanced voice recognition and synthesis capabilities.

Whether you're building financial advisors, news analysts, trading experts, or completely custom assistants, GPT Forge gives you the tools to bring your AI vision to life.

## 🚀 Key Features

### 🎯 **Specialized AI Assistants**
- 📈 **Financial Advisor** - Expert in trading and market analysis
- 📰 **News Analyst** - Specialized in economic news interpretation
- 💹 **Trading Expert** - Advanced TradingView and market strategies
- 📊 **Volsys Specialist** - Volume analysis and order flow expert
- 🛠️ **Custom Assistant** - Create your own specialized AI with custom prompts

### 🎤 **Advanced Voice Technology**
- 🗣️ **Voice Recognition** - Send messages using your voice
- 🔊 **Text-to-Speech** - Listen to AI responses with natural voices
- ⚙️ **Voice Customization** - Adjust speed, pitch, and voice selection
- 🔧 **Microphone Diagnostics** - Built-in troubleshooting tools
- 🌐 **Cross-Platform Support** - Works in browsers and as desktop app

### 🔐 **Security & Privacy**
- 🔑 **Local API Key Management** - Secure OpenAI API key storage
- 🛡️ **Privacy First** - Your conversations stay private
- 🔒 **Secure Architecture** - Built with security best practices

### 🎨 **Modern User Experience**
- ✨ **Beautiful UI** - Modern, responsive design with dark/light themes
- 📱 **Responsive Layout** - Works seamlessly across different screen sizes
- 🚀 **Fast Performance** - Optimized for speed and reliability
- 🔄 **Real-time Updates** - Instant responses and live voice feedback

## ⚡ Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **OpenAI API Key** (get one at [OpenAI Platform](https://platform.openai.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gpt-forge.git
cd gpt-forge

# Install dependencies
npm install

# Start development server
npm run dev
```

### First Run Setup

1. **🔑 Add your OpenAI API Key**
   - Click the settings icon in the chat interface
   - Enter your OpenAI API key
   - Save and start chatting!

2. **🎤 Test Voice Features**
   - Navigate to the "Microphone Test" tab
   - Grant microphone permissions when prompted
   - Test voice recognition and speech synthesis

3. **🤖 Choose Your Assistant**
   - Select from pre-built specialists or create custom ones
   - Customize prompts and behaviors
   - Start building your perfect AI assistant!

## 🏗️ Project Structure

```
gpt-forge/
├── 📁 electron/              # Electron main process & preload scripts
│   ├── main/                 # Main process (app window management)
│   └── preload/              # Secure API bridge for renderer
├── 📁 src/                   # React application source
│   ├── components/           # React components
│   │   ├── Chat/            # 💬 Chat interface & voice controls
│   │   └── update/          # 🔄 Auto-update system
│   ├── config/              # ⚙️ Assistant configurations & prompts
│   ├── types/               # 📝 TypeScript type definitions
│   └── assets/              # 🎨 Images, icons, and static files
├── 📁 public/               # Static assets
├── 📁 release/              # 📦 Built executables
└── 📁 build/                # 🛠️ Build configuration & icons
```

## 🛠️ Customization Guide

### Creating Custom Assistants

1. **Edit Assistant Configuration**
   ```typescript
   // src/config/prompts.ts
   export const assistants: AssistantConfig[] = [
     {
       id: 'my-custom-assistant',
       name: 'My Custom Assistant',
       systemPrompt: 'You are a specialized assistant for...',
       welcomeMessage: 'Hello! I'm your custom assistant.',
       description: 'Specialized in your specific domain'
     }
   ];
   ```

2. **Customize Voice Settings**
   - Modify voice preferences in the settings panel
   - Adjust speech rate, pitch, and voice selection
   - Test different configurations for optimal experience

3. **Style Customization**
   - All chat styles are modular in `src/components/Chat/`
   - Customize colors, fonts, and layouts
   - Add your own branding and themes

## 📚 Documentation

### 📖 Core Documentation
- [**Voice Chat Guide**](src/components/Chat/README.md) - Complete voice features documentation
- [**Update System Guide**](src/components/update/README.md) - Auto-update functionality
- [**Microphone Troubleshooting**](src/components/Chat/TroubleshootMic.md) - Solving voice issues

### 🎯 Use Cases
- **📈 Financial Analysis** - Build AI assistants for market research
- **📰 Content Creation** - Create specialized writing assistants
- **💼 Business Intelligence** - Develop domain-specific AI advisors
- **🎓 Education** - Build tutoring and learning assistants
- **🔬 Research** - Create specialized research AI helpers

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview built app

# Testing
npm run test         # Run tests
npm run pretest      # Build for testing

# Production
npm run build        # Create desktop executable
```

### Building for Production

```bash
# Build the application
npm run build

# Find your executable in:
./release/[version]/
```

## 🌟 Advanced Features

### 🎤 Voice Technology Stack
- **Speech Recognition** - Native browser APIs with fallbacks
- **Text-to-Speech** - Multiple voice engines support
- **Audio Processing** - Real-time microphone diagnostics
- **Cross-Platform** - Works in Electron and web browsers

### 🤖 AI Integration
- **OpenAI GPT-4** - Latest language model support
- **Streaming Responses** - Real-time message generation
- **Context Management** - Intelligent conversation history
- **Prompt Engineering** - Optimized system prompts for each domain

### 🔄 Auto-Updates
- **Seamless Updates** - Automatic application updates
- **Version Management** - Smart rollback and recovery
- **User Control** - Optional update notifications

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **💻 Make your changes**
4. **✅ Add tests** if applicable
5. **📝 Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **🚀 Push to the branch** (`git push origin feature/amazing-feature`)
7. **🔄 Open a Pull Request**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Gabriele Cipriani**
- 🐙 GitHub: [@Gabry848](https://github.com/Gabry848)
- 📧 Email: gabry848.famiglia@gmail.com

## 🙏 Acknowledgments

- 🤖 **OpenAI** for the amazing GPT models
- ⚛️ **React** for the excellent framework
- 🔧 **Electron** for enabling desktop app development
- 🎨 **React Icons** for beautiful interface icons
- 🎤 **Web Speech API** for voice recognition capabilities

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

**Built with ❤️ using React, Electron, and OpenAI**

</div>
