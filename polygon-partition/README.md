# 架构

```
├── data 数据
├── index.html 主页面
├── package.json 依赖信息
└── src
    ├── dataPrehandle.ts 数据处理加工成可以被分割的标准树形结构
    ├── index.ts 逻辑主入口
    ├── interface.ts 标准树形结构约束
    ├── layout 画布分割布局算法
    └── render.ts 渲染多边形及其标签
```

# 运行

要求：node环境

```
npm i -g pnpm
yarn
yarn dev
```

# 步骤说明

1. 输入树形结构数据

   ```typescript
   export interface NonBottomLevel {
     name: string;
     hierarchy: string;
     children: NonBottomLevel[];
     num?: number;
   }
   
   export interface BottomLevel {
     name: string;
     hierarchy: string;
     nodes: any[];
     edges: any[];
     num: number;
   }
   ```

2. 统计树形结构各层级权重

3. 定义矩形边界几何信息

4. 设置每个数据集的标识符，保证分割结果一致

5. 根据树形结构分割画布，并将特殊pod中心化

6. （可选）设置分割区域根据权重设置颜色插值范围

7. 渲染各多边形区域及其标签