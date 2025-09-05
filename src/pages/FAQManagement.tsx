import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Upload, 
  Download, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FAQEntry, FAQUploadResult } from '../types/industry';

export default function FAQManagement() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadFAQs();
  }, [user]);

  useEffect(() => {
    filterFAQs();
  }, [faqs, searchTerm]);

  const loadFAQs = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('faq_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      setMessage({ type: 'error', text: 'Failed to load FAQs' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterFAQs = () => {
    if (!searchTerm.trim()) {
      setFilteredFaqs(faqs);
      return;
    }

    const filtered = faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFaqs(filtered);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Please upload a CSV file' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Validate header
      const header = lines[0].toLowerCase();
      if (!header.includes('question') || !header.includes('answer')) {
        throw new Error('CSV must have "question" and "answer" columns');
      }

      const results: FAQUploadResult = {
        success: true,
        imported: 0,
        errors: [],
        duplicates: 0
      };

      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          // Simple CSV parsing (handles basic cases)
          const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
          
          if (columns.length < 2) {
            results.errors.push(`Row ${i + 1}: Invalid format`);
            continue;
          }

          const [question, answer] = columns;
          
          if (!question || !answer) {
            results.errors.push(`Row ${i + 1}: Missing question or answer`);
            continue;
          }

          // Check for duplicates
          const existingFaq = faqs.find(faq => 
            faq.question.toLowerCase() === question.toLowerCase()
          );

          if (existingFaq) {
            results.duplicates++;
            continue;
          }

          // Insert FAQ
          const { error } = await supabase
            .from('faq_entries')
            .insert({
              user_id: user.id,
              question: question,
              answer: answer
            });

          if (error) {
            results.errors.push(`Row ${i + 1}: ${error.message}`);
          } else {
            results.imported++;
          }
        } catch (error) {
          results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Show results
      let message = `Successfully imported ${results.imported} FAQs`;
      if (results.duplicates > 0) {
        message += `, skipped ${results.duplicates} duplicates`;
      }
      if (results.errors.length > 0) {
        message += `, ${results.errors.length} errors occurred`;
      }

      setMessage({ 
        type: results.errors.length > 0 ? 'error' : 'success', 
        text: message 
      });

      // Reload FAQs
      await loadFAQs();

    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upload CSV' 
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'question,answer\n"What are your hours?","We are open Monday-Friday 9AM-5PM"\n"How do I book an appointment?","You can call us or book online through our website"';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faq_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleEdit = (faq: FAQEntry) => {
    setEditingId(faq.id);
    setEditForm({ question: faq.question, answer: faq.answer });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !user) return;

    try {
      const { error } = await supabase
        .from('faq_entries')
        .update({
          question: editForm.question,
          answer: editForm.answer,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId)
        .eq('user_id', user.id);

      if (error) throw error;

      setEditingId(null);
      setEditForm({ question: '', answer: '' });
      setMessage({ type: 'success', text: 'FAQ updated successfully' });
      await loadFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      setMessage({ type: 'error', text: 'Failed to update FAQ' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ question: '', answer: '' });
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('faq_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDeleteConfirm(null);
      setMessage({ type: 'success', text: 'FAQ deleted successfully' });
      await loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setMessage({ type: 'error', text: 'Failed to delete FAQ' });
    }
  };

  const handleAddNew = async () => {
    if (!user || !newFaq.question.trim() || !newFaq.answer.trim()) return;

    try {
      const { error } = await supabase
        .from('faq_entries')
        .insert({
          user_id: user.id,
          question: newFaq.question.trim(),
          answer: newFaq.answer.trim()
        });

      if (error) throw error;

      setShowAddForm(false);
      setNewFaq({ question: '', answer: '' });
      setMessage({ type: 'success', text: 'FAQ added successfully' });
      await loadFAQs();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      setMessage({ type: 'error', text: 'Failed to add FAQ' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
        <p className="text-gray-600 mt-2">Manage frequently asked questions for your AI assistant</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Upload FAQs</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
            <p className="text-sm text-gray-500 mt-2">
              Upload a CSV file with "question" and "answer" columns
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-2"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
            <p className="text-sm text-gray-500">
              Download a template to see the correct format
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="mt-4 flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Uploading and processing CSV...</span>
          </div>
        )}
      </div>

      {/* FAQ Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Your FAQs</h3>
              <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
                {faqs.length} total
              </span>
            </div>

            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add FAQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add New FAQ Form */}
        {showAddForm && (
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New FAQ</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter the question..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer
                </label>
                <textarea
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Enter the answer..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddNew}
                  disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save FAQ</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewFaq({ question: '', answer: '' });
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ List */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading FAQs...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                {searchTerm ? 'No FAQs match your search' : 'No FAQs found'}
              </p>
              <p className="text-gray-500 text-sm">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Upload a CSV file or add your first FAQ manually'
                }
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div key={faq.id} className="p-6">
                {editingId === faq.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question
                      </label>
                      <input
                        type="text"
                        value={editForm.question}
                        onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer
                      </label>
                      <textarea
                        value={editForm.answer}
                        onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(faq)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Edit FAQ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(faq.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Used {faq.faq_usage_count} times
                      </span>
                      <span>
                        Updated {new Date(faq.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delete FAQ</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}