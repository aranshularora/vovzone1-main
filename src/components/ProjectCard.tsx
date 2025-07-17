import React from 'react';
import { Project, Designer } from '../types';

interface ProjectCardProps {
  project: Project;
  designer: Designer;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, designer, onClick }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  // Generate random heights for Pinterest-style layout
  const getRandomHeight = () => {
    const heights = ['h-48', 'h-56', 'h-64', 'h-72', 'h-80', 'h-96'];
    return heights[Math.floor(Math.random() * heights.length)];
  };

  const [cardHeight] = React.useState(getRandomHeight());

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer mb-3"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - Clean Pinterest Style */}
      <div className={`relative overflow-hidden ${cardHeight}`}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={project.images[0]}
          alt={project.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
        
        {/* Minimal overlay on hover */}
        <div className={`absolute inset-0 bg-black transition-all duration-300 ${
          isHovered ? 'bg-opacity-10' : 'bg-opacity-0'
        }`} />
        
        {/* Image count indicator - minimal and clean */}
        {project.images.length > 1 && (
          <div className={`absolute top-3 right-3 px-2 py-1 bg-black bg-opacity-60 rounded-full transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <span className="text-xs text-white font-medium">+{project.images.length - 1}</span>
          </div>
        )}

        {/* Subtle hover overlay with minimal info */}
        <div className={`absolute inset-0 flex items-end transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-full bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4">
            <div className="text-white">
              <h3 className="font-medium text-sm mb-1 line-clamp-1">
                {project.title}
              </h3>
              <p className="text-xs opacity-90">
                by {designer.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;