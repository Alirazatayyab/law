interface N8NWebhookPayload {
  action: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  data: any;
}

class N8NService {
  private readonly testUrl = import.meta.env.VITE_N8N_TEST_URL || 'https://mzm836987q3287.app.n8n.cloud/webhook-test/proposal-upload';
  private readonly productionUrl = import.meta.env.VITE_N8N_PRODUCTION_URL || 'https://mzm836987q3287.app.n8n.cloud/webhook/proposal-upload';
  private readonly isDevelopment = import.meta.env.DEV;

  private get webhookUrl() {
    return this.isDevelopment ? this.testUrl : this.productionUrl;
  }

  async sendWebhook(payload: N8NWebhookPayload): Promise<void> {
    try {
      console.log('Sending N8N webhook:', payload.action, 'to', this.webhookUrl);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Pocketlaw-Dashboard/1.0.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.text();
      console.log('N8N webhook sent successfully:', payload.action, responseData);
    } catch (error) {
      console.error('Error sending N8N webhook:', error);
      // Don't throw error to prevent breaking the main flow
    }
  }

  // Document Events
  async documentUploaded(user: any, document: any): Promise<void> {
    await this.sendWebhook({
      action: 'document_uploaded',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        document: {
          id: document.id,
          name: document.name,
          type: document.type,
          size: document.fileSize,
          folderId: document.folderId,
          tags: document.tags,
          url: document.fileUrl,
          status: document.status,
          priority: document.priority,
        },
      },
    });
  }

  async documentViewed(user: any, document: any): Promise<void> {
    await this.sendWebhook({
      action: 'document_viewed',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        document: {
          id: document.id,
          name: document.name,
          type: document.type,
        },
      },
    });
  }

  async documentDownloaded(user: any, document: any): Promise<void> {
    await this.sendWebhook({
      action: 'document_downloaded',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        document: {
          id: document.id,
          name: document.name,
          type: document.type,
          size: document.fileSize,
        },
      },
    });
  }

  async documentDeleted(user: any, document: any): Promise<void> {
    await this.sendWebhook({
      action: 'document_deleted',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        document: {
          id: document.id,
          name: document.name,
          type: document.type,
        },
      },
    });
  }

  async documentStatusChanged(user: any, document: any, oldStatus: string, newStatus: string): Promise<void> {
    await this.sendWebhook({
      action: 'document_status_changed',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        document: {
          id: document.id,
          name: document.name,
          oldStatus,
          newStatus,
        },
      },
    });
  }

  async documentShared(user: any, document: any, sharedWith: string[]): Promise<void> {
    await this.sendWebhook({
      action: 'document_shared',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        document: {
          id: document.id,
          name: document.name,
        },
        sharedWith,
      },
    });
  }

  async documentEdited(user: any, document: any, changes: any): Promise<void> {
    await this.sendWebhook({
      action: 'document_edited',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        document: {
          id: document.id,
          name: document.name,
          type: document.type,
        },
        changes,
      },
    });
  }

  // Task Events
  async taskCreated(user: any, task: any): Promise<void> {
    await this.sendWebhook({
      action: 'task_created',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          status: task.status,
        },
      },
    });
  }

  async taskUpdated(user: any, task: any, changes: any): Promise<void> {
    await this.sendWebhook({
      action: 'task_updated',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        task: {
          id: task.id,
          title: task.title,
          status: task.status,
        },
        changes,
      },
    });
  }

  async taskCompleted(user: any, task: any): Promise<void> {
    await this.sendWebhook({
      action: 'task_completed',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        task: {
          id: task.id,
          title: task.title,
          completedAt: new Date().toISOString(),
          actualHours: task.actualHours,
        },
      },
    });
  }

  async taskDeleted(user: any, task: any): Promise<void> {
    await this.sendWebhook({
      action: 'task_deleted',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        task: {
          id: task.id,
          title: task.title,
        },
      },
    });
  }

  // User Events
  async userInvited(inviter: any, invitedEmail: string, role: string): Promise<void> {
    await this.sendWebhook({
      action: 'user_invited',
      timestamp: new Date().toISOString(),
      user: {
        id: inviter.id,
        name: inviter.name,
        email: inviter.email,
        role: inviter.role,
      },
      data: {
        invitedEmail,
        role,
      },
    });
  }

  async userRoleChanged(admin: any, targetUser: any, oldRole: string, newRole: string): Promise<void> {
    await this.sendWebhook({
      action: 'user_role_changed',
      timestamp: new Date().toISOString(),
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      data: {
        targetUser: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
        },
        oldRole,
        newRole,
      },
    });
  }

  async userProfileUpdated(user: any, changes: any): Promise<void> {
    await this.sendWebhook({
      action: 'user_profile_updated',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        changes,
      },
    });
  }

  // Template Events
  async templateCreated(user: any, template: any): Promise<void> {
    await this.sendWebhook({
      action: 'template_created',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        template: {
          id: template.id,
          name: template.name,
          category: template.category,
          isPublic: template.isPublic,
          variables: template.variables?.length || 0,
        },
      },
    });
  }

  async templateUsed(user: any, template: any): Promise<void> {
    await this.sendWebhook({
      action: 'template_used',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        template: {
          id: template.id,
          name: template.name,
          usageCount: template.usageCount,
        },
      },
    });
  }

  async templateDeleted(user: any, template: any): Promise<void> {
    await this.sendWebhook({
      action: 'template_deleted',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        template: {
          id: template.id,
          name: template.name,
          category: template.category,
        },
      },
    });
  }

  // Folder Events
  async folderCreated(user: any, folder: any): Promise<void> {
    await this.sendWebhook({
      action: 'folder_created',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        folder: {
          id: folder.id,
          name: folder.name,
          parentId: folder.parentId,
        },
      },
    });
  }

  async folderDeleted(user: any, folder: any): Promise<void> {
    await this.sendWebhook({
      action: 'folder_deleted',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        folder: {
          id: folder.id,
          name: folder.name,
        },
      },
    });
  }

  // Proposal Events (Custom for your workflow)
  async proposalUploaded(user: any, proposal: any): Promise<void> {
    await this.sendWebhook({
      action: 'proposal_uploaded',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        proposal: {
          id: proposal.id,
          name: proposal.name,
          type: proposal.type,
          size: proposal.fileSize,
          url: proposal.fileUrl,
          status: proposal.status,
          tags: proposal.tags,
          priority: proposal.priority,
        },
      },
    });
  }

  // System Events
  async systemLogin(user: any): Promise<void> {
    await this.sendWebhook({
      action: 'user_login',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        loginTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    });
  }

  async systemLogout(user: any): Promise<void> {
    await this.sendWebhook({
      action: 'user_logout',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      data: {
        logoutTime: new Date().toISOString(),
      },
    });
  }
}

export const n8nService = new N8NService();