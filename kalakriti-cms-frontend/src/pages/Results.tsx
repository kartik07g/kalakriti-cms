
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, Award, Trophy } from "lucide-react";

const Results = () => {
  const achievements = [
    {
      title: "Events Completed",
      value: "1000+",
      icon: Trophy,
      description: "Successfully organized events"
    },
    {
      title: "Happy Clients",
      value: "500+",
      description: "Satisfied customers worldwide"
    },
    {
      title: "Years of Experience",
      value: "15+",
      description: "Years in event management"
    },
    {
      title: "Team Members",
      value: "50+",
      description: "Professional event planners"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      event: "Wedding Celebration",
      rating: 5,
      review: "Absolutely magical! They made our dream wedding come true."
    },
    {
      name: "Michael Chen",
      event: "Corporate Event",
      rating: 5,
      review: "Professional, creative, and flawless execution. Highly recommended!"
    },
    {
      name: "Emily Davis",
      event: "Birthday Party",
      rating: 5,
      review: "The attention to detail was incredible. Best party ever!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent mb-6">
            Our Results
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See the impact we've made and the success stories we've created
          </p>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-r from-purple-100 to-rose-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    {achievement.icon ? (
                      <achievement.icon className="h-8 w-8 text-purple-600" />
                    ) : (
                      <Award className="h-8 w-8 text-purple-600" />
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">{achievement.value}</h3>
                  <p className="text-lg font-semibold text-gray-800 mb-1">{achievement.title}</p>
                  <p className="text-gray-600">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Client Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Client Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.review}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.event}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Results;
