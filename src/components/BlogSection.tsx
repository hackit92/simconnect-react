import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { getPostsByLanguage, type BlogPost } from '../services/wordpressApi';

export const BlogSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isDesktop = useIsDesktop();
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch posts when component mounts or language changes
  React.useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const posts = await getPostsByLanguage(i18n.language, 4);
        setBlogPosts(posts);
        
        if (posts.length === 0) {
          console.warn(`No posts found for language: ${i18n.language}`);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Error al cargar los artículos del blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [i18n.language]);

  // Use first post as featured, rest as regular posts
  const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null;
  const regularPosts = blogPosts.slice(1);

  // Show loading state
  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando artículos...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no posts
  if (blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className={`text-gray-600 mb-2 ${
            isDesktop ? 'text-lg' : 'text-base'
          }`}>
            {t('blog.subtitle')}
          </p>
          <h2 className={`font-light text-gray-800 ${
            isDesktop ? 'text-4xl' : 'text-3xl'
          }`}>
            {t('blog.title_part1')} <span className="text-[#299ae4] font-normal">{t('blog.title_part2')}</span> {t('blog.title_part3')}
          </h2>
        </motion.div>

        {/* Blog Grid */}
        <div className={`${
          isDesktop 
            ? 'grid grid-cols-2 gap-8' 
            : 'space-y-8'
        }`}>
          {/* Featured Post - Left Side */}
          {featuredPost && (
            <motion.article
              className="relative group cursor-pointer"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link to={`/blog/${featuredPost.id}`} className="block">
                <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    isDesktop ? 'h-96' : 'h-64'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className={`font-bold mb-3 leading-tight ${
                    isDesktop ? 'text-2xl' : 'text-xl'
                  }`}>
                    {featuredPost.title}
                  </h3>
                  <p className={`text-gray-200 leading-relaxed ${
                    isDesktop ? 'text-base' : 'text-sm'
                  }`}>
                    {featuredPost.excerpt}
                  </p>
                </div>
              </div>
              </Link>
            </motion.article>
          )}

          {/* Regular Posts - Right Side */}
          <div className="space-y-6">
            {regularPosts.map((post, index) => (
              <motion.article
                key={post.id}
                className="flex items-start space-x-4 group"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + (index * 0.1) }}
                whileHover={{ scale: 1.02 }}
              >
                <Link to={`/blog/${post.id}`} className="flex items-start space-x-4 w-full">
                  <div className="flex-shrink-0">
                  <img
                    src={post.image}
                    alt={post.title}
                    className={`object-cover rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                      isDesktop ? 'w-32 h-24' : 'w-24 h-20'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors duration-200 ${
                    isDesktop ? 'text-lg' : 'text-base'
                  }`}>
                    {post.title}
                  </h4>
                  <p className={`text-gray-600 leading-relaxed ${
                    isDesktop ? 'text-sm' : 'text-xs'
                  }`}>
                    {post.excerpt}
                  </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link to="/blog" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-semibold transition-colors duration-200 group">
            <span>{t('blog.view_all')}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};