import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
    config => {
        // 获取管理员数据
        const adminData = localStorage.getItem('adminData')
        const token = localStorage.getItem('token')
        if (token) {
            // 在请求头中添加认证token
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
api.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        // 统一处理错误
        if (error.response) {
            const { status, data } = error.response
            // 处理认证失败的情况
            if (status === 401) {
                // 清除本地存储的认证信息
                localStorage.removeItem('adminData')
                localStorage.removeItem('token')
                // 可以根据需要跳转到登录页或显示提示
                console.log('认证失败，请重新登录')
            }
            // 其他错误处理
            return Promise.reject(data || error)
        }
        return Promise.reject(error)
    }
)

export default api
