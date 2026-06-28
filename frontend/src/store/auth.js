import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: !!localStorage.getItem('adminData'),
        adminData: JSON.parse(localStorage.getItem('adminData')) || {
            admin_id: '',
            username: '',
            admin_name: '',
            admin_avatar: ''
        }
    }),

    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/admin/login', {
                    username,
                    password
                })

                if (response.success) {
                    const adminData = {
                        username: response.data.username,
                        admin_id: response.data.admin_id,
                        admin_name: response.data.admin_name || '',
                        admin_avatar: response.data.admin_avatar || ''
                    }
                    this.isAuthenticated = true
                    this.adminData = adminData
                    localStorage.setItem('adminData', JSON.stringify(adminData))
                    return true
                }
                return false
            } catch (error) {
                console.error('登录失败：', error)
                throw error // 向上抛出错误以便组件处理
            }
        },

        logout() {
            this.isAuthenticated = false
            this.adminData = {
                admin_id: '',
                username: '',
                admin_name: '',
                admin_avatar: ''
            }
            localStorage.removeItem('adminData')
            localStorage.removeItem('token')
        },

        // 更新管理员信息
        updateAdminInfo(adminInfo) {
            this.adminData = { ...this.adminData, ...adminInfo }
            localStorage.setItem('adminData', JSON.stringify(this.adminData))
        }
    },

    getters: {
        isLoggedIn: (state) => state.isAuthenticated
    }
})
