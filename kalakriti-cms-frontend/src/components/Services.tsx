
import { Heart, Building2, Users, Camera, Music, Utensils } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    icon: Heart,
    title: "Wedding Planning",
    description: "Create your dream wedding with our comprehensive planning services, from intimate ceremonies to grand celebrations.",
    color: "from-rose-500 to-pink-500"
  },
  {
    icon: Building2,
    title: "Corporate Events",
    description: "Professional corporate events, conferences, and business meetings that leave lasting impressions.",
    color: "from-blue-500 to-indigo-500"
  },
  {
    icon: Users,
    title: "Social Gatherings",
    description: "Birthday parties, anniversaries, and family celebrations designed to bring people together.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Camera,
    title: "Photography & Videography",
    description: "Capture every precious moment with our professional photography and videography services.",
    color: "from-purple-500 to-violet-500"
  },
  {
    icon: Music,
    title: "Entertainment",
    description: "Live music, DJs, dancers, and performers to keep your guests entertained throughout the event.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Utensils,
    title: "Catering Services",
    description: "Exquisite culinary experiences with customized menus to suit every taste and dietary requirement.",
    color: "from-yellow-500 to-amber-500"
  }
];

export const Services = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Premium Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From intimate gatherings to grand celebrations, we offer comprehensive event management services tailored to your unique vision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardHeader className="text-center pb-4">
                <div className={`inline-block p-4 rounded-full bg-gradient-to-r ${service.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
