import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Eye, Heart, Users, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';

interface AnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalProjects: number;
  profileViews: number;
  monthlyData: {
    month: string;
    views: number;
    likes: number;
    projects: number;
  }[];
  topProjects: {
    id: string;
    title: string;
    views: number;
    likes: number;
    image: string;
  }[];
  demographics: {
    location: string;
    percentage: number;
  }[];
}

const Analytics: React.FC<AnalyticsProps> = ({ isOpen, onClose }) => {
  useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    if (isOpen) {
      // Generate mock analytics data
      const userProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
      
      const mockData: AnalyticsData = {
        totalViews: Math.floor(Math.random() * 10000) + 5000,
        totalLikes: Math.floor(Math.random() * 1000) + 500,
        totalProjects: userProjects.length + 3, // Include mock projects
        profileViews: Math.floor(Math.random() * 2000) + 1000,
        monthlyData: [
          { month: 'Jan', views: 850, likes: 45, projects: 2 },
          { month: 'Feb', views: 920, likes: 52, projects: 1 },
          { month: 'Mar', views: 1100, likes: 68, projects: 3 },
          { month: 'Apr', views: 1350, likes: 78, projects: 2 },
          { month: 'May', views: 1580, likes: 89, projects: 4 },
          { month: 'Jun', views: 1720, likes: 95, projects: 1 },
        ],
        topProjects: [
          {
            id: '1',
            title: 'Modern Mumbai Penthouse',
            views: 2450,
            likes: 245,
            image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=200'
          },
          {
            id: '2',
            title: 'Contemporary Kitchen Design',
            views: 1890,
            likes: 189,
            image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=200'
          },
          {
            id: '3',
            title: 'Luxury Master Bedroom',
            views: 1560,
            likes: 156,
            image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=200'
          },
        ],
        demographics: [
          { location: 'Mumbai', percentage: 35 },
          { location: 'Delhi', percentage: 25 },
          { location: 'Bangalore', percentage: 20 },
          { location: 'Pune', percentage: 12 },
          { location: 'Others', percentage: 8 },
        ]
      };

      setAnalyticsData(mockData);
    }
  }, [isOpen]);

  if (!isOpen || !analyticsData) return null;

  const getGrowthPercentage = (current: number, previous: number) => {
    return Math.round(((current - previous) / previous) * 100);
  };

  const currentMonthViews = analyticsData.monthlyData[analyticsData.monthlyData.length - 1]?.views || 0;
  const previousMonthViews = analyticsData.monthlyData[analyticsData.monthlyData.length - 2]?.views || 0;
  const viewsGrowth = getGrowthPercentage(currentMonthViews, previousMonthViews);

  const currentMonthLikes = analyticsData.monthlyData[analyticsData.monthlyData.length - 1]?.likes || 0;
  const previousMonthLikes = analyticsData.monthlyData[analyticsData.monthlyData.length - 2]?.likes || 0;
  const likesGrowth = getGrowthPercentage(currentMonthLikes, previousMonthLikes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600">Track your portfolio performance and engagement</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Views</p>
                  <p className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-200" />
              </div>
              <div className="flex items-center mt-2">
                {viewsGrowth > 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-300" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-300" />
                )}
                <span className="text-sm text-blue-100 ml-1">
                  {Math.abs(viewsGrowth)}% from last month
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Total Likes</p>
                  <p className="text-2xl font-bold">{analyticsData.totalLikes.toLocaleString()}</p>
                </div>
                <Heart className="w-8 h-8 text-red-200" />
              </div>
              <div className="flex items-center mt-2">
                {likesGrowth > 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-300" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-300" />
                )}
                <span className="text-sm text-red-100 ml-1">
                  {Math.abs(likesGrowth)}% from last month
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold">{analyticsData.totalProjects}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-200" />
              </div>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-300" />
                <span className="text-sm text-green-100 ml-1">
                  2 new this month
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Profile Views</p>
                  <p className="text-2xl font-bold">{analyticsData.profileViews.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-300" />
                <span className="text-sm text-purple-100 ml-1">
                  15% from last month
                </span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-amber-500" />
                Monthly Trends
              </h3>
              <div className="space-y-4">
                {analyticsData.monthlyData.map((data) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(data.views / 2000) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-16">{data.views} views</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-gray-500 w-8">{data.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Projects */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-amber-500" />
                Top Performing Projects
              </h3>
              <div className="space-y-4">
                {analyticsData.topProjects.map((project, idx) => (
                  <div key={project.id} className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-400 w-4">#{idx + 1}</span>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {project.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {project.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-amber-500" />
              Audience Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Top Locations</h4>
                <div className="space-y-3">
                  {analyticsData.demographics.map((demo) => (
                    <div key={demo.location} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{demo.location}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: `${demo.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{demo.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Insights</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Time on Profile</span>
                    <span className="text-sm font-medium text-gray-900">2m 34s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bounce Rate</span>
                    <span className="text-sm font-medium text-gray-900">32%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Return Visitors</span>
                    <span className="text-sm font-medium text-gray-900">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Contact Rate</span>
                    <span className="text-sm font-medium text-gray-900">8.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">📈 Growth Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800">Content Strategy</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Upload 2-3 projects monthly for consistent growth</li>
                  <li>• Focus on kitchen and bedroom projects (high engagement)</li>
                  <li>• Add more detailed project descriptions</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-amber-800">Engagement Tips</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Respond to inquiries within 24 hours</li>
                  <li>• Update your profile with recent work</li>
                  <li>• Use trending tags like #sustainable #modern</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;