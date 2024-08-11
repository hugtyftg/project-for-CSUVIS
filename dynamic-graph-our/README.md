# 使用说明

前端环境：node v18及以上

```
pnpm i # 安装依赖
pnpm start # 启动工程
```

# 路由

## /overview

提供某个算法在某个数据集下的所有时间片的概览gallery

功能包括：

1. 导出gallery png

## /experiment

提供我们的算法在某个数据集下的运行表现图

功能包括：

1. 单步时间片切换
2. 自动运行单个算法
3. 自动运行所有算法
4. 下载某个时间片的数据集（可用于overview）
5. 计算单时间片指标如DCQ
6. 实时秒表计时
7. 实时图规模统计

# 运行流程

1. public/html 中注入wasm依赖文件——calcNode.js和calcNode.wasm（C++部分优化后，直接替换编译后的wasm文件即可）
2. src/algorithm 向外暴露DynamicGraph类，用来开启worker线程，在后台用wasm开启计算线程，通过postMessage与主线程通信
3. src/worker 作为主线程，用来和子线程通信，接受各个时间片的图布局计算结果
4. src/store 存储每个时间片内的图点边数据
5. src/component 封装图渲染组件，支持多种交互
6. src/metrics 各种衡量动态图布局质量的指标
7. src/router 路由配置文件
8. src/config 图布局参数配置、样式配置
