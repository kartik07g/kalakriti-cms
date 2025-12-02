
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/home/EventCard';
import { getEvents } from '@/lib/api/events';

// Event type mapping for images and descriptions
const eventTypeMap = {
  'Kalakriti Art Competition': {
    description: 'Showcase your painting, sketching or digital art skills in India\'s premier art competition.',
    imageSrc: '/images/art-event.jpg',
    eventType: 'art',
    entryFee: '₹500 per entry',
    categories: ['Painting', 'Sketching', 'Digital Art']
  },
  'Kalakriti Photography Contest': {
    description: 'Capture moments that tell stories through your lens in this national photography competition.',
    imageSrc: '/images/photography-event.jpg',
    eventType: 'photography',
    entryFee: '₹600 per entry',
    categories: ['Portrait', 'Landscape', 'Street Photography']
  },
  'Kalakriti Mehndi Championship': {
    description: 'Express your creativity through the traditional art of mehndi design.',
    imageSrc: '/images/mehndi-event.jpg',
    eventType: 'mehndi',
    entryFee: '₹450 per entry',
    categories: ['Traditional', 'Indo-Arabic', 'Modern Fusion']
  },
  'Kalakriti Rangoli Festival': {
    description: 'Celebrate the vibrant art form of rangoli with your unique patterns and designs.',
    imageSrc: '/images/rangoli-event.jpg',
    eventType: 'rangoli',
    entryFee: '₹400 per entry',
    categories: ['Traditional', 'Contemporary', 'Eco-friendly']
  },
  'Kalakriti Dance Competition': {
    description: 'Showcase your dancing talent across various Indian classical and contemporary styles.',
    imageSrc: '/images/dance-event.jpg',
    eventType: 'dance',
    entryFee: '₹700 per entry',
    categories: ['Classical', 'Folk', 'Contemporary']
  },
  'Kalakriti Singing Contest': {
    description: 'Let your voice shine in India\'s biggest vocal talent hunt across multiple genres.',
    imageSrc: '/images/singing-event.jpg',
    eventType: 'singing',
    entryFee: '₹650 per entry',
    categories: ['Classical', 'Bollywood', 'Folk Songs']
  }
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      setEvents(response.events || []);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kalakriti-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchEvents}
              className="px-4 py-2 bg-kalakriti-primary text-white rounded hover:bg-opacity-90"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold font-heading text-kalakriti-primary mb-4">
              Our Events
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our range of competitive events celebrating various art forms across India. 
              Select an event to learn more and participate!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {events.map((event, index) => {
              const eventInfo = eventTypeMap[event.event_name] || {};
              return (
                <motion.div
                  key={event.event_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                >
                  <EventCard
                    title={event.event_name}
                    description={eventInfo.description || 'Join this exciting competition!'}
                    imageSrc={eventInfo.imageSrc || '/images/default-event.jpg'}
                    eventType={eventInfo.eventType || 'general'}
                    index={index}
                  />
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Season: </span>
                      <span>{event.season}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Event Date: </span>
                      <span>{formatDate(event.start_date, event.end_date)}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Entry Fee: </span>
                      <span>{eventInfo.entryFee || 'TBD'}</span>
                    </div>
                    {eventInfo.categories && (
                      <div>
                        <span className="font-medium text-gray-700">Categories: </span>
                        <span>{eventInfo.categories.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No events available at the moment.</p>
              <p className="text-gray-500 mt-2">Please check back later for upcoming events!</p>
            </div>
          )}
          
          <div className="text-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-kalakriti-secondary rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Have Questions? Contact Us
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Events;
