# 手写字符识别系统 API 文档

## 概述

本文档描述了手写字符识别系统的所有API接口，包括用户接口和管理员接口。

## 基础信息

- **基础URL**: `http://localhost:8000/`
- **认证方式**: Django Session认证
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 用户API接口

### 1. 图片识别接口

**接口描述**: 上传图片进行手写字符识别

**路由**: `POST /handwriting/api/detect/image/`

**请求参数**: 无

**请求体**:

```json
{
    "image": "<base64编码的图片数据>"
}
```

**返回体**:

```json
{
    "success": true,
    "message": "识别成功",
    "data": {
        "character": "A",
        "confidence": 0.95,
        "recognition_time": "2024-01-15 10:30:25",
        "session_id": "session_1234"
    }
}
```

**错误返回**:

```json
{
    "success": false,
    "message": "图片格式不支持",
    "error_code": "INVALID_IMAGE_FORMAT"
}
```

---

### 2. 画布识别接口

**接口描述**: 识别画布上绘制的手写字符

**路由**: `POST /handwriting/api/detect/canvas/`

**请求参数**: 无

**请求体**:

```json
{
    "canvas_data": "<base64编码的画布数据>",
    "width": 300,
    "height": 300
}
```

**返回体**:

```json
{
    "success": true,
    "message": "画布识别成功",
    "data": {
        "character": "5",
        "confidence": 0.88,
        "recognition_time": "2024-01-15 10:32:15",
        "session_id": "session_1234"
    }
}
```

---

### 3. 视频识别接口

**接口描述**: 上传视频文件进行手写字符识别

**路由**: `POST /handwriting/api/detect/video/`

**请求参数**: 无

**请求体**:

```json
{
    "video_file": "<base64编码的视频数据>",
    "frame_interval": 30
}
```

**返回体**:

```json
{
    "success": true,
    "message": "视频识别完成",
    "data": {
        "total_frames": 120,
        "recognized_characters": [
            {
                "frame_number": 30,
                "character": "H",
                "confidence": 0.92,
                "timestamp": "00:01:00"
            },
            {
                "frame_number": 60,
                "character": "e",
                "confidence": 0.87,
                "timestamp": "00:02:00"
            }
        ],
        "session_id": "session_1234"
    }
}
```

---

### 4. 获取历史记录接口

**接口描述**: 获取用户的识别历史记录

**路由**: `GET /handwriting/api/history/`

**请求参数**:

- `page` (可选): 页码，默认为1
- `page_size` (可选): 每页数量，默认为20
- `character` (可选): 筛选特定字符
- `start_date` (可选): 开始日期 (YYYY-MM-DD)
- `end_date` (可选): 结束日期 (YYYY-MM-DD)

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "获取历史记录成功",
    "data": {
        "total_count": 150,
        "page": 1,
        "page_size": 20,
        "total_pages": 8,
        "records": [
            {
                "id": 1,
                "character": "A",
                "confidence": 0.95,
                "recognition_time": "2024-01-15 10:30:25",
                "image_path": "/media/handwriting/image_001.jpg",
                "session_id": "session_1234"
            },
            {
                "id": 2,
                "character": "B",
                "confidence": 0.89,
                "recognition_time": "2024-01-15 10:28:15",
                "image_path": "/media/handwriting/image_002.jpg",
                "session_id": "session_1234"
            }
        ]
    }
}
```

---

### 5. 获取统计数据接口

**接口描述**: 获取用户的识别统计信息

**路由**: `GET /handwriting/api/statistics/`

**请求参数**:

- `period` (可选): 统计周期 (day/week/month/year)，默认为month

**请求体**: 无

**返回体**:

```json
{
 "code": 200,
 "msg": {
  "total_detections": 0,
  "avg_accuracy": 0,
  "daily_stats": [
   {
    "date": "2025-08-12",
    "count": 0
   },
   {
    "date": "2025-08-13",
    "count": 0
   },
   {
    "date": "2025-08-14",
    "count": 0
   },
   {
    "date": "2025-08-15",
    "count": 0
   },
   {
    "date": "2025-08-16",
    "count": 0
   },
   {
    "date": "2025-08-17",
    "count": 0
   },
   {
    "date": "2025-08-18",
    "count": 0
   }
  ],
  "type_stats": [],
  "char_stats": [],
  "date_range": {
   "start_date": "2025-08-12",
   "end_date": "2025-08-19",
   "days": 7
  }
 },
 "data": "获取成功"
}
```

---

### 6. 更新反馈接口

**接口描述**: 用户对识别结果进行反馈

**路由**: `POST /handwriting/api/feedback/`

**请求参数**: 无

**请求体**:

```json
{
    "record_id": 123,
    "correct_character": "A",
    "feedback_type": "correction",
    "comment": "识别结果不正确，应该是字母A"
}
```

**返回体**:

```json
{
    "success": true,
    "message": "反馈提交成功",
    "data": {
        "feedback_id": 456,
        "record_id": 123,
        "status": "已处理",
        "submit_time": "2024-01-15 10:35:20"
    }
}
```

---

### 7. 获取模型信息接口

**接口描述**: 获取当前模型的基本信息

**路由**: `GET /api/handwrite-model/info/`

**请求参数**: 无

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "获取模型信息成功",
    "data": {
        "model_version": "v2.1.0",
        "model_loaded": true,
        "confidence_threshold": 0.75,
        "supported_characters": [
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
            "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
            "u", "v", "w", "x", "y", "z"
        ],
        "device": "cuda",
        "last_updated": "2024-01-10 15:20:30"
    }
}
```

---

## 管理员API接口

### 1. 管理员模型信息接口

**接口描述**: 获取和更新模型的详细配置信息（管理员专用）

**路由**: `GET/POST /handwriting/api/admin/model/info/`

**权限要求**: 管理员权限

#### GET 请求

**请求参数**: 无

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "获取管理员模型信息成功",
    "data": {
        "model_version": "v2.1.0",
        "model_loaded": true,
        "confidence_threshold": 0.75,
        "model_path": "/static/models/handwriting_model.pth",
        "model_size": "15.2 MB",
        "training_date": "2024-01-10",
        "training_samples": 50000,
        "validation_accuracy": 0.94,
        "supported_characters": [
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
            "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
            "u", "v", "w", "x", "y", "z"
        ],
        "device": "cuda",
        "gpu_memory_usage": "2.1 GB",
        "inference_time_avg": "0.05s",
        "last_updated": "2024-01-10 15:20:30"
    }
}
```

#### POST 请求

**请求体**:

```json
{
    "confidence_threshold": 0.80,
    "model_path": "/static/models/handwriting_model_v2.pth"
}
```

**返回体**:

```json
{
    "success": true,
    "message": "模型配置更新成功",
    "data": {
        "confidence_threshold": 0.80,
        "model_path": "/static/models/handwriting_model_v2.pth",
        "updated_time": "2024-01-15 11:00:00"
    }
}
```

---

### 2. 管理员用户管理接口

**接口描述**: 管理系统用户信息

**路由**: `GET/POST /handwriting/api/admin/users/`

**权限要求**: 管理员权限

#### GET 请求

**请求参数**:

- `page` (可选): 页码，默认为1
- `page_size` (可选): 每页数量，默认为20
- `search` (可选): 搜索关键词
- `is_active` (可选): 用户状态筛选

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "获取用户列表成功",
    "data": {
        "total_count": 156,
        "page": 1,
        "page_size": 20,
        "total_pages": 8,
        "users": [
            {
                "id": 1,
                "username": "testuser1",
                "email": "testuser1@example.com",
                "first_name": "测试用户1",
                "is_active": true,
                "date_joined": "2024-01-10 09:30:00",
                "last_login": "2024-01-15 10:20:15",
                "recognition_count": 245,
                "avg_confidence": 0.87
            },
            {
                "id": 2,
                "username": "testuser2",
                "email": "testuser2@example.com",
                "first_name": "测试用户2",
                "is_active": true,
                "date_joined": "2024-01-11 14:15:30",
                "last_login": "2024-01-15 09:45:22",
                "recognition_count": 189,
                "avg_confidence": 0.91
            }
        ]
    }
}
```

#### POST 请求

**请求体**:

```json
{
    "action": "update_status",
    "user_id": 123,
    "is_active": false
}
```

**返回体**:

```json
{
    "success": true,
    "message": "用户状态更新成功",
    "data": {
        "user_id": 123,
        "username": "testuser123",
        "is_active": false,
        "updated_time": "2024-01-15 11:05:00"
    }
}
```

---

### 3. 管理员系统统计接口

**接口描述**: 获取系统整体统计信息

**路由**: `GET /handwriting/api/admin/system/stats/`

**权限要求**: 管理员权限

**请求参数**:

- `period` (可选): 统计周期 (day/week/month/year)，默认为month
- `start_date` (可选): 开始日期 (YYYY-MM-DD)
- `end_date` (可选): 结束日期 (YYYY-MM-DD)

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "获取系统统计成功",
    "data": {
        "overview": {
            "total_users": 156,
            "active_users": 142,
            "total_recognitions": 15420,
            "avg_system_confidence": 0.88,
            "system_accuracy": 0.92,
            "daily_avg_recognitions": 512
        },
        "user_activity": {
            "new_users_today": 3,
            "active_users_today": 45,
            "peak_usage_hour": "14:00-15:00",
            "avg_session_duration": "25分钟"
        },
        "recognition_stats": {
            "total_today": 567,
            "success_rate": 0.94,
            "most_recognized_character": "A",
            "least_recognized_character": "Q",
            "character_accuracy": {
                "A": 0.96,
                "B": 0.94,
                "C": 0.91,
                "1": 0.98,
                "2": 0.95
            }
        },
        "performance_metrics": {
            "avg_response_time": "0.08s",
            "server_uptime": "99.8%",
            "error_rate": "0.2%",
            "memory_usage": "65%",
            "cpu_usage": "45%"
        },
        "trend_data": [
            {
                "date": "2024-01-15",
                "recognitions": 567,
                "new_users": 3,
                "avg_confidence": 0.89
            },
            {
                "date": "2024-01-14",
                "recognitions": 523,
                "new_users": 5,
                "avg_confidence": 0.87
            }
        ]
    }
}
```

---

## 错误代码说明

| 错误代码 | 说明 |
|---------|------|
| `INVALID_IMAGE_FORMAT` | 图片格式不支持 |
| `IMAGE_TOO_LARGE` | 图片文件过大 |
| `MODEL_NOT_LOADED` | 模型未加载 |
| `INSUFFICIENT_CONFIDENCE` | 识别置信度过低 |
| `INVALID_PARAMETERS` | 请求参数无效 |
| `AUTHENTICATION_REQUIRED` | 需要用户认证 |
| `PERMISSION_DENIED` | 权限不足 |
| `RATE_LIMIT_EXCEEDED` | 请求频率超限 |
| `SERVER_ERROR` | 服务器内部错误 |

---

## 状态码说明

- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `429`: 请求频率超限
- `500`: 服务器内部错误

---

---

## WebSocket实时通信接口

### 基础信息

- **WebSocket URL**: `ws://localhost:8001`
- **认证方式**: 无需认证
- **数据格式**: JSON
- **字符编码**: UTF-8

---

### 1. 摄像头WebSocket接口

**接口描述**: 实时摄像头视频流处理和字符识别

**WebSocket路由**: `/ws/camera/`

**连接建立消息**:

```json
{
    "type": "connection_established",
    "message": "摄像头连接已建立"
}
```

**启动摄像头请求**:

```json
{
    "type": "start_camera"
}
```

**启动摄像头响应**:

```json
{
    "type": "camera_started",
    "message": "摄像头启动成功"
}
```

**停止摄像头请求**:

```json
{
    "type": "stop_camera"
}
```

**摄像头状态查询请求**:

```json
{
    "type": "get_camera_status"
}
```

**摄像头状态响应**:

```json
{
    "type": "camera_status",
    "data": {
        "is_streaming": true,
        "camera_opened": true,
        "frame_width": 640,
        "frame_height": 480,
        "fps": 30
    }
}
```

---

### 2. 手写识别WebSocket接口

**接口描述**: 实时手写字符识别处理

**WebSocket路由**: `/ws/handwriting/`

**连接建立消息**:

```json
{
    "type": "connection_established",
    "message": "手写识别连接已建立",
    "session_id": "session_abc123"
}
```

**视频帧识别请求**:

```json
{
    "type": "process_video_frame",
    "frame_data": "<base64编码的视频帧数据>",
    "timestamp": "2024-01-15T10:30:25.123Z"
}
```

**识别成功响应**:

```json
{
    "type": "recognition_result",
    "data": {
        "character": "A",
        "confidence": 0.95,
        "timestamp": "2024-01-15T10:30:25.123Z",
        "session_id": "session_abc123"
    }
}
```

**获取识别历史请求**:

```json
{
    "type": "get_handwriting_history"
}
```

**识别历史响应**:

```json
{
    "type": "handwriting_history",
    "data": {
        "history": [
            {
                "character": "A",
                "confidence": 0.95,
                "timestamp": "2024-01-15T10:30:25.123Z"
            },
            {
                "character": "B",
                "confidence": 0.88,
                "timestamp": "2024-01-15T10:29:15.456Z"
            }
        ],
        "total_count": 50
    }
}
```

**清除历史记录请求**:

```json
{
    "type": "clear_handwriting_history"
}
```

**获取识别统计请求**:

```json
{
    "type": "get_recognition_statistics"
}
```

**识别统计响应**:

```json
{
    "type": "recognition_statistics",
    "data": {
        "total_recognitions": 156,
        "avg_confidence": 0.87,
        "character_distribution": {
            "A": 25,
            "B": 18,
            "C": 12,
            "1": 30,
            "2": 22
        },
        "session_duration": "00:15:30"
    }
}
```

---

### 3. 管理员监控WebSocket接口

**接口描述**: 系统实时监控和管理（管理员专用）

**WebSocket路由**: `/ws/admin/monitor/`

**权限要求**: 管理员权限

**连接建立消息**:

```json
{
    "type": "connection_established",
    "message": "管理员监控连接已建立"
}
```

**系统状态查询请求**:

```json
{
    "type": "get_system_status"
}
```

**系统状态响应**:

```json
{
    "type": "system_status",
    "data": {
        "active_connections": 15,
        "total_recognitions_today": 1250,
        "system_load": {
            "cpu_usage": "45%",
            "memory_usage": "68%",
            "gpu_usage": "32%"
        },
        "model_status": {
            "loaded": true,
            "version": "v2.1.0",
            "last_updated": "2024-01-15T08:00:00Z"
        }
    }
}
```

**系统通知消息**:

```json
{
    "type": "system_notification",
    "data": {
        "level": "info",
        "message": "新用户注册",
        "timestamp": "2024-01-15T10:30:25Z",
        "details": {
            "user_id": 123,
            "username": "newuser"
        }
    }
}
```

---

## WebSocket REST API接口

### 1. 摄像头状态接口

**接口描述**: 获取摄像头设备状态信息

**路由**: `GET /api/websocket/camera/status/`

**请求参数**: 无

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "摄像头可用",
    "data": {
        "status": "available",
        "camera_info": {
            "width": 640,
            "height": 480,
            "fps": 30,
            "index": 0
        }
    }
}
```

**错误返回**:

```json
{
    "success": false,
    "message": "摄像头不可用",
    "data": {
        "status": "unavailable",
        "camera_info": null
    }
}
```

---

### 2. 系统状态接口

**接口描述**: 获取系统整体运行状态

**路由**: `GET /api/websocket/system/status/`

**请求参数**: 无

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "系统运行正常",
    "data": {
        "system_status": "running",
        "components": {
            "camera": {
                "status": "online",
                "index": 0
            },
            "yolo_model": {
                "status": "loaded",
                "model_path": "/path/to/yolo/model"
            },
            "database": {
                "status": "connected"
            },
            "websocket": {
                "status": "running"
            }
        }
    }
}
```

---

## 手写字符识别模型API接口

### 基础信息

- **基础URL**: `http://localhost:8000/handwrite_model/`
- **认证方式**: 无需认证（内部API）
- **数据格式**: JSON
- **字符编码**: UTF-8

---

### 1. 字符识别接口

**接口描述**: 识别图像中的手写字符（核心识别API）

**路由**: `POST /api/handwrite-model/recognize/`

**请求参数**: 无

**请求体**:

```json
{
    "image": "<base64编码的图片数据>",
    "session_id": "session_1234",
    "user_id": 1
}
```

**返回体**:

```json
{
    "success": true,
    "message": "字符识别完成",
    "data": {
        "character": "A",
        "confidence": 0.95,
        "session_id": "session_1234"
    }
}
```

**错误返回**:

```json
{
    "success": false,
    "message": "手写字识别模型未加载",
    "data": null
}
```

---

### 2. 模型信息接口

**接口描述**: 获取手写字符识别模型的详细信息

**路由**: `GET /api/handwrite-model/model/info/`

**请求参数**: 无

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "获取模型信息成功",
    "data": {
        "model_loaded": true,
        "model_path": "/path/to/model.pth",
        "confidence_threshold": 0.8,
        "total_recognitions": 1250,
        "unique_characters_recognized": 36,
        "recent_recognitions_24h": 45,
        "current_confidence_threshold": 0.8,
        "settings_updated": "2024-01-15 10:30:25"
    }
}
```

---

### 3. 模型性能统计接口

**接口描述**: 获取模型性能统计数据

**路由**: `GET /api/handwrite-model/model/performance/`

**请求参数**: 无

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "获取性能统计成功",
    "data": {
        "overall_performance": [
            {
                "character": "A",
                "total_recognitions": 150,
                "avg_confidence": 0.923,
                "last_updated": "2024-01-15 10:30:25"
            }
        ],
        "recent_24h_stats": [
            {
                "character": "A",
                "count_24h": 12,
                "avg_confidence_24h": 0.915
            }
        ],
        "total_recognitions_all_time": 1250,
        "total_recognitions_24h": 45
    }
}
```

---

### 4. 模型设置接口

**接口描述**: 获取和更新模型设置

**路由**: `GET /api/handwrite-model/model/settings/` (获取设置)

**请求参数**: 无

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "获取模型设置成功",
    "data": {
        "confidence_threshold": 0.8,
        "model_path": "/path/to/model.pth",
        "updated_time": "2024-01-15 10:30:25"
    }
}
```

**路由**: `POST /api/handwrite-model/model/settings/` (更新设置)

**请求参数**: 无

**请求体**:

```json
{
    "confidence_threshold": 0.85,
    "model_path": "/new/path/to/model.pth"
}
```

**返回体**:

```json
{
    "success": true,
    "message": "模型设置更新成功",
    "data": {
        "settings": {
            "confidence_threshold": 0.85,
            "model_path": "/new/path/to/model.pth",
            "updated_time": "2024-01-15 10:35:12"
        }
    }
}
```

---

### 5. 识别历史接口

**接口描述**: 获取字符识别历史记录

**路由**: `GET /api/handwrite-model/recognition/history/`

**请求参数**:

- `session_id` (可选): 会话ID
- `character` (可选): 特定字符
- `user_id` (可选): 用户ID
- `limit` (可选): 返回记录数量限制，默认100

**请求体**: 无

**返回体**:

```json
{
    "success": true,
    "message": "获取识别历史成功",
    "data": {
        "history": [
            {
                "id": 1,
                "character": "A",
                "confidence": 0.95,
                "recognition_time": "2024-01-15 10:30:25",
                "session_id": "session_1234",
                "user_id": 1
            }
        ],
        "total_count": 1250,
        "returned_count": 100
    }
}
```

---

## 注意事项

1. 所有API接口都需要用户登录认证
2. 管理员接口需要额外的管理员权限验证
3. 图片和视频文件建议使用base64编码传输
4. 请求频率限制：普通用户每分钟100次，管理员每分钟500次
5. 上传文件大小限制：图片最大5MB，视频最大50MB
6. 支持的图片格式：JPG, PNG, BMP, TIFF
7. 支持的视频格式：MP4, AVI, MOV
8. 所有时间格式均为：YYYY-MM-DD HH:MM:SS
9. **模型API接口**为内部调用接口，无需用户认证
10. **模型路径配置**：当前使用 `c:\2025.8\project\write recong\hzsystem_django\static\models\best_model.pth`
11. **置信度阈值**：默认为0.8，可通过模型设置接口调整

---

## 数据库结构说明

### 识别记录存储结构

本系统的四种识别类型（图片识别、画布识别、视频识别、摄像头识别）**统一存储在同一张表中**：

**主要识别记录表**: `HandwritingDetectionRecord` (hzsystem_handwrite模块)

- 通过 `detection_type` 字段区分识别类型：
  - `'image'` - 图片识别
  - `'canvas'` - 画布识别
  - `'video'` - 视频识别
  - `'camera'` - 摄像头识别
- 所有识别记录都可以通过统一的历史记录API (`GET /handwriting/api/history/`) 查询
- 支持按识别类型、字符、时间范围等条件筛选

**辅助数据表**:

- `HandwritingStatistics` - 用户识别统计数据
- `HandwritingUserPreference` - 用户偏好设置
- `HandwritingModelSettings` - 模型配置设置
- `HandwritingRecord` - 模型内部识别记录 (hzsystem_handwrite_model模块)
- `CharacterPerformance` - 字符识别性能统计

### 假数据说明

系统已自动插入以下测试数据：

- **用户数据**: 15个测试用户（包含1个管理员账户）
  - 管理员: `admin/admin123`
  - 普通用户: `testuser1-testuser15/test123`
- **识别记录**: 800条识别记录，涵盖四种识别类型
- **统计数据**: 每个用户的字符识别统计信息
- **性能数据**: 36个字符（0-9, a-z）的性能统计
- **用户偏好**: 每个用户的个性化设置
- **模型设置**: 系统模型配置参数

### 数据查询示例

**查询所有识别记录**:

```http
GET /handwriting/api/history/
```

**查询特定类型的识别记录**:

```http
GET /handwriting/api/history/?type=canvas
GET /handwriting/api/history/?type=image
GET /handwriting/api/history/?type=video
GET /handwriting/api/history/?type=camera
```

**查询特定字符的识别记录**:

```http
GET /handwriting/api/history/?character=A
```

**查询指定时间范围的记录**:

```http
GET /handwriting/api/history/?start_date=2024-01-01&end_date=2024-01-31
```

**组合查询**:

```http
GET /handwriting/api/history/?type=canvas&character=A&page=1&page_size=10
```

---

## 使用说明

1. **开发环境**: 使用提供的测试账户进行API测试
2. **数据一致性**: 四种识别类型的数据结构完全一致，便于统一处理
3. **扩展性**: 如需添加新的识别类型，只需在 `DETECTION_TYPES` 中添加新选项
4. **性能优化**: 大量数据查询时建议使用分页和筛选条件
5. **数据清理**: 可通过Django管理后台或自定义命令清理测试数据
