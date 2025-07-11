import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'admin' | 'team' | 'client';
  department?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface UpdateUserProfile {
  name?: string;
  avatarUrl?: string;
  department?: string;
  phone?: string;
  bio?: string;
}

class UserService {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          role: 'team' as const,
          is_active: true,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        return this.mapToUserProfile(createdProfile);
      }

      return this.mapToUserProfile(data);
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  async updateProfile(updates: UpdateUserProfile): Promise<UserProfile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToUserProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      return data.map(this.mapToUserProfile);
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUser(id: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.mapToUserProfile(data) : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async updateUserRole(userId: string, role: 'admin' | 'team' | 'client'): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          role,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return this.mapToUserProfile(data);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async deactivateUser(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return this.mapToUserProfile(data);
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  async activateUser(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return this.mapToUserProfile(data);
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  async uploadAvatar(file: File): Promise<string> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile with new avatar URL
      await this.updateProfile({ avatarUrl: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,department.ilike.%${query}%`)
        .order('name');

      if (error) throw error;
      return data.map(this.mapToUserProfile);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  private mapToUserProfile(data: any): UserProfile {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatar_url,
      role: data.role,
      department: data.department,
      phone: data.phone,
      bio: data.bio,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastLogin: data.last_login,
      isActive: data.is_active,
    };
  }
}

export const userService = new UserService();