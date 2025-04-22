# AWS Dummy Mode

This application includes a "dummy mode" for AWS operations, allowing you to test and develop the application without making actual AWS API calls.

## What is Dummy Mode?

Dummy mode is a development and testing feature that bypasses all actual AWS SDK operations and returns mock success responses instead. When enabled:

- All AWS credential validation is immediately successful (with basic validation still in place)
- AWS Service Catalog operations are simulated with predetermined responses
- Provisioning steps are accelerated (5x faster than normal)
- All API responses include a `dummyMode: true` flag

## How to Enable Dummy Mode

### Option 1: Use the provided script

Run the application with dummy mode enabled using the provided script:

```bash
./start-dummy-mode.sh
```

### Option 2: Set the environment variable manually

Set the `AWS_DUMMY` environment variable to "true" before starting the application:

```bash
# Linux/Mac
export AWS_DUMMY=true
npm run dev

# Windows (Command Prompt)
set AWS_DUMMY=true
npm run dev

# Windows (PowerShell)
$env:AWS_DUMMY="true"
npm run dev
```

## API Response Format in Dummy Mode

When dummy mode is enabled, all API responses will be wrapped in a standard mock response format:

```json
{
  "status": "mock-success",
  "message": "Dummy mode enabled. No real AWS action performed.",
  "data": {
    // The actual response data that would have been returned
    "success": true,
    "dummyMode": true,
    // ... other response properties
  }
}
```

## Identifying Dummy Mode in Response

You can identify if a response was generated in dummy mode by:

1. Looking for the `status: "mock-success"` property at the root level
2. Checking for the `dummyMode: true` property in the response body or wrapped data

## Dummy Mode Implementation Details

The dummy mode implementation is controlled by utility functions in `server/utils/config.ts`:

- `isDummyMode()`: Checks if dummy mode is enabled
- `generateMockResponse()`: Formats mock responses for AWS operations

All AWS-related services and controllers have been updated to check for dummy mode and respond accordingly.