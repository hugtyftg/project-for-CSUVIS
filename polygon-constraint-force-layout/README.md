# 场景

将任意网络数据以力导引布局作为基本布局，限制性地布局在给定的任意凸多边形内，边界清晰美观

# 架构

```
├── data 数据
├── index.html 主页面与逻辑
└── src
    ├── calculatePolygonCentroid.js 
    └── polygonForceConstraint.js
```

# 运行

vscode安装live server插件，开启本地开发服务即可（也可使用其他方法开启本地服务器如python http模块）

![image-20240811000710281](README.assets/image-20240811000710281.png)

# 步骤说明

1. 输入图数据，即具有唯一id标识的nodes和links
2. 输入多边形顶点数据
3. 计算多边形质心
4. 开启力导引模拟器
5. 每次布局迭代时进行多边形限制的力导引计算
6. （可选）拖拽交互
7. （可选）样式配置
8. 渲染多边形与节点链接图



