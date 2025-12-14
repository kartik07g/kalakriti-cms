import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Trophy, 
  FileText, 
  LogOut, 
  Search, 
  Award,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import ResultUpload from '@/components/admin/ResultUpload';
import QueriesManagement from '@/components/admin/QueriesManagement';

import * as XLSX from 'xlsx';
import api from '@/lib/axios';

interface Participant {
  participantId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  eventType: string;
  eventName: string;
  registrationDate: string;
  status: string;
  paymentStatus: string;
  submissionFileName: string;
  previousExperience?: string;
}

interface Result {
  participantId: string;
  eventType: string;
  position: number;
  score: number;
  remarks: string;
  publishedDate: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [eventDateFilter, setEventDateFilter] = useState('');
  const [eventSeasonFilter, setEventSeasonFilter] = useState('all');
  const [eventSortBy, setEventSortBy] = useState('created_at');
  const [eventSortOrder, setEventSortOrder] = useState<'asc' | 'desc'>('desc');
  const [regStartDate, setRegStartDate] = useState('');
  const [regEndDate, setRegEndDate] = useState('');
  const [regSeasonFilter, setRegSeasonFilter] = useState('all');
  const [regSortBy, setRegSortBy] = useState('created_dt');
  const [regSortOrder, setRegSortOrder] = useState<'asc' | 'desc'>('desc');
  const [newResult, setNewResult] = useState({
    participantId: '',
    eventType: '',
    position: 1,
    score: 0,
    remarks: ''
  });

  const eventTypes = ['art', 'photography', 'mehndi', 'rangoli', 'dance', 'singing'];
  const eventNames = {
    art: 'Art Competition',
    photography: 'Photography Competition',
    mehndi: 'Mehndi Competition',
    rangoli: 'Rangoli Competition',
    dance: 'Dance Competition',
    singing: 'Singing Competition'
  };

  // Format date to match API response format (YYYY-MM-DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format datetime to match API response format (ISO string)
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString();
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('kalakriti-admin-token');
      const response = await api.get('/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchEventRegistrations = async () => {
    try {
      const token = localStorage.getItem('kalakriti-admin-token');
      const response = await api.get('/event-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEventRegistrations(response.data.event_registrations || []);
    } catch (error) {
      console.error('Failed to fetch event registrations:', error);
      toast.error('Failed to load event registrations');
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('kalakriti-admin-token');
      const response = await api.get('/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    }
  };

  const updateEvent = async (eventId: string, updatedData: any) => {
    try {
      const token = localStorage.getItem('kalakriti-admin-token');
      await api.patch(`/events/${eventId}`, updatedData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Event updated successfully');
      fetchEvents();
      setEditingEvent(null);
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    }
  };

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('kalakriti-admin-token');
    if (!adminToken) {
      navigate('/admin');
      return;
    }

    // Load participants and results from localStorage
    const storedParticipants = JSON.parse(localStorage.getItem('kalakriti-participants') || '[]');
    const storedResults = JSON.parse(localStorage.getItem('kalakriti-results') || '[]');
    
    setParticipants(storedParticipants);
    setResults(storedResults);
    
    // Fetch users from API
    fetchUsers();
    fetchEventRegistrations();
    fetchEvents();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kalakriti-admin-token');
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const getAvailableSeasons = () => {
    const seasons = ['all', '2024', '2025'];
    return seasons;
  };

  const getEventSeasons = () => {
    const seasons = new Set(events.map(event => event.season).filter(Boolean));
    return ['all', ...Array.from(seasons)];
  };

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesDate = !eventDateFilter || 
        (event.start_date && event.start_date.includes(eventDateFilter)) ||
        (event.end_date && event.end_date.includes(eventDateFilter));
      const matchesSeason = eventSeasonFilter === 'all' || event.season === eventSeasonFilter;
      return matchesDate && matchesSeason;
    })
    .sort((a, b) => {
      let aValue = a[eventSortBy as keyof typeof a];
      let bValue = b[eventSortBy as keyof typeof b];
      
      if (eventSortBy === 'created_at' || eventSortBy === 'start_date' || eventSortBy === 'end_date') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (eventSortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleEventSort = (column: string) => {
    if (eventSortBy === column) {
      setEventSortOrder(eventSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setEventSortBy(column);
      setEventSortOrder('asc');
    }
  };

  const getRegistrationSeasons = () => {
    const seasons = new Set(eventRegistrations.map(reg => reg.season).filter(Boolean));
    return ['all', ...Array.from(seasons)];
  };

  const filteredAndSortedRegistrations = eventRegistrations
    .filter(registration => {
      const regDate = new Date(registration.created_dt.split('T')[0]);
      const matchesStartDate = !regStartDate || regDate >= new Date(regStartDate);
      const matchesEndDate = !regEndDate || regDate <= new Date(regEndDate);
      const matchesSeason = regSeasonFilter === 'all' || registration.season === regSeasonFilter;
      return matchesStartDate && matchesEndDate && matchesSeason;
    })
    .sort((a, b) => {
      let aValue = a[regSortBy as keyof typeof a];
      let bValue = b[regSortBy as keyof typeof b];
      
      if (regSortBy === 'created_dt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (regSortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleRegistrationSort = (column: string) => {
    if (regSortBy === column) {
      setRegSortOrder(regSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setRegSortBy(column);
      setRegSortOrder('asc');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.participantId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === 'all' || participant.eventType === selectedEvent;
    const matchesSeason = selectedSeason === 'all' || participant.registrationDate.includes(selectedSeason);
    return matchesSearch && matchesEvent && matchesSeason;
  });

  const exportToExcel = () => {
    if (filteredParticipants.length === 0) {
      toast.error('No participants to export');
      return;
    }

    const exportData = filteredParticipants.map(p => ({
      'Participant ID': p.participantId,
      'Full Name': p.fullName,
      'Email': p.email,
      'Phone': p.phone,
      'City': p.city,
      'State': p.state,
      'Competition': eventNames[p.eventType as keyof typeof eventNames],
      'Registration Date': new Date(p.registrationDate).toLocaleDateString(),
      'Status': p.status,
      'Payment Status': p.paymentStatus,
      'Artwork File': p.submissionFileName || 'Not submitted'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    
    const filename = `participants_${selectedEvent}_${selectedSeason}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success('Excel file downloaded successfully!');
  };

  const getEventStats = () => {
    const stats = eventTypes.map(eventType => ({
      eventType,
      eventName: eventNames[eventType as keyof typeof eventNames],
      participantCount: participants.filter(p => p.eventType === eventType).length,
      resultsPublished: results.filter(r => r.eventType === eventType).length
    }));
    return stats;
  };

  const handlePublishResult = () => {
    if (!newResult.participantId || !newResult.eventType) {
      toast.error('Please fill all required fields');
      return;
    }

    const participant = participants.find(p => p.participantId === newResult.participantId);
    if (!participant) {
      toast.error('Participant not found');
      return;
    }

    const result: Result = {
      ...newResult,
      publishedDate: new Date().toISOString()
    };

    const updatedResults = [...results, result];
    setResults(updatedResults);
    localStorage.setItem('kalakriti-results', JSON.stringify(updatedResults));

    setNewResult({
      participantId: '',
      eventType: '',
      position: 1,
      score: 0,
      remarks: ''
    });

    toast.success('Result published successfully!');
  };

  const downloadParticipantData = (eventType: string) => {
    const eventParticipants = participants.filter(p => p.eventType === eventType);
    const csvContent = [
      'Participant ID,Name,Email,Phone,City,State,Registration Date,Status',
      ...eventParticipants.map(p => 
        `${p.participantId},${p.fullName},${p.email},${p.phone},${p.city},${p.state},${new Date(p.registrationDate).toLocaleDateString()},${p.status}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventType}-participants.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-kalakriti-primary">Kalakriti Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage competitions, participants & results</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
            <TabsTrigger value="registrations">Event Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-kalakriti-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-kalakriti-primary">{users.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Results Published</p>
                      <p className="text-2xl font-bold text-yellow-600">{results.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Competitions</p>
                      <p className="text-2xl font-bold text-green-600">6</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Days to Deadline</p>
                      <p className="text-2xl font-bold text-blue-600">16</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Competition Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getEventStats().map((stat, index) => (
                    <div key={stat.eventType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-kalakriti-primary">{stat.eventName}</h4>
                        <p className="text-sm text-gray-600">{stat.participantCount} participants registered</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={stat.resultsPublished > 0 ? "default" : "secondary"}>
                          {stat.resultsPublished} results
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadParticipantData(stat.eventType)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participant Management</CardTitle>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search participants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="all">All Competitions</option>
                      {eventTypes.map(type => (
                        <option key={type} value={type}>
                          {eventNames[type as keyof typeof eventNames]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="all">All Seasons</option>
                      {getAvailableSeasons().filter(s => s !== 'all').map(season => (
                        <option key={season} value={season}>
                          Season {season}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={exportToExcel}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Competition</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Phone</th>
                        <th className="text-left p-3">City</th>
                         <th className="text-left p-3">Status</th>
                         <th className="text-left p-3">Artwork</th>
                         <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr key={user.user_id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">{user.user_id}</td>
                          <td className="p-3 font-medium">{user.full_name}</td>
                          <td className="p-3">
                            <Badge variant="outline">
                              User
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{user.email}</td>
                          <td className="p-3 text-sm text-gray-600">{user.phone_number}</td>
                          <td className="p-3 text-sm text-gray-600">{user.city}</td>
                           <td className="p-3">
                             <Badge variant="default">
                               Active
                             </Badge>
                           </td>
                           <td className="p-3">
                             <span className="text-gray-400 text-sm">-</span>
                           </td>
                           <td className="p-3">
                             <Button 
                               size="sm" 
                               variant="outline"
                               onClick={() => {
                                 toast.info(`User: ${user.full_name}`);
                               }}
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Events Management</CardTitle>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="date"
                      placeholder="Filter by date"
                      value={eventDateFilter}
                      onChange={(e) => setEventDateFilter(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                    <select
                      value={eventSeasonFilter}
                      onChange={(e) => setEventSeasonFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="all">All Seasons</option>
                      {getEventSeasons().filter(s => s !== 'all').map(season => (
                        <option key={season} value={season}>
                          Season {season}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {filteredAndSortedEvents.length} of {events.length} events
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Event ID</th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleEventSort('event_name')}>
                          <div className="flex items-center gap-1">
                            Event Name
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleEventSort('season')}>
                          <div className="flex items-center gap-1">
                            Season
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleEventSort('start_date')}>
                          <div className="flex items-center gap-1">
                            Start Date
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleEventSort('end_date')}>
                          <div className="flex items-center gap-1">
                            End Date
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleEventSort('created_at')}>
                          <div className="flex items-center gap-1">
                            Created
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedEvents.map((event) => (
                        <tr key={event.event_id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">{event.event_id}</td>
                          <td className="p-3 font-medium">{event.event_name}</td>
                          <td className="p-3">
                            {editingEvent?.event_id === event.event_id ? (
                              <Input
                                value={editingEvent.season}
                                onChange={(e) => setEditingEvent({...editingEvent, season: e.target.value})}
                                className="w-24"
                              />
                            ) : (
                              event.season
                            )}
                          </td>
                          <td className="p-3">
                            {editingEvent?.event_id === event.event_id ? (
                              <Input
                                type="date"
                                value={editingEvent.start_date}
                                onChange={(e) => setEditingEvent({...editingEvent, start_date: e.target.value})}
                                className="w-32"
                              />
                            ) : (
                              event.start_date
                            )}
                          </td>
                          <td className="p-3">
                            {editingEvent?.event_id === event.event_id ? (
                              <Input
                                type="date"
                                value={editingEvent.end_date}
                                onChange={(e) => setEditingEvent({...editingEvent, end_date: e.target.value})}
                                className="w-32"
                              />
                            ) : (
                              event.end_date
                            )}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {event.created_at.split('T')[0]}
                          </td>
                          <td className="p-3">
                            {editingEvent?.event_id === event.event_id ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const updatedFields: any = {};
                                    if (editingEvent.season !== event.season) updatedFields.season = editingEvent.season;
                                    if (editingEvent.start_date !== event.start_date) updatedFields.start_date = editingEvent.start_date;
                                    if (editingEvent.end_date !== event.end_date) updatedFields.end_date = editingEvent.end_date;
                                    
                                    if (Object.keys(updatedFields).length > 0) {
                                      updateEvent(event.event_id, updatedFields);
                                    } else {
                                      setEditingEvent(null);
                                    }
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingEvent(null)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingEvent(event)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ResultUpload 
              eventTypes={eventTypes}
              eventNames={eventNames}
              participants={participants}
            />
          </TabsContent>

          <TabsContent value="queries" className="space-y-6">
            <QueriesManagement />
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Registrations</CardTitle>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex flex-col gap-1">
                      <Label className="text-sm font-medium">From Date</Label>
                      <Input
                        type="date"
                        value={regStartDate}
                        onChange={(e) => setRegStartDate(e.target.value)}
                        className="w-full sm:w-auto"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-sm font-medium">To Date</Label>
                      <Input
                        type="date"
                        value={regEndDate}
                        onChange={(e) => setRegEndDate(e.target.value)}
                        className="w-full sm:w-auto"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-sm font-medium">Season</Label>
                      <select
                        value={regSeasonFilter}
                        onChange={(e) => setRegSeasonFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md bg-white h-10"
                      >
                        <option value="all">All Seasons</option>
                        {getRegistrationSeasons().filter(s => s !== 'all').map(season => (
                          <option key={season} value={season}>
                            Season {season}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRegStartDate('');
                        setRegEndDate('');
                        setRegSeasonFilter('all');
                      }}
                      className="whitespace-nowrap"
                    >
                      Clear Filters
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {(regStartDate || regEndDate || regSeasonFilter !== 'all') && (
                      <span className="text-blue-600 font-medium">
                        Filtered: {filteredAndSortedRegistrations.length} of {eventRegistrations.length} registrations
                        {regStartDate && ` • From: ${regStartDate}`}
                        {regEndDate && ` • To: ${regEndDate}`}
                        {regSeasonFilter !== 'all' && ` • Season: ${regSeasonFilter}`}
                      </span>
                    )}
                    {!regStartDate && !regEndDate && regSeasonFilter === 'all' && (
                      <span>Showing all {eventRegistrations.length} registrations</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Registration ID</th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleRegistrationSort('user_id')}>
                          <div className="flex items-center gap-1">
                            User ID
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleRegistrationSort('event_name')}>
                          <div className="flex items-center gap-1">
                            Event Name
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleRegistrationSort('season')}>
                          <div className="flex items-center gap-1">
                            Season
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleRegistrationSort('artwork_count')}>
                          <div className="flex items-center gap-1">
                            Artwork Count
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleRegistrationSort('registration_status')}>
                          <div className="flex items-center gap-1">
                            Status
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                        <th className="text-left p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleRegistrationSort('created_dt')}>
                          <div className="flex items-center gap-1">
                            Created Date
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedRegistrations.map((registration) => (
                        <tr key={registration.event_registration_id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono text-sm">{registration.event_registration_id}</td>
                          <td className="p-3 font-mono text-sm">{registration.user_id}</td>
                          <td className="p-3">{registration.event_name}</td>
                          <td className="p-3">{registration.season}</td>
                          <td className="p-3">{registration.artwork_count}</td>
                          <td className="p-3">
                            <Badge variant={registration.registration_status === 'pending' ? 'secondary' : 'default'}>
                              {registration.registration_status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {registration.created_dt.split('T')[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;