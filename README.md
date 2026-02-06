# RTC Battambang - Frontend

A Vue 3 + Vite application for RTC Battambang management system.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16.x or higher) - [Download here](https://nodejs.org/)
- **npm** (v7.x or higher) or **yarn** (v1.22.x or higher)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Vibaksanna/RTC-Project-Frontend.git
```

### 2. Navigate to Project Directory

```bash
cd RTC-Project-Frontend
```

### 3. Install Dependencies

Using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

## 🛠️ Development

### ⚠️ Important: Configure Environment Variables First

Before running the application, you **must** create an environment configuration file based on your setup:

#### For Local Development (.env.localhost)

Create a `.env.localhost` file in the root directory:

```env
VITE_API_BASE_URL=/api
VITE_FILE_ORIGIN=http://localhost:8000
VITE_API_TARGET_URL=http://localhost:8000/api
```

#### For Server/Production (.env.development)

Create a `.env.development` file in the root directory:

```env
VITE_API_BASE_URL=/api
VITE_FILE_ORIGIN=https://api.rtc-bb.camai.kh
VITE_API_TARGET_URL=https://api.rtc-bb.camai.kh/api
```

### Run Development Server

#### Local Development

Using npm:

```bash
npm run dev
```

Or using yarn:

```bash
yarn dev
```

#### Server/Production Development

Using npm:

```bash
npm run dev:dev
```

Or using yarn:

```bash
yarn dev:dev
```

The application will be available at `http://localhost:5173` (default Vite port)

### Build for Production

Using npm:

```bash
npm run build
```

Or using yarn:

```bash
yarn build
```

The built files will be generated in the `dist` directory.

### Preview Production Build

Using npm:

```bash
npm run preview
```

Or using yarn:

```bash
yarn preview
```

## 📁 Project Structure

```
rtc-battambang/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, and styles
│   ├── components/     # Vue components
│   │   ├── admins/     # Admin components
│   │   ├── features/   # Reusable feature components
│   │   ├── students/   # Student components
│   │   ├── teachers/   # Teacher components
│   │   └── ui/         # UI components
│   ├── db/             # Mock data and locales
│   ├── routers/        # Vue Router configuration
│   ├── services/       # API services
│   ├── stores/         # Pinia state management
│   ├── views/          # Page views
│   ├── App.vue         # Root component
│   └── main.js         # Application entry point
├── docker-compose.yml  # Docker configuration
├── Dockerfile          # Docker build file
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🛠️ Technologies Used

- **Vue 3** - Progressive JavaScript Framework
- **Vite** - Next Generation Frontend Tooling
- **Pinia** - Vue Store (State Management)
- **Vue Router** - Official Router for Vue.js
- **Tailwind CSS** - Utility-first CSS Framework
- **Axios** - HTTP Client
- **Chart.js** - JavaScript Charting Library
- **Lucide Vue Next** - Icon Library

## 🔧 Configuration

### Environment Variables

The application supports multiple environment configurations:

#### Local Environment (.env.localhost)

For local development with a local backend server:

```env
VITE_API_BASE_URL=/api
VITE_FILE_ORIGIN=http://localhost:8000
VITE_API_TARGET_URL=http://localhost:8000/api
```

Run with: `npm run dev`

#### Server Environment (.env.development)

For development against the production server:

```env
VITE_API_BASE_URL=/api
VITE_FILE_ORIGIN=https://api.rtc-bb.camai.kh
VITE_API_TARGET_URL=https://api.rtc-bb.camai.kh/api
```

Run with: `npm run dev:dev`

### API Configuration

The API base URL is configured via environment variables. Make sure to create the appropriate `.env` file before running the application.

## 🐳 Docker Support

### Run with Docker Compose

```bash
docker-compose up
```

The application will be available at the port specified in `docker-compose.yml`.

### Build Docker Image

```bash
docker build -t rtc-battambang-frontend .
```

### Run Docker Container

```bash
docker run -p 8080:80 rtc-battambang-frontend
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact the development team or open an issue in the repository.

---

**Note:** Make sure the backend API server is running before starting the frontend application.
