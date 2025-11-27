import { Outlet } from "react-router-dom"
import Header from "./components/Navbar"
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from "react-hot-toast"

export default function App() {
  return (
    <div>
      <Header/>
      <main>
        <ScrollToTop />
        <Outlet/>
      </main>
      <Footer/>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'font-medium',
          style: {
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            color: '#f8fafc',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          },
          success: {
            style: {
              background: 'rgba(255,255,255,0.25)',
              borderColor: 'rgba(69,71,70,0.5)'
            },
            iconTheme: { primary: '#22d172', secondary: '#166534' },
          },
          error: {
            style: {
              background: 'rgba(255,255,255,0.25)',
              borderColor: 'rgba(239, 68, 68, 0.5)'
            },
            iconTheme: { primary: '#f87171', secondary: '#7f1d1d' },
          },
        }}
      />
    </div>
  )
}
