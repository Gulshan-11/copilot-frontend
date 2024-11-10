import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Code } from 'lucide-react';
import Home from './components/Home';
import Editor from './components/Editor';
import './index.css'
import 'tailwindcss/tailwind.css'

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-14 flex items-center bg-white shadow-sm">
          <Link to="/" className="flex items-center justify-center">
            <Code className="h-6 w-6 mr-2 text-blue-600" />
            <span className="font-bold text-xl text-gray-800">AI CodeWizard</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Home
            </Link>
            <Link to="/editor" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Editor
            </Link>
          </nav>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor" element={<Editor />} />
          </Routes>
        </main>

        <footer className="w-full py-6 bg-white border-t">
          <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500">© 2024 AI CodeWizard. All rights reserved.</p>
            <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
              <a className="text-xs text-gray-500 hover:text-blue-600" href="#">
                Terms of Service
              </a>
              <a className="text-xs text-gray-500 hover:text-blue-600" href="#">
                Privacy
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;