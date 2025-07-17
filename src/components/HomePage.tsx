import React, { useState, useEffect } from 'react';
import { Filter, Grid, LayoutGrid, User, Mail, Bed, ChefHat, Bath, TreePine, Home, Building, Coffee, ShoppingBag, Briefcase } from 'lucide-react';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { mockProjects, mockDesigners } from '../data/mockData';
import { Project, Designer } from '../types';

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const categories = ['all', 'residential', 'commercial', 'office', 'hospitality', 'retail'];
  const roomTypes = ['all', 'bedroom', 'kitchen', 'bathroom', 'living-room', 'dining-room', 'balcony', 'office', 'lobby', 'restaurant', 'retail-space'];
  const classes = ['all', 'economical', 'premium', 'luxury', 'ultra-luxury'];

  const getRoomTypeIcon = (roomType: string) => {
    switch (roomType) {
      case 'bedroom': return Bed;
      case 'kitchen': return ChefHat;
      case 'bathroom': return Bath;
      case 'balcony': return TreePine;
      case 'living-room': return Home;
      case 'dining-room': return Home;
      case 'office': return Briefcase;
      case 'lobby': return Building;
      case 'restaurant': return Coffee;
      case 'retail-space': return ShoppingBag;
      default: return Grid;
    }
  };

  const getClassColor = (classType: string) => {
    switch (classType) {
      case 'economical': return 'text-green-600 bg-green-100';
      case 'premium': return 'text-blue-600 bg-blue-100';
      case 'luxury': return 'text-purple-600 bg-purple-100';
      case 'ultra-luxury': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(() => {
    // Load projects from localStorage and mock data
    const storedProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
    const allProjects = [...storedProjects, ...mockProjects];
    
    let filteredProjects = [...allProjects];

    // Apply category filter
    if (categoryFilter !== 'all') {
      filteredProjects = filteredProjects.filter(project => project.category === categoryFilter);
    }

    // Apply room type filter
    if (roomTypeFilter !== 'all') {
      filteredProjects = filteredProjects.filter(project => project.roomType === roomTypeFilter);
    }

    // Apply class filter
    if (classFilter !== 'all') {
      filteredProjects = filteredProjects.filter(project => project.class === classFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filteredProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filteredProjects.sort((a, b) => b.likes - a.likes);
        break;
      case 'oldest':
        filteredProjects.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    setProjects(filteredProjects);
  }, [categoryFilter, roomTypeFilter, classFilter, sortBy]);

  const handleProjectClick = (project: Project) => {
    const designer = mockDesigners.find(d => d.id === project.designerId);
    if (designer) {
      setSelectedProject(project);
      setSelectedDesigner(designer);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setSelectedDesigner(null);
  };

  const getDesignerForProject = (project: Project): Designer => {
    return mockDesigners.find(d => d.id === project.designerId) || mockDesigners[0];
  };

  const clearAllFilters = () => {
    setCategoryFilter('all');
    setRoomTypeFilter('all');
    setClassFilter('all');
  };

  const activeFiltersCount = [categoryFilter, roomTypeFilter, classFilter].filter(f => f !== 'all').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Advanced Filters */}
      <section className="sticky top-16 bg-white border-b border-gray-200 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Filter Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort & Results Count */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="oldest">Oldest First</option>
              </select>

              <span className="text-sm text-gray-500">
                {projects.length} projects
              </span>
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {roomTypes.map(roomType => (
                  <option key={roomType} value={roomType}>
                    {roomType === 'all' ? 'All Room Types' : 
                     roomType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {classes.map(classType => (
                  <option key={classType} value={classType}>
                    {classType === 'all' ? 'All Classes' : 
                     classType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Pinterest-Style Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No projects found for the selected filters.</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or browse all projects.</p>
            </div>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="break-inside-avoid"
              >
                <ProjectCard
                  project={project}
                  designer={getDesignerForProject(project)}
                  onClick={() => handleProjectClick(project)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Filter Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Room Type</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find inspiration for specific rooms and spaces in your home or office
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {roomTypes.slice(1, 6).map((roomType) => {
            const IconComponent = getRoomTypeIcon(roomType);
            const allProjects = [...JSON.parse(localStorage.getItem('userProjects') || '[]'), ...mockProjects];
            const count = allProjects.filter(p => p.roomType === roomType).length;
            
            return (
              <button
                key={roomType}
                onClick={() => setRoomTypeFilter(roomType)}
                className="p-6 bg-gray-50 rounded-lg hover:bg-amber-50 hover:border-amber-200 border border-gray-200 transition-all group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:bg-amber-200">
                    <IconComponent className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {roomType.split('-').join(' ')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {count} projects
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Class Categories */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse by Class</h3>
          <p className="text-gray-600">
            Explore projects across different budget ranges and luxury levels
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {classes.slice(1).map((classType) => {
            const allProjects = [...JSON.parse(localStorage.getItem('userProjects') || '[]'), ...mockProjects];
            const count = allProjects.filter(p => p.class === classType).length;
            const colorClass = getClassColor(classType);
            
            return (
              <button
                key={classType}
                onClick={() => setClassFilter(classType)}
                className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-all group"
              >
                <div className="text-center">
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-3 ${colorClass}`}>
                    {classType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </div>
                  <p className="text-sm text-gray-500">
                    {count} projects
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About VovZone</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting exceptional Interior Designers and Architects with clients who appreciate beautiful, functional spaces
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Grid className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Curated Projects</h3>
              <p className="text-gray-600">
                Discover handpicked interior design projects from verified professionals across all budget ranges
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Designers</h3>
              <p className="text-gray-600">
                Connect with experienced, verified interior designers and architects specializing in various room types
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Contact</h3>
              <p className="text-gray-600">
                Get quotes and start your project with just a few clicks, from economical to ultra-luxury designs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started Today</h2>
          <p className="text-xl text-gray-600 mb-8">
            Ready to transform your space? Browse our projects and connect with the perfect designer for your needs and budget.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              Browse Projects
            </button>
            <a 
              href="/register"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Join as Designer
            </a>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 mb-4">Questions? We're here to help!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="mailto:mail@vovzone.com" className="text-amber-600 hover:text-amber-700">
                mail@vovzone.com
              </a>
              <a href="tel:+91-888-2910-888" className="text-amber-600 hover:text-amber-700">
                +91 (888)-2910-888
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Project Modal */}
      {selectedProject && selectedDesigner && (
        <ProjectModal
          project={selectedProject}
          designer={selectedDesigner}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default HomePage;