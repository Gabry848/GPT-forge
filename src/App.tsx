import { useState } from 'react'
import UpdateElectron from '@/components/update'
import VoiceChatNavigation from '@/components/Chat/VoiceChatNavigation'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <div className='App'>
        <VoiceChatNavigation />
      </div>
    </ThemeProvider>
  )
}

export default App