import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useIsDesktop } from '../../hooks/useIsDesktop';

interface BlogPostData {
  id: number;
  title: string;
  excerpt: string;
  fullContent: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

export const BlogPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  // Mock blog posts data - in a real app, this would come from an API or CMS
  const blogPosts: BlogPostData[] = [
    {
      id: 1,
      title: t('blog.post1.title'),
      excerpt: t('blog.post1.excerpt'),
      fullContent: t('blog.post1.fullContent'),
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      author: 'SimConnect Team',
      date: '2024-01-15',
      readTime: '5 min',
      category: 'Viajes de Negocios',
      tags: ['ejecutivos', 'servicio al cliente', 'viajes']
    },
    {
      id: 2,
      title: t('blog.post2.title'),
      excerpt: t('blog.post2.excerpt'),
      fullContent: t('blog.post2.fullContent'),
      image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      author: 'SimConnect Team',
      date: '2024-01-10',
      readTime: '4 min',
      category: 'Tecnología',
      tags: ['esim', 'flexibilidad', 'configuración']
    },
    {
      id: 3,
      title: t('blog.post3.title'),
      excerpt: t('blog.post3.excerpt'),
      fullContent: t('blog.post3.fullContent'),
      image: 'https://images.pexels.com/photos/936722/pexels-photo-936722.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      author: 'SimConnect Team',
      date: '2024-01-05',
      readTime: '6 min',
      category: 'Ahorro',
      tags: ['roaming', 'costos', 'beneficios']
    },
    {
      id: 4,
      title: t('blog.post4.title'),
      excerpt: t('blog.post4.excerpt'),
      fullContent: t('blog.post4.fullContent'),
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      author: 'SimConnect Team',
      date: '2024-01-01',
      readTime: '7 min',
      category: 'Negocios',
      tags: ['conectividad', 'internacional', 'confiabilidad']
    }
  ];

  const post = blogPosts.find(p => p.id === parseInt(postId || '0'));

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post no encontrado</h1>
          <p className="text-gray-600 mb-6">El artículo que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareUrl = window.location.href;
  const shareTitle = post.title;

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className={`bg-white border-b border-gray-100 ${isDesktop ? 'py-6' : 'py-4'}`}>
        <div className={`max-w-4xl mx-auto ${isDesktop ? 'px-8' : 'px-4'}`}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('common.back')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <article className={`max-w-4xl mx-auto ${isDesktop ? 'px-8 py-12' : 'px-4 py-8'}`}>
        {/* Article Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Category */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className={`font-bold text-gray-900 mb-6 leading-tight ${
            isDesktop ? 'text-4xl' : 'text-2xl'
          }`}>
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className={`flex items-center text-gray-600 mb-6 ${
            isDesktop ? 'space-x-6' : 'flex-wrap gap-4'
          }`}>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span className="text-sm">{post.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">{post.readTime} de lectura</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Compartir:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
                aria-label="Compartir en Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors duration-200"
                aria-label="Compartir en Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors duration-200"
                aria-label="Compartir en LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Featured Image */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
          />
        </motion.div>

        {/* Article Content */}
        <motion.div
          className="prose prose-lg max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div 
            className="text-gray-700 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: post.fullContent }}
          />
        </motion.div>

        {/* Tags */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="mt-12 p-8 bg-primary/5 rounded-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para conectarte al mundo?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Descubre nuestros planes de datos móviles internacionales y mantente conectado en más de 200 países.
          </p>
          <div className={`flex gap-4 ${isDesktop ? 'justify-center' : 'flex-col'}`}>
            <Button
              onClick={() => navigate('/plans')}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Ver Planes
            </Button>
            <Button
              onClick={() => navigate('/compatibility')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 px-8 py-3 rounded-xl font-semibold"
            >
              Verificar Compatibilidad
            </Button>
          </div>
        </motion.div>
      </article>

      {/* Related Posts Section */}
      <section className="bg-gray-50 py-16">
        <div className={`max-w-4xl mx-auto ${isDesktop ? 'px-8' : 'px-4'}`}>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Artículos Relacionados
          </h2>
          <div className={`grid gap-8 ${isDesktop ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {blogPosts
              .filter(p => p.id !== post.id)
              .slice(0, 3)
              .map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="group"
                >
                  <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                      <div className="mt-4 flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(relatedPost.date)}
                        <span className="mx-2">•</span>
                        <Clock className="w-3 h-3 mr-1" />
                        {relatedPost.readTime}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};