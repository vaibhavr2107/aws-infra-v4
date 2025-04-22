# AWS Infrastructure Provisioning Dashboard

A full-stack dashboard application for provisioning AWS infrastructure (ECS/EKS) using AWS Service Catalog and temporary credentials.

## Project Overview

This application provides a user-friendly interface for DevOps and developers to provision AWS infrastructure components without needing direct access to the AWS console. The application handles the complexity of AWS resource management and presents a streamlined workflow for creating containerized infrastructure.

## Features

- Simple AWS authentication using organization credentials
- Provisioning of Elastic Container Service (ECS) infrastructure
- Real-time provisioning status monitoring with step-by-step progress
- Support for different environment types (dev, test, staging, prod)
- Infrastructure configuration options (instance type, container count, auto-scaling)
- Secure handling of temporary AWS credentials

## Tech Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching
- React Hook Form for form management
- Wouter for routing
- Tailwind CSS and ShadCN UI components
- Zod for form validation

### Backend
- Node.js with Express
- TypeScript
- In-memory storage (MemStorage)
- AWS Service Catalog integration (mocked for development)
- Drizzle ORM with PostgreSQL schema definitions

## Project Structure

### Backend Structure

- `server/index.ts` - Main entry point for the Express server
- `server/routes.ts` - API route definitions
- `server/storage.ts` - In-memory storage implementation
- `server/service-catalog.ts` - AWS service catalog integration
- `server/controllers/` - Request handlers for different resources
- `server/services/` - Business logic services
- `server/utils/` - Utility functions for provisioning
- `shared/schema.ts` - Shared TypeScript types and database schema definitions

### Frontend Structure

- `client/src/App.tsx` - Main React component and routing setup
- `client/src/pages/` - Page components for different routes
- `client/src/components/` - Reusable UI components
- `client/src/context/` - React context providers for state management
- `client/src/lib/` - Utility functions and type definitions
- `client/src/hooks/` - Custom React hooks

## API Endpoints

### AWS Credentials

- `POST /api/aws/credentials` - Get temporary AWS credentials

### Provisioning

- `POST /api/provision/start` - Start infrastructure provisioning process
- `GET /api/provision/status` - Get current provisioning status

## Data Model

### User
- Stores basic user information and authentication details

### AWS Credentials
- Manages temporary AWS credentials associated with users

### Provisioning State
- Tracks the status and configuration of infrastructure provisioning
- Includes logs, steps, and current status

## Provisioning Workflow

1. **Select Infrastructure Type** - Choose between ECS or EKS (EKS currently unavailable)
2. **AWS Authentication** - Enter AWS credentials to obtain temporary tokens
3. **Configure Infrastructure** - Set application name, environment, compute options
4. **Initiate Provisioning** - Start the automated provisioning process
5. **Monitor Progress** - Track real-time progress with detailed logs

## Getting Started

### Running the Application

The project uses a workflow named 'Start application' which runs `npm run dev` to start both the Express backend and React frontend in development mode.

### Development Guidelines

- Frontend uses React with TypeScript and Tailwind CSS
- Backend uses Express with in-memory storage
- API routes validate requests with Zod schemas
- Shared types ensure consistency between frontend and backend

## Key Components

### Frontend Components

- **ProvisioningContext** - Manages AWS credentials, infrastructure config, and provisioning state
- **Infrastructure Cards** - Display available infrastructure options
- **AWS Credential Form** - Collects and validates AWS credentials
- **ECS Configuration Form** - Configures ECS infrastructure parameters
- **Activity Monitor** - Shows real-time provisioning progress

### Backend Services

- **Storage Service** - In-memory data persistence layer
- **AWS Credentials Service** - Handles AWS authentication and token generation
- **ECS Steps Service** - Manages the ECS provisioning workflow
- **Synchronous Step Executor** - Executes provisioning steps sequentially