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
  private readonly testUrl = import.meta.env.VITE_N8N_TEST_URL || 'https://mzm987.app.n8n.cloud/webhook-test/proposal-upload';
  private readonly productionUrl = import.meta.env.VITE_N8N_PRODUCTION_URL || 'https://mzm987.app.n8n.cloud/webhook/proposal-upload';
  private readonly isDevelopment = import.meta.env.DEV;

  private get webhookUrl() {
    return this.isDevelopment ? this.testUrl : this.productionUrl;
  }

  async sendWebhook(payload: N8NWebhookPayload): Promise<void> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('N8N webhook sent successfully:', payload.action);
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
          priority: task.priority,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
        },
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
          clientId: proposal.clientId,
          projectId: proposal.projectId,
          status: proposal.status,
        },
      },
    });
  }
}

export const n8nService = new N8NService();