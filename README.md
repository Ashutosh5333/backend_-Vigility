# Analytics Dashboard - Backend API

## Overview
This is the backend API for the Interactive Product Analytics Dashboard. It provides authentication, user management, and analytics data endpoints using Node.js, Express, PostgreSQL, and JWT authentication.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

## Project Structure
```
backend/
├── config/
│   ├── database.js       # PostgreSQL connection configuration
│   └── initDB.js         # Database initialization and table creation
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── models/
│   ├── User.js           # User model and database operations
│   └── FeatureClick.js   # Feature click model and analytics queries
├── routes/
│   ├── auth.js           # Authentication routes (register, login)
│   └── analytics.js      # Analytics routes (track, data retrieval)
├── scripts/
│   └── seed.js           # Database seeding script
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
└── server.js             # Main application entry point
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Feature Clicks Table
```sql
CREATE TABLE feature_clicks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_name VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123",
  "age": 25,
  "gender": "Male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "age": 25,
    "gender": "Male"
  }
}
```

#### POST /api/auth/login
Login an existing user.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "age": 25,
    "gender": "Male"
  }
}
```

### Analytics

#### POST /api/analytics/track
Track a user interaction (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "feature_name": "date_filter"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interaction tracked successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "feature_name": "date_filter",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/analytics/data
Retrieve aggregated analytics data (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `startDate`: Start date for filtering (ISO 8601 format)
- `endDate`: End date for filtering (ISO 8601 format)
- `age`: Age range filter (`<18`, `18-40`, `>40`)
- `gender`: Gender filter (`Male`, `Female`, `Other`)
- `feature`: Specific feature name for time trend data

**Example Request:**
```
GET /api/analytics/data?startDate=2024-01-01&endDate=2024-01-31&age=18-40&gender=Male&feature=date_filter
```

**Response:**
```json
{
  "success": true,
  "data": {
    "featureClicks": [
      {
        "feature_name": "date_filter",
        "click_count": "45"
      },
      {
        "feature_name": "bar_chart",
        "click_count": "32"
      }
    ],
    "timeTrend": [
      {
        "date": "2024-01-15",
        "click_count": "12"
      },
      {
        "date": "2024-01-16",
        "click_count": "15"
      }
    ]
  }
}
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=analytics_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Create PostgreSQL Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE analytics_db;

# Exit
\q
```

### Step 4: Run the Application
The application will automatically create the necessary tables on first run.

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### Step 5: Seed the Database (Important!)
To populate the database with dummy data:

```bash
npm run seed
```

This will create:
- 15 demo users with varying ages and genders
- 100-150 feature click records across the last 30 days
- Realistic distribution across different features

**Demo Login Credentials:**
- Username: `john_doe` (or any other seeded username)
- Password: `password123`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run seed` - Populate the database with dummy data

## Architecture Decisions

### 1. PostgreSQL Database
**Choice**: PostgreSQL over SQLite

**Reasoning**:
- Better performance for concurrent reads/writes
- ACID compliance for data integrity
- Rich indexing capabilities for complex analytics queries
- Production-ready with no data loss on server restarts
- Better support for date/time operations needed for analytics

### 2. JWT Authentication
**Choice**: Stateless JWT tokens

**Reasoning**:
- Scalable - no server-side session storage required
- Works well with separate frontend/backend architecture
- Easy to implement CORS for cross-origin requests
- 7-day expiration balances security and user experience

### 3. Express.js Framework
**Choice**: Express over alternatives

**Reasoning**:
- Lightweight and flexible
- Large ecosystem of middleware
- Well-documented and widely adopted
- Easy to integrate with PostgreSQL
- Excellent for RESTful API development

### 4. Database Indexing
**Implementation**: Strategic indexes on:
- `feature_clicks.user_id` - Fast user-specific queries
- `feature_clicks.timestamp` - Date range filtering
- `feature_clicks.feature_name` - Feature aggregation

**Reasoning**:
- Analytics queries heavily rely on filtering and aggregation
- Indexes significantly improve query performance
- Essential for scaling to larger datasets

### 5. Password Security
**Choice**: bcryptjs with salt rounds

**Reasoning**:
- Industry-standard password hashing
- Protection against rainbow table attacks
- Computationally expensive to slow brute-force attempts

## Scaling to 1 Million Events Per Minute

If this dashboard needed to handle 1 million write events per minute, here's how I would change the backend architecture:

### Current Bottlenecks
1. **Database Write Throughput**: PostgreSQL on a single instance can't handle 16,667 writes/second
2. **Single Server Limitation**: One Express instance is insufficient
3. **Synchronous Processing**: Blocking writes slow down API responses
4. **No Caching Layer**: Every request hits the database

### Proposed Solutions

#### 1. Message Queue Architecture
**Implementation**: 
- Replace direct database writes with message queue (Apache Kafka or RabbitMQ)
- API endpoint publishes events to queue immediately (non-blocking)
- Multiple consumer workers batch-process events into database
- Can handle millions of events with minimal latency

**Benefits**:
- Decouples write API from database operations
- Natural backpressure handling
- Event replay capability for recovery
- Horizontal scalability of consumers

#### 2. Database Optimization
**Write Path**:
- Batch inserts (1000+ events per transaction)
- Write to time-series database (TimescaleDB, ClickHouse)
- Partition tables by date for better write performance
- Use connection pooling with 100+ connections

**Read Path**:
- Materialized views for pre-aggregated data
- Read replicas for analytics queries
- Separate OLTP (writes) and OLAP (analytics) databases

#### 3. Caching Layer
**Implementation**:
- Redis for aggregated analytics results
- Cache with short TTL (1-5 minutes) for real-time feel
- Cache invalidation on filter changes
- Reduce database load by 80-90%

#### 4. Horizontal Scaling
**Architecture**:
- Load balancer (NGINX/AWS ALB) distributing traffic
- Multiple stateless API servers (10-50 instances)
- Auto-scaling based on CPU/memory metrics
- Kubernetes for container orchestration

#### 5. Event Processing Pipeline
**Data Flow**:
```
User Event → API Gateway → Kafka Topic → Stream Processor → TimescaleDB
                                ↓
                           Real-time Analytics (Flink/Spark Streaming)
                                ↓
                           Redis Cache → API → Frontend
```

#### 6. Monitoring & Observability
**Tools**:
- Prometheus + Grafana for metrics
- ELK stack for log aggregation
- Distributed tracing (Jaeger)
- Alert systems for queue depth, error rates

### Cost-Effective Alternatives
For startups/smaller scale:
- Use Supabase/PlanetScale for managed PostgreSQL
- CloudFlare Workers for edge computing
- Implement client-side batching (collect 10 events, send together)
- Sample events (track 10% of clicks, extrapolate)

### Estimated Infrastructure
- **API Servers**: 20-30 instances
- **Kafka Cluster**: 5-10 brokers
- **Database**: TimescaleDB cluster (1 primary + 3 replicas)
- **Redis Cluster**: 3-5 nodes
- **Consumer Workers**: 50-100 instances
- **Total Cost**: $5,000-$15,000/month on AWS/GCP

## Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "age": 25,
    "gender": "Male"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Track Event (replace TOKEN with actual JWT)
```bash
curl -X POST http://localhost:5000/api/analytics/track \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "feature_name": "date_filter"
  }'
```

### Get Analytics Data
```bash
curl http://localhost:5000/api/analytics/data \
  -H "Authorization: Bearer TOKEN"
```

## Deployment

### Environment Variables for Production
Ensure you set secure values for:
- `JWT_SECRET` - Use a long random string
- `DB_PASSWORD` - Strong database password
- `NODE_ENV=production`
- `FRONTEND_URL` - Your actual frontend domain

### Recommended Platforms
- **Backend**: Render, Railway, Heroku, AWS Elastic Beanstalk
- **Database**: Render PostgreSQL, Supabase, AWS RDS, Railway PostgreSQL

### Deployment Steps (Render Example)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add PostgreSQL database
7. Configure environment variables
8. Deploy
9. Run seed command via Render Shell: `npm run seed`

## License
MIT

## Support
For issues or questions, please create an issue in the GitHub repository.
