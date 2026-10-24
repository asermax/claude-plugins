import { createRoot } from 'react-dom/client'
import { getUserPreferences, setUserPreferences } from 'tldraw'
import { App } from './App'

// Other tabs label this tab's cursor with the name, so the agent opens its tab with ?user=Agent
const user = new URLSearchParams(location.search).get('user')

if (user != null) {
  setUserPreferences({ ...getUserPreferences(), name: user })
}

createRoot(document.getElementById('root')!).render(<App />)
