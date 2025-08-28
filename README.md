# **Rato POS**

**Rato POS** is a modern, Next.js-based Progressive Web App (PWA) for restaurant point-of-sale (POS) management, developed by **Kree Multipurpose Private Limited**. This application streamlines restaurant operations by enabling waiters to efficiently manage tables, view real-time table statuses, browse menu items, and create orders directly from any device.

---

## **Features**

* **Waiter Login**: Secure authentication for waiters to access their assigned tables and manage orders.
* **Table Management**: View all tables with real-time status indicators (available, occupied, reserved, unavailable).
* **Menu Browsing**: Browse categorized menu items, search, and filter with ease.
* **Order Creation**: Quickly add, update, or remove items from table orders.
* **Responsive Design**: Optimized for mobile, tablet, and desktop devices.
* **PWA Support**: Installable on devices for a native app-like experience, including offline capabilities.
* **Session Management**: Automatic session expiry and secure local storage of user data.

---

## **Getting Started**

### **Prerequisites**


Before you begin, ensure that you have the following tools installed:

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### **Installation**

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-org/rato-pos.git
   cd rato-pos
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

   or, if you prefer Yarn:

   ```sh
   yarn install
   ```

3. **Configure environment variables:**

   Copy `.env.example` to `.env` and set the required variables, especially `NEXT_PUBLIC_API_BASE_URL`.

4. **Run the development server:**

   ```sh
   npm run dev
   ```

   or

   ```sh
   yarn dev
   ```

5. **Open the app:**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## **Building for Production**

1. **Build the application:**

   ```sh
   npm run build
   ```

   or

   ```sh
   yarn build
   ```

2. **Start the production server:**

   ```sh
   npm run start
   ```

   or

   ```sh
   yarn start
   ```

---

## **Usage**

### **Login**

* Waiters log in with their credentials to access the application.

### **Tables**

* View all tables and their current statuses (available, occupied, reserved, or unavailable).

### **Orders**

* Select a table to view or create orders, add menu items, adjust quantities, and save orders.

### **Menu**

* Browse or search menu items, view item details, and add items to orders.

---

## **Technologies Used**

* **Next.js** (App Router)
* **React**
* **Tailwind CSS**
* **React Query**
* **Zod** (Schema Validation)
* **Axios**
* **Lucide Icons**
* **Sonner** (Toast Notifications)

---

## **PWA Features**

* Installable on mobile and desktop devices.
* Offline support for static assets.
* Home screen icon and splash screen.
* Optimized for touch and small screens.

---

## **License**

© **Kree Multipurpose Private Limited**. All rights reserved.

For support or inquiries, please contact **Kree Multipurpose Private Limited**.
