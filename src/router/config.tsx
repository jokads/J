import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load pages
const Home = lazy(() => import('../pages/home/page'));
const Produtos = lazy(() => import('../pages/produtos/page'));
const Produto = lazy(() => import('../pages/produto/page'));
const Marketplace = lazy(() => import('../pages/marketplace/page'));
const MontarPC = lazy(() => import('../pages/montar-pc/page'));
const Carrinho = lazy(() => import('../pages/carrinho/page'));
const Favoritos = lazy(() => import('../pages/favoritos/page'));
const Checkout = lazy(() => import('../pages/checkout/page'));
const Sucesso = lazy(() => import('../pages/sucesso/page'));
const Cancelado = lazy(() => import('../pages/cancelado/page'));
const Login = lazy(() => import('../pages/login/page'));
const Dashboard = lazy(() => import('../pages/dashboard/page'));
const Sobre = lazy(() => import('../pages/sobre/page'));
const Contato = lazy(() => import('../pages/contato/page'));
const Termos = lazy(() => import('../pages/termos/page'));
const Privacidade = lazy(() => import('../pages/privacidade/page'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ComparacoesPage = lazy(() => import('../pages/comparacoes/page'));
const Perfil = lazy(() => import('../pages/perfil/page'));
const Novidades = lazy(() => import('../pages/novidades/page'));
const ServicosPage = lazy(() => import('../pages/servicos/page'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/produtos',
    element: <Produtos />,
  },
  {
    path: '/produto/:id',
    element: <Produto />,
  },
  {
    path: '/marketplace',
    element: <Marketplace />,
  },
  {
    path: '/montar-pc',
    element: <MontarPC />,
  },
  {
    path: '/carrinho',
    element: <Carrinho />,
  },
  {
    path: '/favoritos',
    element: <Favoritos />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
  {
    path: '/sucesso',
    element: <Sucesso />,
  },
  {
    path: '/cancelado',
    element: <Cancelado />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/sobre',
    element: <Sobre />,
  },
  {
    path: '/contato',
    element: <Contato />,
  },
  {
    path: '/termos',
    element: <Termos />,
  },
  {
    path: '/privacidade',
    element: <Privacidade />,
  },
  {
    path: '/comparacoes',
    element: <ComparacoesPage />,
  },
  {
    path: '/perfil',
    element: <Perfil />,
  },
  {
    path: '/novidades',
    element: <Novidades />,
  },
  {
    path: '/servicos',
    element: <ServicosPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
