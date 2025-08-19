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
    "success": true,
    "message": "获取统计数据成功",
    "data": {
        "total_recognitions": 1250,
        "avg_confidence": 0.87,
        "most_recognized_character": "A",
        "recognition_accuracy": 0.92,
        "daily_stats": [
            {
                "date": "2024-01-15",
                "count": 45,
                "avg_confidence": 0.89
            },
            {
                "date": "2024-01-14",
                "count": 38,
                "avg_confidence": 0.85
            }
        ],
        "character_distribution": {
            "A": 120,
            "B": 95,
            "C": 87,
            "1": 156,
            "2": 134
        }
    }
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