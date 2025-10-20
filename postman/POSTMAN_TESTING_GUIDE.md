# 🚀 Event Planner Auth Service - Postman Testing Guide

This guide will walk you through importing and using the Postman collection to test the Event Planner Auth Service through the API Gateway.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ **Postman** installed ([Download here](https://www.postman.com/downloads/))
- ✅ **API Gateway** running on `http://localhost:8080`
- ✅ **Auth Service** running on `http://localhost:8090`
- ✅ **Java 17** and **Maven** installed

## 🚀 Quick Start

### Step 1: Import the Collection

1. **Open Postman**
2. **Click "Import"** button (top left)
3. **Select the file**: `Event_Planner_Auth_Service_Testing.postman_collection.json`
4. **Click "Import"**

### Step 2: Set Up Environment (Optional but Recommended)

1. **Click the gear icon** (⚙️) in the top right
2. **Click "Add"** to create a new environment
3. **Name it**: `Event Planner Local`
4. **Add these variables**:
   ```
   base_url: http://localhost:8080
   auth_token: (leave empty - will be set automatically)
   refresh_token: (leave empty - will be set automatically)
   token_type: Bearer
   user_id: (leave empty - will be set automatically)
   user_email: (leave empty - will be set automatically)
   ```
5. **Click "Save"**
6. **Select the environment** from the dropdown in the top right

### Step 3: Start Testing

Follow this **exact sequence** for best results:

## 🧪 Testing Sequence

### 1. 🔍 Health & Status Checks
- **Gateway Health Check** - Verify Gateway is running
- **Auth Service Health Check (via Gateway)** - Verify Auth Service is accessible
- **Direct Auth Service Access (Should Fail)** - Verify security is working

### 2. 👤 User Registration & Authentication
- **Register New User** - Create a test account
- **Login User** - Get JWT tokens
- **Validate Token** - Verify token is valid
- **Refresh Token** - Test token refresh

### 3. 🔐 Protected Endpoints Testing
- **Get User Profile (Authenticated)** - Test with valid token
- **Get User Profile (No Token - Should Fail)** - Test without token
- **Get User Profile (Invalid Token - Should Fail)** - Test with invalid token

### 4. 📚 Swagger UI & API Documentation
- **Auth Service Swagger UI** - Access interactive docs
- **Auth Service OpenAPI Docs** - Get API specification
- **Direct Swagger UI Access (Should Fail)** - Verify security

### 5. 🛡️ Security Testing
- **Test X-Internal-Auth Header** - Test internal security
- **Test Wrong X-Internal-Auth Header** - Test security failure
- **Test SQL Injection Protection** - Test input validation

### 6. 🧪 Error Handling & Edge Cases
- **Login with Invalid Credentials** - Test authentication failure
- **Register with Existing Username** - Test conflict handling
- **Invalid JSON Request** - Test malformed requests

## 🎯 Expected Results

### ✅ Successful Tests (200/201 Status)
- Gateway Health Check
- Auth Service Health Check (via Gateway)
- User Registration
- User Login
- Token Validation
- Token Refresh
- Get User Profile (with valid token)
- Auth Service Swagger UI
- Auth Service OpenAPI Docs
- Test X-Internal-Auth Header

### ❌ Expected Failures (403/401 Status)
- Direct Auth Service Access (403 - X-Internal-Auth missing)
- Get User Profile (No Token) (401 - Unauthorized)
- Get User Profile (Invalid Token) (401 - Unauthorized)
- Direct Swagger UI Access (403 - X-Internal-Auth missing)
- Test Wrong X-Internal-Auth Header (403 - Invalid secret)
- Login with Invalid Credentials (401 - Invalid credentials)
- Register with Existing Username (409/400 - Conflict/Bad Request)
- Invalid JSON Request (400 - Bad Request)

## 🔧 Troubleshooting

### Common Issues

#### 1. **Connection Refused Errors**
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```
**Solution**: Start the API Gateway
```bash
cd gateway
mvn spring-boot:run
```

#### 2. **Auth Service Not Running**
```
Error: connect ECONNREFUSED 127.0.0.1:8090
```
**Solution**: Start the Auth Service
```bash
cd services/auth-service
mvn spring-boot:run
```

#### 3. **403 Forbidden on Direct Access**
This is **EXPECTED** and shows security is working! The X-Internal-Auth filter is blocking direct access.

#### 4. **User Already Exists Error**
Change the username in the registration request:
```json
{
    "username": "testuser2",  // Change this
    "email": "test2@example.com",  // Change this too
    "password": "TestPass123@",
    "firstName": "Test",
    "lastName": "User"
}
```

#### 5. **Token Not Set Error**
Make sure you run the **Login User** request first to get the JWT token.

## 📊 Understanding the Security Model

### X-Internal-Auth Mechanism
- **Purpose**: Prevents direct access to microservices
- **How it works**: Services check for `X-Internal-Auth` header with correct secret
- **Secret**: `dev-internal-gateway` (for development)
- **Gateway**: Automatically adds this header when forwarding requests

### JWT Authentication
- **Purpose**: Authenticates users for protected endpoints
- **Flow**: Login → Get JWT → Use JWT in Authorization header
- **Format**: `Bearer <jwt-token>`

## 🎨 Collection Features

### Automatic Token Management
- Tokens are automatically stored in environment variables
- No need to manually copy/paste tokens
- Automatic token refresh testing

### Comprehensive Test Scripts
- Each request has built-in tests
- Automatic validation of responses
- Clear pass/fail indicators

### Security Testing
- Tests both positive and negative cases
- Validates security mechanisms
- Demonstrates proper error handling

## 📝 Customization

### Changing Base URL
If your services run on different ports:
1. Update the `base_url` environment variable
2. Or modify the collection variable

### Adding New Tests
1. Right-click on a folder
2. Select "Add Request"
3. Configure the request
4. Add test scripts in the "Tests" tab

### Modifying Test Data
- Change usernames, emails, passwords in request bodies
- Update expected status codes in test scripts
- Modify timeout settings if needed

## 🚨 Important Notes

1. **Run tests in sequence** - Some tests depend on previous ones
2. **Check service logs** - Look at console output for debugging
3. **Environment variables** - Tokens are stored automatically
4. **Security is working** - 403 errors on direct access are expected
5. **Clean up** - Delete test users if needed

## 🎉 Success Criteria

You'll know everything is working when:
- ✅ All health checks pass
- ✅ User registration and login work
- ✅ JWT authentication works
- ✅ Direct access is blocked (403 errors)
- ✅ Swagger UI is accessible through Gateway
- ✅ All security tests pass

## 📞 Support

If you encounter issues:
1. Check the service logs
2. Verify all services are running
3. Check the troubleshooting section above
4. Ensure you're following the testing sequence

---

**Happy Testing! 🚀**

This collection provides comprehensive testing of the Event Planner Auth Service security model, demonstrating both the X-Internal-Auth mechanism and JWT authentication working together through the API Gateway.
