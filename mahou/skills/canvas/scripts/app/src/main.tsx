import { createRoot } from 'react-dom/client'
import { getUserPreferences, setUserPreferences } from 'tldraw'
import { App } from './App'

// Other tabs label this tab's cursor with the name, so Claude opens its tab with ?user=Claude
const user = new URLSearchParams(location.search).get('user')

if (user != null) {
  setUserPreferences({ ...getUserPreferences(), name: user })
}

createRoot(document.getElementById('root')!).render(<App />)
