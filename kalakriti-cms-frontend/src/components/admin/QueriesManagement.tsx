import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Phone, Calendar, Search, MessageSquare, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

interface Query {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
  created_at: string;
  updated_at: string | null;
}

const QueriesManagement = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    try {
      const response = await api.get('/v1/backend/contact-us');
      const queriesData = response.data.contact_us || [];
      setQueries(queriesData.sort((a: Query, b: Query) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Error loading queries:', error);
      toast.error('Failed to load queries');
    }
  };

  const deleteQuery = async (queryId: number) => {
    try {
      await api.delete(`/v1/backend/contact-us/${queryId}`);
      setQueries(queries.filter(q => q.id !== queryId));
      toast.success('Query deleted successfully');
    } catch (error) {
      console.error('Error deleting query:', error);
      toast.error('Failed to delete query');
    }
  };

  const filteredQueries = queries.filter(query => 
    query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.id.toString().includes(searchTerm)
  );

  const totalCount = queries.length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-kalakriti-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Queries</p>
                <p className="text-2xl font-bold text-kalakriti-primary">{queries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">{queries.filter(q => new Date(q.created_at).getMonth() === new Date().getMonth()).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                <p className="text-2xl font-bold text-green-600">{queries.filter(q => new Date(q.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Queries</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, subject or query ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredQueries.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Queries Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria' : 'Contact form submissions will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueries.map((query) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{query.name}</h3>
                        <Badge variant="default">ID: {query.id}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {query.email}
                        </div>
                        {query.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            {query.phone_number}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(query.created_at).toLocaleString()}
                        </div>
                      </div>

                      {query.subject && (
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          <strong>Subject:</strong> {query.subject}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{query.message}</p>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedQuery(query)}
                          >
                            View Full
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Query Details</DialogTitle>
                          </DialogHeader>
                          {selectedQuery && (
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Query ID</p>
                                <p className="font-mono text-sm">{selectedQuery.id}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Name</p>
                                <p>{selectedQuery.name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p>{selectedQuery.email}</p>
                              </div>
                              {selectedQuery.phone_number && (
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Phone</p>
                                  <p>{selectedQuery.phone_number}</p>
                                </div>
                              )}
                              {selectedQuery.subject && (
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Subject</p>
                                  <p>{selectedQuery.subject}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-500">Message</p>
                                <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{selectedQuery.message}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Submitted At</p>
                                <p>{new Date(selectedQuery.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteQuery(query.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QueriesManagement;
