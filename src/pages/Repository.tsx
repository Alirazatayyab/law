import React, { useState, useEffect } from 'react';
import { Search, Filter, Upload, FolderPlus, Grid, List, Download, Eye, Trash2, MoreHorizontal, FileText, Share, Edit } from 'lucide-react';
import { documentService, DocumentMetadata } from '../services/documentService';
import DocumentViewer from '../components/DocumentViewer';
import FileUploader from '../components/FileUploader';

export default function Repository() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const mockFolders = [
    { id: '1', name: 'Active Contracts', documentCount: 15 },
    { id: '2', name: 'Templates', documentCount: 8 },
    { id: '3', name: 'Legal Documents', documentCount: 23 },
    { id: '4', name: 'HR Files', documentCount: 12 },
    { id: '5', name: 'Archive', documentCount: 42 }
  ];

  useEffect(() => {
    loadDocuments();
  }, [selectedFolder]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getDocuments(selectedFolder || undefined);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      review: 'bg-yellow-100 text-yellow-800',
      agreed: 'bg-green-100 text-green-800',
      esigning: 'bg-blue-100 text-blue-800',
      signed: 'bg-green-100 text-green-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.unknown;
  };

  const handleViewDocument = (document: DocumentMetadata) => {
    setSelectedDocument(document);
    setShowViewer(true);
  };

  const handleDownloadDocument = async (document: DocumentMetadata) => {
    try {
      await documentService.downloadDocument(document.id);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDeleteDocument = async (document: DocumentMetadata) => {
    try {
      await documentService.deleteDocument(document.id);
      await loadDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleUploadComplete = (uploadedDocuments: any[]) => {
    setShowUploader(false);
    loadDocuments(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Repository</h1>
        <p className="text-gray-600">Manage your documents and folders</p>
      </div>

      {/* Actions bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={() => setShowUploader(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} />
              <span>Upload Documents</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <FolderPlus size={16} />
              <span>New Folder</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
            </button>
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'} transition-colors`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'} transition-colors`}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Folders</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                All Documents
              </button>
              {mockFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedFolder === folder.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{folder.name}</span>
                    <span className="text-xs text-gray-500">{folder.documentCount}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200">
            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-900">Name</th>
                      <th className="text-left p-4 font-medium text-gray-900">Status</th>
                      <th className="text-left p-4 font-medium text-gray-900">Size</th>
                      <th className="text-left p-4 font-medium text-gray-900">Modified</th>
                      <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">
                              {doc.tags.map(tag => (
                                <span key={tag} className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mr-1">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{formatFileSize(doc.fileSize)}</td>
                        <td className="p-4 text-sm text-gray-600">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewDocument(doc)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Share">
                              <Share size={16} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteDocument(doc)}
                              className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <FileText className="text-blue-600" size={24} />
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{doc.name}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                      Modified {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDocument(doc)}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                      <button 
                        onClick={() => handleDownloadDocument(doc)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setSelectedDocument(null);
          }}
          onDelete={() => {
            handleDeleteDocument(selectedDocument);
            setShowViewer(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* File Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <FileUploader
                folderId={selectedFolder || undefined}
                onUploadComplete={handleUploadComplete}
                onUploadError={(error) => console.error('Upload error:', error)}
              />
            </div>
          </div>
        </div>
      )}

      {filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">Upload your first document to get started.</p>
        </div>
      )}
    </div>
  );
}