import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Callback from '../views/Callback.vue'
import LifeGroups from '../views/LifeGroups.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/callback',
      name: 'Callback',
      component: Callback,
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/life-groups',
      name: 'LifeGroups',
      component: LifeGroups,
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard to protect routes and check auth
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Check if user is already authenticated
  if (!authStore.isAuthenticated && to.path !== '/login' && to.path !== '/callback') {
    await authStore.checkAuth()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    return '/'
  }
})

export default router
