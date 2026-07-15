import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from '@/utils/reactRouterCompat';
import { 
  Briefcase, FolderOpen, FileText, ShoppingBag, 
  Edit, Trash2, Eye, Plus 
} from 'lucide-react';
import { jobService, resourceService, blogService, productService } from '../../services/dataService';
import toast from 'react-hot-toast';

const MyPosts = () => {
  const { canPostJobs, canPostResources, canPostBlogs, canPostProducts } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    jobs: [],
    resources: [],
    blogs: [],
    products: [],
  });

  const tabs = [
    { id: 'jobs', label: 'Jobs', icon: Briefcase, visible: canPostJobs },
    { id: 'resources', label: 'Resources', icon: FolderOpen, visible: canPostResources },
    { id: 'blogs', label: 'Blogs', icon: FileText, visible: canPostBlogs },
    { id: 'products', label: 'Products', icon: ShoppingBag, visible: canPostProducts },
  ].filter(tab => tab.visible);

  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, resourcesRes, blogsRes, productsRes] = await Promise.allSettled([
        canPostJobs ? jobService.getMyJobs() : Promise.resolve({ data: { data: [] } }),
        canPostResources ? resourceService.getMyResources() : Promise.resolve({ data: { data: [] } }),
        canPostBlogs ? blogService.getMyBlogs() : Promise.resolve({ data: { data: [] } }),
        canPostProducts ? productService.getMyProducts() : Promise.resolve({ data: { data: [] } }),
      ]);

      setData({
        jobs: jobsRes.status === 'fulfilled' ? jobsRes.value.data.data : [],
        resources: resourcesRes.status === 'fulfilled' ? resourcesRes.value.data.data : [],
        blogs: blogsRes.status === 'fulfilled' ? blogsRes.value.data.data : [],
        products: productsRes.status === 'fulfilled' ? productsRes.value.data.data : [],
      });
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this?')) return;

    try {
      switch (type) {
        case 'jobs':
          await jobService.delete(id);
          setData({ ...data, jobs: data.jobs.filter(j => j._id !== id) });
          break;
        case 'resources':
          await resourceService.delete(id);
          setData({ ...data, resources: data.resources.filter(r => r._id !== id) });
          break;
        case 'blogs':
          await blogService.delete(id);
          setData({ ...data, blogs: data.blogs.filter(b => b._id !== id) });
          break;
        case 'products':
          await productService.delete(id);
          setData({ ...data, products: data.products.filter(p => p._id !== id) });
          break;
      }
      toast.success('Deleted successfully');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getCreatePath = () => {
    switch (activeTab) {
      case 'jobs': return '/dashboard/create-job';
      case 'resources': return '/dashboard/create-resource';
      case 'blogs': return '/dashboard/create-blog';
      case 'products': return '/dashboard/create-product';
      default: return '/dashboard';
    }
  };

  const currentData = data[activeTab] || [];

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="w-full px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">My Posts</h1>
          <Link to={getCreatePath()} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create New
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-dark-100 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">
                {data[tab.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 bg-dark-200 rounded mb-4"></div>
                <div className="h-4 bg-dark-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-dark-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-dark-100 flex items-center justify-center mx-auto mb-4">
              {activeTab === 'jobs' && <Briefcase className="w-8 h-8 text-gray-600" />}
              {activeTab === 'resources' && <FolderOpen className="w-8 h-8 text-gray-600" />}
              {activeTab === 'blogs' && <FileText className="w-8 h-8 text-gray-600" />}
              {activeTab === 'products' && <ShoppingBag className="w-8 h-8 text-gray-600" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No {activeTab} yet</h3>
            <p className="text-gray-500 mb-6">Start by creating your first post</p>
            <Link to={getCreatePath()} className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Create {activeTab.slice(0, -1)}
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.map((item) => (
              <div key={item._id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-white line-clamp-2">
                    {item.title || item.name}
                  </h3>
                  <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                    {item.category}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {item.description || item.excerpt || item.company || item.subcategory}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Eye className="w-4 h-4" />
                    {item.views || 0}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-dark-200 text-gray-400 hover:text-blue-400 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(activeTab, item._id)}
                      className="p-2 rounded-lg bg-dark-200 text-gray-400 hover:text-blue-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
