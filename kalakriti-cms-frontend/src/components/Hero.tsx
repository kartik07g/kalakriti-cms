
import { ArrowRight, Star, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1519167758481-83f29c8c3d4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Elegant event setup"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-purple-800/70 to-rose-800/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Creating
            <span className="block bg-gradient-to-r from-yellow-400 to-rose-400 bg-clip-text text-transparent">
              Magical Moments
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your special occasions into unforgettable experiences with our premium event management services
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/events">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-lg px-8 py-3">
                Explore Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/results">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-3">
                View Results
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-4 mb-4">
                <Users className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-purple-200">Happy Clients</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-4 mb-4">
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-purple-200">Events Organized</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-4 mb-4">
                <Award className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">15+</div>
              <div className="text-purple-200">Years Experience</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 animate-pulse">
        <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-60"></div>
      </div>
      <div className="absolute top-32 right-20 animate-pulse delay-1000">
        <div className="w-6 h-6 bg-rose-400 rounded-full opacity-40"></div>
      </div>
      <div className="absolute bottom-20 left-1/4 animate-pulse delay-500">
        <div className="w-3 h-3 bg-purple-400 rounded-full opacity-50"></div>
      </div>
    </section>
  );
};
