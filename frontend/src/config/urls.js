// API 基础URL
export const API_BASE_URL = 'http://localhost:3000'

// 图片URL前缀
export const IMAGE_BASE_URL = API_BASE_URL

// API 路径
export const API_URLS = {
    // 失物相关
    FOUND_ITEMS: '/api/founder/items',
    SEARCH_FOUND: '/api/founder/search',
    ADMIN_LOGIN: '/api/founder/admin/login',

    // 挂失相关
    LOST_ITEMS: '/api/loster/items',
    SEARCH_LOST: '/api/loster/search',
}

// 获取完整的图片URL
export const getImageUrl = (path) => {
    if (!path) return '';
    // 如果是完整的URL，直接返回
    if (path.startsWith('http')) {
        return path;
    }
    // 如果path已经包含/uploads，则直接与基础URL拼接
    if (path.startsWith('/uploads')) {
        return `${API_BASE_URL}${path}`;
    }
    // 否则，添加/uploads前缀
    return `${API_BASE_URL}/uploads/${path}`;
}
