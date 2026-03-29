/**
 * 日志工具类
 * 提供统一的日志记录接口
 */

enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

class Logger {
    private static instance: Logger;
    private currentLevel: LogLevel = LogLevel.DEBUG;
    private enableConsole: boolean = true;
    private logs: Array<{ timestamp: Date; level: string; message: string; data?: any }> = [];

    private constructor() {}

    /**
     * 获取Logger实例
     */
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * 设置日志级别
     */
    public setLevel(level: LogLevel): void {
        this.currentLevel = level;
    }

    /**
     * 启用/禁用控制台输出
     */
    public setConsoleEnabled(enabled: boolean): void {
        this.enableConsole = enabled;
    }

    /**
     * 获取所有日志
     */
    public getLogs(): Array<{ timestamp: Date; level: string; message: string; data?: any }> {
        return [...this.logs];
    }

    /**
     * 清空日志
     */
    public clearLogs(): void {
        this.logs = [];
    }

    /**
     * 导出日志
     */
    public exportLogs(): string {
        const logText = this.logs
            .map(
                log =>
                    `[${log.timestamp.toISOString()}] [${log.level}] ${log.message}${
                        log.data ? ` ${JSON.stringify(log.data)}` : ''
                    }`
            )
            .join('\n');
        return logText;
    }

    /**
     * 记录调试日志
     */
    public debug(message: string, data?: any): void {
        this.log(LogLevel.DEBUG, 'DEBUG', message, data);
    }

    /**
     * 记录信息日志
     */
    public info(message: string, data?: any): void {
        this.log(LogLevel.INFO, 'INFO', message, data);
    }

    /**
     * 记录警告日志
     */
    public warn(message: string, data?: any): void {
        this.log(LogLevel.WARN, 'WARN', message, data);
    }

    /**
     * 记录错误日志
     */
    public error(message: string, data?: any): void {
        this.log(LogLevel.ERROR, 'ERROR', message, data);
    }

    /**
     * 内部日志记录方法
     */
    private log(level: LogLevel, levelName: string, message: string, data?: any): void {
        if (level < this.currentLevel) {
            return;
        }

        const logEntry = {
            timestamp: new Date(),
            level: levelName,
            message,
            data
        };

        this.logs.push(logEntry);

        // 控制台输出
        if (this.enableConsole) {
            const timestamp = logEntry.timestamp.toTimeString().split(' ')[0];
            const prefix = `[${timestamp}] [${levelName}]`;

            switch (level) {
                case LogLevel.DEBUG:
                    console.debug(prefix, message, data || '');
                    break;
                case LogLevel.INFO:
                    console.info(prefix, message, data || '');
                    break;
                case LogLevel.WARN:
                    console.warn(prefix, message, data || '');
                    break;
                case LogLevel.ERROR:
                    console.error(prefix, message, data || '');
                    break;
            }
        }
    }
}

// 导出单例实例
export const logger = Logger.getInstance();
export { LogLevel, Logger };
