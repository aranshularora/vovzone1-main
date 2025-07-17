import React, { useState, useEffect } from 'react';
import { X, Share2, MapPin, Calendar, Mail, Phone, Globe, ChevronLeft, ChevronRight, User, Building, Star, Shield } from 'lucide-react';
import { Project, Designer } from '../types';

interface ProjectModalProps {
  project: Project;
  designer: Designer;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, designer, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    projectDetails: ''
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getClassColor = (classType: string) => {
    switch (classType) {
      case 'economical': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'luxury': return 'bg-purple-100 text-purple-800';
      case 'ultra-luxury': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRoomType = (roomType?: string) => {
    if (!roomType) return '';
    return roomType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: `Check out this amazing ${project.category} design by ${designer.name}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Unable to share. Please copy the URL manually.');
      });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.phone.trim() || !contactForm.projectDetails.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Simulate sending the inquiry
    console.log('Contact form submitted:', {
      ...contactForm,
      projectTitle: project.title,
      designerName: designer.name,
      designerEmail: designer.email,
      timestamp: new Date().toISOString()
    });

    // Reset form and close
    setContactForm({ name: '', email: '', phone: '', projectDetails: '' });
    setShowContactForm(false);
    
    // Show success message
    alert(`Thank you, ${contactForm.name}! Your inquiry about "${project.title}" has been sent to ${designer.name}. They will contact you soon at ${contactForm.email}.`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent closing when clicking inside the modal content
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden"
        onClick={handleModalClick}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Image Section */}
          <div className="lg:w-2/3 relative bg-gray-100">
            <div className="relative h-64 lg:h-full">
              <img
                src={project.images[currentImageIndex]}
                alt={`${project.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {project.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {project.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Share Button */}
              <div className="absolute top-4 left-4">
                <button 
                  onClick={handleShare}
                  className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Section - Scrollable */}
          <div className="lg:w-1/3 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              {/* Project Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full capitalize">
                      {project.category}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${getClassColor(project.class)}`}>
                      {project.class.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{project.likes} likes</span>
                </div>

                {project.roomType && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                      {formatRoomType(project.roomType)}
                    </span>
                  </div>
                )}
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{project.year}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  {project.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Designer Info - Limited for Privacy */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={designer.avatar || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={designer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {designer.name}
                      </h3>
                      {designer.verified && (
                        <div className="flex items-center space-x-1">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                    {designer.company && (
                      <p className="text-gray-600 text-sm mb-1">{designer.company}</p>
                    )}
                    {designer.experience && (
                      <p className="text-gray-500 text-sm">{designer.experience} years experience</p>
                    )}
                    {designer.rating && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="text-sm text-gray-600">{designer.rating} rating</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Limited Bio for Privacy */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {designer.bio}
                </p>
                
                {/* Specialties */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {designer.specialties.slice(0, 4).map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {designer.specialties.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{designer.specialties.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Notice - No Direct Contact Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-amber-800 text-sm">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Contact details are shared only after you submit an inquiry to protect designer privacy.
                  </p>
                </div>
              </div>
            </div>

            {/* Fixed Contact Button */}
            <div className="p-6 lg:p-8 border-t border-gray-200 bg-white">
              <button
                onClick={() => setShowContactForm(true)}
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-lg"
              >
                Get Quote & Contact Designer
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form Overlay */}
        {showContactForm && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center p-6 z-20">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto border">
              <h3 className="text-lg font-semibold mb-4 text-center">Contact {designer.name}</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Interested in "{project.title}"? Send your project details below.
              </p>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={contactForm.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Details *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      name="projectDetails"
                      rows={4}
                      required
                      value={contactForm.projectDetails}
                      onChange={handleInputChange}
                      placeholder={`I'm interested in your "${project.title}" project (${project.class} class). Please tell me more about your services and pricing for a similar ${formatRoomType(project.roomType)} design. My project details: [describe your space, timeline, budget range, etc.]`}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Send Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectModal;