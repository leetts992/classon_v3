const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface APIError {
  detail: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupUserRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface SignupInstructorRequest {
  email: string;
  password: string;
  full_name: string;
  subdomain: string;
  store_name: string;
  bio?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface InstructorResponse {
  id: string;
  email: string;
  full_name: string;
  subdomain: string;
  store_name: string;
  bio?: string;
  profile_image?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;

  // Footer information
  footer_company_name?: string;
  footer_ceo_name?: string;
  footer_privacy_officer?: string;
  footer_business_number?: string;
  footer_sales_number?: string;
  footer_contact?: string;
  footer_business_hours?: string;
  footer_address?: string;
}

export type ProductType = 'ebook' | 'video';

export interface Product {
  id: string;
  instructor_id: string;
  title: string;
  description?: string;
  detailed_description?: string;
  price: number;
  discount_price?: number;
  thumbnail?: string;
  type: ProductType;
  category?: string;
  duration?: number;
  file_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;

  // 상세 페이지 추가 정보
  is_new?: boolean;
  banner_image?: string;
  curriculum?: string;
  schedule_info?: string;
  product_options?: Array<{name: string; price?: number; description?: string}>;
  additional_options?: Array<{name: string; price: number; description?: string}>;

  // 결제 유도 모달 설정
  modal_bg_color?: string;
  modal_bg_opacity?: number;
  modal_text?: string;
  modal_text_color?: string;
  modal_button_text?: string;
  modal_button_color?: string;
  modal_count_days?: number;
  modal_count_hours?: number;
  modal_count_minutes?: number;
  modal_count_seconds?: number;
  modal_end_time?: string;  // ISO datetime string
}

export interface ProductCreateRequest {
  title: string;
  description?: string;
  detailed_description?: string;
  price: number;
  discount_price?: number;
  thumbnail?: string;
  type: ProductType;
  category?: string;
  duration?: number;
  file_url?: string;
  is_published?: boolean;

  // 상세 페이지 추가 정보
  is_new?: boolean;
  banner_image?: string;
  curriculum?: string;
  schedule_info?: string;
  product_options?: Array<{name: string; price?: number; description?: string}>;
  additional_options?: Array<{name: string; price: number; description?: string}>;

  // 결제 유도 모달 설정
  modal_bg_color?: string;
  modal_bg_opacity?: number;
  modal_text?: string;
  modal_text_color?: string;
  modal_button_text?: string;
  modal_button_color?: string;
  modal_count_days?: number;
  modal_count_hours?: number;
  modal_count_minutes?: number;
  modal_count_seconds?: number;
}

export interface ProductUpdateRequest {
  title?: string;
  description?: string;
  detailed_description?: string;
  price?: number;
  discount_price?: number;
  thumbnail?: string;
  type?: ProductType;
  category?: string;
  duration?: number;
  file_url?: string;
  is_published?: boolean;

  // 상세 페이지 추가 정보
  is_new?: boolean;
  banner_image?: string;
  curriculum?: string;
  schedule_info?: string;
  product_options?: Array<{name: string; price?: number; description?: string}>;
  additional_options?: Array<{name: string; price: number; description?: string}>;

  // 결제 유도 모달 설정
  modal_bg_color?: string;
  modal_bg_opacity?: number;
  modal_text?: string;
  modal_text_color?: string;
  modal_button_text?: string;
  modal_button_color?: string;
  modal_count_days?: number;
  modal_count_hours?: number;
  modal_count_minutes?: number;
  modal_count_seconds?: number;
}

// Get auth token from storage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.detail || 'An error occurred');
  }

  return response.json();
}

// Authenticated API request function
async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      throw new Error('Authentication failed. Please login again.');
    }
    const error: APIError = await response.json();
    throw new Error(error.detail || 'An error occurred');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Auth API
export const authAPI = {
  // User signup
  signupUser: (data: SignupUserRequest) =>
    apiRequest<UserResponse>('/auth/signup/user', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Instructor signup
  signupInstructor: (data: SignupInstructorRequest) =>
    apiRequest<InstructorResponse>('/auth/signup/instructor', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // User login
  loginUser: (data: LoginRequest) =>
    apiRequest<TokenResponse>('/auth/login/user', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Instructor login
  loginInstructor: (data: LoginRequest) =>
    apiRequest<TokenResponse>('/auth/login/instructor', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get current instructor profile
  getCurrentInstructor: () =>
    authenticatedRequest<InstructorResponse>('/auth/me/instructor', {
      method: 'GET',
    }),
};

// Instructor update request interface
export interface InstructorUpdateRequest {
  full_name?: string;
  store_name?: string;
  subdomain?: string;
  bio?: string;
  profile_image?: string;
  email?: string;

  // Footer information
  footer_company_name?: string;
  footer_ceo_name?: string;
  footer_privacy_officer?: string;
  footer_business_number?: string;
  footer_sales_number?: string;
  footer_contact?: string;
  footer_business_hours?: string;
  footer_address?: string;

  // Kakao Login Settings
  kakao_client_id?: string;
  kakao_client_secret?: string;
  kakao_redirect_uri?: string;
  kakao_enabled?: boolean;
}

// Instructor API (alias for convenience)
export const instructorAPI = {
  getMe: () => authAPI.getCurrentInstructor(),
  update: (data: InstructorUpdateRequest) =>
    authenticatedRequest<InstructorResponse>('/auth/me/instructor', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Products API
export const productsAPI = {
  // List all products
  list: (params?: { skip?: number; limit?: number }) =>
    authenticatedRequest<Product[]>(
      `/products?skip=${params?.skip || 0}&limit=${params?.limit || 100}`,
      { method: 'GET' }
    ),

  // Get single product
  get: (id: string) =>
    authenticatedRequest<Product>(`/products/${id}`, { method: 'GET' }),

  // Create product
  create: (data: ProductCreateRequest) =>
    authenticatedRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update product
  update: (id: string, data: ProductUpdateRequest) =>
    authenticatedRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete product
  delete: (id: string) =>
    authenticatedRequest<void>(`/products/${id}`, { method: 'DELETE' }),

  // Get stats
  stats: () =>
    authenticatedRequest<{ total_products: number; instructor_id: string }>(
      '/products/stats/summary',
      { method: 'GET' }
    ),
};

// Upload response interface
export interface UploadResponse {
  url: string;
  filename: string;
  content_type: string;
  size: number;
}

// Upload API
export const uploadAPI = {
  // Upload image (thumbnail, profile, etc.)
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        throw new Error('Authentication failed. Please login again.');
      }
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Failed to upload image');
    }

    return response.json();
  },

  // Upload video
  uploadVideo: async (file: File): Promise<UploadResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        throw new Error('Authentication failed. Please login again.');
      }
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Failed to upload video');
    }

    return response.json();
  },

  // Upload document (ebook, PDF, etc.)
  uploadDocument: async (file: File): Promise<UploadResponse> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
        throw new Error('Authentication failed. Please login again.');
      }
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Failed to upload document');
    }

    return response.json();
  },

  // Delete file
  deleteFile: async (fileUrl: string): Promise<void> => {
    await authenticatedRequest<void>(`/upload?file_url=${encodeURIComponent(fileUrl)}`, {
      method: 'DELETE',
    });
  },
};

// Order types
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  instructor_id: string;
  order_number: string;
  status: OrderStatus;
  original_price: number;
  paid_price: number;
  payment_method?: string;
  payment_id?: string;
  paid_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
  refund_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderCreateRequest {
  product_id: string;
  original_price: number;
  paid_price: number;
  payment_method?: string;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  payment_id?: string;
  paid_at?: string;
  refund_reason?: string;
}

export interface OrderStats {
  instructor_id: string;
  total_orders: number;
  total_revenue: number;
  orders_by_status: {
    PENDING: number;
    PAID: number;
    CANCELLED: number;
    REFUNDED: number;
  };
}

// Banner slide interface
export interface BannerSlide {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  link_url?: string;
  order?: number;
}

// Store information interface
export interface StoreInfo {
  store_name: string;
  full_name: string;
  bio?: string;
  profile_image?: string;
  subdomain: string;

  // Footer information
  footer_company_name?: string;
  footer_ceo_name?: string;
  footer_privacy_officer?: string;
  footer_business_number?: string;
  footer_sales_number?: string;
  footer_contact?: string;
  footer_business_hours?: string;
  footer_address?: string;

  // Banner slides
  banner_slides?: BannerSlide[];

  // Kakao Channel Chat
  kakao_channel_id?: string;
}

// Public Store API (no authentication required)
export const publicStoreAPI = {
  // Get store information by subdomain
  getStoreInfo: async (subdomain: string): Promise<StoreInfo> => {
    const response = await fetch(`${API_BASE_URL}/public/store/${subdomain}/info`);

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Failed to fetch store info');
    }

    return response.json();
  },

  // Get published products for a store
  getStoreProducts: async (subdomain: string, params?: { skip?: number; limit?: number }): Promise<Product[]> => {
    const query = `skip=${params?.skip || 0}&limit=${params?.limit || 100}`;
    const response = await fetch(`${API_BASE_URL}/public/store/${subdomain}/products?${query}`);

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Failed to fetch store products');
    }

    return response.json();
  },

  // Get single product by ID
  getProduct: async (subdomain: string, productId: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/public/store/${subdomain}/products/${productId}`);

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Failed to fetch product');
    }

    return response.json();
  },
};

// Orders API
export const ordersAPI = {
  // List all orders (for instructor)
  list: (params?: { skip?: number; limit?: number; status?: OrderStatus }) => {
    let query = `skip=${params?.skip || 0}&limit=${params?.limit || 100}`;
    if (params?.status) {
      query += `&status=${params.status}`;
    }
    return authenticatedRequest<Order[]>(`/orders?${query}`, { method: 'GET' });
  },

  // Get single order
  get: (id: string) =>
    authenticatedRequest<Order>(`/orders/${id}`, { method: 'GET' }),

  // Create order (for user)
  create: (data: OrderCreateRequest) =>
    authenticatedRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update order status (for instructor)
  updateStatus: (id: string, data: OrderUpdateRequest) =>
    authenticatedRequest<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Get order stats (for instructor)
  stats: () =>
    authenticatedRequest<OrderStats>('/orders/stats/summary', { method: 'GET' }),

  // Get user's orders (for user)
  myOrders: (params?: { skip?: number; limit?: number }) =>
    authenticatedRequest<Order[]>(
      `/orders/my?skip=${params?.skip || 0}&limit=${params?.limit || 100}`,
      { method: 'GET' }
    ),
};

// Customer interfaces
export interface Customer {
  id: string;
  instructor_id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_email_verified: boolean;
  notes?: string;
  tags?: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export interface CustomerSignupRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerUpdateRequest {
  full_name?: string;
  phone?: string;
  is_active?: boolean;
  notes?: string;
  tags?: string;
}

// Customer Auth API (for subdomain sites - public endpoints)
export const customerAuthAPI = {
  // Customer signup on subdomain site
  signup: async (subdomain: string, data: CustomerSignupRequest): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/public/store/${subdomain}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    return response.json();
  },

  // Customer login on subdomain site
  login: async (subdomain: string, data: CustomerLoginRequest): Promise<{ access_token: string; token_type: string }> => {
    const response = await fetch(`${API_BASE_URL}/public/store/${subdomain}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  // Get current customer profile
  getMe: async (subdomain: string): Promise<Customer> => {
    return authenticatedRequest<Customer>(`/public/store/${subdomain}/me`, {
      method: 'GET',
    });
  },
};

// Kakao Auth API (for customer Kakao login on subdomain sites)
export const kakaoAuthAPI = {
  // Initiate Kakao login - returns authorization URL
  initiateLogin: async (subdomain: string, redirectUri?: string): Promise<{ authorization_url: string; state: string }> => {
    let url = `${API_BASE_URL}/auth/kakao/login/${subdomain}`;
    if (redirectUri) {
      url += `?redirect_uri=${encodeURIComponent(redirectUri)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Failed to initiate Kakao login');
    }

    return response.json();
  },

  // Handle Kakao callback (called after redirect)
  handleCallback: async (
    code: string,
    state: string,
    subdomain: string,
    redirectUri?: string
  ): Promise<{ access_token: string; token_type: string; customer: Customer }> => {
    let url = `${API_BASE_URL}/auth/kakao/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&subdomain=${encodeURIComponent(subdomain)}`;
    if (redirectUri) {
      url += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.detail || 'Kakao login failed');
    }

    return response.json();
  },
};

// Customer Management API (for instructors)
export const customersAPI = {
  // List all customers for current instructor
  list: (params?: { skip?: number; limit?: number; search?: string; is_active?: boolean }) => {
    let query = `skip=${params?.skip || 0}&limit=${params?.limit || 100}`;
    if (params?.search) {
      query += `&search=${encodeURIComponent(params.search)}`;
    }
    if (params?.is_active !== undefined) {
      query += `&is_active=${params.is_active}`;
    }
    return authenticatedRequest<Customer[]>(`/customers?${query}`, { method: 'GET' });
  },

  // Get single customer
  get: (id: string) =>
    authenticatedRequest<Customer>(`/customers/${id}`, { method: 'GET' }),

  // Update customer
  update: (id: string, data: CustomerUpdateRequest) =>
    authenticatedRequest<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete customer
  delete: (id: string) =>
    authenticatedRequest<void>(`/customers/${id}`, { method: 'DELETE' }),

  // Get customer stats
  stats: () =>
    authenticatedRequest<{ total_customers: number; instructor_id: string }>(
      '/customers/stats/summary',
      { method: 'GET' }
    ),
};

// ========== Ebook Types ==========

export interface EbookChapter {
  id: string;
  product_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  sections?: EbookSection[];
}

export interface EbookSection {
  id: string;
  chapter_id: string;
  title: string;
  content?: any; // Tiptap JSON
  content_html?: string;
  order_index: number;
  reading_time?: number;
  is_published: boolean;
  is_free: boolean;
  created_at: string;
  updated_at?: string;
}

export interface EbookChapterCreate {
  product_id: string;
  title: string;
  description?: string;
  order_index?: number;
  is_published?: boolean;
}

export interface EbookChapterUpdate {
  title?: string;
  description?: string;
  order_index?: number;
  is_published?: boolean;
}

export interface EbookSectionCreate {
  chapter_id: string;
  title: string;
  content?: any;
  content_html?: string;
  order_index?: number;
  reading_time?: number;
  is_published?: boolean;
  is_free?: boolean;
}

export interface EbookSectionUpdate {
  title?: string;
  content?: any;
  content_html?: string;
  order_index?: number;
  reading_time?: number;
  is_published?: boolean;
  is_free?: boolean;
}

export interface EbookStructure {
  product_id: string;
  product_title: string;
  chapters: EbookChapter[];
}

export interface UserEbookProgress {
  id: string;
  customer_id: string;
  section_id: string;
  is_completed: boolean;
  reading_progress: number;
  last_read_at: string;
  created_at: string;
  updated_at?: string;
}

export interface UserEbookBookmark {
  id: string;
  customer_id: string;
  section_id: string;
  note?: string;
  position?: number;
  created_at: string;
  updated_at?: string;
}

// ========== Ebook API ==========

// Instructor APIs
export const ebookInstructorAPI = {
  // Create chapter
  createChapter: (data: EbookChapterCreate) =>
    authenticatedRequest<EbookChapter>('/ebook/instructor/chapters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get product chapters
  getProductChapters: (productId: string) =>
    authenticatedRequest<EbookChapter[]>(`/ebook/instructor/products/${productId}/chapters`, {
      method: 'GET',
    }),

  // Update chapter
  updateChapter: (chapterId: string, data: EbookChapterUpdate) =>
    authenticatedRequest<EbookChapter>(`/ebook/instructor/chapters/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete chapter
  deleteChapter: (chapterId: string) =>
    authenticatedRequest<void>(`/ebook/instructor/chapters/${chapterId}`, {
      method: 'DELETE',
    }),

  // Create section
  createSection: (data: EbookSectionCreate) =>
    authenticatedRequest<EbookSection>('/ebook/instructor/sections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update section
  updateSection: (sectionId: string, data: EbookSectionUpdate) =>
    authenticatedRequest<EbookSection>(`/ebook/instructor/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete section
  deleteSection: (sectionId: string) =>
    authenticatedRequest<void>(`/ebook/instructor/sections/${sectionId}`, {
      method: 'DELETE',
    }),
};

// Customer APIs
export const ebookCustomerAPI = {
  // Get ebook structure (with purchase verification)
  getEbookStructure: (productId: string) =>
    authenticatedRequest<EbookStructure>(`/ebook/customer/products/${productId}/structure`, {
      method: 'GET',
    }),

  // Get section content
  getSectionContent: (sectionId: string) =>
    authenticatedRequest<EbookSection>(`/ebook/customer/sections/${sectionId}`, {
      method: 'GET',
    }),

  // Update progress
  updateProgress: (sectionId: string, data: { is_completed: boolean; reading_progress: number }) =>
    authenticatedRequest<UserEbookProgress>('/ebook/customer/progress', {
      method: 'POST',
      body: JSON.stringify({ section_id: sectionId, ...data }),
    }),

  // Get product progress
  getProductProgress: (productId: string) =>
    authenticatedRequest<UserEbookProgress[]>(`/ebook/customer/products/${productId}/progress`, {
      method: 'GET',
    }),

  // Create bookmark
  createBookmark: (sectionId: string, data: { note?: string; position?: number }) =>
    authenticatedRequest<UserEbookBookmark>('/ebook/customer/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ section_id: sectionId, ...data }),
    }),

  // Get product bookmarks
  getProductBookmarks: (productId: string) =>
    authenticatedRequest<UserEbookBookmark[]>(`/ebook/customer/products/${productId}/bookmarks`, {
      method: 'GET',
    }),

  // Delete bookmark
  deleteBookmark: (bookmarkId: string) =>
    authenticatedRequest<void>(`/ebook/customer/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    }),
};
