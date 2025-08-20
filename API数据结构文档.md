# 手写字符识别系统 - API数据结构文档

## 概述

本文档定义了手写字符识别系统后端API需要返回的数据结构，确保前端能够正常工作。

## 1. 统计数据API

### 1.1 获取统计数据

**接口地址**: `GET /handwriting/api/statistics/`

**请求参数**:

```typescript
interface StatisticsParams {
  period?: 'day' | 'week' | 'month' | 'year'  // 统计周期，默认为week
}
```

**响应数据结构**:

```typescript
interface StatisticsResponse {
  code: number        // 状态码
  msg: StatisticsData // 统计数据（注意：这里是msg字段，不是data）
  data: string        // 消息文本
}

interface StatisticsData {
  total_detections: number    // 总识别次数
  avg_accuracy: number       // 平均准确率（0-100的数值）
  daily_stats: DailyStat[]   // 每日统计数据
  type_stats: TypeStat[]     // 类型统计数据
  char_stats: CharStat[]     // 字符统计数据
  date_range: DateRange      // 日期范围
}

interface DailyStat {
  date: string    // 日期，格式：YYYY-MM-DD
  count: number   // 当日识别次数
}

interface TypeStat {
  detection_type: string  // 检测类型（如：canvas）
  count: number          // 该类型识别次数
  avg_conf: number       // 平均置信度
}

interface CharStat {
  recognized_character: string  // 识别的字符（可能包含路径如：Img/A.png）
  count: number                // 该字符识别次数
  avg_conf: number             // 平均置信度
}

interface DateRange {
  start_date: string  // 开始日期
  end_date: string    // 结束日期
  days: number        // 天数
}
```

**响应示例**:

```json
{
  "code": 200,
  "msg": {
    "total_detections": 1250,
    "avg_accuracy": 92.5,
    "daily_stats": [
      {
        "date": "2025-01-13",
        "count": 45
      },
      {
        "date": "2025-01-14",
        "count": 67
      }
    ],
    "type_stats": [
      {
        "detection_type": "canvas",
        "count": 1200,
        "avg_conf": 0.925
      }
    ],
    "char_stats": [
      {
        "recognized_character": "Img/A.png",
        "count": 150,
        "avg_conf": 0.95
      },
      {
        "recognized_character": "Img/B.png",
        "count": 120,
        "avg_conf": 0.88
      }
    ],
    "date_range": {
      "start_date": "2025-01-07",
      "end_date": "2025-01-14",
      "days": 7
    }
  },
  "data": "获取统计数据成功"
}
```

## 2. 管理员系统统计API

### 2.1 获取管理员系统统计数据

**接口地址**: `GET /handwriting/api/admin/system/stats/`

**请求参数**:

```typescript
interface AdminSystemStatsParams {
  period?: 'day' | 'week' | 'month' | 'year'  // 统计周期
  include_activities?: boolean                 // 是否包含活动记录
}
```

**响应数据结构**:

```typescript
interface AdminSystemStatsResponse {
  code: number
  message: string
  data: AdminSystemStatsData  // 注意：这里是data字段
}

interface AdminSystemStatsData {
  system_info: {
    total_users: number          // 总用户数
    active_users_today: number   // 今日活跃用户数
    total_detections: number     // 总识别次数
    detections_today: number     // 今日识别次数
    system_uptime: string        // 系统运行时间
    cpu_usage: number           // CPU使用率（0-100）
    memory_usage: number        // 内存使用率（0-100）
    disk_usage: number          // 磁盘使用率（0-100）
  }
  model_info: {
    model_name: string          // 模型名称
    model_version: string       // 模型版本
    accuracy: number           // 模型准确率
    last_updated: string       // 最后更新时间
    total_parameters: number   // 模型参数总数
  }
  performance_stats: {
    avg_response_time: number   // 平均响应时间（秒）
    requests_per_second: number // 每秒请求数
    error_rate: number         // 错误率（0-1）
    success_rate: number       // 成功率（0-1）
  }
  recent_activities: Array<{
    timestamp: string    // 时间戳
    user_id: number     // 用户ID
    action: string      // 操作类型
    details: string     // 操作详情
  }>
  daily_stats: DailyStat[]    // 每日统计（同上）
  type_stats: TypeStat[]      // 类型统计（同上）
  char_stats: CharStat[]      // 字符统计（同上）
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "获取系统统计数据成功",
  "data": {
    "system_info": {
      "total_users": 1250,
      "active_users_today": 45,
      "total_detections": 15000,
      "detections_today": 120,
      "system_uptime": "15天 3小时 25分钟",
      "cpu_usage": 35.2,
      "memory_usage": 68.5,
      "disk_usage": 42.1
    },
    "model_info": {
      "model_name": "HandwritingRecognitionModel",
      "model_version": "v2.1.0",
      "accuracy": 92.5,
      "last_updated": "2025-01-10T10:30:00Z",
      "total_parameters": 2500000
    },
    "performance_stats": {
      "avg_response_time": 0.85,
      "requests_per_second": 25.3,
      "error_rate": 0.02,
      "success_rate": 0.98
    },
    "recent_activities": [
      {
        "timestamp": "2025-01-14T14:30:00Z",
        "user_id": 123,
        "action": "字符识别",
        "details": "识别字符A，置信度95%"
      }
    ],
    "daily_stats": [],
    "type_stats": [],
    "char_stats": []
  }
}
```

## 3. 模型信息API

### 3.1 获取模型信息

**接口地址**: `GET /handwriting/api/admin/model/info/`

**响应数据结构**:

```typescript
interface ModelInfoResponse {
  code: number
  msg: ModelInfo    // 注意：这里是msg字段
  data: string
}

interface ModelInfo {
  model_loaded: boolean           // 模型是否已加载
  model_version: string          // 模型版本
  confidence_threshold: number   // 置信度阈值（0-1之间的小数）
  char_classes_count: number     // 支持的字符类别数量
  model_name?: string           // 模型名称（可选）
  last_updated?: string         // 最后更新时间（可选）
}
```

**响应示例**:

```json
{
  "code": 200,
  "msg": {
    "model_loaded": true,
    "model_version": "v2.1.0",
    "confidence_threshold": 0.75,
    "char_classes_count": 36,
    "model_name": "HandwritingRecognitionModel",
    "last_updated": "2025-01-10T10:30:00Z"
  },
  "data": "获取模型信息成功"
}
```

## 4. 系统状态API

### 4.1 获取系统状态

**接口地址**: `GET /api/websocket/system/status/`

**响应数据结构**:

```typescript
interface SystemStatusResponse {
  code: number
  message: string
  data: SystemStatus    // 注意：这里是data字段
}

interface SystemStatus {
  status: string        // 系统状态
  uptime: string       // 运行时间
  version: string      // 系统版本
  // 其他系统状态信息
}
```

## 重要说明

1. **字段命名约定**：
   - 统计相关API使用 `msg` 字段返回数据
   - 管理员系统统计API使用 `data` 字段返回数据
   - 模型信息API使用 `msg` 字段返回数据
   - 系统状态API使用 `data` 字段返回数据

2. **数据类型**：
   - 所有数值类型必须是number，不能是字符串
   - 日期格式统一使用ISO 8601格式或YYYY-MM-DD格式
   - 置信度使用0-1之间的小数
   - 准确率使用0-100的整数或小数

3. **必需字段**：
   - 所有接口都必须返回code字段
   - StatisticsData中的所有字段都是必需的，如果没有数据应返回空数组或0
   - AdminSystemStatsData中的所有字段都是必需的

4. **兼容性**：
   - 确保字段名称与前端TypeScript类型定义完全一致
   - 数组字段即使为空也要返回空数组[]，不能返回null
   - 数值字段不能返回null，应返回0或合适的默认值

## 测试建议

建议后端开发人员使用以下测试数据验证API：

```bash
# 测试统计数据API
curl -X GET "http://your-domain/handwriting/api/statistics/?period=week"

# 测试管理员系统统计API
curl -X GET "http://your-domain/handwriting/api/admin/system/stats/?period=week&include_activities=true"

# 测试模型信息API
curl -X GET "http://your-domain/handwriting/api/admin/model/info/"

# 测试系统状态API
curl -X GET "http://your-domain/api/websocket/system/status/"
```

确保返回的JSON数据结构与本文档定义完全一致。
