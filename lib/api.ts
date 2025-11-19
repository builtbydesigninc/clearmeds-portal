/**
 * API Client for WordPress REST API
 * Handles all API calls to the ClearMeds WordPress plugin
 */

const API_BASE = process.env.NEXT_PUBLIC_WP_API_URL || 'https://yoursite.com/wp-json/clearmeds/v1';

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  // Cache for current user data
  private userCache: {
    data: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      displayName: string;
      role: 'affiliate' | 'admin' | 'super_admin';
      affiliate_id: string | null;
    } | null;
    timestamp: number;
  } = { data: null, timestamp: 0 };
  
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('clearmeds_token');
  }

  private setToken(token: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (token) {
      localStorage.setItem('clearmeds_token', token);
    } else {
      localStorage.removeItem('clearmeds_token');
    }
    // Clear user cache when token changes
    this.clearUserCache();
  }

  private clearUserCache(): void {
    this.userCache = { data: null, timestamp: 0 };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add JWT token to Authorization header if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token and user cache
        this.clearUserCache();
        this.setToken(null);
        // Redirect to login only if not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        throw new APIError(401, 'Authentication required');
      } else if (response.status === 403) {
        throw new APIError(403, 'You do not have permission to access this resource');
      }
      
      const errorText = await response.text();
      throw new APIError(response.status, errorText);
    }

    return response.json();
  }

  logout(): void {
    this.clearUserCache();
    this.setToken(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request<{ user_id: number; email: string; token: string; role: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    // Store JWT token
    if (response.token) {
      this.setToken(response.token);
      // Clear user cache on login to force fresh fetch
      this.clearUserCache();
    }
    
    return response;
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    taxIdType?: string;
    taxId?: string;
    paymentDetails?: string;
    paymentMethod?: any;
    password: string;
    referrerId?: string;
  }) {
    const response = await this.request<{ user_id: number; affiliate_id: string; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    // Don't store token or auto-login - user needs admin approval first
    // Token is returned but not stored, user will need to login after approval
    
    return response;
  }

  async getCurrentUser() {
    const now = Date.now();
    const token = this.getToken();
    
    // If no token, clear cache and let the request fail (will throw 401)
    if (!token) {
      this.clearUserCache();
    }
    
    // Check if we have valid cached data
    if (
      this.userCache.data &&
      token &&
      (now - this.userCache.timestamp) < this.CACHE_TTL
    ) {
      return this.userCache.data;
    }
    
    // Fetch fresh user data
    try {
      const userData = await this.request<{
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      displayName: string;
      role: 'affiliate' | 'admin' | 'super_admin';
      affiliate_id: string | null;
    }>('/auth/user');
      
      // Cache the user data
      this.userCache = {
        data: userData,
        timestamp: now
      };
      
      return userData;
    } catch (error) {
      // If request fails, clear cache
      this.clearUserCache();
      throw error;
    }
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
  }

  async resetPassword(key: string, login: string, password: string) {
    return this.request<{ success: boolean; message: string }>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ key, login, password }),
      }
    );
  }

  // Dashboard methods
  async getDashboard() {
    return this.request<{
      profile: {
        name: string;
        email: string;
        company: string;
        avatar: string;
        affiliateId: string;
      };
      referralLink: {
        link: string;
        commissionRate: string;
      };
      stats: {
        totalOrders: number;
        totalSales: number;
        commissionsEarned: number;
        clinicsOnboarded: number;
        changes: {
          orders: string;
          sales: string;
          commissions: string;
          clinics: string;
        };
      };
      rank: {
        currentRank: number;
        currentAmount: number;
        nextRankAmount: number;
        percentage: number;
        nextRank: string;
      };
      leaderboard: {
        top10: Array<{
          rank: number;
          name: string;
          email: string;
          sales: string;
        }>;
        userRank: number;
      };
      recentTransactions: Array<{
        date: string;
        customer: string;
        orderNumber: string;
        amount: string;
        commission: string;
        status: string;
      }>;
    }>('/dashboard');
  }

  // User profile methods
  async getProfile() {
    return this.request<{
      name: string;
      email: string;
      company: string;
      avatar: string;
      affiliateId: string;
      phone: string;
      bio: string;
    }>('/users/profile');
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    bio?: string;
  }) {
    return this.request<{ success: boolean }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getReferralLink() {
    return this.request<{ link: string; commissionRate: string }>(
      '/users/referral-link'
    );
  }

  async getPaymentDetails() {
    return this.request<{
      bankName?: string;
      accountNumber?: string;
      routingNumber?: string;
      accountHolder?: string;
    }>('/users/payment-details');
  }

  async updatePaymentDetails(data: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    accountHolder?: string;
  }) {
    return this.request<{ success: boolean }>('/users/payment-details', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTaxInfo() {
    return this.request<{
      taxId: string;
      taxIdType: string;
      businessName: string;
      taxAddress: string;
    }>('/users/tax-info');
  }

  async updateTaxInfo(data: {
    taxId?: string;
    taxIdType?: string;
    businessName?: string;
    taxAddress?: string;
  }) {
    return this.request<{ success: boolean }>('/users/tax-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return this.request<{ success: boolean }>('/users/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Network methods
  async getNetworkFull() {
    return this.request<{
      stats: {
        totalAffiliates: number;
        directReferrals: number;
        indirectReferrals: number;
        networkSales: number;
        changes?: {
          totalAffiliates: string;
          directReferrals: string;
          indirectReferrals: string;
          networkSales: string;
        };
      };
      networkTree: {
        id: string;
        name: string;
        initials: string;
        earnings: number;
        referrals: number;
        level: number;
        children: Array<any>;
      };
      directReferrals: Array<{
        id: string;
        name: string;
        email: string;
        join_date: string;
        joinDate?: string;
        referrals: number;
        sales: number;
        commission: number;
        status: string;
      }>;
      breakdown: {
        level2: {
          commissionRate: number;
          totalSales: number;
          earned: number;
        };
        level3: {
          commissionRate: number;
          totalSales: number;
          earned: number;
        };
        extended: {
          commissionRate: number;
          totalSales: number;
          earned: number;
        };
      };
    }>('/referrals/network-full');
  }

  async getDirectReferrals(params?: { search?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);

    return this.request<Array<{
      id: number;
      ID?: number;
      name: string;
      email: string;
      affiliate_id: string;
      join_date: string;
      joinDate?: string;
      referrals: number;
      sales: number | null;
      commission: number | null;
      status: string;
      initials?: string;
    }>>(`/referrals/direct?${query.toString()}`);
  }

  async getReferralNetwork() {
    return this.request<{
      id: string;
      name: string;
      initials: string;
      earnings: number;
      referrals: number;
      level: number;
      children: Array<any>;
    }>('/referrals/network');
  }

  async getCommissionBreakdown() {
    return this.request<{
      level2: {
        commissionRate: number;
        totalSales: number;
        earned: number;
      };
      level3: {
        commissionRate: number;
        totalSales: number;
        earned: number;
      };
      extended: {
        commissionRate: number;
        totalSales: number;
        earned: number;
      };
    }>('/referrals/breakdown');
  }

  async getReferralStats() {
    return this.request<{
      totalAffiliates: number;
      directReferrals: number;
      indirectReferrals: number;
      networkSales: number;
      changes?: {
        totalAffiliates: string;
        directReferrals: string;
        indirectReferrals: string;
        networkSales: string;
      };
    }>('/referrals/stats');
  }

  // Transactions methods
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    return this.request<{
      stats: {
        totalTransactions: number;
        totalAmount: number;
        totalCommission: number;
      };
      transactions: Array<{
        date: string;
        customer: string;
        orderNumber: string;
        amount: number;
        commission: number;
        status: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/transactions?${query.toString()}`);
  }

  // Commissions methods
  async getPendingCommissions(params?: {
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return this.request<{
      commissions: Array<{
        id: number;
        user_id: number;
        order_id: string;
        order_amount: number;
        commission_rate: number;
        commission_amount: number;
        level: number;
        status: string;
        created_at: string;
        is_own: boolean;
        source: 'own_order' | 'network';
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
      };
    }>(`/commissions/pending?${query.toString()}`);
  }

  // Payments methods
  async getPayments() {
    return this.request<{
      stats: {
        totalPaid: number;
        pending: number;
        nextPayout: number;
        payoutDate: string;
      };
      methods: Array<{
        id: number;
        type: string;
        last4: string;
        logo: string;
      }>;
      history: Array<{
        date: string;
        reference: string;
        method: string;
        amount: number;
        status: string;
      }>;
    }>('/payments');
  }

  async getPaymentMethods() {
    return this.request<Array<{
      id: number;
      type: string;
      last4: string;
      logo: string;
    }>>('/payments/methods');
  }

  async addPaymentMethod(data: {
    type: string;
    last4: string;
    details: any;
  }) {
    return this.request<{ success: boolean }>('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(id: number, data: {
    type?: string;
    last4?: string;
    details?: any;
  }) {
    return this.request<{ success: boolean }>(`/payments/methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentMethod(id: number) {
    return this.request<{ success: boolean }>(`/payments/methods/${id}`, {
      method: 'DELETE',
    });
  }

  async setPrimaryPaymentMethod(id: number) {
    return this.request<{ success: boolean }>(`/payments/methods/${id}/set-primary`, {
      method: 'POST',
    });
  }

  // Leaderboard methods
  async getLeaderboard(period: 'all-time' | 'this-month' | 'last-month' = 'all-time') {
    return this.request<{
      userRank: {
        currentRank: number;
        currentAmount: number;
        nextRankAmount: number;
        percentage: number;
        nextRank: string;
      };
      tiers: Array<{
        name: string;
        range: string;
        commission: string;
        color: string;
      }>;
      leaderboard: Array<{
        rank: number;
        name: string;
        email: string;
        level: string;
        badge: string | null;
        sales: number;
      }>;
    }>(`/leaderboard?period=${period}`);
  }

  async getLeaderboardWidget() {
    return this.request<{
      top10: Array<{
        rank: number;
        name: string;
        email: string;
        sales: string;
      }>;
      userRank: number;
    }>('/leaderboard/widget');
  }

  // Guides methods
  async getGuides() {
    return this.request<{
      checklist: Array<{
        id: number;
        text: string;
        completed: boolean;
      }>;
      tutorials: Array<{
        id: number;
        title: string;
        description: string;
        category: string;
      }>;
      faqs: Array<{
        id: number;
        question: string;
        answer: string;
      }>;
    }>('/guides');
  }

  async updateChecklistItem(itemKey: string, completed: boolean) {
    return this.request<{ success: boolean }>(
      `/guides/checklist/${itemKey}`,
      {
        method: 'PUT',
        body: JSON.stringify({ completed }),
      }
    );
  }

  // Marketing methods
  async getMarketingLinks() {
    return this.request<{ defaultLink: string }>('/marketing/links');
  }

  async generateMarketingLink(data: {
    productId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }) {
    return this.request<{ link: string }>('/marketing/generate-link', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMarketingStats() {
    return this.request<{
      totalClicks: number;
      conversionRate: number;
    }>('/marketing/stats');
  }

  async getMarketingMedia() {
    return this.request<Array<{
      id: number;
      title: string;
      category: string;
      type: string;
    }>>('/marketing/media');
  }

  async getMarketingResources() {
    return this.request<Array<{
      category: string;
      items: Array<{
        id: number;
        title: string;
        description: string;
      }>;
    }>>('/marketing/resources');
  }

  async getMarketingIntegrations() {
    return this.request<Array<{
      id: string;
      name: string;
      enabled: boolean;
    }>>('/marketing/integrations');
  }

  async updateMarketingIntegration(id: string, enabled: boolean) {
    return this.request<{ success: boolean }>('/marketing/integrations', {
      method: 'PUT',
      body: JSON.stringify({ id, enabled }),
    });
  }

  // Settings methods
  async getNotificationSettings() {
    return this.request<{
      emailNotifications: boolean;
      referralAlerts: boolean;
      paymentNotifications: boolean;
      marketingUpdates: boolean;
      monthlyReports: boolean;
    }>('/settings/notifications');
  }

  async updateNotificationSettings(data: {
    emailNotifications?: boolean;
    referralAlerts?: boolean;
    paymentNotifications?: boolean;
    marketingUpdates?: boolean;
    monthlyReports?: boolean;
  }) {
    return this.request<{ success: boolean }>('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getIntegrationSettings() {
    return this.request<Array<{
      name: string;
      connected: boolean;
    }>>('/settings/integrations');
  }

  async updateIntegrationSettings(data: Array<{
    name: string;
    connected: boolean;
  }>) {
    return this.request<{ success: boolean }>('/settings/integrations', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin methods
  async getAdminDashboard() {
    return this.request<{
      stats: {
        totalAffiliates: number;
        totalSales: number;
        totalCommissions: number;
        totalPayouts: number;
        activeReferrals: number;
        pendingCommissions: number;
      };
      pendingCommissions: Array<any>;
      processingPayouts: Array<any>;
    }>('/admin/dashboard');
  }

  async getAdminConfig() {
    return this.request<{
      commissionRates: {
        level1: number;
        level2: number;
        level3: number;
      };
      payoutSettings: {
        frequency: string;
        minimumThreshold: number;
        dayOfWeek?: string;
      };
    }>('/admin/config');
  }

  async updateAdminConfig(data: {
    commissionRates?: {
      level1: number;
      level2: number;
      level3: number;
    };
    payoutSettings?: {
      frequency: string;
      minimumThreshold: number;
      dayOfWeek?: string;
    };
  }) {
    return this.request<{ success: boolean }>('/admin/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search || '');
    if (params?.status) query.append('status', params.status);

    return this.request<Array<{
      ID: number;
      display_name: string;
      user_email: string;
      affiliate_id: string;
      affiliate_status: string;
    }>>(`/admin/users?${query.toString()}`);
  }

  async getAdminUserById(userId: number) {
    return this.request<{
      ID: number;
      user_email: string;
      display_name: string;
      user_registered: string;
      first_name: string;
      last_name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zip_code: string;
      company: string;
      bio: string;
      affiliate_id: string | null;
      affiliate_status: string;
      referrer: {
        user_id: number;
        name: string;
        email: string;
      } | null;
      created_at: string | null;
      updated_at: string | null;
      payment_details: string | null;
      tax_id_type: string | null;
      tax_id: string | null;
      total_commissions: number;
      total_orders: number;
      referral_count: number;
    }>(`/admin/users/${userId}`);
  }

  async approveUser(userId: number) {
    return this.request<{ success: boolean; message: string }>(`/admin/users/${userId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectUser(userId: number, reason?: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/users/${userId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminCommissions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return this.request<Array<any>>(`/admin/commissions?${query.toString()}`);
  }

  async getAdminPendingCommissions(params?: {
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return this.request<{
      commissions: Array<{
        id: number;
        user_id: number;
        user_name: string;
        user_email: string;
        order_id: string;
        order_amount: number;
        commission_rate: number;
        commission_amount: number;
        level: number;
        status: string;
        created_at: string;
        updated_at: string | null;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
      };
    }>(`/admin/commissions/pending?${query.toString()}`);
  }

  async approveCommission(id: number) {
    return this.request<{ success: boolean }>(`/admin/commissions/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectCommission(id: number, reason?: string) {
    return this.request<{ success: boolean }>(`/admin/commissions/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminPayouts() {
    return this.request<Array<any>>('/admin/payouts');
  }

  async processPayouts() {
    return this.request<{ success: boolean }>('/admin/payouts/process', {
      method: 'POST',
    });
  }

  async getDebugStatus() {
    return this.request<{ debug_enabled: boolean; timestamp: string }>('/debug/status');
  }
}

// Export singleton instance
export const api = new APIClient();

