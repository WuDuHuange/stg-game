/**
 * Logger工具类测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Logger, LogLevel, logger } from '../../src/utils/Logger';

describe('Logger', () => {
    let testLogger: Logger;

    beforeEach(() => {
        testLogger = Logger.getInstance();
        testLogger.clearLogs();
        testLogger.setLevel(LogLevel.DEBUG);
    });

    describe('getInstance', () => {
        it('should return the same instance', () => {
            const instance1 = Logger.getInstance();
            const instance2 = Logger.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('log levels', () => {
        it('should log debug messages when level is DEBUG', () => {
            testLogger.setLevel(LogLevel.DEBUG);
            testLogger.debug('Test debug message');
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('DEBUG');
        });

        it('should not log debug messages when level is INFO', () => {
            testLogger.setLevel(LogLevel.INFO);
            testLogger.debug('Test debug message');
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(0);
        });

        it('should log info messages when level is INFO', () => {
            testLogger.setLevel(LogLevel.INFO);
            testLogger.info('Test info message');
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('INFO');
        });
    });

    describe('log methods', () => {
        it('should record debug logs', () => {
            testLogger.debug('Debug message', { data: 'test' });
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toBe('Debug message');
            expect(logs[0].data).toEqual({ data: 'test' });
        });

        it('should record info logs', () => {
            testLogger.info('Info message');
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toBe('Info message');
        });

        it('should record warn logs', () => {
            testLogger.warn('Warn message');
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toBe('Warn message');
        });

        it('should record error logs', () => {
            testLogger.error('Error message');
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].message).toBe('Error message');
        });
    });

    describe('log management', () => {
        it('should clear all logs', () => {
            testLogger.info('Message 1');
            testLogger.info('Message 2');
            testLogger.clearLogs();
            const logs = testLogger.getLogs();
            expect(logs).toHaveLength(0);
        });

        it('should export logs as string', () => {
            testLogger.info('Test message');
            const exported = testLogger.exportLogs();
            expect(exported).toContain('INFO');
            expect(exported).toContain('Test message');
        });
    });
});
