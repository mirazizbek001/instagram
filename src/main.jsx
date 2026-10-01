import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.addEventListener('beforeinstallprompt', event => {
	event.preventDefault()
	window.__instakidsInstallPrompt = event
	window.dispatchEvent(new Event('instakids-installprompt'))
})

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
	})
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
