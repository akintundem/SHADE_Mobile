# 🚀 Event Planner - Complete Postman Testing Guide

This comprehensive guide provides step-by-step instructions for testing all Event Planner services through the API Gateway using Postman collections.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Service Collections](#service-collections)
3. [Import Instructions](#import-instructions)
4. [Environment Setup](#environment-setup)
5. [Testing Sequence](#testing-sequence)
6. [Service-Specific Testing](#service-specific-testing)
7. [Troubleshooting](#troubleshooting)
8. [Security Testing](#security-testing)

## 🔧 Prerequisites

Before starting, ensure you have:

- ✅ **Postman** installed ([Download here](https://www.postman.com/downloads/))
- ✅ **API Gateway** running on `http://localhost:8080`
- ✅ **All Services** running on their respective ports
- ✅ **Java 17** and **Maven** installed
- ✅ **Docker** (optional, for containerized services)

## 📁 Service Collections

The following Postman collections are available for testing:

| Service | Collection File | Port | Description |
|---------|----------------|------|-------------|
| **Auth Service** | `Event_Planner_Auth_Service_Testing.postman_collection.json` | 8090 | Authentication, user management, JWT tokens |
| **Event Service** | `Event_Planner_Event_Service_Testing.postman_collection.json` | 8082 | Event management, AI integration |
| **Vendor Service** | `Event_Planner_Vendor_Service_Testing.postman_collection.json` | 8082 | Vendor management, search functionality |
| **Attendee Service** | `Event_Planner_Attendee_Service_Testing.postman_collection.json` | 8083 | Attendee management, registration |
| **Budget Service** | `Event_Planner_Budget_Service_Testing.postman_collection.json` | 8084 | Budget management, expense tracking |
| **Comms Service** | `Event_Planner_Comms_Service_Testing.postman_collection.json` | 8085 | Communications, notifications |
| **Risk Service** | `Event_Planner_Risk_Service_Testing.postman_collection.json` | 8086 | Risk management, assessment |
| **Timeline Service** | `Event_Planner_Timeline_Service_Testing.postman_collection.json` | 8087 | Timeline management, scheduling |
| **Payments Service** | `Event_Planner_Payments_Service_Testing.postman_collection.json` | 8088 | Payment processing, transactions |
| **Weather Service** | `Event_Planner_Weather_Service_Testing.postman_collection.json` | 8089 | Weather data, alerts, forecasting |

## 📥 Import Instructions

### Step 1: Import Collections

1. **Open Postman**
2. **Click "Import"** button (top left)
3. **Select all collection files** from the Event Planner directory
4. **Click "Import"** for each collection

### Step 2: Organize Collections

1. **Create a folder** named "Event Planner Services"
2. **Move all collections** into this folder
3. **Arrange by service name** for easy navigation

## 🌍 Environment Setup

### Step 1: Create Environment

1. **Click the gear icon** (⚙️) in the top right
2. **Click "Add"** to create a new environment
3. **Name it**: `Event Planner Local`

### Step 2: Add Environment Variables

Add the following variables to your environment:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:8080` | API Gateway URL |
| `auth_token` | (will be set automatically) | JWT token from login |
| `token_type` | `Bearer` | Token type for Authorization header |
| `event_id` | (set manually or from Event Service) | Event ID for testing |
| `user_id` | (will be set automatically) | User ID from registration |
| `vendor_id` | (will be set automatically) | Vendor ID from creation |
| `budget_id` | (will be set automatically) | Budget ID from creation |
| `attendee_id` | (will be set automatically) | Attendee ID from creation |
| `risk_id` | (will be set automatically) | Risk ID from creation |
| `message_id` | (will be set automatically) | Message ID from creation |
| `timeline_id` | (will be set automatically) | Timeline ID from creation |
| `payment_id` | (will be set automatically) | Payment ID from creation |
| `weather_alert_id` | (will be set automatically) | Weather alert ID from creation |

## 🔄 Testing Sequence

### Phase 1: System Health Check

1. **Start with Gateway Health Check**
   - Run: `Gateway Health Check` from any collection
   - Expected: `200 OK`

2. **Check Service Health**
   - Run health checks for all services
   - Expected: `200 OK` for running services, `500` for stopped services

### Phase 2: Authentication Setup

1. **Register a Test User**
   - Use: `Auth Service` → `Register User`
   - Expected: `201 Created`

2. **Login and Get Token**
   - Use: `Auth Service` → `Login User`
   - Expected: `200 OK` with JWT token
   - **Token will be automatically stored** in `auth_token` variable

### Phase 3: Service Testing

Test each service in the following order:

1. **Event Service** (Core functionality)
2. **Vendor Service** (External integrations)
3. **Attendee Service** (User management)
4. **Budget Service** (Financial management)
5. **Comms Service** (Communications)
6. **Risk Service** (Risk management)
7. **Timeline Service** (Scheduling)
8. **Payments Service** (Payment processing)
9. **Weather Service** (Weather data)

## 🧪 Service-Specific Testing

### Auth Service Testing

**Purpose**: Authentication and user management

**Key Tests**:
- ✅ User registration
- ✅ User login
- ✅ Token validation
- ✅ Password reset
- ✅ User profile management

**Expected Results**:
- Registration: `201 Created`
- Login: `200 OK` with JWT token
- Protected endpoints: `401 Unauthorized` without token

### Event Service Testing

**Purpose**: Event management and AI integration

**Key Tests**:
- ✅ Create event
- ✅ Get event details
- ✅ Update event
- ✅ Delete event
- ✅ AI event generation
- ✅ AI event optimization

**Expected Results**:
- CRUD operations: `200 OK` or `201 Created`
- AI features: `200 OK` with generated content

### Vendor Service Testing

**Purpose**: Vendor management and search

**Key Tests**:
- ✅ Create vendor
- ✅ Search vendors by category
- ✅ Search vendors by location
- ✅ Search vendors by price range
- ✅ Get vendor ratings

**Expected Results**:
- Vendor creation: `201 Created`
- Search operations: `200 OK` with results

### Attendee Service Testing

**Purpose**: Attendee management and registration

**Key Tests**:
- ✅ Create attendee
- ✅ Register attendee for event
- ✅ Get attendee details
- ✅ Update attendee information
- ✅ Get event attendees

**Expected Results**:
- Attendee creation: `201 Created`
- Registration: `200 OK`
- Event attendees: `200 OK` with attendee list

### Budget Service Testing

**Purpose**: Budget management and expense tracking

**Key Tests**:
- ✅ Create budget
- ✅ Add expense
- ✅ Get budget summary
- ✅ Update budget
- ✅ Get financial reports

**Expected Results**:
- Budget creation: `201 Created`
- Expense tracking: `200 OK`
- Reports: `200 OK` with financial data

### Comms Service Testing

**Purpose**: Communications and notifications

**Key Tests**:
- ✅ Create message
- ✅ Send email notification
- ✅ Send SMS notification
- ✅ Get message status
- ✅ Get communication dashboard

**Expected Results**:
- Message creation: `201 Created`
- Notifications: `200 OK`
- Dashboard: `200 OK` with communication stats

### Risk Service Testing

**Purpose**: Risk management and assessment

**Key Tests**:
- ✅ Create risk
- ✅ Get risk assessment
- ✅ Update risk status
- ✅ Get risk dashboard
- ✅ Get risk trends

**Expected Results**:
- Risk creation: `201 Created`
- Assessment: `200 OK` with risk data
- Dashboard: `200 OK` with risk statistics

### Timeline Service Testing

**Purpose**: Timeline management and scheduling

**Key Tests**:
- ✅ Create timeline
- ✅ Add milestone
- ✅ Update milestone status
- ✅ Get timeline progress
- ✅ Get upcoming milestones

**Expected Results**:
- Timeline creation: `201 Created`
- Milestone management: `200 OK`
- Progress tracking: `200 OK` with progress data

### Payments Service Testing

**Purpose**: Payment processing and transactions

**Key Tests**:
- ✅ Create payment
- ✅ Process payment
- ✅ Get payment status
- ✅ Refund payment
- ✅ Get payment reports

**Expected Results**:
- Payment creation: `201 Created`
- Processing: `200 OK`
- Reports: `200 OK` with transaction data

### Weather Service Testing

**Purpose**: Weather data and alerts

**Key Tests**:
- ✅ Get current weather
- ✅ Get weather forecast
- ✅ Create weather alert
- ✅ Get weather recommendations
- ✅ Get weather impact report

**Expected Results**:
- Weather data: `200 OK` with weather information
- Alerts: `201 Created`
- Reports: `200 OK` with weather analysis

## 🛡️ Security Testing

### X-Internal-Auth Testing

Each collection includes security tests to verify the X-Internal-Auth mechanism:

1. **Direct Service Access (Should Fail)**
   - Expected: `403 Forbidden`
   - Purpose: Verify direct access is blocked

2. **Correct X-Internal-Auth Header**
   - Expected: `200 OK`
   - Purpose: Verify internal communication works

3. **Wrong X-Internal-Auth Header**
   - Expected: `403 Forbidden`
   - Purpose: Verify security mechanism

### JWT Authentication Testing

1. **Protected Endpoints Without Token**
   - Expected: `401 Unauthorized`
   - Purpose: Verify JWT requirement

2. **Protected Endpoints With Invalid Token**
   - Expected: `401 Unauthorized`
   - Purpose: Verify token validation

3. **Protected Endpoints With Valid Token**
   - Expected: `200 OK` or `201 Created`
   - Purpose: Verify successful authentication

## 🔧 Troubleshooting

### Common Issues

#### 1. Service Not Running
**Error**: `Connection refused` or `500 Server Error`
**Solution**: 
- Check if service is running: `curl http://localhost:PORT/actuator/health`
- Start service: `cd services/SERVICE-NAME && mvn spring-boot:run`

#### 2. Authentication Failures
**Error**: `401 Unauthorized`
**Solution**:
- Verify JWT token is set in environment
- Check token expiration
- Re-login to get fresh token

#### 3. X-Internal-Auth Failures
**Error**: `403 Forbidden`
**Solution**:
- Verify gateway is running
- Check X-Internal-Auth header value
- Ensure service has correct secret configuration

#### 4. Missing Environment Variables
**Error**: `{{variable_name}}` not found
**Solution**:
- Check environment is selected
- Verify all required variables are set
- Run tests in correct order to populate variables

### Debug Tips

1. **Check Response Headers**
   - Look for `X-Internal-Auth` header in responses
   - Verify `Authorization` header format

2. **Monitor Gateway Logs**
   - Check gateway logs for routing issues
   - Look for authentication filter logs

3. **Test Individual Endpoints**
   - Use curl to test endpoints directly
   - Verify service-specific functionality

## 📊 Testing Results

### Expected Status Codes

| Operation | Success Code | Failure Code |
|-----------|--------------|--------------|
| Create | `201 Created` | `400 Bad Request` |
| Read | `200 OK` | `404 Not Found` |
| Update | `200 OK` | `400 Bad Request` |
| Delete | `200 OK` | `404 Not Found` |
| Authentication | `200 OK` | `401 Unauthorized` |
| Authorization | `200 OK` | `403 Forbidden` |

### Performance Expectations

- **Response Time**: < 2 seconds for most operations
- **Health Checks**: < 500ms
- **Authentication**: < 1 second
- **Data Retrieval**: < 1 second

## 🎯 Success Criteria

A successful test run should demonstrate:

1. ✅ **All services accessible through Gateway**
2. ✅ **Direct service access blocked (403 Forbidden)**
3. ✅ **JWT authentication working**
4. ✅ **X-Internal-Auth mechanism functioning**
5. ✅ **CRUD operations working for all services**
6. ✅ **Service-specific features functional**
7. ✅ **Error handling working correctly**
8. ✅ **Security mechanisms enforced**

## 📝 Notes

- **Test Data**: Collections use test data that can be modified as needed
- **Environment**: All tests assume local development environment
- **Dependencies**: Some services may depend on others (e.g., Event Service for event IDs)
- **Cleanup**: Consider cleaning up test data after testing
- **Monitoring**: Use Postman Console to monitor request/response details

## 🚀 Next Steps

After successful testing:

1. **Deploy to staging environment**
2. **Update environment variables for staging**
3. **Run integration tests**
4. **Performance testing**
5. **Security penetration testing**
6. **Production deployment**

---

**Happy Testing! 🎉**

For issues or questions, refer to the individual service documentation or check the gateway logs for detailed error information.
