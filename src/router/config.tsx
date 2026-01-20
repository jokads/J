import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import Layout from "../components/Layout";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazy load pages
const HomePage = lazy(() => import("../pages/home/page"));
const AboutPage = lazy(() => import("../pages/about/page"));
const ContactPage = lazy(() => import("../pages/contact/page"));
const CategoryPage = lazy(() => import("../pages/category/page"));
const ProductPage = lazy(() => import("../pages/product/page"));
const ServicesPage = lazy(() => import("../pages/services/page"));
const ServiceDetailPage = lazy(() => import("../pages/services/detail/page"));
const LoginPage = lazy(() => import("../pages/login/page"));
const RegisterPage = lazy(() => import("../pages/register/page"));
const ProfilePage = lazy(() => import("../pages/profile/page"));
const FavoritesPage = lazy(() => import("../pages/favorites/page"));
const CartPage = lazy(() => import("../pages/cart/page"));
const AdminPage = lazy(() => import("../pages/admin/page"));
const SetupPage = lazy(() => import("../pages/setup/page"));
const NotFound = lazy(() => import("../pages/NotFound"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "inicio", element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "category", element: <CategoryPage /> },
      { path: "product", element: <ProductPage /> },
      { path: "produto/:slug", element: <ProductPage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "services/:slug", element: <ServiceDetailPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "profile", element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: "favorites", element: <ProtectedRoute><FavoritesPage /></ProtectedRoute> },
      { path: "cart", element: <CartPage /> },
      { path: "setup", element: <SetupPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminPage /> },
    ],
  },
  {
    path: '/cart',
    element: lazy(() => import('../pages/cart/page'))
  },
  {
    path: '/checkout',
    element: lazy(() => import('../pages/checkout/page'))
  },
  
  // WooCommerce REST API Discovery Endpoints
  {
    path: '/wp-json',
    element: lazy(() => import('../pages/wp-json/page')),
  },
  {
    path: '/wp-json/',
    element: lazy(() => import('../pages/wp-json/page')),
  },
  {
    path: '/wp/wp-json',
    element: lazy(() => import('../pages/wp-json/page')),
  },
  {
    path: '/wp/wp-json/',
    element: lazy(() => import('../pages/wp-json/page')),
  },
];

export default routes;
