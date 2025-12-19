
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const eventPricing = {
  art: { name: 'Art Competition', fee: 500, color: 'from-red-500 to-pink-600' },
  photography: { name: 'Photography Contest', fee: 600, color: 'from-blue-500 to-cyan-600' },
  mehndi: { name: 'Mehndi Championship', fee: 450, color: 'from-orange-500 to-red-500' },
  rangoli: { name: 'Rangoli Festival', fee: 400, color: 'from-purple-500 to-pink-500' },
  dance: { name: 'Dance Competition', fee: 700, color: 'from-green-500 to-teal-600' },
  singing: { name: 'Singing Contest', fee: 650, color: 'from-indigo-500 to-purple-600' }
};

const PaymentPage = () => {
  const { eventType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const queryParams = new URLSearchParams(location.search);
  const numberOfArtworks = parseInt(queryParams.get('artworks') || '1');
  const totalAmount = parseInt(queryParams.get('amount') || '0');
  
  const event = eventPricing[eventType as keyof typeof eventPricing];

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('kalakriti-token');
    setIsAuthenticated(!!token);
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onerror = () => console.warn('Razorpay script loaded with warnings');
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!event) {
    return <div>Event not found</div>;
  }

  const handlePayment = async () => {
    setLoading(true);

    // If user is not authenticated, store payment intent and redirect to login
    if (!isAuthenticated) {
      localStorage.setItem('kalakriti-payment-intent', JSON.stringify({
        eventType,
        numberOfArtworks,
        totalAmount
      }));
      navigate('/auth/login?redirect=payment');
      return;
    }

    try {
      const token = localStorage.getItem('kalakriti-token');
      
      // Create Razorpay order
      const orderResponse = await api.post(
        '/v1/backend/payment/create-order',
        {
          event_name: `Kalakriti ${event.name}`,
          season: JSON.parse(localStorage.getItem('kalakriti-submission-data') || '{}').season || '1',
          artwork_count: numberOfArtworks,
          amount: (numberOfArtworks === 1 ? 150 : numberOfArtworks === 2 ? 250 : numberOfArtworks === 3 ? 350 : numberOfArtworks === 4 ? 450 : 550) + 30 + 20
        }
      );

      const { order_id, amount, currency, key } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key,
        amount,
        currency,
        name: 'Kalakriti Events',
        description: `Payment for ${event.name}`,
        order_id,
        handler: async (response: any) => {
          try {
            toast.loading('Processing registration... Please wait', { id: 'registration' });
            
            // Verify payment
            const verifyResponse = await api.post(
              '/v1/backend/payment/verify',
              {
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                event_name: `Kalakriti ${event.name}`,
                season: JSON.parse(localStorage.getItem('kalakriti-submission-data') || '{}').season || '1',
                artwork_count: numberOfArtworks
              }
            );
            
            // Upload assets after successful payment
            const tempFiles = window.kalakritTempFiles || [];
            
            if (tempFiles.length > 0) {
              try {
                for (let i = 0; i < tempFiles.length; i++) {
                  const file = tempFiles[i];
                  
                  // Upload asset
                  const assetFormData = new FormData();
                  assetFormData.append('media_file', file);
                  assetFormData.append('title', `${event.name} - Artwork ${i + 1}`);
                  assetFormData.append('asset_type', eventType || 'art');
                  assetFormData.append('event_registration_id', verifyResponse.data.registration_id);
                  
                  await api.post(
                    '/v1/backend/assets',
                    assetFormData,
                    {
                      headers: {
                        'Content-Type': 'multipart/form-data'
                      }
                    }
                  );
                }
                
                // Clean up stored files
                delete window.kalakritTempFiles;
                sessionStorage.removeItem('kalakriti-files-metadata');
                localStorage.removeItem('kalakriti-submission-data');
                
              } catch (error) {
                console.error('Asset upload failed:', error);
              }
            }
            
            localStorage.setItem('kalakriti-payment-success', JSON.stringify({
              eventType,
              numberOfArtworks,
              totalAmount,
              paymentId: response.razorpay_payment_id,
              registrationId: verifyResponse.data.registration_id
            }));
            
            toast.success('Registration completed! Redirecting to dashboard...', { id: 'registration' });
            
            // Redirect to dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
            
          } catch (error) {
            toast.error('Payment verification failed', { id: 'registration' });
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem('kalakriti-user') || '{}').full_name || '',
          email: JSON.parse(localStorage.getItem('kalakriti-user') || '{}').email || '',
          contact: JSON.parse(localStorage.getItem('kalakriti-user') || '{}').phone_number || ''
        },
        theme: {
          color: '#3399cc'
        }
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay script not loaded');
      }
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <Badge className="mb-4">Payment</Badge>
              <h1 className="text-3xl font-bold mb-2">Complete Your Registration</h1>
              <p className="text-gray-600">Secure payment for Kalakriti {event.name}</p>
            </div>

            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Event:</span>
                  <span className="font-medium">Kalakriti {event.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of Artworks:</span>
                  <span className="font-medium">{numberOfArtworks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Submission Fee:</span>
                  <span className="font-medium">₹{numberOfArtworks === 1 ? 150 : numberOfArtworks === 2 ? 250 : numberOfArtworks === 3 ? 350 : numberOfArtworks === 4 ? 450 : 550}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee:</span>
                  <span className="font-medium">₹30</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span className="font-medium">₹20</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{(numberOfArtworks === 1 ? 150 : numberOfArtworks === 2 ? 250 : numberOfArtworks === 3 ? 350 : numberOfArtworks === 4 ? 450 : 550) + 30 + 20}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isAuthenticated && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-blue-800">
                    <Lock className="h-5 w-5" />
                    <p>You need to log in to complete the payment process.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Powered by Razorpay</span>
                  </div>
                </div>

                <Button 
                  className={`w-full bg-gradient-to-r ${event.color} hover:opacity-90 text-white`}
                  size="lg"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay ₹${(numberOfArtworks === 1 ? 150 : numberOfArtworks === 2 ? 250 : numberOfArtworks === 3 ? 350 : numberOfArtworks === 4 ? 450 : 550) + 30 + 20}`
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  After successful payment, you'll receive a contestant ID and access to the submission form.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentPage;
