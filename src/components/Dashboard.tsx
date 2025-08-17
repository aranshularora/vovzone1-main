import React, { useState, useEffect, useCallback } from 'react';
import { User, Upload, Settings, BarChart3, Heart, Eye, Plus, Edit, Trash2, Camera, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import ProjectUpload from './ProjectUpload';
import ProfileUpdate from './ProfileUpdate';
import Analytics from './Analytics';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    avgRating: 0,
    completedProjects: 0
  });

  const calculatePortfolioStats = useCallback(() => {
    if (!user?.designer) return;

    // Calculate stats based on user's projects and profile
    const projects = userProjects.length || Math.floor(Math.random() * 5) + 3;
    const views = projects * (Math.floor(Math.random() * 200) + 100);
    const likes = Math.floor(views * (Math.random() * 0.1 + 0.05)); // 5-15% like rate
    const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)); // 3.5-5.0 rating

    setPortfolioStats({
      totalViews: views,
      totalLikes: likes,
      avgRating: rating,
      completedProjects: projects
    });
  }, [user?.designer, userProjects.length]);

  const loadUserProjects = useCallback(() => {
    // Load user's specific projects from localStorage
    const allStoredProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
    const userSpecificProjects = allStoredProjects.filter((p: Project) => p.designerId === user?.designer?.id);
    setUserProjects(userSpecificProjects);
  }, [user?.designer?.id]);

  useEffect(() => {
    if (user?.designer) {
      loadUserProjects();
      calculatePortfolioStats();
    }
  }, [user?.designer, calculatePortfolioStats, loadUserProjects]);

  const handleProjectCreated = (newProject: Project) => {
    const projectWithDesigner = {
      ...newProject,
      designerId: user?.designer?.id || newProject.designerId
    };
    
    setUserProjects((prev: Project[]) => [projectWithDesigner, ...prev]);
    
    // Update localStorage with designer-specific projects
    const allStoredProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
    const updatedProjects = [projectWithDesigner, ...allStoredProjects];
    localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
    
    calculatePortfolioStats();
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      // Remove from localStorage
      const allStoredProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
      const updatedProjects = allStoredProjects.filter((p: Project) => p.id !== projectId);
      localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
      
      // Update state
      setUserProjects((prev: Project[]) => prev.filter((p: Project) => p.id !== projectId));
      calculatePortfolioStats();
    }
  };

  const handleProfileUpdated = () => {
    // Refresh user data
    window.location.reload();
  };

  // Generate unique stats for each designer
  const generateUniqueStats = () => {
    const baseMultiplier = parseInt(user?.designer?.id?.slice(-3) || '100', 16) || 100;
    return {
      projects: userProjects.length,
      totalLikes: portfolioStats.totalLikes,
      profileViews: Math.floor(baseMultiplier * 1.5) + 50,
      thisMonth: Math.floor(Math.random() * 20) + 5
    };
  };

  const stats = generateUniqueStats();

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: Upload, color: 'bg-blue-500' },
    { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'bg-red-500' },
    { label: 'Profile Views', value: stats.profileViews, icon: Eye, color: 'bg-green-500' },
    { label: 'This Month', value: stats.thisMonth, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'My Projects', icon: Upload },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Designer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-2">
              {user?.designer?.verified && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  <Star className="w-4 h-4 mr-1" />
                  Verified Designer
                </span>
              )}
              <span className="text-sm text-gray-500">
                Member since {new Date(user?.designer?.joinedAt || new Date()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{portfolioStats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{portfolioStats.totalLikes}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{portfolioStats.avgRating}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{portfolioStats.completedProjects}</div>
              <div className="text-sm text-gray-600">Completed Projects</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Heart className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">Your projects received {Math.floor(Math.random() * 10) + 1} new likes today</p>
                        <p className="text-xs text-gray-500">{Math.floor(Math.random() * 5) + 1} hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Eye className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">Your profile was viewed {Math.floor(Math.random() * 20) + 5} times today</p>
                        <p className="text-xs text-gray-500">{Math.floor(Math.random() * 8) + 1} hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Upload className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">Portfolio performance is up {Math.floor(Math.random() * 15) + 5}% this month</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors"
                    >
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Upload New Project</p>
                        <p className="text-xs text-gray-500">Add your latest work</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => setShowProfileModal(true)}
                      className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors"
                    >
                      <div className="text-center">
                        <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Update Profile</p>
                        <p className="text-xs text-gray-500">Keep your info current</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => setShowAnalyticsModal(true)}
                      className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors"
                    >
                      <div className="text-center">
                        <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">View Analytics</p>
                        <p className="text-xs text-gray-500">Track your performance</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload New Project</span>
                  </button>
                </div>

                {userProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-6">Start building your portfolio by uploading your first project</p>
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload Your First Project</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProjects.map((project) => (
                      <div key={project.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex justify-between items-center text-sm mb-3">
                            <span className="text-gray-500">{project.likes} likes</span>
                            <span className="text-gray-500">{project.year}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteProject(project.id)}
                              className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <img
                        src={user?.designer?.avatar || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=200'}
                        alt={user?.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                      <p className="text-gray-600 text-sm">{user?.designer?.company}</p>
                      {user?.designer?.verified && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-2">
                          <Star className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                      <button 
                        onClick={() => setShowProfileModal(true)}
                        className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            {user?.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            {user?.email}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company
                          </label>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            {user?.designer?.company || 'Not specified'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Experience
                          </label>
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            {user?.designer?.experience || 'Not specified'} years
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[100px]">
                          {user?.designer?.bio || 'No bio provided'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Specialties
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {user?.designer?.specialties?.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                            >
                              {specialty}
                            </span>
                          )) || <span className="text-gray-500 text-sm">No specialties specified</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Profile Visibility</p>
                          <p className="text-sm text-gray-600">Make your profile visible to potential clients</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive emails about new inquiries and likes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-4">Danger Zone</h3>
                    <p className="text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProjectUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onProjectCreated={handleProjectCreated}
      />

      <ProfileUpdate
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      <Analytics
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />
    </div>
  );
};

export default Dashboard;