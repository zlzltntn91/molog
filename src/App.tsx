import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import FindIdPage from './pages/FindIdPage'
import MainPage from './pages/MainPage'
import LedgerPage from './pages/LedgerPage'
import AssetsPage from './pages/AssetsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="find-id" element={<FindIdPage />} />
          <Route path="main" element={<MainPage />} />
          <Route path="ledger" element={<LedgerPage />} />
          <Route path="assets" element={<AssetsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App