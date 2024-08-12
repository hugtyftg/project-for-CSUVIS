# 场景



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

提供算法在某个数据集下的运行表现图

功能包括：

1. 单步时间片切换
2. 自动运行单个算法
3. 自动运行所有算法
4. 下载某个时间片的数据集（可用于overview）
5. 计算单时间片指标如DCQ
6. 实时秒表计时
7. 实时图规模统计

# 对比算法运行流程

1. src/compare 对比算法，基于**G6自定义图布局**实现并注入

   1. **alg 具体的布局算法，如age、degree**
   2. **forces 各种限制力**
   3. **pos 初始化节点位置**
   4. **layout 最终暴露出来布局入口，可以配置布局算法和限制力策略，并注入到G6自定义布局策略中**
   5. **simulation 力模拟器**

2. src/component 封装图渲染组件，支持多种交互

   **其中，渲染对比图的组件内，使用layout的方式如下：**

   1. **初始化一个G6图实例，type为我们刚注入到自定义布局**
   2. **切换时间片的时候，给图实例传入新旧时间片的点边，然后初始化位置，接着应用对比算法，最后在G6中开启力模拟器计算**
   3. **布局计算完毕的回调事件内，更新图中节点和连边，计算各种布局指标**

3. src/metrics 各种衡量动态图布局质量的指标

4. src/router 路由配置文件

5. src/config 图布局参数配置、样式配置

# 效果

<img src="README.assets/our-eva_11t.gif" alt="our-eva_11t" style="zoom:50%;" /><img src="README.assets/age-b_19t.gif" alt="age-b_19t" style="zoom:50%;" />

# 具体使用

## Experiment视图怎么切换算法

更换传入的算法名称即可，比如更改为compareConfig[0].name或直接输入对应的字符串

<img src="README.assets/image-20240812210923955.png" alt="image-20240812210923955" style="zoom:50%;" />

<img src="README.assets/image-20240812204250526.png" alt="image-20240812204250526" style="zoom:50%;" />

## 怎么一次性呈现某个算法在某个数据集上的运行效果gallery

### 1.运行到某个感兴趣的时间片时，下载已经计算过的时间片的布局结果

<img src="README.assets/image-20240812212631799.png" alt="image-20240812212631799" style="zoom:50%;" />

<img src="README.assets/image-20240812212731717.png" alt="image-20240812212731717" style="zoom:50%;" />

### 2.将下载后的数据根据所用算法和数据集名称放入对应的data/overview文件夹中

<img src="README.assets/image-20240812213044139.png" alt="image-20240812213044139" style="zoom:50%;" />

### 3.修改Overview中读取的数据路径

<img src="README.assets/image-20240812213354225.png" alt="image-20240812213354225" style="zoom:50%;" />

### 4.浏览器输入http://localhost:3000/overview查看gallery

![image-20240812213505613](README.assets/image-20240812213505613.png)

### 5.下载gallery整图

<img src="README.assets/image-20240812213534332.png" alt="image-20240812213534332" style="zoom:50%;" />

<img src="README.assets/image-20240812213612891.png" alt="image-20240812213612891" style="zoom:50%;" />

# 进阶——如何实现一个基于G6的自定义力导引布局

可参考src/compare目录下的源代码理解如下概念

## 1.定义各种力

如节点距离力，必须实现initialize方法用来初始化节点/连边，返回一个force

## 2.定义力模拟器

必须实现：

1. tick接口，用于每次迭代计算
2. nodes接口，用于传入模拟计算的节点集合
3. stop接口，用于暂停力模拟器
4. restart接口，用于重启力模拟器
5. alpha和alphaDecay接口，用于定义“退火衰减次数”即迭代计算次数

## 3.定义布局方法

1. 初始化配置参数
2. 读取图数据，初始化点边
3. 执行布局计算：
   1. 开启力模拟器
   2. 力模拟器中应用各种力
   3. 按需添加自定义力，比如约束力
4. 更新布局参数
5. 终止布局并销毁

## 4.注册布局到G6

```
registerLayout('restricted-force-layout', RestrictedForceLayout);
```