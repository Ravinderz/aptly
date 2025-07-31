import { APIService } from './api.service';

export interface Bill {
  id: string;
  billNumber: string;
  billType:
    | 'electricity'
    | 'gas'
    | 'broadband'
    | 'mobile'
    | 'dishtv'
    | 'water'
    | 'maintenance';
  consumerNumber: string;
  billerName: string;
  billerCode: string;
  amount: number;
  dueDate: Date;
  issueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  userId: string;
  category: string;
  paymentHistory: PaymentRecord[];
  autopayEnabled: boolean;
  nextBillDate?: Date;
}

export interface PaymentRecord {
  id: string;
  billId: string;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  paymentDate: Date;
  fee: number;
  gatewayResponse?: any;
}

export interface BillPaymentRequest {
  billId: string;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  autopay?: boolean;
}

export interface RechargeRequest {
  type: 'mobile' | 'electricity' | 'gas' | 'broadband' | 'dishtv';
  number: string;
  amount: number;
  operator?: string;
  circle?: string;
  plan?: string;
}

export interface BillerInfo {
  id: string;
  name: string;
  code: string;
  type: string;
  category: string;
  logo: string;
  isActive: boolean;
  supportedRegions: string[];
  minAmount: number;
  maxAmount: number;
}

export interface GSTCalculation {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  gstRate: number;
  breakdown: {
    cgst: number;
    sgst: number;
    igst: number;
  };
}

// Mock data
const MOCK_BILLS: Bill[] = [
  {
    id: 'bill1',
    billNumber: 'ELEC123456789',
    billType: 'electricity',
    consumerNumber: '1234567890',
    billerName: 'BESCOM',
    billerCode: 'BESCOM01',
    amount: 2450.5,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    issueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    status: 'pending',
    userId: 'user1',
    category: 'Utilities',
    paymentHistory: [],
    autopayEnabled: false,
  },
  {
    id: 'bill2',
    billNumber: 'GAS987654321',
    billType: 'gas',
    consumerNumber: '9876543210',
    billerName: 'Indane Gas',
    billerCode: 'INDANE01',
    amount: 1200.0,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    status: 'pending',
    userId: 'user1',
    category: 'Utilities',
    paymentHistory: [],
    autopayEnabled: true,
    nextBillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

const MOCK_BILLERS: BillerInfo[] = [
  {
    id: 'bescom',
    name: 'BESCOM',
    code: 'BESCOM01',
    type: 'electricity',
    category: 'Utilities',
    logo: 'https://example.com/bescom-logo.png',
    isActive: true,
    supportedRegions: ['Karnataka'],
    minAmount: 100,
    maxAmount: 50000,
  },
  {
    id: 'indane',
    name: 'Indane Gas',
    code: 'INDANE01',
    type: 'gas',
    category: 'Utilities',
    logo: 'https://example.com/indane-logo.png',
    isActive: true,
    supportedRegions: ['All India'],
    minAmount: 500,
    maxAmount: 5000,
  },
  {
    id: 'airtel',
    name: 'Airtel',
    code: 'AIRTEL01',
    type: 'mobile',
    category: 'Telecom',
    logo: 'https://example.com/airtel-logo.png',
    isActive: true,
    supportedRegions: ['All India'],
    minAmount: 10,
    maxAmount: 10000,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class BillingService {
  private static instance: BillingService;
  private apiService: APIService;

  private constructor() {
    this.apiService = APIService.getInstance();
  }

  static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  // Get user bills
  async getBills(filters?: {
    status?: string;
    type?: string;
    dateRange?: { from: Date; to: Date };
  }): Promise<Bill[]> {
    await delay(500);

    try {
      // In production, this would make an API call
      // const response = await this.apiService.getBills(filters);
      // return response;

      // Mock implementation
      let bills = [...MOCK_BILLS];

      if (filters?.status) {
        bills = bills.filter((bill) => bill.status === filters.status);
      }

      if (filters?.type) {
        bills = bills.filter((bill) => bill.billType === filters.type);
      }

      if (filters?.dateRange) {
        bills = bills.filter(
          (bill) =>
            bill.issueDate >= filters.dateRange!.from &&
            bill.issueDate <= filters.dateRange!.to,
        );
      }

      return bills.sort(
        (a, b) => b.issueDate.getTime() - a.issueDate.getTime(),
      );
    } catch (error) {
      throw new Error('Failed to fetch bills');
    }
  }

  // Get single bill
  async getBill(billId: string): Promise<Bill | null> {
    await delay(300);

    try {
      // In production: const response = await this.apiService.getBill(billId);
      return MOCK_BILLS.find((bill) => bill.id === billId) || null;
    } catch (error) {
      throw new Error('Failed to fetch bill details');
    }
  }

  // Pay bill
  async payBill(request: BillPaymentRequest): Promise<PaymentRecord> {
    await delay(2000); // Simulate payment processing time

    try {
      // In production, this would integrate with payment gateway
      const paymentRecord: PaymentRecord = {
        id: `payment_${Date.now()}`,
        billId: request.billId,
        amount: request.amount,
        paymentMethod: request.paymentMethod,
        transactionId: `TXN${Date.now()}`,
        status: 'success',
        paymentDate: new Date(),
        fee: request.amount * 0.02, // 2% fee
        gatewayResponse: {
          gateway: 'razorpay',
          gatewayTransactionId: `rzp_${Date.now()}`,
        },
      };

      // Update bill status
      const bill = MOCK_BILLS.find((b) => b.id === request.billId);
      if (bill) {
        bill.status = 'paid';
        bill.paymentHistory.push(paymentRecord);

        if (request.autopay) {
          bill.autopayEnabled = true;
        }
      }

      return paymentRecord;
    } catch (error) {
      throw new Error('Payment failed. Please try again.');
    }
  }

  // Mobile/DTH recharge
  async recharge(request: RechargeRequest): Promise<PaymentRecord> {
    await delay(1500);

    try {
      // Mock recharge transaction
      const paymentRecord: PaymentRecord = {
        id: `recharge_${Date.now()}`,
        billId: '', // Recharges don't have bill IDs
        amount: request.amount,
        paymentMethod: 'upi', // Default for recharges
        transactionId: `RCH${Date.now()}`,
        status: 'success',
        paymentDate: new Date(),
        fee: 0, // Usually no fee for recharges
        gatewayResponse: {
          operator: request.operator,
          number: request.number,
          plan: request.plan,
        },
      };

      return paymentRecord;
    } catch (error) {
      throw new Error('Recharge failed. Please try again.');
    }
  }

  // Get available billers
  async getBillers(type?: string): Promise<BillerInfo[]> {
    await delay(300);

    try {
      let billers = [...MOCK_BILLERS];

      if (type) {
        billers = billers.filter((biller) => biller.type === type);
      }

      return billers.filter((biller) => biller.isActive);
    } catch (error) {
      throw new Error('Failed to fetch billers');
    }
  }

  // Calculate GST
  async calculateGST(
    amount: number,
    gstRate: number = 18,
  ): Promise<GSTCalculation> {
    await delay(100);

    const gstAmount = (amount * gstRate) / 100;
    const totalAmount = amount + gstAmount;

    return {
      baseAmount: amount,
      gstAmount: gstAmount,
      totalAmount: totalAmount,
      gstRate: gstRate,
      breakdown: {
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        igst: 0, // For interstate transactions
      },
    };
  }

  // Get payment history
  async getPaymentHistory(
    userId: string,
    limit: number = 50,
  ): Promise<PaymentRecord[]> {
    await delay(400);

    try {
      // In production: const response = await this.apiService.getPaymentHistory(userId, limit);

      // Mock implementation - get all payments for user's bills
      const userBills = MOCK_BILLS.filter((bill) => bill.userId === userId);
      const allPayments: PaymentRecord[] = [];

      userBills.forEach((bill) => {
        allPayments.push(...bill.paymentHistory);
      });

      return allPayments
        .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
        .slice(0, limit);
    } catch (error) {
      throw new Error('Failed to fetch payment history');
    }
  }

  // Setup autopay
  async setupAutopay(billId: string, enabled: boolean): Promise<boolean> {
    await delay(500);

    try {
      const bill = MOCK_BILLS.find((b) => b.id === billId);
      if (bill) {
        bill.autopayEnabled = enabled;
        return true;
      }
      return false;
    } catch (error) {
      throw new Error('Failed to setup autopay');
    }
  }

  // Get billing analytics
  async getBillingAnalytics(
    userId: string,
    period: 'month' | 'quarter' | 'year' = 'month',
  ): Promise<{
    totalSpent: number;
    billCount: number;
    categoryBreakdown: { category: string; amount: number; count: number }[];
    monthlyTrend: { month: string; amount: number }[];
  }> {
    await delay(600);

    try {
      const userBills = MOCK_BILLS.filter((bill) => bill.userId === userId);
      const totalSpent = userBills.reduce((sum, bill) => sum + bill.amount, 0);

      // Category breakdown
      const categoryMap = new Map<string, { amount: number; count: number }>();
      userBills.forEach((bill) => {
        const existing = categoryMap.get(bill.category) || {
          amount: 0,
          count: 0,
        };
        categoryMap.set(bill.category, {
          amount: existing.amount + bill.amount,
          count: existing.count + 1,
        });
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          ...data,
        }),
      );

      // Mock monthly trend
      const monthlyTrend = [
        { month: 'Jan', amount: 3200 },
        { month: 'Feb', amount: 2890 },
        { month: 'Mar', amount: 3650 },
        { month: 'Apr', amount: totalSpent },
      ];

      return {
        totalSpent,
        billCount: userBills.length,
        categoryBreakdown,
        monthlyTrend,
      };
    } catch (error) {
      throw new Error('Failed to fetch billing analytics');
    }
  }

  // Validate bill details
  async validateBillDetails(
    billerCode: string,
    consumerNumber: string,
  ): Promise<{
    isValid: boolean;
    billAmount?: number;
    dueDate?: Date;
    consumerName?: string;
    error?: string;
  }> {
    await delay(800);

    try {
      // Mock validation
      if (consumerNumber.length < 8) {
        return {
          isValid: false,
          error: 'Invalid consumer number',
        };
      }

      return {
        isValid: true,
        billAmount: 2450.5,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        consumerName: 'John Doe',
      };
    } catch (error) {
      throw new Error('Failed to validate bill details');
    }
  }
}

export default BillingService.getInstance();
