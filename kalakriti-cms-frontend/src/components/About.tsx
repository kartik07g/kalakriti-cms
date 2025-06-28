
import { CheckCircle, Target, Eye, Award } from "lucide-react";

export const About = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-purple-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About
              <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent"> Kalakriti Events</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              With over 15 years of experience in the event management industry, Kalakriti Events has been transforming dreams into reality. We specialize in creating bespoke experiences that reflect your unique style and vision.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                "15+ years of industry expertise",
                "500+ successful events executed",
                "Award-winning creative team",
                "24/7 dedicated support"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <Target className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-600 text-sm">To create extraordinary experiences that exceed expectations and leave lasting memories.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <Eye className="h-8 w-8 text-rose-500 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Vision</h3>
                <p className="text-gray-600 text-sm">To be the most trusted and innovative event management company in the industry.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Event planning team"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-4">
                <Award className="h-10 w-10 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">Award Winner</div>
                  <div className="text-gray-600">Event Company 2023</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
