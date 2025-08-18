import React, { useState } from 'react';
import { Upload, X, Plus, Camera, MapPin, Tag, Building, Home, ChefHat, Bath, Bed, TreePine, Coffee, ShoppingBag, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';

interface ProjectUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const ProjectUpload: React.FC<ProjectUploadProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'residential' as Project['category'],
    roomType: '' as Project['roomType'],
    class: 'premium' as Project['class'],
    location: '',
    year: new Date().getFullYear(),
    tags: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newTag, setNewTag] = useState('');

  const categories = [
    { value: 'residential', label: 'Residential', icon: Home },
    { value: 'commercial', label: 'Commercial', icon: Building },
    { value: 'office', label: 'Office', icon: Briefcase },
    { value: 'hospitality', label: 'Hospitality', icon: Coffee },
    { value: 'retail', label: 'Retail', icon: ShoppingBag },
  ];

  const roomTypes = [
    { value: 'bedroom', label: 'Bedroom', icon: Bed },
    { value: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { value: 'bathroom', label: 'Bathroom', icon: Bath },
    { value: 'living-room', label: 'Living Room', icon: Home },
    { value: 'dining-room', label: 'Dining Room', icon: Home },
    { value: 'balcony', label: 'Balcony', icon: TreePine },
    { value: 'office', label: 'Office', icon: Briefcase },
    { value: 'lobby', label: 'Lobby', icon: Building },
    { value: 'restaurant', label: 'Restaurant', icon: Coffee },
    { value: 'retail-space', label: 'Retail Space', icon: ShoppingBag },
  ];

  const classes = [
    { value: 'economical', label: 'Economical', color: 'bg-green-100 text-green-800' },
    { value: 'premium', label: 'Premium', color: 'bg-blue-100 text-blue-800' },
    { value: 'luxury', label: 'Luxury', color: 'bg-purple-100 text-purple-800' },
    { value: 'ultra-luxury', label: 'Ultra Luxury', color: 'bg-amber-100 text-amber-800' },
  ];

  if (!isOpen) return null;

  const handleImageUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length + images.length > 10) {
      alert('Maximum 10 images allowed per project');
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.designer) {
      alert('You must be logged in as a designer to upload projects');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate image upload to cloud storage
      const uploadedImageUrls = await Promise.all(
        images.map(async (file, index) => {
          // In a real app, you would upload to a service like Cloudinary, AWS S3, etc.
          // For demo purposes, we'll use the preview URLs
          return imagePreviews[index];
        })
      );

      const newProject: Project = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        images: uploadedImageUrls,
        category: formData.category,
        roomType: formData.roomType || undefined,
        class: formData.class,
        location: formData.location,
        year: formData.year,
        designerId: user.designer.id,
        tags: formData.tags,
        likes: 0,
        createdAt: new Date(),
      };

      // Save to localStorage (in a real app, this would be an API call)
      const existingProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
      const updatedProjects = [newProject, ...existingProjects];
      localStorage.setItem('userProjects', JSON.stringify(updatedProjects));

      onProjectCreated(newProject);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'residential',
        roomType: '',
        class: 'premium',
        location: '',
        year: new Date().getFullYear(),
        tags: [],
      });
      setImages([]);
      setImagePreviews([]);
      
      onClose();
      alert('Project uploaded successfully!');
    } catch (error) {
      alert('Error uploading project. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Upload New Project</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Project Images * (Max 10 images)
            </label>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-300 hover:border-amber-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop images here, or{' '}
                <label className="text-amber-600 hover:text-amber-700 cursor-pointer font-medium">
                  browse files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, WebP (Max 5MB each)
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="e.g., Modern Mumbai Penthouse Living Room"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                    className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors ${
                      formData.category === category.value
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="text-sm">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type
              </label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value as Project['roomType'] }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select room type</option>
                {roomTypes.map((room) => (
                  <option key={room.value} value={room.value}>
                    {room.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Class *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {classes.map((cls) => (
                  <button
                    key={cls.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, class: cls.value }))}
                    className={`p-3 border rounded-lg text-sm transition-colors ${
                      formData.class === cls.value
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {cls.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Bandra, Mumbai"
                />
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Completed *
              </label>
              <input
                type="number"
                required
                min="2000"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Describe your project, design approach, challenges overcome, and unique features..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Add tags (e.g., modern, luxury, minimalist)"
                />
              </div>
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || images.length === 0}
              className="flex-1 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectUpload;