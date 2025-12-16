import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Upload, CreditCard, CheckCircle, User, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

interface ParticipantRegistrationProps {
  eventType: string;
  eventName: string;
  eventColor: string;
  onClose: () => void;
}

const eventDetails = {
  art: { name: 'Art Competition', fee: 150, acceptedFiles: 'image/*' },
  photography: { name: 'Photography Competition', fee: 150, acceptedFiles: 'image/*' },
  mehndi: { name: 'Mehndi Competition', fee: 150, acceptedFiles: 'image/*' },
  rangoli: { name: 'Rangoli Competition', fee: 150, acceptedFiles: 'image/*' },
  dance: { name: 'Dance Competition', fee: 150, acceptedFiles: 'video/*' },
  singing: { name: 'Singing Competition', fee: 150, acceptedFiles: 'audio/*,video/*' }
};

const ParticipantRegistration: React.FC<ParticipantRegistrationProps> = ({
  eventType,
  eventName,
  eventColor,
  onClose
}) => {
  const navigate = useNavigate();
  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('kalakriti-token');
  const userData = isLoggedIn ? JSON.parse(localStorage.getItem('kalakriti-user') || '{}') : null;
  
  const [step, setStep] = useState(isLoggedIn ? 2 : 1);
  const [formData, setFormData] = useState({
    full_name: userData?.full_name || '',
    email: userData?.email || '',
    phone_number: userData?.phone_number || '',
    address: userData?.address || '',
    age: userData?.age || '',
    city: userData?.city || '',
    state: userData?.state || '',
    password: '',
    confirmPassword: '',
    previous_experience: userData?.previous_experience || '',
    submissions: [] as File[],
    season: '',
    artwork_count: parseInt(localStorage.getItem('kalakriti-selected-artworks') || '1')
  });
  const [currentSeason, setCurrentSeason] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [participantId, setParticipantId] = useState('');

  const event = eventDetails[eventType as keyof typeof eventDetails];

  useEffect(() => {
    const fetchCurrentSeason = async () => {
      try {
        const response = await api.get('/v1/backend/events');
        const events = response.data.events || [];
        const activeEvent = events.find((e: any) => e.event_name === eventName);
        if (activeEvent?.season) {
          setCurrentSeason(activeEvent.season);
          setFormData(prev => ({ ...prev, season: localStorage.getItem('kalakriti-event-season') || activeEvent.season }));
        }
      } catch (error) {
        console.error('Failed to fetch current season:', error);
        setCurrentSeason('Season 1');
        setFormData(prev => ({ ...prev, season: 'Season 1' }));
      }
    };
    
    fetchCurrentSeason();
  }, [eventName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getAssetType = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    
    if (imageExtensions.includes(extension || '')) {
      return 'image';
    } else if (videoExtensions.includes(extension || '')) {
      return 'video';
    }
    return 'image'; // default
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      if (files.length !== formData.artwork_count) {
        toast.error(`Please select exactly ${formData.artwork_count} file(s)`);
        return;
      }
      
      for (const file of files) {
        if (file.size > maxSize) {
          toast.error('Each file size must be less than 50MB');
          return;
        }
      }
      
      setFormData(prev => ({ ...prev, submissions: files }));
      toast.success(`${files.length} file(s) uploaded successfully!`);
    }
  };

  const validateStep1 = () => {
    const required = ['full_name', 'email', 'phone_number', 'password', 'confirmPassword'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast.error('Please fill all required fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (formData.submissions.length !== formData.artwork_count) {
      toast.error(`Please upload exactly ${formData.artwork_count} file(s)`);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    
    try {
      // Step 1: Signup if not logged in
      if (!isLoggedIn) {
        const signupPayload = {
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          phone_number: formData.phone_number,
          age: formData.age || null,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          previous_experience: formData.previous_experience || null
        };
        
        const signupResponse = await api.post('/v1/backend/signup', signupPayload);
        
        // Store auth token and user data
        if (signupResponse.data.access_token) {
          localStorage.setItem('kalakriti-token', signupResponse.data.access_token);
        }
        if (signupResponse.data.user) {
          localStorage.setItem('kalakriti-user', JSON.stringify(signupResponse.data.user));
        }
      }
      
      // Store files temporarily (will be uploaded after payment)
      const fileData = new FormData();
      formData.submissions.forEach((file, index) => {
        fileData.append(`file_${index}`, file);
      });
      
      // Store submission metadata
      localStorage.setItem('kalakriti-submission-data', JSON.stringify({
        artwork_count: formData.artwork_count,
        eventName,
        eventType,
        fileCount: formData.submissions.length,
        season: localStorage.getItem('kalakriti-event-season') || '1'
      }));
      
      // Store file metadata only (not the actual files)
      const fileMetadata = formData.submissions.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      sessionStorage.setItem('kalakriti-files-metadata', JSON.stringify(fileMetadata));
      
      // Store actual files in a temporary global variable
      window.kalakritTempFiles = formData.submissions;
      
      // Close modal and redirect to payment
      onClose();
      
      const totalAmount = (event?.fee || 150) * formData.artwork_count;
      navigate(`/payment/${eventType}?artworks=${formData.artwork_count}&amount=${totalAmount}`);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const generateParticipantId = (eventType: string) => {
    const eventCodes = {
      art: 'A',
      photography: 'P',
      mehndi: 'M',
      rangoli: 'R',
      dance: 'D',
      singing: 'S'
    };
    
    const season = 'S1';
    const eventCode = eventCodes[eventType as keyof typeof eventCodes];
    const year = '25';
    const participantNumber = String(Math.floor(Math.random() * 9999) + 1).padStart(3, '0');
    
    return `${season}${eventCode}${year}${participantNumber}`;
  };

  if (registrationComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl p-8 max-w-md w-full text-center"
          onClick={e => e.stopPropagation()}
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-kalakriti-primary mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your participant ID is: <span className="font-bold text-kalakriti-secondary">{participantId}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please save this ID for future reference. You will receive an email confirmation shortly.
          </p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2">Step {step} of {isLoggedIn ? 2 : 3}</Badge>
              <h2 className="text-xl font-bold text-kalakriti-primary">Register for {eventName}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Create Account
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="10-digit phone number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Your age"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Your address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="previous_experience">Previous Experience</Label>
                  <Input
                    id="previous_experience"
                    name="previous_experience"
                    value={formData.previous_experience}
                    onChange={handleInputChange}
                    placeholder="Any previous art experience (optional)"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Submissions
                </h3>
                
                <div className="mb-4">
                  <Label>Number of Artworks</Label>
                  <div className="p-3 bg-gray-100 rounded-md">
                    <span className="font-medium">{formData.artwork_count} Artwork{formData.artwork_count > 1 ? 's' : ''}</span>
                    <span className="text-sm text-gray-600 ml-2">(₹{150 * formData.artwork_count})</span>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="mb-4">
                    <Label htmlFor="submissions" className="cursor-pointer">
                      <span className="text-lg font-medium text-kalakriti-primary hover:text-kalakriti-secondary">
                        Click to upload {formData.artwork_count} file{formData.artwork_count > 1 ? 's' : ''}
                      </span>
                    </Label>
                    <p className="text-sm text-gray-500 mt-2">
                      {eventType === 'dance' || eventType === 'singing' ? 
                        `Upload ${formData.artwork_count} video file(s) (max 50MB each)` : 
                        `Upload ${formData.artwork_count} image file(s) (max 50MB each)`}
                    </p>
                  </div>
                  <Input
                    id="submissions"
                    name="submissions"
                    type="file"
                    accept={event?.acceptedFiles}
                    onChange={handleFileChange}
                    multiple={formData.artwork_count > 1}
                    className="hidden"
                  />
                  {formData.submissions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.submissions.map((file, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">
                            <strong>File {index + 1}:</strong> {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment & Review
                </h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Competition:</span>
                      <span className="font-medium">{eventName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Participant:</span>
                      <span className="font-medium">{formData.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registration Fee per Artwork:</span>
                      <span className="font-medium">₹150</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of Artworks:</span>
                      <span className="font-medium">{formData.artwork_count}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span>₹{150 * formData.artwork_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-4 border-t">
            {step > (isLoggedIn ? 2 : 1) && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Previous
              </Button>
            )}
            
            <div className="ml-auto">
              {step < (isLoggedIn ? 3 : 3) ? (
                <Button onClick={handleNextStep}>
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={handlePayment}
                  disabled={paymentProcessing}
                  className={`bg-gradient-to-r ${eventColor} text-white`}
                >
                  {paymentProcessing ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParticipantRegistration;