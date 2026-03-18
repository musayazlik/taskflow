# API Response Structure

This document defines the standard response format that all API endpoints in the TurboStack project must adhere to. It standardizes frontend-backend communication by providing a common structure for successful and error operations.

## Standard Response Format

```typescript
interface ApiResponse<T = unknown> {
  success: boolean; // Is the operation successful?
  data?: T; // Data returned in a successful response (single object or array)
  meta?: {
    // Pagination and other additional information
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string; // Error code (e.g., "UNAUTHORIZED", "VALIDATION_ERROR")
  message?: string; // Message that can be shown to the user
}
```

## Successful Response Examples

### Single Record

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Paginated List

```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### Success with Message

```json
{
  "success": true,
  "message": "User created successfully"
}
```

## Error Response Examples

### Validation Error (400)

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Email format is invalid"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "The requested resource was not found"
}
```

### Rate Limited (429)

```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Too many requests. Please try again later."
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

## Auth Endpoint Responses

With the better-auth integration, auth endpoints (`/api/auth/*`) also use the same format:

### Login Success

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": true,
      "role": "USER"
    },
    "session": {
      "token": "session_token",
      "expiresAt": "2025-01-18T12:00:00.000Z"
    }
  },
  "message": "Login successful"
}
```

### Register Success

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": false,
      "role": "USER"
    }
  },
  "message": "Registration successful. Please verify your email."
}
```

### Auth Error Codes

| Code                  | Description                         |
| --------------------- | ----------------------------------- |
| `UNAUTHORIZED`        | Authentication failed               |
| `INVALID_CREDENTIALS` | Invalid email or password           |
| `EMAIL_NOT_VERIFIED`  | Email not verified                  |
| `USER_EXISTS`         | User with this email already exists |
| `INVALID_TOKEN`       | Invalid or expired token            |
| `RATE_LIMITED`        | Too many requests                   |

## Usage Recommendations

### Handling Responses in Web

```typescript
const response = await fetch("/api/auth/sign-in/email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
  credentials: "include",
});

const result = await response.json();

if (result.success) {
  // Success - user and session are inside result.data
  console.log("Logged in:", result.data.user);
} else {
  // Error - result.error and result.message are present
  console.error(result.error, result.message);
}
```

### HTTP Status Codes

| Status | Description      |
| ------ | ---------------- |
| 200    | Success          |
| 400    | Validation error |
| 401    | Unauthorized     |
| 403    | Forbidden        |
| 404    | Not found        |
| 429    | Rate limited     |
| 500    | Server error     |
