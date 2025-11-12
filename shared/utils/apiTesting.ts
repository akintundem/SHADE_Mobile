import { 
  authService, 
  eventService, 
  assistantService 
} from '../services';
import { 
  RegisterRequest, 
  LoginRequest, 
  CreateEventRequest, 
  ChatRequest,
  EventType,
  EventStatus 
} from '../types';

export class ApiTesting {
  private static baseUrl = 'http://192.168.2.17:8080';
  private static testUser: any = null;
  private static testEvent: any = null;
  private static testResults: any[] = [];

  // Test Authentication APIs
  static async testAuthAPIs() {
    console.log('🧪 Testing Authentication APIs...');
    
    try {
      // Test 1: Health Check
      console.log('1. Testing Health Check...');
      const health = await authService.healthCheck();
      console.log('✅ Health Check:', health);

      // Test 2: User Registration
      console.log('2. Testing User Registration...');
      const registerRequest: RegisterRequest = {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        acceptTerms: true,
        acceptPrivacy: true,
        marketingOptIn: false,
        deviceId: 'test-device-001',
        clientId: 'test-client-001'
      };
      
      const registerResponse = await authService.registerNew(registerRequest);
      console.log('✅ User Registration:', registerResponse);
      this.testUser = registerResponse.user;

      // Test 3: User Login
      console.log('3. Testing User Login...');
      const loginRequest: LoginRequest = {
        email: registerRequest.email,
        password: registerRequest.password,
        rememberMe: false,
        deviceId: 'test-device-002',
        clientId: 'test-client-002'
      };
      
      const loginResponse = await authService.loginNew(loginRequest);
      console.log('✅ User Login:', loginResponse);

      // Test 4: Get Current User
      console.log('4. Testing Get Current User...');
      const currentUser = await authService.getCurrentUser();
      console.log('✅ Current User:', currentUser);

      // Test 5: Validate Token
      console.log('5. Testing Token Validation...');
      const validateRequest = { token: loginResponse.accessToken };
      const validateResponse = await authService.validateToken(validateRequest);
      console.log('✅ Token Validation:', validateResponse);

      // Test 6: Refresh Token
      console.log('6. Testing Token Refresh...');
      const refreshRequest = {
        refreshToken: loginResponse.refreshToken,
        deviceId: 'test-device-003',
        clientId: 'test-client-003'
      };
      const refreshResponse = await authService.refreshToken(refreshRequest);
      console.log('✅ Token Refresh:', refreshResponse);

      console.log('✅ All Authentication APIs passed!');
      return true;
    } catch (error) {
      console.error('❌ Authentication API test failed:', error);
      return false;
    }
  }

  // Test Event Management APIs
  static async testEventAPIs() {
    console.log('🧪 Testing Event Management APIs...');
    
    try {
      // Test 1: Create Event
      console.log('1. Testing Create Event...');
      const createEventRequest: CreateEventRequest = {
        name: 'Test Conference 2026',
        description: 'A comprehensive test conference for API testing',
        eventType: EventType.CONFERENCE,
        eventStatus: EventStatus.PLANNING,
        startDateTime: '2026-06-15T09:00:00',
        endDateTime: '2026-06-15T17:00:00',
        registrationDeadline: '2026-06-10T23:59:59',
        capacity: 200,
        isPublic: true,
        requiresApproval: false,
        qrCodeEnabled: true
      };
      
      const createResponse = await eventService.createEvent(createEventRequest);
      console.log('✅ Create Event:', createResponse);
      this.testEvent = createResponse;

      // Test 2: Get Event by ID
      console.log('2. Testing Get Event by ID...');
      const getEventResponse = await eventService.getEvent(createResponse.id);
      console.log('✅ Get Event:', getEventResponse);

      // Test 3: Update Event
      console.log('3. Testing Update Event...');
      const updateRequest = {
        name: 'Updated Test Conference 2026',
        description: 'Updated description for the test conference',
        eventStatus: EventStatus.PUBLISHED,
        capacity: 250,
        theme: 'Innovation & Technology',
        hashtag: '#TestConf2026',
        objectives: 'Share knowledge and network',
        targetAudience: 'Test participants and developers',
        venueRequirements: 'Large conference hall with AV equipment',
        technicalRequirements: 'High-speed internet, projectors, microphones',
        accessibilityFeatures: 'Wheelchair accessible, sign language interpreter',
        emergencyPlan: 'Emergency exits and first aid stations',
        backupPlan: 'Virtual attendance option',
        postEventTasks: 'Follow-up surveys and thank you emails'
      };
      
      const updateResponse = await eventService.updateEvent(createResponse.id, updateRequest);
      console.log('✅ Update Event:', updateResponse);

      // Test 4: Delete Event
      console.log('4. Testing Delete Event...');
      const deleteResponse = await eventService.deleteEvent(createResponse.id);
      console.log('✅ Delete Event:', deleteResponse);

      console.log('✅ All Event Management APIs passed!');
      return true;
    } catch (error) {
      console.error('❌ Event Management API test failed:', error);
      return false;
    }
  }

  // Test AI Assistant/Chat APIs
  static async testAssistantAPIs() {
    console.log('🧪 Testing AI Assistant/Chat APIs...');
    
    try {
      // Test 1: Chat with Assistant (BFF)
      console.log('1. Testing Chat with Assistant (BFF)...');
      const chatRequest: ChatRequest = {
        message: 'I need help planning a corporate conference for 500 people in New York',
        chatId: 'test-chat-123',
        eventId: this.testEvent?.id,
        context: {
          location: 'New York',
          attendees: 500,
          budget: 50000
        },
        intent: 'event_planning'
      };
      
      const chatResponse = await assistantService.chat(chatRequest);
      console.log('✅ Chat with Assistant:', chatResponse);

      // Test 2: Chat with Shade AI (Direct)
      console.log('2. Testing Chat with Shade AI (Direct)...');
      const shadeChatRequest = {
        message: 'I need help planning my wedding. Can you suggest some venues in Greece?',
        sessionId: 'test-session-123',
        context: {
          location: 'Greece',
          event_type: 'wedding',
          budget: 30000
        },
        intent: 'venue_search',
        collectedData: {
          guest_count: 150,
          preferred_date: '2026-06-15'
        }
      };
      
      const shadeChatResponse = await assistantService.shadeChat(shadeChatRequest);
      console.log('✅ Shade AI Chat:', shadeChatResponse);

      // Test 3: Health Check
      console.log('3. Testing Assistant Health Check...');
      const health = await assistantService.healthCheck();
      console.log('✅ Assistant Health Check:', health);

      console.log('✅ All AI Assistant/Chat APIs passed!');
      return true;
    } catch (error) {
      console.error('❌ AI Assistant/Chat API test failed:', error);
      return false;
    }
  }

  // Run all API tests
  static async runAllTests() {
    console.log('🚀 Starting Comprehensive API Testing...');
    console.log('Base URL:', this.baseUrl);
    console.log('=====================================');

    const results = {
      auth: false,
      events: false,
      assistant: false
    };

    try {
      // Test Authentication APIs
      results.auth = await this.testAuthAPIs();
      console.log('=====================================');

      // Test Event Management APIs
      results.events = await this.testEventAPIs();
      console.log('=====================================');

      // Test AI Assistant/Chat APIs
      results.assistant = await this.testAssistantAPIs();
      console.log('=====================================');

      // Summary
      console.log('📊 Test Results Summary:');
      console.log('Authentication APIs:', results.auth ? '✅ PASSED' : '❌ FAILED');
      console.log('Event Management APIs:', results.events ? '✅ PASSED' : '❌ FAILED');
      console.log('AI Assistant/Chat APIs:', results.assistant ? '✅ PASSED' : '❌ FAILED');
      
      const allPassed = Object.values(results).every(result => result);
      console.log('Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
      
      return results;
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      return results;
    }
  }

  // Test specific endpoint
  static async testEndpoint(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`Testing ${method} ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.testUser?.accessToken && { Authorization: `Bearer ${this.testUser.accessToken}` })
        },
        body: data ? JSON.stringify(data) : undefined
      });
      
      const result = await response.json();
      console.log(`✅ ${method} ${endpoint}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ ${method} ${endpoint} failed:`, error);
      throw error;
    }
  }
}

// Export for easy testing
export const apiTesting = ApiTesting;
