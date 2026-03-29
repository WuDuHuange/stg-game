/**
 * 测试环境设置
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/dom';

// 清理DOM
afterEach(() => {
    cleanup();
});

// 扩展expect
expect.extend({});
