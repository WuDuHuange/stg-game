/**
 * 测试环境设置
 */

import { afterEach } from 'vitest';

// 每个用例后清理DOM，保持测试环境隔离
afterEach(() => {
    if (typeof document !== 'undefined' && document.body) {
        document.body.innerHTML = '';
    }
});
