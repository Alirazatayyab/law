import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { n8nService } from './n8nService';

export interface DocumentUpload {
  file: File;
  folderId?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  type: string;
  status: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  tags: string[];
  folderId?: string;
  priority: string;
  dueDate?: string;
  version: number;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

class DocumentService {
  async uploadDocument(uploadData: DocumentUpload): Promise<DocumentMetadata> {
    try {
      const { file, folderId, tags = [], priority = 'medium', dueDate } = uploadData;
      const fileId = uuidv4();
      const fileName = `${fileId}-${file.name}`;
      
      // For demo purposes, create a mock file URL
      const mockFileUrl = `https://example.com/documents/${fileName}`;

      // Auto-generate tags based on file content
      const autoTags = await this.generateAutoTags(file);
      const allTags = [...new Set([...tags, ...autoTags])];

      // Create mock document metadata
      const documentData = {
        id: fileId,
        name: file.name,
        type: this.getDocumentType(file.type),
        status: 'draft',
        file_url: mockFileUrl,
        file_size: file.size,
        mime_type: file.type,
        tags: allTags,
        folder_id: folderId,
        priority,
        due_date: dueDate?.toISOString(),
        version: 1,
        created_by: 'current-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const document = this.mapToDocumentMetadata(documentData);

      // Send N8N webhook for document upload
      const mockUser = {
        id: 'current-user-id',
        name: 'Current User',
        email: 'user@example.com',
        role: 'team'
      };

      await n8nService.documentUploaded(mockUser, document);
      
      // Special handling for proposals
      if (file.name.toLowerCase().includes('proposal') || allTags.includes('proposal')) {
        await n8nService.proposalUploaded(mockUser, document);
      }

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async getDocuments(folderId?: string): Promise<DocumentMetadata[]> {
    try {
      // Mock documents for demo
      const mockDocuments = [
        {
          id: '1',
          name: 'Service Agreement - TechCorp.pdf',
          type: 'pdf',
          status: 'review',
          file_url: 'https://example.com/documents/service-agreement.pdf',
          file_size: 245000,
          mime_type: 'application/pdf',
          tags: ['service', 'tech', 'annual'],
          folder_id: folderId,
          priority: 'high',
          due_date: new Date('2024-02-01').toISOString(),
          version: 1,
          created_by: 'user-1',
          assigned_to: null,
          created_at: new Date('2024-01-15').toISOString(),
          updated_at: new Date('2024-01-20').toISOString(),
        },
        {
          id: '2',
          name: 'NDA Template v2.1.docx',
          type: 'document',
          status: 'signed',
          file_url: 'https://example.com/documents/nda-template.docx',
          file_size: 89000,
          mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          tags: ['nda', 'template', 'standard'],
          folder_id: folderId,
          priority: 'medium',
          due_date: null,
          version: 2,
          created_by: 'user-2',
          assigned_to: null,
          created_at: new Date('2024-01-10').toISOString(),
          updated_at: new Date('2024-01-18').toISOString(),
        }
      ];

      return mockDocuments.map(this.mapToDocumentMetadata);
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getDocument(id: string): Promise<DocumentMetadata | null> {
    try {
      const documents = await this.getDocuments();
      const document = documents.find(d => d.id === id);
      
      if (document) {
        // Send N8N webhook for document view
        const mockUser = {
          id: 'current-user-id',
          name: 'Current User',
          email: 'user@example.com',
          role: 'team'
        };
        await n8nService.documentViewed(mockUser, document);
      }
      
      return document || null;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  async downloadDocument(id: string): Promise<Blob> {
    try {
      const document = await this.getDocument(id);
      if (!document) throw new Error('Document not found');

      // Send N8N webhook for document download
      const mockUser = {
        id: 'current-user-id',
        name: 'Current User',
        email: 'user@example.com',
        role: 'team'
      };
      await n8nService.documentDownloaded(mockUser, document);

      // For demo purposes, create a mock blob
      const mockContent = `Mock content for ${document.name}`;
      return new Blob([mockContent], { type: document.mimeType });
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const document = await this.getDocument(id);
      if (!document) throw new Error('Document not found');

      // Send N8N webhook for document deletion
      const mockUser = {
        id: 'current-user-id',
        name: 'Current User',
        email: 'user@example.com',
        role: 'team'
      };
      await n8nService.documentDeleted(mockUser, document);

      console.log(`Document ${id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async updateDocument(id: string, updates: Partial<DocumentMetadata>): Promise<DocumentMetadata> {
    try {
      const currentDoc = await this.getDocument(id);
      if (!currentDoc) throw new Error('Document not found');
      
      const oldStatus = currentDoc.status;
      const updatedDocument = { ...currentDoc, ...updates, updatedAt: new Date().toISOString() };

      // Send N8N webhook for status change
      if (oldStatus && updates.status && oldStatus !== updates.status) {
        const mockUser = {
          id: 'current-user-id',
          name: 'Current User',
          email: 'user@example.com',
          role: 'team'
        };
        await n8nService.documentStatusChanged(mockUser, updatedDocument, oldStatus, updates.status);
      }

      // Send N8N webhook for document edit
      if (Object.keys(updates).length > 0) {
        const mockUser = {
          id: 'current-user-id',
          name: 'Current User',
          email: 'user@example.com',
          role: 'team'
        };
        await n8nService.documentEdited(mockUser, updatedDocument, updates);
      }

      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async shareDocument(id: string, userEmails: string[]): Promise<void> {
    try {
      const document = await this.getDocument(id);
      if (!document) throw new Error('Document not found');

      // Send N8N webhook for document sharing
      const mockUser = {
        id: 'current-user-id',
        name: 'Current User',
        email: 'user@example.com',
        role: 'team'
      };
      await n8nService.documentShared(mockUser, document, userEmails);

      console.log(`Document ${id} shared with:`, userEmails);
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }

  async searchDocuments(query: string): Promise<DocumentMetadata[]> {
    try {
      const allDocuments = await this.getDocuments();
      return allDocuments.filter(doc =>
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  private async generateAutoTags(file: File): Promise<string[]> {
    const tags: string[] = [];
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // File type tags
    if (fileType.includes('pdf')) tags.push('pdf');
    if (fileType.includes('word')) tags.push('word', 'document');
    if (fileType.includes('excel')) tags.push('excel', 'spreadsheet');
    if (fileType.includes('image')) tags.push('image');

    // Content-based tags
    if (fileName.includes('contract')) tags.push('contract', 'legal');
    if (fileName.includes('nda')) tags.push('nda', 'confidential');
    if (fileName.includes('agreement')) tags.push('agreement', 'legal');
    if (fileName.includes('invoice')) tags.push('invoice', 'financial');
    if (fileName.includes('template')) tags.push('template');
    if (fileName.includes('draft')) tags.push('draft');
    if (fileName.includes('final')) tags.push('final');
    if (fileName.includes('signed')) tags.push('signed');
    if (fileName.includes('proposal')) tags.push('proposal', 'business');

    // Date-based tags
    const currentYear = new Date().getFullYear();
    if (fileName.includes(currentYear.toString())) tags.push(currentYear.toString());

    return tags;
  }

  private getDocumentType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) return 'document';
    if (mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('text')) return 'text';
    return 'other';
  }

  private mapToDocumentMetadata(data: any): DocumentMetadata {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      status: data.status,
      fileUrl: data.file_url,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      tags: data.tags || [],
      folderId: data.folder_id,
      priority: data.priority,
      dueDate: data.due_date,
      version: data.version,
      createdBy: data.created_by,
      assignedTo: data.assigned_to,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const documentService = new DocumentService();