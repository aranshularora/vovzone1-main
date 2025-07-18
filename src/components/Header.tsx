import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, LogOut, Home, Grid, Info, Mail } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import Logo from './Logo';

interface SearchResult {
  type: 'project' | 'designer';
  id: string;
  title: string;
  subtitle: string;
  image?: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    // Scroll to section on current page
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If section doesn't exist, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBrowseProjects = () => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = '/';
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Search in projects and designers
    const storedProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
    const storedDesigners = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Mock data for demonstration
    const mockProjects = [
      { id: '1', title: 'Modern Mumbai Penthouse', subtitle: 'Luxury Living Room', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { id: '2', title: 'Contemporary Kitchen Design', subtitle: 'Premium Kitchen', image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { id: '3', title: 'Luxury Master Bedroom', subtitle: 'Ultra-Luxury Bedroom', image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=200' },
    ];

    const mockDesigners = [
      { id: '1', name: 'Priya Sharma', company: 'Elegant Spaces Design Studio', avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { id: '2', name: 'Arjun Patel', company: 'Urban Architects & Interiors', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { id: '3', name: 'Kavya Reddy', company: 'Warm Homes Studio', avatar: 'https://images.pexels.com/photos/3767411/pexels-photo-3767411.jpeg?auto=compress&cs=tinysrgb&w=200' },
    ];

    const results: SearchResult[] = [];

    // Search projects
    [...storedProjects, ...mockProjects].forEach(project => {
      if (project.title?.toLowerCase().includes(query.toLowerCase()) ||
          project.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          project.description?.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'project',
          id: project.id,
          title: project.title,
          subtitle: project.subtitle || 'Interior Design Project',
          image: project.image || project.images?.[0]
        });
      }
    });

    // Search designers
    [...storedDesigners, ...mockDesigners].forEach(designer => {
      if (designer.name?.toLowerCase().includes(query.toLowerCase()) ||
          designer.company?.toLowerCase().includes(query.toLowerCase()) ||
          designer.bio?.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'designer',
          id: designer.id,
          title: designer.name,
          subtitle: designer.company || 'Interior Designer',
          image: designer.avatar
        });
      }
    });

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    if (result.type === 'project') {
      // Navigate to home page and highlight the project
      if (location.pathname !== '/') {
        window.location.href = '/';
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // For designers, could navigate to a designer profile page
      console.log('Navigate to designer profile:', result.id);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Logo size="lg" />
            <span className="text-xl font-semibold text-gray-900"></span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects, designers..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      {result.image && (
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.title}</p>
                        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result.type === 'project' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                {/* Search - Mobile */}
                <div className="px-4 py-2 md:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-100 my-2 md:hidden"></div>

                {/* Navigation Menu Items */}
                <button
                  onClick={handleBrowseProjects}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4 mr-3" />
                  Browse Projects
                </button>
                
                <button
                  onClick={() => scrollToSection('categories')}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Grid className="w-4 h-4 mr-3" />
                  Categories
                </button>
                
                <button
                  onClick={() => scrollToSection('about')}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Info className="w-4 h-4 mr-3" />
                  About
                </button>
                
                <button
                  onClick={() => scrollToSection('contact')}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-3" />
                  Contact
                </button>
                
                <div className="border-t border-gray-100 my-2"></div>

                {/* Designer Authentication Section */}
                {isAuthenticated ? (
                  <>
                    {/* Authenticated Designer Menu */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">Designer Account</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Dashboard
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    {/* Designer Authentication Options */}
                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-500 mb-2">For Designers:</p>
                    </div>
                    
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Designer Sign In
                    </Link>
                    
                    <Link
                      to="/register"
                      className="block px-4 py-3 text-amber-600 font-medium hover:bg-amber-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join as Designer
                    </Link>
                  </>
                )}
                
                <div className="border-t border-gray-100 my-2"></div>
                
                <div className="px-4 py-2">
                  <p className="text-xs text-gray-500">
                    Discover exceptional interior design projects and connect with talented professionals
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;