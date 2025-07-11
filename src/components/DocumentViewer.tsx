import React, { useState, useEffect } from 'react';
import { X, Download, Share, Edit, Trash2, Eye, ZoomIn, ZoomOut, RotateCw, AlertCircle } from 'lucide-react';
import { DocumentMetadata, documentService } from '../services/documentService';
import { downloadFile } from '../utils/fileUtils';

interface DocumentViewerProps {
  document: DocumentMetadata;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export default function DocumentViewer({ 
  document, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onShare 
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmails, setShareEmails] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      // Simulate loading time
      setTimeout(() => setLoading(false), 1000);
    }
  }, [isOpen, document.id]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setLoading(true);
      const blob = await documentService.downloadDocument(document.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const emails = shareEmails.split(',').map(email => email.trim()).filter(email => email);
      if (emails.length === 0) {
        setError('Please enter at least one email address');
        return;
      }
      
      await documentService.shareDocument(document.id, emails);
      setShowShareModal(false);
      setShareEmails('');
      onShare?.();
    } catch (error) {
      console.error('Error sharing document:', error);
      setError('Failed to share document');
    }
  };

  const handleDelete = async () => {
    try {
      await documentService.deleteDocument(document.id);
      setShowDeleteConfirm(false);
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const renderDocumentContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-600">
          <AlertCircle size={48} className="mb-4" />
          <p className="text-lg font-medium mb-2">Error loading document</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (document.mimeType.includes('pdf')) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-medium text-gray-900 mb-2">PDF Document</p>
            <p className="text-sm text-gray-600 mb-4">{document.name}</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download to view
            </button>
          </div>
        </div>
      );
    }

    if (document.mimeType.includes('image')) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-lg font-medium text-gray-900 mb-2">Image File</p>
            <p className="text-sm text-gray-600 mb-4">{document.name}</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download to view
            </button>
          </div>
        </div>
      );
    }

    if (document.mimeType.includes('word')) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg font-medium text-gray-900 mb-2">Word Document</p>
            <p className="text-sm text-gray-600 mb-4">{document.name}</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download to view
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Eye size={48} className="mb-4" />
        <p className="text-lg font-medium mb-2">Preview not available</p>
        <p className="text-sm mb-4">This file type cannot be previewed in the browser.</p>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download to view
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{document.name}</h3>
              <p className="text-sm text-gray-500">
                {document.type} • {(document.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2 mx-4">
              {(document.mimeType.includes('pdf') || document.mimeType.includes('image')) && (
                <>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[3rem] text-center">{zoom}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Rotate"
                  >
                    <RotateCw size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download"
                disabled={loading}
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share"
              >
                <Share size={16} />
              </button>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {renderDocumentContent()}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Created: {new Date(document.createdAt).toLocaleDateString()}</span>
                <span>Modified: {new Date(document.updatedAt).toLocaleDateString()}</span>
                <span>Version: {document.version}</span>
              </div>
              <div className="flex items-center space-x-2">
                {document.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email addresses (comma separated)
                </label>
                <textarea
                  value={shareEmails}
                  onChange={(e) => setShareEmails(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user1@example.com, user2@example.com"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={handleShare}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share
              </button>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareEmails('');
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Document</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{document.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}