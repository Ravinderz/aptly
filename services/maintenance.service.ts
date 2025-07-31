import { APIService } from './api.service';

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category:
    | 'plumbing'
    | 'electrical'
    | 'hvac'
    | 'elevator'
    | 'cleaning'
    | 'security'
    | 'common_area'
    | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status:
    | 'submitted'
    | 'acknowledged'
    | 'assigned'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
  location: string;
  flatNumber?: string;
  requestedBy: {
    id: string;
    name: string;
    flatNumber: string;
    phone: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    role: string;
    phone: string;
  };
  images?: string[];
  attachments?: string[];
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: Date;
  completedDate?: Date;
  rating?: number; // 1-5 stars
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
  isEmergency: boolean;
  workOrderNumber?: string;
}

export interface MaintenanceStaff {
  id: string;
  name: string;
  role: 'supervisor' | 'technician' | 'cleaner' | 'security' | 'gardener';
  specialization: string[];
  phone: string;
  email: string;
  isAvailable: boolean;
  currentWorkload: number; // number of active requests
  rating: number;
  totalRequestsCompleted: number;
  joinedDate: Date;
  emergencyContact: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  services: string[];
  rating: number;
  phone: string;
  email: string;
  address: string;
  isPreferred: boolean;
  priceRange: 'budget' | 'mid' | 'premium';
  availabilityHours: string;
  responseTime: string; // e.g., "2-4 hours"
  certifications: string[];
  insurance: {
    hasInsurance: boolean;
    provider?: string;
    validUntil?: Date;
  };
}

export interface MaintenanceAnalytics {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  avgResolutionTime: number; // in hours
  categoryBreakdown: { category: string; count: number; avgTime: number }[];
  monthlyTrend: { month: string; requests: number; costs: number }[];
  topIssues: { issue: string; count: number }[];
  staffPerformance: {
    staffId: string;
    name: string;
    completedTasks: number;
    avgRating: number;
  }[];
  costAnalysis: {
    totalCost: number;
    avgCostPerRequest: number;
    budgetUtilization: number;
  };
}

export interface ScheduledMaintenance {
  id: string;
  title: string;
  description: string;
  type: 'preventive' | 'routine' | 'inspection';
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDue: Date;
  lastCompleted?: Date;
  assignedTo: string;
  location: string;
  estimatedDuration: number; // in hours
  cost: number;
  isActive: boolean;
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  notes?: string;
  imageRequired: boolean;
  image?: string;
}

// Mock data
const MOCK_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'req1',
    title: 'Lift Not Working - Floor 5',
    description:
      'The lift is stuck on the 5th floor and not responding to calls. This is an emergency as elderly residents cannot use stairs.',
    category: 'elevator',
    priority: 'urgent',
    status: 'in_progress',
    location: 'Lift-1, Near A Wing',
    requestedBy: {
      id: 'user1',
      name: 'Ravinder Singh',
      flatNumber: 'A-201',
      phone: '+91-9876543210',
    },
    assignedTo: {
      id: 'staff1',
      name: 'Kumar Technician',
      role: 'Elevator Specialist',
      phone: '+91-9876543220',
    },
    estimatedCost: 5000,
    scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isEmergency: true,
    workOrderNumber: 'WO-2024-001',
  },
  {
    id: 'req2',
    title: 'Water Leakage in Basement',
    description:
      'Water leakage observed in the basement parking area. Might be from the overhead tank or pipeline.',
    category: 'plumbing',
    priority: 'high',
    status: 'acknowledged',
    location: 'Basement - B2 Parking',
    requestedBy: {
      id: 'user3',
      name: 'Amit Kumar',
      flatNumber: 'C-102',
      phone: '+91-9876543212',
    },
    images: ['basement-leak-1.jpg', 'basement-leak-2.jpg'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    isEmergency: false,
    workOrderNumber: 'WO-2024-002',
  },
  {
    id: 'req3',
    title: 'Garden Maintenance Required',
    description:
      'The society garden needs trimming and watering system check. Some plants are dying due to clogged sprinklers.',
    category: 'common_area',
    priority: 'medium',
    status: 'completed',
    location: 'Society Garden',
    requestedBy: {
      id: 'user4',
      name: 'Neha Gupta',
      flatNumber: 'A-401',
      phone: '+91-9876543213',
    },
    assignedTo: {
      id: 'staff2',
      name: 'Raj Gardener',
      role: 'Garden Specialist',
      phone: '+91-9876543221',
    },
    actualCost: 2500,
    completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    rating: 4,
    feedback: 'Good work, garden looks much better now. Quick response time.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isEmergency: false,
    workOrderNumber: 'WO-2024-003',
  },
];

const MOCK_STAFF: MaintenanceStaff[] = [
  {
    id: 'staff1',
    name: 'Kumar Technician',
    role: 'technician',
    specialization: ['Elevator', 'HVAC', 'Electrical'],
    phone: '+91-9876543220',
    email: 'kumar.tech@society.com',
    isAvailable: false, // Currently working on lift
    currentWorkload: 2,
    rating: 4.5,
    totalRequestsCompleted: 156,
    joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    emergencyContact: true,
  },
  {
    id: 'staff2',
    name: 'Raj Gardener',
    role: 'gardener',
    specialization: ['Landscaping', 'Plant Care', 'Irrigation'],
    phone: '+91-9876543221',
    email: 'raj.garden@society.com',
    isAvailable: true,
    currentWorkload: 0,
    rating: 4.8,
    totalRequestsCompleted: 89,
    joinedDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    emergencyContact: false,
  },
  {
    id: 'staff3',
    name: 'Priya Supervisor',
    role: 'supervisor',
    specialization: ['Management', 'Quality Control', 'Vendor Coordination'],
    phone: '+91-9876543222',
    email: 'priya.supervisor@society.com',
    isAvailable: true,
    currentWorkload: 1,
    rating: 4.7,
    totalRequestsCompleted: 234,
    joinedDate: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000),
    emergencyContact: true,
  },
];

const MOCK_VENDORS: Vendor[] = [
  {
    id: 'vendor1',
    name: 'QuickFix Plumbing Services',
    category: 'Plumbing',
    services: [
      'Pipe Repair',
      'Leak Detection',
      'Water Tank Cleaning',
      'Bathroom Renovation',
    ],
    rating: 4.3,
    phone: '+91-9876543230',
    email: 'contact@quickfixplumbing.com',
    address: '123, Service Street, Bangalore',
    isPreferred: true,
    priceRange: 'mid',
    availabilityHours: '24/7',
    responseTime: '2-4 hours',
    certifications: ['Licensed Plumber', 'Safety Certified'],
    insurance: {
      hasInsurance: true,
      provider: 'ABC Insurance',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  },
  {
    id: 'vendor2',
    name: 'Elite Elevator Solutions',
    category: 'Elevator',
    services: [
      'Elevator Repair',
      'AMC Services',
      'Emergency Response',
      'Modernization',
    ],
    rating: 4.8,
    phone: '+91-9876543231',
    email: 'service@eliteelevator.com',
    address: '456, Tech Park, Bangalore',
    isPreferred: true,
    priceRange: 'premium',
    availabilityHours: '24/7',
    responseTime: '1-2 hours',
    certifications: ['Certified Elevator Technician', 'ISO 9001'],
    insurance: {
      hasInsurance: true,
      provider: 'XYZ Insurance',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MaintenanceService {
  private static instance: MaintenanceService;
  private apiService: APIService;

  private constructor() {
    this.apiService = APIService.getInstance();
  }

  static getInstance(): MaintenanceService {
    if (!MaintenanceService.instance) {
      MaintenanceService.instance = new MaintenanceService();
    }
    return MaintenanceService.instance;
  }

  // Get maintenance requests
  async getMaintenanceRequests(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<MaintenanceRequest[]> {
    await delay(500);

    try {
      let requests = [...MOCK_REQUESTS];

      if (filters?.status) {
        requests = requests.filter((req) => req.status === filters.status);
      }

      if (filters?.category) {
        requests = requests.filter((req) => req.category === filters.category);
      }

      if (filters?.priority) {
        requests = requests.filter((req) => req.priority === filters.priority);
      }

      if (filters?.userId) {
        requests = requests.filter(
          (req) => req.requestedBy.id === filters.userId,
        );
      }

      // Sort by priority and creation date
      requests.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      // Apply pagination
      if (filters?.offset !== undefined) {
        requests = requests.slice(filters.offset);
      }

      if (filters?.limit !== undefined) {
        requests = requests.slice(0, filters.limit);
      }

      return requests;
    } catch (error) {
      throw new Error('Failed to fetch maintenance requests');
    }
  }

  // Get single maintenance request
  async getMaintenanceRequest(
    requestId: string,
  ): Promise<MaintenanceRequest | null> {
    await delay(300);

    try {
      return MOCK_REQUESTS.find((req) => req.id === requestId) || null;
    } catch (error) {
      throw new Error('Failed to fetch maintenance request');
    }
  }

  // Create maintenance request
  async createMaintenanceRequest(
    requestData: Omit<
      MaintenanceRequest,
      'id' | 'createdAt' | 'updatedAt' | 'workOrderNumber'
    >,
  ): Promise<MaintenanceRequest> {
    await delay(800);

    try {
      const newRequest: MaintenanceRequest = {
        ...requestData,
        id: `req_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        workOrderNumber: `WO-2024-${String(MOCK_REQUESTS.length + 1).padStart(3, '0')}`,
      };

      MOCK_REQUESTS.unshift(newRequest);

      // Auto-assign based on category and staff availability
      if (requestData.isEmergency || requestData.priority === 'urgent') {
        const availableStaff = MOCK_STAFF.find(
          (staff) =>
            staff.emergencyContact &&
            staff.specialization.some((spec) =>
              spec.toLowerCase().includes(requestData.category.toLowerCase()),
            ),
        );

        if (availableStaff) {
          newRequest.assignedTo = {
            id: availableStaff.id,
            name: availableStaff.name,
            role: availableStaff.role,
            phone: availableStaff.phone,
          };
          newRequest.status = 'assigned';
          availableStaff.currentWorkload++;
        }
      }

      return newRequest;
    } catch (error) {
      throw new Error('Failed to create maintenance request');
    }
  }

  // Update maintenance request status
  async updateRequestStatus(
    requestId: string,
    status: MaintenanceRequest['status'],
    notes?: string,
  ): Promise<MaintenanceRequest> {
    await delay(400);

    try {
      const request = MOCK_REQUESTS.find((req) => req.id === requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }

      request.status = status;
      request.updatedAt = new Date();

      if (status === 'completed' && !request.completedDate) {
        request.completedDate = new Date();

        // Free up staff workload
        if (request.assignedTo) {
          const staff = MOCK_STAFF.find((s) => s.id === request.assignedTo!.id);
          if (staff) {
            staff.currentWorkload = Math.max(0, staff.currentWorkload - 1);
            staff.totalRequestsCompleted++;
          }
        }
      }

      return request;
    } catch (error) {
      throw new Error('Failed to update request status');
    }
  }

  // Rate and provide feedback
  async rateRequest(
    requestId: string,
    rating: number,
    feedback?: string,
  ): Promise<boolean> {
    await delay(300);

    try {
      const request = MOCK_REQUESTS.find((req) => req.id === requestId);
      if (!request) {
        throw new Error('Maintenance request not found');
      }

      if (request.status !== 'completed') {
        throw new Error('Can only rate completed requests');
      }

      request.rating = rating;
      request.feedback = feedback;
      request.updatedAt = new Date();

      // Update staff rating
      if (request.assignedTo) {
        const staff = MOCK_STAFF.find((s) => s.id === request.assignedTo!.id);
        if (staff) {
          // Simple rating calculation (in production, use proper weighted average)
          staff.rating =
            (staff.rating * (staff.totalRequestsCompleted - 1) + rating) /
            staff.totalRequestsCompleted;
        }
      }

      return true;
    } catch (error) {
      throw new Error('Failed to rate request');
    }
  }

  // Get maintenance staff
  async getMaintenanceStaff(available?: boolean): Promise<MaintenanceStaff[]> {
    await delay(300);

    try {
      let staff = [...MOCK_STAFF];

      if (available !== undefined) {
        staff = staff.filter((s) => s.isAvailable === available);
      }

      return staff.sort((a, b) => b.rating - a.rating);
    } catch (error) {
      throw new Error('Failed to fetch maintenance staff');
    }
  }

  // Get vendors
  async getVendors(category?: string, preferred?: boolean): Promise<Vendor[]> {
    await delay(400);

    try {
      let vendors = [...MOCK_VENDORS];

      if (category) {
        vendors = vendors.filter(
          (vendor) =>
            vendor.category.toLowerCase() === category.toLowerCase() ||
            vendor.services.some((service) =>
              service.toLowerCase().includes(category.toLowerCase()),
            ),
        );
      }

      if (preferred !== undefined) {
        vendors = vendors.filter((vendor) => vendor.isPreferred === preferred);
      }

      return vendors.sort((a, b) => b.rating - a.rating);
    } catch (error) {
      throw new Error('Failed to fetch vendors');
    }
  }

  // Get maintenance analytics
  async getMaintenanceAnalytics(
    period: 'month' | 'quarter' | 'year' = 'month',
  ): Promise<MaintenanceAnalytics> {
    await delay(600);

    try {
      const requests = MOCK_REQUESTS;
      const completed = requests.filter((req) => req.status === 'completed');
      const pending = requests.filter((req) =>
        ['submitted', 'acknowledged', 'assigned', 'in_progress'].includes(
          req.status,
        ),
      );

      // Calculate average resolution time
      const completedWithTime = completed.filter(
        (req) => req.completedDate && req.createdAt,
      );
      const avgResolutionTime =
        completedWithTime.length > 0
          ? completedWithTime.reduce((sum, req) => {
              const timeDiff =
                req.completedDate!.getTime() - req.createdAt.getTime();
              return sum + timeDiff / (1000 * 60 * 60); // Convert to hours
            }, 0) / completedWithTime.length
          : 0;

      // Category breakdown
      const categoryMap = new Map<
        string,
        { count: number; totalTime: number; timeCount: number }
      >();
      requests.forEach((req) => {
        const existing = categoryMap.get(req.category) || {
          count: 0,
          totalTime: 0,
          timeCount: 0,
        };
        existing.count++;

        if (req.completedDate && req.createdAt) {
          const timeDiff =
            req.completedDate.getTime() - req.createdAt.getTime();
          existing.totalTime += timeDiff / (1000 * 60 * 60);
          existing.timeCount++;
        }

        categoryMap.set(req.category, existing);
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          count: data.count,
          avgTime: data.timeCount > 0 ? data.totalTime / data.timeCount : 0,
        }),
      );

      // Mock data for other analytics
      const monthlyTrend = [
        { month: 'Jan', requests: 25, costs: 45000 },
        { month: 'Feb', requests: 18, costs: 32000 },
        { month: 'Mar', requests: 22, costs: 38000 },
        { month: 'Apr', requests: requests.length, costs: 55000 },
      ];

      const topIssues = [
        { issue: 'Elevator Malfunction', count: 8 },
        { issue: 'Water Leakage', count: 6 },
        { issue: 'Electrical Issues', count: 5 },
        { issue: 'HVAC Problems', count: 4 },
      ];

      const staffPerformance = MOCK_STAFF.map((staff) => ({
        staffId: staff.id,
        name: staff.name,
        completedTasks: staff.totalRequestsCompleted,
        avgRating: staff.rating,
      }));

      const totalCost = completed.reduce(
        (sum, req) => sum + (req.actualCost || 0),
        0,
      );

      return {
        totalRequests: requests.length,
        completedRequests: completed.length,
        pendingRequests: pending.length,
        avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
        categoryBreakdown,
        monthlyTrend,
        topIssues,
        staffPerformance,
        costAnalysis: {
          totalCost,
          avgCostPerRequest:
            completed.length > 0 ? totalCost / completed.length : 0,
          budgetUtilization: 75, // Mock percentage
        },
      };
    } catch (error) {
      throw new Error('Failed to fetch maintenance analytics');
    }
  }

  // Get scheduled maintenance
  async getScheduledMaintenance(
    upcoming: boolean = true,
  ): Promise<ScheduledMaintenance[]> {
    await delay(400);

    try {
      // Mock scheduled maintenance data
      const scheduled: ScheduledMaintenance[] = [
        {
          id: 'sched1',
          title: 'Monthly Elevator Inspection',
          description:
            'Routine safety inspection and maintenance of all elevators',
          type: 'preventive',
          frequency: 'monthly',
          nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          lastCompleted: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), // 23 days ago
          assignedTo: 'staff1',
          location: 'All Elevator Shafts',
          estimatedDuration: 4,
          cost: 8000,
          isActive: true,
          checklist: [
            {
              id: 'check1',
              description: 'Check brake system',
              isCompleted: false,
              imageRequired: true,
            },
            {
              id: 'check2',
              description: 'Inspect cables and pulleys',
              isCompleted: false,
              imageRequired: true,
            },
            {
              id: 'check3',
              description: 'Test emergency systems',
              isCompleted: false,
              imageRequired: false,
            },
            {
              id: 'check4',
              description: 'Clean and lubricate moving parts',
              isCompleted: false,
              imageRequired: false,
            },
          ],
        },
        {
          id: 'sched2',
          title: 'Water Tank Cleaning',
          description:
            'Quarterly cleaning and disinfection of overhead water tanks',
          type: 'routine',
          frequency: 'quarterly',
          nextDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          assignedTo: 'staff3',
          location: 'Rooftop Water Tanks',
          estimatedDuration: 6,
          cost: 12000,
          isActive: true,
          checklist: [
            {
              id: 'check5',
              description: 'Drain water tank completely',
              isCompleted: false,
              imageRequired: true,
            },
            {
              id: 'check6',
              description: 'Scrub tank walls and bottom',
              isCompleted: false,
              imageRequired: true,
            },
            {
              id: 'check7',
              description: 'Apply disinfectant solution',
              isCompleted: false,
              imageRequired: false,
            },
            {
              id: 'check8',
              description: 'Test water quality',
              isCompleted: false,
              imageRequired: true,
            },
          ],
        },
      ];

      if (upcoming) {
        return scheduled.filter(
          (item) => item.nextDue > new Date() && item.isActive,
        );
      }

      return scheduled.filter((item) => item.isActive);
    } catch (error) {
      throw new Error('Failed to fetch scheduled maintenance');
    }
  }

  // Emergency contact
  async getEmergencyContacts(): Promise<
    { name: string; role: string; phone: string; available: boolean }[]
  > {
    await delay(200);

    try {
      return MOCK_STAFF.filter((staff) => staff.emergencyContact).map(
        (staff) => ({
          name: staff.name,
          role: staff.role,
          phone: staff.phone,
          available: staff.isAvailable,
        }),
      );
    } catch (error) {
      throw new Error('Failed to fetch emergency contacts');
    }
  }
}

export default MaintenanceService.getInstance();
