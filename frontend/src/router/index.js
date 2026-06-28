import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import LostNotices from '../views/LostNotices.vue'
import FoundItems from '../views/FoundItems.vue'
import Admin from '../views/Admin.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/lost-notices',
        name: 'LostNotices',
        component: LostNotices
    },
    {
        path: '/found-items',
        name: 'FoundItems',
        component: FoundItems
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
